import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

// GET - Debug endpoint to check tournament loading without auth
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Starting tournament fetch...')
    
    // Try to get tournaments without auth first to see if it's an auth issue
    const tournaments = await prisma.tournament.findMany({
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
      take: 5 // Limit to 5 for debugging
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