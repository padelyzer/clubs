import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// Helper function to generate single elimination bracket
function generateSingleEliminationBracket(registrations: any[]) {
  const matches = []
  
  // Calculate number of rounds needed
  const numParticipants = registrations.length
  const numRounds = Math.ceil(Math.log2(numParticipants))
  
  // Round 1 - pair up all registered players
  let currentRound = 1
  let matchNumber = 1
  
  for (let i = 0; i < registrations.length; i += 2) {
    const player1 = registrations[i]
    const player2 = registrations[i + 1] || null
    
    matches.push({
      round: `Ronda ${currentRound}`,
      matchNumber,
      player1Id: player1?.player1Id,
      player1Name: player1?.player1Name,
      player2Id: player2?.player1Id || null,
      player2Name: player2?.player1Name || null,
      status: 'SCHEDULED'
    })
    
    matchNumber++
  }
  
  // Generate placeholder matches for subsequent rounds
  let remainingMatches = Math.ceil(registrations.length / 2)
  
  for (let round = 2; round <= numRounds; round++) {
    remainingMatches = Math.ceil(remainingMatches / 2)
    
    const roundName = round === numRounds ? 'Final' : 
                     round === numRounds - 1 ? 'Semifinal' :
                     round === numRounds - 2 ? 'Cuartos de Final' :
                     `Ronda ${round}`
    
    for (let i = 0; i < remainingMatches; i++) {
      matches.push({
        round: roundName,
        matchNumber: i + 1,
        player1Id: null,
        player1Name: null,
        player2Id: null,
        player2Name: null,
        status: 'SCHEDULED'
      })
    }
  }
  
  return matches
}

// Helper function to generate round robin bracket
function generateRoundRobinBracket(registrations: any[]) {
  const matches = []
  let matchNumber = 1
  
  // Generate all possible pairings
  for (let i = 0; i < registrations.length; i++) {
    for (let j = i + 1; j < registrations.length; j++) {
      const player1 = registrations[i]
      const player2 = registrations[j]
      
      matches.push({
        round: 'Ronda Única',
        matchNumber,
        player1Id: player1.player1Id,
        player1Name: player1.player1Name,
        player2Id: player2.player1Id,
        player2Name: player2.player1Name,
        status: 'SCHEDULED'
      })
      
      matchNumber++
    }
  }
  
  return matches
}

// POST - Generate tournament bracket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { id: tournamentId } = await params
    
    // Verify tournament exists and belongs to club
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        clubId: session.clubId
      },
      include: {
        TournamentRegistration: {
          where: {
            confirmed: true
          },
          include: {
            Player_TournamentRegistration_player1IdToPlayer: true,
            Player_TournamentRegistration_player2IdToPlayer: true
          }
        },
        TournamentMatch: true
      }
    })
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    // Check if tournament can generate bracket
    if (tournament.status !== 'REGISTRATION_CLOSED') {
      return NextResponse.json(
        { success: false, error: 'El torneo debe estar en estado "Registraciones Cerradas" para generar bracket' },
        { status: 400 }
      )
    }
    
    // Check if bracket already exists
    if (tournament.TournamentMatch.length > 0) {
      return NextResponse.json(
        { success: false, error: 'El bracket ya ha sido generado para este torneo' },
        { status: 400 }
      )
    }
    
    // Check minimum participants
    if (tournament.TournamentRegistration.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Se necesitan al menos 2 participantes para generar bracket' },
        { status: 400 }
      )
    }
    
    let bracketMatches = []
    
    // Generate bracket based on tournament type
    switch (tournament.type) {
      case 'SINGLE_ELIMINATION':
      case 'DOUBLE_ELIMINATION':
        bracketMatches = generateSingleEliminationBracket(tournament.TournamentRegistration)
        break
        
      case 'ROUND_ROBIN':
        bracketMatches = generateRoundRobinBracket(tournament.TournamentRegistration)
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de torneo no soportado para generación automática de bracket' },
          { status: 400 }
        )
    }
    
    // Create all matches in database
    const createdMatches = []
    
    for (const matchData of bracketMatches) {
      const match = await prisma.tournamentMatch.create({
        data: {
          tournamentId,
          ...matchData
        },
        include: {
          player1: true,
          player2: true,
          court: true
        }
      })
      
      createdMatches.push(match)
    }
    
    // Update tournament status to IN_PROGRESS
    const updatedTournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'IN_PROGRESS' },
      include: {
        TournamentRegistration: {
          include: {
            Player_TournamentRegistration_player1IdToPlayer: true,
            Player_TournamentRegistration_player2IdToPlayer: true
          }
        },
        TournamentMatch: {
          include: {
            Player_TournamentMatch_player1IdToPlayer: true,
            Player_TournamentMatch_player2IdToPlayer: true,
            Court: true,
            Player_TournamentMatch_winnerIdToPlayer: true
          }
        },
        _count: {
          select: {
            TournamentRegistration: true,
            TournamentMatch: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      tournament: {
        ...updatedTournament,
        registeredPlayers: updatedTournament._count.TournamentRegistration,
        totalMatches: updatedTournament._count.TournamentMatch,
        completedMatches: updatedTournament.TournamentMatch.filter(m => m.status === 'COMPLETED').length
      },
      matches: createdMatches,
      message: 'Bracket generado exitosamente'
    })

  } catch (error) {
    console.error('Error generating tournament bracket:', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar bracket' },
      { status: 500 }
    )
  }
}