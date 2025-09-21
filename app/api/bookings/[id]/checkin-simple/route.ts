import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function POST(
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
    const { id: bookingId } = await params

    // Try to get as a regular booking first
    let booking = await prisma.booking.findUnique({
      where: { 
        id: bookingId,
        clubId: session.clubId 
      },
      include: {
        Court: { select: { name: true } }
      }
    })

    let isGroup = false

    // If not found, try as booking group
    if (!booking) {
      const bookingGroup = await prisma.bookingGroup.findUnique({
        where: { 
          id: bookingId,
          clubId: session.clubId 
        }
      })

      if (bookingGroup) {
        booking = bookingGroup
        isGroup = true
      }
    }

    if (!booking) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Check if already checked in
    if (booking.checkedIn) {
      return NextResponse.json(
        { error: 'Esta reserva ya tiene check-in' },
        { status: 400 }
      )
    }

    // Check if payment is required but not completed
    if (booking.paymentStatus === 'pending') {
      return NextResponse.json(
        { 
          error: 'El pago debe completarse antes del check-in',
          requiresPayment: true,
          paymentEndpoint: `/api/bookings/${bookingId}/payment`,
          amount: booking.price / 100 // Convert to pesos for display
        },
        { status: 400 }
      )
    }

    // Perform check-in
    if (isGroup) {
      await prisma.bookingGroup.update({
        where: { id: bookingId },
        data: {
          checkedIn: true,
          checkedInAt: new Date(),
          checkedInBy: session.userId,
          status: 'CONFIRMED' // Ensure status is confirmed on check-in
        }
      })
    } else {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          checkedIn: true,
          checkedInAt: new Date(),
          checkedInBy: session.userId,
          status: 'CONFIRMED' // Ensure status is confirmed on check-in
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Check-in completado para ${isGroup ? 'reserva grupal' : 'reserva'} de ${booking.playerName}`,
      booking: {
        id: booking.id,
        playerName: booking.playerName,
        court: booking.Court?.name || 'Múltiples canchas',
        date: booking.date,
        startTime: booking.startTime,
        checkedInAt: new Date()
      }
    })

  } catch (error) {
    console.error('Error in check-in:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al realizar check-in' },
      { status: 500 }
    )
  }
}