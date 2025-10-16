import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

/**
 * POST - Finalizar un torneo
 *
 * Verifica que todos los partidos estén completados y marca el torneo como finalizado.
 * Genera rankings finales por categoría basándose en los resultados de los partidos.
 */
export async function POST(
  req: NextRequest,
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

    const paramData = await params
    const { id: tournamentId } = paramData

    // Verificar que el torneo pertenece al club del usuario
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        clubId: session.clubId
      },
      include: {
        TournamentMatch: true,
        TournamentRegistration: true,
        TournamentRound: true
      }
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado o no pertenece a tu club' },
        { status: 404 }
      )
    }

    // Verificar que el torneo no esté ya finalizado
    if (tournament.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'El torneo ya está finalizado' },
        { status: 400 }
      )
    }

    // Verificar que el torneo esté activo
    if (tournament.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: 'El torneo debe estar activo para ser finalizado. Status actual: ' + tournament.status
        },
        { status: 400 }
      )
    }

    const allMatches = tournament.TournamentMatch

    // Verificar que haya partidos
    if (allMatches.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No hay partidos en el torneo. Genera los brackets primero.'
        },
        { status: 400 }
      )
    }

    // Verificar que todos los partidos estén completados
    const incompleteMatches = allMatches.filter(match =>
      match.status !== 'COMPLETED' && match.status !== 'CANCELLED'
    )

    if (incompleteMatches.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Hay ${incompleteMatches.length} partido(s) sin completar. Todos los partidos deben estar completados o cancelados.`,
          incompleteMatches: incompleteMatches.map(m => ({
            id: m.id,
            round: m.round,
            matchNumber: m.matchNumber,
            status: m.status,
            teams: `${m.team1Name || 'TBD'} vs ${m.team2Name || 'TBD'}`
          }))
        },
        { status: 400 }
      )
    }

    // Verificar que no haya conflictos sin resolver
    const matchesWithConflicts = allMatches.filter(match =>
      match.status === 'COMPLETED' && !match.conflictResolved && !match.resultsConfirmed
    )

    if (matchesWithConflicts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Hay ${matchesWithConflicts.length} partido(s) con resultados no confirmados. Resuelve todos los conflictos primero.`,
          conflictMatches: matchesWithConflicts.map(m => ({
            id: m.id,
            round: m.round,
            matchNumber: m.matchNumber,
            teams: `${m.team1Name} vs ${m.team2Name}`
          }))
        },
        { status: 400 }
      )
    }

    // Generar rankings finales por categoría
    const rankings = await generateFinalRankings(tournamentId, allMatches)

    // Actualizar el torneo a COMPLETED
    const updatedTournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Torneo finalizado exitosamente',
      tournament: {
        id: updatedTournament.id,
        name: updatedTournament.name,
        status: updatedTournament.status,
        startDate: updatedTournament.startDate,
        endDate: updatedTournament.endDate
      },
      statistics: {
        totalMatches: allMatches.length,
        completedMatches: allMatches.filter(m => m.status === 'COMPLETED').length,
        cancelledMatches: allMatches.filter(m => m.status === 'CANCELLED').length,
        totalRounds: tournament.TournamentRound.length,
        totalParticipants: tournament.TournamentRegistration.length
      },
      rankings
    })

  } catch (error) {
    console.error('Error finalizing tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Error al finalizar el torneo' },
      { status: 500 }
    )
  }
}

/**
 * GET - Obtener información de finalización del torneo
 * Verifica si el torneo está listo para ser finalizado
 */
export async function GET(
  req: NextRequest,
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

    const paramData = await params
    const { id: tournamentId } = paramData

    // Verificar que el torneo pertenece al club del usuario
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        clubId: session.clubId
      },
      include: {
        TournamentMatch: true,
        TournamentRound: true,
        TournamentRegistration: true
      }
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }

    const allMatches = tournament.TournamentMatch
    const completedMatches = allMatches.filter(m => m.status === 'COMPLETED')
    const incompleteMatches = allMatches.filter(m =>
      m.status !== 'COMPLETED' && m.status !== 'CANCELLED'
    )
    const matchesWithConflicts = allMatches.filter(m =>
      m.status === 'COMPLETED' && !m.conflictResolved && !m.resultsConfirmed
    )

    const canFinalize =
      tournament.status === 'ACTIVE' &&
      allMatches.length > 0 &&
      incompleteMatches.length === 0 &&
      matchesWithConflicts.length === 0

    return NextResponse.json({
      success: true,
      tournament: {
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
        canFinalize
      },
      validation: {
        isActive: tournament.status === 'ACTIVE',
        hasMatches: allMatches.length > 0,
        allMatchesCompleted: incompleteMatches.length === 0,
        noConflicts: matchesWithConflicts.length === 0,
        canFinalize
      },
      statistics: {
        totalMatches: allMatches.length,
        completedMatches: completedMatches.length,
        incompleteMatches: incompleteMatches.length,
        conflictMatches: matchesWithConflicts.length,
        totalRounds: tournament.TournamentRound.length,
        totalParticipants: tournament.TournamentRegistration.length
      },
      blockers: {
        incompleteMatches: incompleteMatches.map(m => ({
          id: m.id,
          round: m.round,
          matchNumber: m.matchNumber,
          status: m.status,
          teams: `${m.team1Name || 'TBD'} vs ${m.team2Name || 'TBD'}`
        })),
        conflictMatches: matchesWithConflicts.map(m => ({
          id: m.id,
          round: m.round,
          matchNumber: m.matchNumber,
          teams: `${m.team1Name} vs ${m.team2Name}`
        }))
      }
    })

  } catch (error) {
    console.error('Error checking tournament finalize status:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar estado del torneo' },
      { status: 500 }
    )
  }
}

/**
 * Genera rankings finales basándose en los resultados de los partidos
 * Utiliza el sistema de rondas para determinar posiciones
 */
async function generateFinalRankings(
  tournamentId: string,
  matches: any[]
) {
  // Agrupar por categoría si existen
  const matchesByCategory: Record<string, any[]> = {}

  // Obtener categorías de las rondas
  const rounds = await prisma.tournamentRound.findMany({
    where: { tournamentId },
    select: { category: true, stage: true }
  })

  const categories = [...new Set(rounds.map(r => r.category).filter(Boolean))]

  if (categories.length === 0) {
    // Sin categorías específicas, usar una categoría general
    matchesByCategory['general'] = matches
  } else {
    // Agrupar matches por categoría basándose en las rondas
    for (const category of categories) {
      const categoryRounds = rounds
        .filter(r => r.category === category)
        .map(r => r.stage)

      matchesByCategory[category as string] = matches.filter(m =>
        categoryRounds.includes(m.round) ||
        (m.round && m.round.toLowerCase().includes(category?.toLowerCase() || ''))
      )
    }
  }

  const rankings: Record<string, any[]> = {}

  // Generar ranking para cada categoría
  for (const [category, categoryMatches] of Object.entries(matchesByCategory)) {
    if (categoryMatches.length === 0) continue

    const participants: Record<string, {
      team: string
      player1: string
      player2?: string
      wins: number
      losses: number
      position?: number
      finalRound?: string
    }> = {}

    // Recolectar todos los equipos y sus estadísticas
    categoryMatches.forEach(match => {
      if (match.status !== 'COMPLETED') return

      const team1 = match.team1Name || `${match.team1Player1}/${match.team1Player2}`
      const team2 = match.team2Name || `${match.team2Player1}/${match.team2Player2}`

      // Inicializar equipos si no existen
      if (!participants[team1]) {
        participants[team1] = {
          team: team1,
          player1: match.team1Player1 || '',
          player2: match.team1Player2,
          wins: 0,
          losses: 0,
          finalRound: match.round
        }
      }
      if (!participants[team2]) {
        participants[team2] = {
          team: team2,
          player1: match.team2Player1 || '',
          player2: match.team2Player2,
          wins: 0,
          losses: 0,
          finalRound: match.round
        }
      }

      // Actualizar estadísticas
      if (match.winner === 'team1') {
        participants[team1].wins++
        participants[team2].losses++
        // El ganador avanza, actualizar su ronda final
        participants[team1].finalRound = match.round
      } else if (match.winner === 'team2') {
        participants[team2].wins++
        participants[team1].losses++
        participants[team2].finalRound = match.round
      }
    })

    // Determinar posiciones basándose en la ronda final alcanzada
    const roundPriority: Record<string, number> = {
      'Final': 1,
      'Semifinal': 2,
      'Cuartos de Final': 3,
      'Octavos de Final': 4,
      'Dieciseisavos de Final': 5
    }

    const rankedParticipants = Object.values(participants)
      .sort((a, b) => {
        // Primero por ronda final alcanzada
        const roundA = roundPriority[a.finalRound || ''] || 99
        const roundB = roundPriority[b.finalRound || ''] || 99

        if (roundA !== roundB) return roundA - roundB

        // Si están en la misma ronda, ordenar por victorias
        if (a.wins !== b.wins) return b.wins - a.wins

        // Si tienen las mismas victorias, ordenar por derrotas (menos es mejor)
        return a.losses - b.losses
      })
      .map((participant, index) => ({
        ...participant,
        position: index + 1
      }))

    rankings[category] = rankedParticipants
  }

  return rankings
}
