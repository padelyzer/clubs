import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// GET - Get single player details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const playerId = id

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

    // Get player statistics
    const [bookingsCount, totalSpent, lastBooking] = await Promise.all([
      // Count total bookings
      prisma.booking.count({
        where: {
          clubId: session.clubId,
          playerPhone: player.phone,
          status: { not: 'CANCELLED' }
        }
      }),
      // Calculate total spent
      prisma.booking.aggregate({
        where: {
          clubId: session.clubId,
          playerPhone: player.phone,
          paymentStatus: 'completed'
        },
        _sum: {
          price: true
        }
      }),
      // Get last booking
      prisma.booking.findFirst({
        where: {
          clubId: session.clubId,
          playerPhone: player.phone
        },
        orderBy: {
          date: 'desc'
        },
        select: {
          date: true,
          court: {
            select: {
              name: true
            }
          }
        }
      })
    ])

    // Update player statistics if changed
    const updatedStats: any = {}
    if (bookingsCount !== player.totalBookings) {
      updatedStats.totalBookings = bookingsCount
    }
    if (totalSpent._sum.price !== player.totalSpent) {
      updatedStats.totalSpent = totalSpent._sum.price || 0
    }
    if (lastBooking && lastBooking.date !== player.lastBookingAt) {
      updatedStats.lastBookingAt = lastBooking.date
    }

    // Update if there are changes
    if (Object.keys(updatedStats).length > 0) {
      await prisma.player.update({
        where: { id: playerId },
        data: updatedStats
      })
    }

    return NextResponse.json({
      success: true,
      player: {
        ...player,
        ...updatedStats,
        statistics: {
          totalBookings: bookingsCount,
          totalSpent: totalSpent._sum.price || 0,
          lastBooking: lastBooking ? {
            date: lastBooking.date,
            court: lastBooking.court.name
          } : null
        }
      }
    })

  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener jugador' },
      { status: 500 }
    )
  }
}