import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const setScoreSchema = z.object({
  set: z.number().int().min(1).max(5),
  games: z.number().int().min(0),
  tiebreak: z.boolean().optional(),
  tiebreakScore: z.number().int().optional()
})

const resultSchema = z.object({
  player1Score: z.array(setScoreSchema),
  player2Score: z.array(setScoreSchema),
  winnerId: z.string().optional(),
  duration: z.number().int().positive().optional(),
  goldenPointUsed: z.boolean().optional(),
  notes: z.string().optional(),
  resultCapturedBy: z.enum(['player', 'admin']).optional()
})

// Helper function to determine match winner based on sets
function determineWinner(player1Score: any[], player2Score: any[], setsToWin: number = 2) {
  let player1Sets = 0
  let player2Sets = 0
  
  for (let i = 0; i < player1Score.length; i++) {
    const p1Games = player1Score[i].games
    const p2Games = player2Score[i].games
    
    // Check if it was a tiebreak
    if (player1Score[i].tiebreak || player2Score[i].tiebreak) {
      // In tiebreak, winner needs 7 points (or more with 2 point difference)
      const p1TiebreakScore = player1Score[i].tiebreakScore || 0
      const p2TiebreakScore = player2Score[i].tiebreakScore || 0
      
      if (p1TiebreakScore > p2TiebreakScore) {
        player1Sets++
      } else {
        player2Sets++
      }
    } else {
      // Normal set - first to 6 games (with 2 game difference)
      if (p1Games > p2Games) {
        player1Sets++
      } else if (p2Games > p1Games) {
        player2Sets++
      }
    }
  }
  
  // Determine overall winner
  if (player1Sets >= setsToWin) {
    return 'player1'
  } else if (player2Sets >= setsToWin) {
    return 'player2'
  }
  
  return null // Match not finished
}

// POST - Submit match result
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const paramData = await params
    
    const matchId = params.matchId
    const body = await request.json()
    
    const validatedData = resultSchema.parse(body)
    
    // Get match details
    const match = await prisma.tournamentMatch.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        player1: true,
        player2: true
      }
    })
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }
    
    // Check if match can be updated
    if (match.status === 'COMPLETED' && !body.forceUpdate) {
      return NextResponse.json(
        { success: false, error: 'El partido ya ha sido completado' },
        { status: 400 }
      )
    }
    
    // Determine winner based on scores
    const setsToWin = Math.ceil((match.tournament.sets || 3) / 2)
    const winner = determineWinner(
      validatedData.player1Score, 
      validatedData.player2Score,
      setsToWin
    )
    
    if (!winner) {
      return NextResponse.json(
        { success: false, error: 'Resultado incompleto. El partido no ha terminado.' },
        { status: 400 }
      )
    }
    
    const winnerId = winner === 'player1' ? match.player1Id : match.player2Id
    const winnerName = winner === 'player1' ? match.player1Name : match.player2Name
    
    // Store tiebreak scores separately
    const tiebreakScores = validatedData.player1Score.map((score, index) => {
      if (score.tiebreak) {
        return {
          set: score.set,
          player1: score.tiebreakScore || 0,
          player2: validatedData.player2Score[index].tiebreakScore || 0
        }
      }
      return null
    }).filter(Boolean)
    
    // Update match result
    const updatedMatch = await prisma.tournamentMatch.update({
      where: { id: matchId },
      data: {
        status: 'COMPLETED',
        winnerId,
        winnerName,
        player1Score: validatedData.player1Score,
        player2Score: validatedData.player2Score,
        tiebreakScores,
        goldenPointUsed: validatedData.goldenPointUsed || false,
        duration: validatedData.duration,
        completedAt: new Date(),
        resultCapturedBy: validatedData.resultCapturedBy || 'admin',
        resultVerified: validatedData.resultCapturedBy === 'admin',
        notes: validatedData.notes
      }
    })
    
    // If this is an elimination tournament, advance winner to next round
    if (match.tournament.type === 'SINGLE_ELIMINATION' || match.tournament.type === 'DOUBLE_ELIMINATION') {
      await advanceWinnerToNextRound(match, winnerId!, winnerName!)
    }
    
    return NextResponse.json({
      success: true,
      match: updatedMatch,
      message: 'Resultado registrado exitosamente'
    })
    
  } catch (error) {
    console.error('Error submitting match result:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al registrar resultado' },
      { status: 500 }
    )
  }
}

// Helper function to advance winner to next round
async function advanceWinnerToNextRound(
  currentMatch: any,
  winnerId: string,
  winnerName: string
) {
  // Determine next round
  const currentRound = currentMatch.round
  let nextRound = ''
  
  // Map rounds (this is simplified, you may need to adjust based on your naming)
  if (currentRound.includes('Ronda 1') || currentRound.includes('Round 1')) {
    nextRound = 'Cuartos de Final'
  } else if (currentRound.includes('Cuartos')) {
    nextRound = 'Semifinal'
  } else if (currentRound.includes('Semifinal')) {
    nextRound = 'Final'
  } else {
    // No more rounds
    return
  }
  
  // Find the next match where this winner should play
  // This logic assumes matches are pre-created with null players
  const nextMatchPosition = Math.ceil(currentMatch.matchNumber / 2)
  
  const nextMatch = await prisma.tournamentMatch.findFirst({
    where: {
      tournamentId: currentMatch.tournamentId,
      round: nextRound,
      matchNumber: nextMatchPosition
    }
  })
  
  if (nextMatch) {
    // Determine if winner goes to player1 or player2 slot
    const isPlayer1 = currentMatch.matchNumber % 2 === 1
    
    if (isPlayer1 && !nextMatch.player1Id) {
      await prisma.tournamentMatch.update({
        where: { id: nextMatch.id },
        data: {
          player1Id: winnerId,
          player1Name: winnerName
        }
      })
    } else if (!isPlayer1 && !nextMatch.player2Id) {
      await prisma.tournamentMatch.update({
        where: { id: nextMatch.id },
        data: {
          player2Id: winnerId,
          player2Name: winnerName
        }
      })
    }
  }
}

// GET - Get match result
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const paramData = await params
    
    const matchId = params.matchId
    
    const match = await prisma.tournamentMatch.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        player1: true,
        player2: true,
        winner: true,
        court: true
      }
    })
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      match
    })
    
  } catch (error) {
    console.error('Error fetching match:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener partido' },
      { status: 500 }
    )
  }
}