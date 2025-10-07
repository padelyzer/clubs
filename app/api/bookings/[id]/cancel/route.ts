import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const cancelSchema = z.object({
  reason: z.string().optional(),
  refundAmount: z.number().min(0).optional()
})

// POST - Cancel a booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id } = paramData
    
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const bookingId = id
    const body = await request.json()
    const validatedData = cancelSchema.parse(body)

    // Get the booking - verify it belongs to user's club
    const booking = await prisma.booking.findFirst({
      where: { 
        id: bookingId,
        clubId: session.clubId 
      },
      include: {
        payments: {
          where: { status: 'completed' }
        },
        splitPayments: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Check if already cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'Esta reserva ya está cancelada' },
        { status: 400 }
      )
    }

    // Check if booking is in progress or completed
    if (booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED') {
      return NextResponse.json(
        { 
          success: false, 
          error: `No se puede cancelar una reserva ${
            booking.status === 'IN_PROGRESS' ? 'en progreso' : 'completada'
          }` 
        },
        { status: 400 }
      )
    }

    // Calculate refund if payments exist
    let refundAmount = 0
    if (booking.payments.length > 0) {
      const totalPaid = booking.payments.reduce(
        (sum, payment) => sum + payment.amount, 
        0
      )

      // Get cancellation fee from club settings
      const clubSettings = await prisma.clubSettings.findUnique({
        where: { clubId: booking.clubId }
      })

      const cancellationFee = clubSettings?.cancellationFee || 0
      refundAmount = validatedData.refundAmount ?? (totalPaid - cancellationFee)
      
      // Create refund payment record if there's a refund
      if (refundAmount > 0) {
        await prisma.payment.create({
          data: {
            bookingId,
            amount: -refundAmount, // Negative amount for refund
            currency: 'MXN',
            method: 'STRIPE', // Or the original payment method
            status: 'refunded'
          }
        })
      }
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        notes: validatedData.reason 
          ? `${booking.notes || ''}\nMotivo de cancelación: ${validatedData.reason}`.trim()
          : booking.notes
      },
      include: {
        court: true
      }
    })

    // Update split payments if enabled
    if (booking.splitPaymentEnabled) {
      await prisma.splitPayment.updateMany({
        where: {
          bookingId,
          status: 'pending'
        },
        data: {
          status: 'cancelled'
        }
      })
    }

    // Create cancellation notification
    await prisma.notification.create({
      data: {
        bookingId,
        type: 'WHATSAPP',
        template: 'BOOKING_CANCELLED',
        recipient: booking.playerPhone,
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      refund: refundAmount > 0 ? {
        amount: refundAmount,
        status: 'processing'
      } : null,
      message: 'Reserva cancelada exitosamente'
    })

  } catch (error) {
    console.error('Error cancelling booking:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al cancelar la reserva' },
      { status: 500 }
    )
  }
}