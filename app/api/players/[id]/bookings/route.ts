import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// GET - Get player's booking history
export async function GET(
  request: NextRequest,
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
    const { id: playerId } = await params
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

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

    // Find all bookings that match player by name, email or phone
    const bookings = await prisma.booking.findMany({
      where: {
        clubId: session.clubId,
        ...(orConditions.length > 0 ? { OR: orConditions } : {}),
        ...(status ? { status } : {})
      },
      include: {
        Court: true,
        bookingGroup: {
          include: {
            splitPayments: true,
            bookings: {
              include: {
                Court: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Count total bookings for pagination
    const total = await prisma.booking.count({
      where: {
        clubId: session.clubId,
        ...(orConditions.length > 0 ? { OR: orConditions } : {}),
        ...(status ? { status } : {})
      }
    })

    // Format bookings for response - differentiating group bookings
    const formattedBookings = bookings.map(booking => {
      // Check if this is part of a group booking
      if (booking.bookingGroup) {
        const group = booking.bookingGroup
        
        // Determine player's role in the group booking
        let role: 'organizer' | 'payer' | 'participant' = 'participant'
        let amountPaid = 0
        let paymentDetails = null
        
        // Check if player is the organizer
        const isOrganizer = 
          (player.name && group.playerName === player.name) ||
          (player.email && group.playerEmail === player.email) ||
          (player.phone && group.playerPhone === player.phone)
        
        if (isOrganizer) {
          role = 'organizer'
        }
        
        // Check if player has a split payment
        const playerSplitPayment = group.splitPayments.find(sp => 
          (player.name && sp.playerName === player.name) ||
          (player.email && sp.playerEmail === player.email) ||
          (player.phone && sp.playerPhone === player.phone)
        )
        
        if (playerSplitPayment) {
          role = isOrganizer ? 'organizer' : 'payer'
          amountPaid = playerSplitPayment.amount
          paymentDetails = {
            status: playerSplitPayment.status,
            paidAt: playerSplitPayment.paidAt,
            amount: playerSplitPayment.amount
          }
        }
        
        // Count total courts in the group
        const courtsInGroup = group.bookings.length
        
        return {
          id: booking.id,
          type: 'group',
          groupId: group.id,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          court: booking.Court?.name || 'Sin cancha',
          courtType: booking.Court?.type || 'PADEL',
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          
          // Group-specific fields
          role,
          amountPaid,
          totalGroupPrice: group.price,
          courtsInGroup,
          groupOrganizer: group.playerName,
          paymentDetails,
          
          // Individual booking price (per court)
          individualPrice: booking.price,
          splitPaymentEnabled: group.splitPaymentEnabled,
          totalPlayers: group.totalPlayers,
          
          checkedIn: booking.checkedIn,
          checkedInAt: booking.checkedInAt
        }
      }
      
      // Regular individual booking
      return {
        id: booking.id,
        type: 'individual',
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        court: booking.Court?.name || 'Sin cancha',
        courtType: booking.Court?.type || 'PADEL',
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.price,
        splitPaymentEnabled: booking.splitPaymentEnabled,
        totalPlayers: booking.totalPlayers,
        checkedIn: booking.checkedIn,
        checkedInAt: booking.checkedInAt
      }
    })

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