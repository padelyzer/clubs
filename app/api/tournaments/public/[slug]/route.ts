import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

// GET - Get public tournament data by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Find tournament by slug (using ID for now since we don't have slug field)
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: slug // In production, this should be a proper slug field
      },
      include: {
        Club: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        TournamentMatch: {
          where: {
            status: {
              in: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']
            }
          },
          include: {
            Court: {
              select: {
                name: true
              }
            }
          },
          orderBy: [
            { round: 'asc' },
            { matchNumber: 'asc' }
          ]
        },
        TournamentRegistration: {
          where: {
            confirmed: true
          },
          select: {
            id: true,
            player1Name: true,
            player2Name: true,
            paymentStatus: true
          }
        },
        _count: {
          select: {
            TournamentRegistration: {
              where: {
                confirmed: true
              }
            }
          }
        }
      }
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }

    // Transform data for public view
    const publicTournament = {
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      type: tournament.type,
      status: tournament.status,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      registrationDeadline: tournament.registrationDeadline,
      maxPlayers: tournament.maxPlayers,
      registeredPlayers: tournament._count.TournamentRegistration,
      entryFee: tournament.entryFee,
      currency: tournament.currency,
      prizePool: tournament.prizePool,
      rules: tournament.rules,
      location: tournament.location,
      club: tournament.Club,
      matches: tournament.TournamentMatch.map(match => ({
        id: match.id,
        round: match.round,
        matchNumber: match.matchNumber,
        player1Name: match.player1Name,
        player2Name: match.player2Name,
        winnerName: match.winnerName,
        status: match.status,
        scheduledAt: match.scheduledAt,
        court: match.Court
      })),
      registrations: tournament.TournamentRegistration
    }

    return NextResponse.json({
      success: true,
      tournament: publicTournament
    })

  } catch (error) {
    console.error('Error fetching public tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener información del torneo' },
      { status: 500 }
    )
  }
}