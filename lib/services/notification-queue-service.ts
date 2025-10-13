import { prisma } from '@/lib/config/prisma'
import { WhatsAppLinkService } from './whatsapp-link-service'
import { NotificationType } from '@prisma/client'

export interface QueuedNotification {
  id: string
  type: 'confirmation' | 'reminder-24h' | 'reminder-2h' | 'payment-reminder' | 'custom'
  bookingId?: string
  bookingGroupId?: string
  scheduledFor: Date
  status: 'pending' | 'processing' | 'sent' | 'failed'
  attempts: number
  lastAttempt?: Date
  error?: string
  metadata?: Record<string, any>
}

export class NotificationQueueService {
  private static readonly MAX_RETRY_ATTEMPTS = 3
  private static readonly RETRY_DELAY_MS = 5 * 60 * 1000 // 5 minutes

  /**
   * Schedule automatic notifications for a booking
   */
  static async scheduleBookingNotifications(bookingId: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          Club: true,
          Court: true
        }
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      const bookingDate = new Date(booking.date)
      const [hours, minutes] = booking.startTime.split(':').map(Number)
      bookingDate.setHours(hours, minutes, 0, 0)

      const notifications = []

      // 1. Confirmación inmediata
      notifications.push(
        await this.scheduleNotification({
          type: 'confirmation',
          bookingId,
          scheduledFor: new Date(), // Inmediato
          metadata: {
            playerName: booking.playerName,
            playerPhone: booking.playerPhone,
            clubName: booking.Club.name,
            courtName: booking.Court.name,
            bookingTime: booking.startTime
          }
        })
      )

      // 2. Recordatorio 24 horas antes
      const reminder24h = new Date(bookingDate.getTime() - 24 * 60 * 60 * 1000)
      if (reminder24h > new Date()) {
        notifications.push(
          await this.scheduleNotification({
            type: 'reminder-24h',
            bookingId,
            scheduledFor: reminder24h,
            metadata: {
              playerName: booking.playerName,
              playerPhone: booking.playerPhone,
              hoursRemaining: 24
            }
          })
        )
      }

      // 3. Recordatorio 2 horas antes
      const reminder2h = new Date(bookingDate.getTime() - 2 * 60 * 60 * 1000)
      if (reminder2h > new Date()) {
        notifications.push(
          await this.scheduleNotification({
            type: 'reminder-2h',
            bookingId,
            scheduledFor: reminder2h,
            metadata: {
              playerName: booking.playerName,
              playerPhone: booking.playerPhone,
              hoursRemaining: 2
            }
          })
        )
      }

      // 4. Si hay pago pendiente, recordatorio de pago
      if (booking.paymentStatus === 'pending' && booking.paymentType !== 'ONSITE') {
        const paymentReminder = new Date(bookingDate.getTime() - 12 * 60 * 60 * 1000)
        if (paymentReminder > new Date()) {
          notifications.push(
            await this.scheduleNotification({
              type: 'payment-reminder',
              bookingId,
              scheduledFor: paymentReminder,
              metadata: {
                playerName: booking.playerName,
                amount: booking.price
              }
            })
          )
        }
      }

      return {
        success: true,
        scheduledCount: notifications.length,
        notifications
      }

    } catch (error) {
      console.error('Error scheduling booking notifications:', error)
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Schedule a single notification
   */
  static async scheduleNotification(data: {
    type: string
    bookingId?: string
    bookingGroupId?: string
    scheduledFor: Date
    metadata?: Record<string, any>
  }) {
    // Note: This function is designed for a queue-based notification system
    // but the current schema doesn't support scheduledFor, attempts, etc.
    // Store metadata with scheduling info instead
    const metadata = {
      ...(data.metadata || {}),
      scheduledFor: data.scheduledFor.toISOString(),
      queueType: data.type
    }

    return await prisma.notification.create({
      data: {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'WHATSAPP' as NotificationType,
        template: data.type,
        recipient: data.metadata?.playerPhone || 'pending',
        recipientPhone: data.metadata?.playerPhone,
        bookingId: data.bookingId || '',
        splitPaymentId: null,
        status: 'pending',
        message: JSON.stringify(metadata),
        updatedAt: new Date()
      }
    })
  }

  /**
   * Process pending notifications
   * This should be called by a cron job every minute
   */
  static async processPendingNotifications() {
    const now = new Date()

    // Get notifications that should be sent
    const pendingNotifications = await prisma.notification.findMany({
      where: {
        status: 'pending'
      },
      include: {
        Booking: {
          include: {
            Club: true,
            Court: true,
            SplitPayment: true
          }
        }
      },
      take: 10 // Process 10 at a time to avoid overload
    })

    const results = []

    for (const notification of pendingNotifications) {
      try {
        // Send the notification based on type
        const result = await this.sendScheduledNotification(notification)

        if (result.success) {
          // Mark as sent
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
              updatedAt: new Date()
            }
          })
        } else {
          // Mark as failed
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'failed',
              errorMessage: result.error,
              updatedAt: new Date()
            }
          })
        }

        results.push(result)

      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error)

        // Mark as failed
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'failed',
            errorMessage: (error as Error).message,
            updatedAt: new Date()
          }
        })
      }
    }

    return {
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    }
  }

  /**
   * Send a scheduled notification
   */
  private static async sendScheduledNotification(notification: any) {
    const booking = notification.Booking

    if (!booking) {
      return { success: false, error: 'No booking data found' }
    }

    try {
      let result

      // Parse metadata to get queue type
      let metadata: any = {}
      try {
        metadata = notification.message ? JSON.parse(notification.message) : {}
      } catch (e) {
        metadata = {}
      }

      const queueType = metadata.queueType || notification.template

      switch (queueType) {
        case 'confirmation':
          result = await WhatsAppLinkService.sendBookingConfirmation(booking.id)
          break

        case 'reminder-24h':
        case 'reminder-2h':
          const hoursRemaining = metadata.hoursRemaining || 2
          result = await this.sendReminder(booking, hoursRemaining)
          break

        case 'payment-reminder':
          result = await this.sendPaymentReminder(booking)
          break

        default:
          result = await this.sendCustomNotification(notification)
      }

      return result

    } catch (error) {
      console.error('Error sending scheduled notification:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Send reminder notification
   */
  private static async sendReminder(booking: any, hoursRemaining: number) {
    const message =
      `⏰ Recordatorio de tu reserva\n\n` +
      `¡Hola ${booking.playerName}!\n\n` +
      `Te recordamos tu reserva en ${booking.Club?.name || 'el club'}:\n\n` +
      `📅 Fecha: ${booking.date.toLocaleDateString('es-MX')}\n` +
      `⏰ Hora: ${booking.startTime}\n` +
      `🎾 Cancha: ${booking.Court?.name || 'Cancha'}\n\n` +
      `⏳ Faltan ${hoursRemaining} horas para tu juego\n\n` +
      `¡Te esperamos! 🎾`

    return await WhatsAppLinkService.generateLink({
      clubId: booking.clubId,
      notificationType: 'REMINDER' as NotificationType,
      playerName: booking.playerName,
      playerPhone: booking.playerPhone,
      bookingId: booking.id,
      message
    })
  }

  /**
   * Send payment reminder
   */
  private static async sendPaymentReminder(booking: any) {
    const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${booking.id}`

    const message =
      `💰 Recordatorio de Pago Pendiente\n\n` +
      `¡Hola ${booking.playerName}!\n\n` +
      `Tienes un pago pendiente para tu reserva:\n\n` +
      `📅 Fecha: ${booking.date.toLocaleDateString('es-MX')}\n` +
      `⏰ Hora: ${booking.startTime}\n` +
      `🎾 Cancha: ${booking.Court?.name || 'Cancha'}\n` +
      `💵 Monto: $${(booking.price / 100).toFixed(2)} MXN\n\n` +
      `Completa tu pago aquí: ${paymentLink}\n\n` +
      `⚠️ Recuerda completar el pago para confirmar tu reserva`

    return await WhatsAppLinkService.generateLink({
      clubId: booking.clubId,
      notificationType: 'PAYMENT_REMINDER' as NotificationType,
      playerName: booking.playerName,
      playerPhone: booking.playerPhone,
      bookingId: booking.id,
      message
    })
  }

  /**
   * Send custom notification
   */
  private static async sendCustomNotification(notification: any) {
    let metadata: any = {}
    try {
      metadata = notification.message ? JSON.parse(notification.message) : {}
    } catch (e) {
      metadata = {}
    }

    return await WhatsAppLinkService.generateLink({
      clubId: notification.Booking?.clubId || '',
      notificationType: 'WHATSAPP' as NotificationType,
      playerName: metadata.playerName || 'Jugador',
      playerPhone: metadata.playerPhone || notification.recipientPhone,
      bookingId: notification.bookingId,
      message: metadata.customMessage || 'Tienes una nueva notificación'
    })
  }

  /**
   * Cancel scheduled notifications for a booking
   */
  static async cancelBookingNotifications(bookingId: string) {
    // Mark as failed since 'cancelled' is not in NotificationStatus enum
    const result = await prisma.notification.updateMany({
      where: {
        bookingId,
        status: 'pending'
      },
      data: {
        status: 'failed',
        errorMessage: 'Cancelled by user',
        updatedAt: new Date()
      }
    })

    return {
      success: true,
      cancelledCount: result.count
    }
  }

  /**
   * Get queue statistics
   */
  static async getQueueStats(clubId?: string) {
    const where = clubId ? {
      Booking: { clubId }
    } : {}

    const [pending, sent, failed, delivered] = await Promise.all([
      prisma.notification.count({ where: { ...where, status: 'pending' } }),
      prisma.notification.count({ where: { ...where, status: 'sent' } }),
      prisma.notification.count({ where: { ...where, status: 'failed' } }),
      prisma.notification.count({ where: { ...where, status: 'delivered' } })
    ])

    return {
      pending,
      sent,
      failed,
      delivered,
      total: pending + sent + failed + delivered
    }
  }

  /**
   * Clean old processed notifications (older than 30 days)
   */
  static async cleanOldNotifications() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const result = await prisma.notification.deleteMany({
      where: {
        status: {
          in: ['sent', 'failed', 'delivered']
        },
        sentAt: { lt: thirtyDaysAgo }
      }
    })

    return {
      success: true,
      deletedCount: result.count
    }
  }
}