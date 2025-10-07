import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// GET - Get player's booking history (SIMPLIFIED VERSION)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[GET Player Bookings] Starting...')
    
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const paramData = await params
    const { id: playerId } = paramData
    
    console.log('[GET Player Bookings] Player ID:', playerId)
    
    // Simplified URL parsing to avoid Next.js 15 issues
    let limit = 20
    let offset = 0
    let status = null
    
    try {
      const { searchParams } = new URL(request.url)
      limit = parseInt(searchParams.get('limit') || '20')
      offset = parseInt(searchParams.get('offset') || '0')
      status = searchParams.get('status')
      console.log('[GET Player Bookings] URL params parsed successfully')
    } catch (urlError) {
      console.log('[GET Player Bookings] URL parsing error, using defaults:', urlError)
    }

    // Get player to verify it exists
    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        clubId: session.clubId
      }
    })

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Jugador no encontrado' },
        { status: 404 }
      )
    }

    // Build OR conditions for matching bookings
    const orConditions: any[] = []
    
    if (player.name) {
      orConditions.push({ playerName: player.name })
    }
    
    if (player.email) {
      orConditions.push({ playerEmail: player.email })
    }
    
    if (player.phone) {
      orConditions.push({ playerPhone: player.phone })
    }
    
    console.log('Searching bookings for player:', {
      playerId: player.id,
      name: player.name,
      email: player.email,
      phone: player.phone,
      orConditions
    })

    console.log('[GET Player Bookings] OR conditions:', orConditions)
    
    // Simplified booking query (no complex includes for now)
    console.log('[GET Player Bookings] Fetching bookings...')
    const bookings = await prisma.booking.findMany({
      where: {
        clubId: session.clubId,
        ...(orConditions.length > 0 ? { OR: orConditions } : {}),
        ...(status ? { status } : {})
      },
      include: {
        Court: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: limit,
      skip: offset
    })
    
    console.log('[GET Player Bookings] Found bookings:', bookings.length)

    // Count total bookings for pagination
    const total = await prisma.booking.count({
      where: {
        clubId: session.clubId,
        ...(orConditions.length > 0 ? { OR: orConditions } : {}),
        ...(status ? { status } : {})
      }
    })

    // Simplified formatting (no complex group logic for now)
    console.log('[GET Player Bookings] Formatting bookings...')
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      type: booking.bookingGroupId ? 'group' : 'individual',
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      court: booking.Court?.name || 'Sin cancha',
      courtType: booking.Court?.type || 'PADEL',
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.price,
      splitPaymentEnabled: booking.splitPaymentEnabled || false,
      totalPlayers: booking.totalPlayers,
      checkedIn: booking.checkedIn,
      checkedInAt: booking.checkedInAt
    }))
    
    console.log('[GET Player Bookings] Formatted bookings:', formattedBookings.length)

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Error fetching player bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener historial de reservas' },
      { status: 500 }
    )
  }
}