import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// GET - Get player's booking history (ULTRA-SIMPLIFIED VERSION)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[GET Player Bookings] Starting ultra-simple version...')
    
    const session = await requireAuthAPI()
    
    if (!session) {
      console.log('[GET Player Bookings] No session')
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    console.log('[GET Player Bookings] Session OK:', session.clubId)
    
    const paramData = await params
    const { id: playerId } = paramData
    
    console.log('[GET Player Bookings] Player ID:', playerId)
    
    // Step 1: Get player first
    console.log('[GET Player Bookings] Step 1: Getting player...')
    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        clubId: session.clubId
      }
    })

    if (!player) {
      console.log('[GET Player Bookings] Player not found')
      return NextResponse.json(
        { success: false, error: 'Jugador no encontrado' },
        { status: 404 }
      )
    }
    
    console.log('[GET Player Bookings] Player found:', player.name, player.phone)

    // Step 2: Try basic booking query (no includes at all)
    console.log('[GET Player Bookings] Step 2: Getting basic bookings...')
    const bookings = await prisma.booking.findMany({
      where: {
        clubId: session.clubId,
        playerPhone: player.phone
      },
      orderBy: {
        date: 'desc'
      },
      take: 10 // Very limited for safety
    })
    
    console.log('[GET Player Bookings] Basic bookings found:', bookings.length)

    // Step 3: Ultra-simple formatting (no court lookup)
    console.log('[GET Player Bookings] Step 3: Simple formatting...')
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      courtId: booking.courtId,
      status: booking.status,
      price: booking.price
    }))
    
    console.log('[GET Player Bookings] Formatted count:', formattedBookings.length)
    console.log('[GET Player Bookings] SUCCESS - returning data')

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      debug: {
        playerId,
        playerName: player.name,
        playerPhone: player.phone,
        clubId: session.clubId,
        totalFound: bookings.length
      }
    })

  } catch (error) {
    console.error('[GET Player Bookings] ULTRA-SIMPLE ERROR:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener historial de reservas',
        debug: {
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : 'No stack'
        }
      },
      { status: 500 }
    )
  }
}