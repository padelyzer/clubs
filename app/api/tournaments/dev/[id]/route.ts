import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

/**
 * DEV ONLY - Endpoint sin autenticación para testing
 * NO USAR EN PRODUCCIÓN
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id: tournamentId } = paramData

    console.log('[DEV] Fetching tournament:', tournamentId)

    // Obtener datos del torneo con toda la información necesaria
    const [tournament, registrations, matches, rounds] = await Promise.all([
      // Información básica del torneo
      prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          _count: {
            select: {
              TournamentRegistration: true,
              TournamentMatch: true
            }
          }
        }
      }),

      // Registros de equipos
      prisma.tournamentRegistration.findMany({
        where: {
          tournamentId,
          confirmed: true
        },
        select: {
          id: true,
          teamName: true,
          player1Name: true,
          player2Name: true,
          category: true,
          modality: true,
          teamLevel: true,
          paymentStatus: true,
          checkedIn: true
        }
      }),

      // Partidos del torneo
      prisma.tournamentMatch.findMany({
        where: { tournamentId },
        include: {
          Court: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { scheduledAt: 'asc' },
          { courtNumber: 'asc' }
        ]
      }),

      // Rondas del torneo
      prisma.tournamentRound.findMany({
        where: { tournamentId },
        orderBy: { createdAt: 'asc' }
      })
    ])

    console.log('[DEV] Tournament found:', !!tournament, tournament?.name)
    console.log('[DEV] Registrations:', registrations.length)
    console.log('[DEV] Matches:', matches.length)
    console.log('[DEV] Rounds:', rounds.length)

    if (!tournament) {
      console.log('[DEV] ERROR: Tournament not found!')
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }

    // Procesar estadísticas
    const stats = {
      totalTeams: registrations.length,
      totalMatches: matches.length,
      completedMatches: matches.filter(m => m.status === 'COMPLETED').length,
      pendingMatches: matches.filter(m => m.status === 'SCHEDULED').length,
      inProgressMatches: matches.filter(m => m.status === 'IN_PROGRESS').length,
      todayMatches: matches.filter(m => {
        if (!m.scheduledAt) return false
        const today = new Date()
        const matchDate = new Date(m.scheduledAt)
        return matchDate.toDateString() === today.toDateString()
      }).length
    }

    return NextResponse.json({
      success: true,
      tournament: {
        ...tournament,
        stats,
        registrations,
        matches,
        rounds
      }
    })

  } catch (error) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener el torneo' },
      { status: 500 }
    )
  }
}
