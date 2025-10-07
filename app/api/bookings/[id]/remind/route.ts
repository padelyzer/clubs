import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const remindSchema = z.object({
  splitPaymentId: z.string().optional(),
  message: z.string().optional()
})

// POST - Send payment reminder
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id } = paramData
    
    const bookingId = id
    const body = await request.json()
    const validatedData = remindSchema.parse(body)

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        court: true,
        splitPayments: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Check if booking is cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'No se pueden enviar recordatorios para reservas canceladas' },
        { status: 400 }
      )
    }

    // If specific split payment reminder
    if (validatedData.splitPaymentId) {
      const splitPayment = await prisma.splitPayment.findFirst({
        where: {
          id: validatedData.splitPaymentId,
          bookingId
        }
      })

      if (!splitPayment) {
        return NextResponse.json(
          { success: false, error: 'Pago dividido no encontrado' },
          { status: 404 }
        )
      }

      if (splitPayment.status === 'completed') {
        return NextResponse.json(
          { success: false, error: 'Este pago ya está completado' },
          { status: 400 }
        )
      }

      // Create reminder notification for specific player
      const notification = await prisma.notification.create({
        data: {
          bookingId,
          splitPaymentId: splitPayment.id,
          type: 'WHATSAPP',
          template: 'SPLIT_PAYMENT_REMINDER',
          recipient: splitPayment.playerPhone,
          status: 'pending'
        }
      })

      // Format reminder message
      const reminderMessage = validatedData.message || 
        `Hola ${splitPayment.playerName}, tienes un pago pendiente de $${(splitPayment.amount / 100).toFixed(2)} MXN para la reserva de pádel el ${booking.date.toLocaleDateString('es-MX')} a las ${booking.startTime} en ${booking.court.name}. Por favor realiza tu pago lo antes posible.`

      return NextResponse.json({
        success: true,
        notification,
        recipient: {
          name: splitPayment.playerName,
          phone: splitPayment.playerPhone,
          amount: splitPayment.amount
        },
        message: 'Recordatorio enviado exitosamente'
      })

    } else {
      // Send reminders to all pending split payments
      if (!booking.splitPaymentEnabled) {
        return NextResponse.json(
          { success: false, error: 'Esta reserva no tiene pagos divididos' },
          { status: 400 }
        )
      }

      const pendingPayments = booking.splitPayments.filter(
        sp => sp.status === 'pending' && sp.playerPhone
      )

      if (pendingPayments.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No hay pagos pendientes para recordar' },
          { status: 400 }
        )
      }

      // Create notifications for all pending payments
      const notifications = await Promise.all(
        pendingPayments.map(sp => 
          prisma.notification.create({
            data: {
              bookingId,
              splitPaymentId: sp.id,
              type: 'WHATSAPP',
              template: 'SPLIT_PAYMENT_REMINDER',
              recipient: sp.playerPhone,
              status: 'pending'
            }
          })
        )
      )

      return NextResponse.json({
        success: true,
        notificationsSent: notifications.length,
        recipients: pendingPayments.map(sp => ({
          name: sp.playerName,
          phone: sp.playerPhone,
          amount: sp.amount
        })),
        message: `${notifications.length} recordatorios enviados exitosamente`
      })
    }

  } catch (error) {
    console.error('Error sending reminder:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al enviar recordatorio' },
      { status: 500 }
    )
  }
}

// GET - Get reminder history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id } = paramData
    
    const bookingId = id

    const notifications = await prisma.notification.findMany({
      where: {
        bookingId,
        template: {
          in: ['SPLIT_PAYMENT_REMINDER', 'PAYMENT_REMINDER']
        }
      },
      include: {
        splitPayment: {
          select: {
            playerName: true,
            amount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      reminders: notifications.map(n => ({
        id: n.id,
        recipient: n.recipient,
        status: n.status,
        sentAt: n.sentAt,
        playerName: n.splitPayment?.playerName,
        amount: n.splitPayment?.amount,
        type: n.template
      })),
      total: notifications.length
    })

  } catch (error) {
    console.error('Error fetching reminder history:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener historial de recordatorios' },
      { status: 500 }
    )
  }
}