import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { validateRequest } from '@/lib/auth/lucia'

// GET - Debug endpoint to check tournament loading without auth
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Starting tournament fetch...')

    // Get current user session to filter by their club
    const { user } = await validateRequest()
    const clubId = user?.clubId || '90e75af6-4ef5-49bf-adb3-a6f2a78e2e8d' // Default to your club

    console.log('🏢 Filtering tournaments for club:', clubId)

    // Try to get tournaments filtered by club
    const tournaments = await prisma.tournament.findMany({
      where: {
        clubId: clubId
      },
      include: {
        TournamentRegistration: true,
        TournamentMatch: true,
        _count: {
          select: {
            TournamentRegistration: true,
            TournamentMatch: true
          }
        }
      },
      orderBy: { startDate: 'desc' },
      take: 10 // Show up to 10 tournaments
    })

    console.log(`✅ Found ${tournaments.length} tournaments`)

    // Transform for frontend
    const formattedTournaments = tournaments.map(tournament => ({
      ...tournament,
      registrationFee: tournament.registrationFee,
      prizePool: tournament.prizePool,
      registeredPlayers: tournament._count.TournamentRegistration,
      totalMatches: tournament._count.TournamentMatch,
      completedMatches: tournament.TournamentMatch.filter(m => m.status === 'COMPLETED').length
    }))

    return NextResponse.json({
      success: true,
      tournaments: formattedTournaments,
      debug: {
        totalFound: tournaments.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        timestamp: new Date().toISOString(),
        errorType: error?.constructor?.name
      }
    }, { status: 500 })
  }
}