import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// Simple GET endpoint to test step by step
export async function GET(request: NextRequest) {
  try {
    console.log('[Bookings Simple] Starting request...')
    
    // Step 1: Test authentication
    console.log('[Bookings Simple] Testing auth...')
    const session = await requireAuthAPI()
    
    if (!session) {
      console.log('[Bookings Simple] No session found')
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    console.log('[Bookings Simple] Session found:', {
      userId: session.userId,
      clubId: session.clubId,
      role: session.role
    })
    
    // Step 2: Test basic database query
    console.log('[Bookings Simple] Testing basic DB query...')
    const bookingCount = await prisma.booking.count({
      where: { clubId: session.clubId }
    })
    
    console.log('[Bookings Simple] Booking count:', bookingCount)
    
    // Step 3: Test simple booking query (with playerId support)
    console.log('[Bookings Simple] Testing simple booking query...')
    const bookings = await prisma.booking.findMany({
      where: { 
        clubId: session.clubId,
        status: { not: 'CANCELLED' }
      },
      take: 5, // Only get 5 records to avoid large response
      include: {
        Court: true,
        Player: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    
    console.log('[Bookings Simple] Found bookings:', bookings.length)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Simple bookings endpoint working',
      data: {
        sessionInfo: {
          userId: session.userId,
          clubId: session.clubId,
          role: session.role
        },
        totalBookings: bookingCount,
        recentBookings: bookings.length,
        bookings: bookings.map(b => ({
          id: b.id,
          date: b.date,
          startTime: b.startTime,
          playerName: b.playerName,
          playerId: b.playerId,
          playerEmail: b.Player?.email,
          courtName: b.Court?.name || 'Unknown',
          status: b.status
        }))
      }
    })

  } catch (error) {
    console.error('[Bookings Simple] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error en endpoint simple',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}