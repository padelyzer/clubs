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
    
    // Step 1: Get player first (with specific select to avoid missing columns)
    console.log('[GET Player Bookings] Step 1: Getting player...')
    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        clubId: session.clubId
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        clubId: true,
        totalBookings: true,
        totalSpent: true,
        lastBookingAt: true
        // Explicitly exclude totalClasses and other potentially missing columns
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

    // Step 2: Test database connectivity first
    console.log('[GET Player Bookings] Step 2: Testing DB connection...')
    try {
      const dbTest = await prisma.$queryRaw`SELECT 1 as test`
      console.log('[GET Player Bookings] DB test successful:', dbTest)
    } catch (dbError) {
      console.log('[GET Player Bookings] DB test failed:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Database connection error',
        debug: {
          step: 'database_test',
          playerId,
          playerName: player.name,
          playerPhone: player.phone,
          clubId: session.clubId,
          dbError: dbError instanceof Error ? dbError.message : 'Unknown DB error'
        }
      }, { status: 500 })
    }

    // Step 3: Try to count bookings first (safer than findMany)
    console.log('[GET Player Bookings] Step 3: Counting bookings...')
    let bookingCount = 0
    try {
      bookingCount = await prisma.booking.count({
        where: {
          clubId: session.clubId,
          playerPhone: player.phone
        }
      })
      console.log('[GET Player Bookings] Booking count:', bookingCount)
    } catch (countError) {
      console.log('[GET Player Bookings] Count failed:', countError)
      return NextResponse.json({
        success: false,
        error: 'Error counting bookings',
        debug: {
          step: 'booking_count',
          playerId,
          playerName: player.name,
          playerPhone: player.phone,
          clubId: session.clubId,
          countError: countError instanceof Error ? countError.message : 'Unknown count error'
        }
      }, { status: 500 })
    }

    // Step 4: If count works, try simple findMany
    console.log('[GET Player Bookings] Step 4: Getting bookings (limit 3)...')
    let bookings = []
    try {
      bookings = await prisma.booking.findMany({
        where: {
          clubId: session.clubId,
          playerPhone: player.phone
        },
        orderBy: {
          date: 'desc'
        },
        take: 3 // Very small limit
      })
      console.log('[GET Player Bookings] Bookings retrieved:', bookings.length)
    } catch (findError) {
      console.log('[GET Player Bookings] Find failed:', findError)
      return NextResponse.json({
        success: false,
        error: 'Error fetching bookings',
        debug: {
          step: 'booking_find',
          playerId,
          playerName: player.name,
          playerPhone: player.phone,
          clubId: session.clubId,
          bookingCount,
          findError: findError instanceof Error ? findError.message : 'Unknown find error'
        }
      }, { status: 500 })
    }

    // Step 5: Simple formatting
    console.log('[GET Player Bookings] Step 5: Formatting...')
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      date: booking.date?.toISOString(),
      startTime: booking.startTime,
      status: booking.status,
      price: booking.price
    }))
    
    console.log('[GET Player Bookings] SUCCESS - returning data')

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      debug: {
        playerId,
        playerName: player.name,
        playerPhone: player.phone,
        clubId: session.clubId,
        bookingCount,
        returnedCount: formattedBookings.length
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