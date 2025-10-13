import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { requireAuthAPI } from '@/lib/auth/actions'
import { addDays } from 'date-fns'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'

// GET - Send reminder notifications for upcoming classes
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'reminder'

    if (type === 'reminder') {
      // Find classes happening tomorrow
      const tomorrow = addDays(new Date(), 1)
      const startOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
      const endOfTomorrow = addDays(startOfTomorrow, 1)

      const upcomingClasses = await prisma.class.findMany({
        where: {
          clubId: session.clubId,
          date: {
            gte: startOfTomorrow,
            lt: endOfTomorrow
          },
          status: 'SCHEDULED'
        },
        include: {
          ClassBooking: {
            where: {
              status: 'CONFIRMED'
            }
          },
          Instructor: true,
          Court: true
        }
      })

      // Send notifications directly via WhatsApp
      const results = []
      for (const cls of upcomingClasses) {
        for (const booking of cls.ClassBooking) {
          if (booking.playerPhone) {
            const message = `🎾 Recordatorio: Tienes clase mañana "${cls.name}" a las ${cls.startTime} en ${cls.Court?.name || 'cancha asignada'}. ¡Te esperamos!`

            try {
              await sendWhatsAppMessage({
                to: booking.playerPhone,
                message
              })

              results.push({
                playerPhone: booking.playerPhone,
                playerName: booking.playerName,
                status: 'sent'
              })
            } catch (error) {
              results.push({
                playerPhone: booking.playerPhone,
                playerName: booking.playerName,
                status: 'failed',
                error: (error as Error).message
              })
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Se enviaron ${results.filter(r => r.status === 'sent').length} recordatorios`,
        notifications: results
      })

    } else if (type === 'pending-payments') {
      // Find classes with pending payments
      const classesWithPendingPayments = await prisma.class.findMany({
        where: {
          clubId: session.clubId,
          status: { in: ['SCHEDULED', 'COMPLETED'] }
        },
        include: {
          ClassBooking: {
            where: {
              paymentStatus: 'pending',
              status: 'CONFIRMED'
            }
          }
        }
      })

      // Send notifications directly via WhatsApp
      const results = []
      for (const cls of classesWithPendingPayments) {
        for (const booking of cls.ClassBooking) {
          if (booking.playerPhone) {
            const amount = cls.price || 0
            const message = `💰 Recordatorio de pago: Tienes un pago pendiente de $${amount} MXN por la clase "${cls.name}". Por favor, realiza tu pago.`

            try {
              await sendWhatsAppMessage({
                to: booking.playerPhone,
                message
              })

              results.push({
                playerPhone: booking.playerPhone,
                playerName: booking.playerName,
                status: 'sent'
              })
            } catch (error) {
              results.push({
                playerPhone: booking.playerPhone,
                playerName: booking.playerName,
                status: 'failed',
                error: (error as Error).message
              })
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Se enviaron ${results.filter(r => r.status === 'sent').length} recordatorios de pago`,
        notifications: results
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Tipo de notificación no válido'
    })

  } catch (error) {
    console.error('Error sending notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Error al enviar notificaciones' },
      { status: 500 }
    )
  }
}

// POST - Send custom notification
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { classId, message, studentIds } = body
    
    if (!classId || !message) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }
    
    // Get class and students
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        ClassBooking: {
          where: studentIds ? {
            id: { in: studentIds }
          } : undefined
        }
      }
    })
    
    if (!cls) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }
    
    const notifications = []
    const results = []

    for (const booking of cls.ClassBooking) {
      if (booking.playerPhone) {
        // Note: Notification model requires bookingId (court booking), not classId
        // For now, send WhatsApp directly without creating Notification record
        try {
          await sendWhatsAppMessage({
            to: booking.playerPhone,
            message
          })

          results.push({
            playerPhone: booking.playerPhone,
            playerName: booking.playerName,
            status: 'sent'
          })
        } catch (error) {
          results.push({
            playerPhone: booking.playerPhone,
            playerName: booking.playerName,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Mensaje enviado a ${results.filter(r => r.status === 'sent').length} de ${results.length} estudiantes`,
      notifications: results
    })
    
  } catch (error) {
    console.error('Error sending custom notification:', error)
    return NextResponse.json(
      { success: false, error: 'Error al enviar notificación' },
      { status: 500 }
    )
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}