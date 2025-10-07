import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'

// EMERGENCY endpoint - no database queries at all
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[EMERGENCY Bookings] Starting...')
    
    const session = await requireAuthAPI()
    
    if (!session) {
      console.log('[EMERGENCY Bookings] No session')
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    console.log('[EMERGENCY Bookings] Session OK:', session.clubId)
    
    const paramData = await params
    const { id: playerId } = paramData
    
    console.log('[EMERGENCY Bookings] Player ID:', playerId)
    
    // Return fake data to test if the issue is with Prisma queries
    const fakeBookings = [
      {
        id: 'fake-booking-1',
        date: '2025-01-07',
        startTime: '10:00',
        status: 'CONFIRMED',
        price: 50000
      },
      {
        id: 'fake-booking-2', 
        date: '2025-01-06',
        startTime: '12:00',
        status: 'PENDING',
        price: 60000
      }
    ]
    
    console.log('[EMERGENCY Bookings] Returning fake data successfully')

    return NextResponse.json({
      success: true,
      bookings: fakeBookings,
      debug: {
        type: 'EMERGENCY_MODE',
        playerId,
        clubId: session.clubId,
        message: 'This is fake data to test if Prisma queries are the issue'
      }
    })

  } catch (error) {
    console.error('[EMERGENCY Bookings] Error in emergency mode:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error in emergency mode',
        debug: {
          type: 'EMERGENCY_ERROR',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : 'No stack'
        }
      },
      { status: 500 }
    )
  }
}