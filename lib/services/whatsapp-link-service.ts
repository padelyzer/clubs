import { prisma } from '@/lib/config/prisma'
import { NotificationType } from '@prisma/client'
import { generateId } from '@/lib/utils/generate-id'

export interface WhatsAppLinkOptions {
  clubId: string
  notificationType: NotificationType
  playerName: string
  playerPhone?: string
  bookingId?: string
  bookingGroupId?: string
  message?: string
  expirationHours?: number // Optional expiration (default: 24 hours)
}

export interface WhatsAppLinkResult {
  success: boolean
  notificationId?: string
  whatsappLink?: string
  message?: string
  error?: string
}

/**
 * WhatsApp Link Service
 * Generates wa.me links for direct WhatsApp messaging without Business API
 */
export class WhatsAppLinkService {
  
  /**
   * Generate WhatsApp link with notification tracking
   */
  static async generateLink(options: WhatsAppLinkOptions): Promise<WhatsAppLinkResult> {
    try {
      // Get club information
      const club = await prisma.club.findUnique({
        where: { id: options.clubId },
        select: {
          id: true,
          name: true,
          whatsappNumber: true,
          phone: true
        }
      })

      if (!club) {
        return {
          success: false,
          error: 'Club no encontrado'
        }
      }

      // Use WhatsApp number or fallback to regular phone
      const clubPhone = club.whatsappNumber || club.phone
      if (!clubPhone) {
        return {
          success: false,
          error: 'Número de WhatsApp no configurado para el club'
        }
      }

      // Generate message content based on notification type
      const message = options.message || this.generateMessageFromClub(options, club.name)
      
      // Create wa.me link with CLIENT phone as destination
      const encodedMessage = encodeURIComponent(message)
      // Use player phone if provided, otherwise we can't create the link
      if (!options.playerPhone) {
        return {
          success: false,
          error: 'Número de teléfono del cliente requerido'
        }
      }
      const cleanPhone = this.formatPhoneForWhatsApp(options.playerPhone)
      const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodedMessage}`

      // Calculate expiration date
      const expirationHours = options.expirationHours || 24
      const linkExpiredAt = new Date()
      linkExpiredAt.setHours(linkExpiredAt.getHours() + expirationHours)

      // Create notification record with WhatsApp link tracking
      const notification = await prisma.notification.create({
        data: {
          id: generateId(),
          bookingId: options.bookingId || '', // Required field - use empty string if not provided
          type: options.notificationType,
          template: this.getNotificationTitle(options.notificationType),
          recipient: options.playerName,
          recipientPhone: options.playerPhone,
          status: 'pending',

          // Content
          message,

          // WhatsApp specific fields
          whatsappLink,

          // Relations
          splitPaymentId: undefined, // Optional field
          updatedAt: new Date()
        }
      })

      return {
        success: true,
        notificationId: notification.id,
        whatsappLink,
        message
      }

    } catch (error) {
      console.error('Error generating WhatsApp link:', error)
      return {
        success: false,
        error: 'Error generando link de WhatsApp'
      }
    }
  }

  /**
   * Track link click
   */
  static async trackLinkClick(notificationId: string): Promise<boolean> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'delivered', // Consider it delivered when clicked
          sentAt: new Date(),
          updatedAt: new Date()
        }
      })
      return true
    } catch (error) {
      console.error('Error tracking link click:', error)
      return false
    }
  }

  /**
   * Check and mark expired links
   */
  static async markExpiredLinks(): Promise<number> {
    try {
      const now = new Date()
      const result = await prisma.notification.updateMany({
        where: {
          sentAt: null,
          createdAt: {
            lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
          },
          status: 'pending'
        },
        data: {
          status: 'failed',
          updatedAt: new Date()
        }
      })

      return result.count
    } catch (error) {
      console.error('Error marking expired links:', error)
      return 0
    }
  }

  /**
   * Get notification statistics for a club
   */
  static async getNotificationStats(clubId: string, days: number = 7): Promise<Record<string, number>> {
    try {
      const since = new Date()
      since.setDate(since.getDate() - days)

      const stats = await prisma.notification.groupBy({
        by: ['status'],
        where: {
          Booking: {
            clubId
          },
          createdAt: {
            gte: since
          },
          whatsappLink: {
            not: null
          }
        },
        _count: {
          status: true
        }
      })

      return stats.reduce((acc: Record<string, number>, stat) => {
        acc[stat.status] = stat._count.status
        return acc
      }, {} as Record<string, number>)

    } catch (error) {
      console.error('Error getting notification stats:', error)
      return {}
    }
  }

  /**
   * Generate message content from club to client perspective
   */
  private static generateMessageFromClub(options: WhatsAppLinkOptions, clubName: string): string {
    const { notificationType, playerName, bookingId } = options
    const paymentUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://padelyzer.com'

    const messages: Record<string, string> = {
      PAYMENT_REMINDER:
        `¡Hola ${playerName}! 💰\n\n` +
        `Te recordamos que tienes un pago pendiente para tu reserva en ${clubName}.\n\n` +
        (bookingId ? `💳 Puedes pagar en línea:\n${paymentUrl}/pay/${bookingId}\n\n` : '') +
        `Por favor, completa el pago lo antes posible para confirmar tu reserva 🎾`,

      CANCELLATION:
        `¡Hola ${playerName}! ❌\n\n` +
        `Tu reserva en ${clubName} ha sido cancelada.\n\n` +
        `Si tienes alguna duda, no dudes en contactarnos 📞`,

      WHATSAPP:
        `¡Hola ${playerName}! 👋\n\n` +
        `Tu reserva en ${clubName} ha sido confirmada ✅\n\n` +
        `¡Te esperamos en la cancha! 🎾\n\n` +
        (bookingId ? `💳 Puedes pagar tu reserva en línea:\n${paymentUrl}/pay/${bookingId}` : ''),

      EMAIL:
        `¡Hola ${playerName}! 👋\n\n` +
        `${clubName} tiene una notificación para ti.\n\n` +
        `¡Gracias por elegirnos! 🎾`
    }

    return messages[notificationType] || messages.EMAIL
  }

  /**
   * Get notification title based on type
   */
  private static getNotificationTitle(type: NotificationType): string {
    const titles: Record<string, string> = {
      WHATSAPP: 'Notificación WhatsApp',
      EMAIL: 'Notificación Email',
      SMS: 'Notificación SMS',
      REMINDER: 'Recordatorio',
      PAYMENT_REMINDER: 'Recordatorio de Pago',
      CANCELLATION: 'Reserva Cancelada',
      EMAIL_CONFIRMATION: 'Confirmación por Email',
      PAYMENT_RECEIVED: 'Pago Recibido'
    }

    return titles[type] || titles.EMAIL
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): boolean {
    // Mexican phone number validation
    // Accepts: +52XXXXXXXXXX, 52XXXXXXXXXX, or 10 digits
    const cleanPhone = phone.replace(/[^\d]/g, '')
    
    if (cleanPhone.length === 10) return true // Local format
    if (cleanPhone.length === 12 && cleanPhone.startsWith('52')) return true // With country code
    if (cleanPhone.length === 13 && cleanPhone.startsWith('521')) return true // With mobile prefix
    
    return false
  }

  /**
   * Format phone number for wa.me links
   */
  static formatPhoneForWhatsApp(phone: string): string {
    const cleanPhone = phone.replace(/[^\d]/g, '')
    
    // If it's 10 digits, add Mexico country code
    if (cleanPhone.length === 10) {
      return `52${cleanPhone}`
    }
    
    // If it already has country code, use as is
    if (cleanPhone.length === 12 && cleanPhone.startsWith('52')) {
      return cleanPhone
    }
    
    // If it has mobile prefix (521), use as is  
    if (cleanPhone.length === 13 && cleanPhone.startsWith('521')) {
      return cleanPhone
    }
    
    return cleanPhone // Return as is for other formats
  }

  /**
   * Send booking confirmation via WhatsApp link
   */
  static async sendBookingConfirmation(bookingId: string): Promise<WhatsAppLinkResult> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          Club: { select: { id: true, name: true } },
          Court: { select: { name: true } }
        }
      })

      if (!booking) {
        return { success: false, error: 'Reserva no encontrada' }
      }

      const paymentUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://padelyzer.com'
      const customMessage =
        `¡Hola ${booking.playerName}! 👋\n\n` +
        `Tu reserva en ${booking.Club.name} ha sido confirmada:\n\n` +
        `• Fecha: ${booking.date.toLocaleDateString('es-MX')}\n` +
        `• Hora: ${booking.startTime}\n` +
        `• Cancha: ${booking.Court.name}\n` +
        `• Total: $${(booking.price / 100).toFixed(2)} MXN\n\n` +
        `💳 Puedes pagar tu reserva en línea:\n${paymentUrl}/pay/${booking.id}\n\n` +
        `¡Te esperamos! 🎾`

      return await this.generateLink({
        clubId: booking.clubId,
        notificationType: 'WHATSAPP',
        playerName: booking.playerName,
        playerPhone: booking.playerPhone,
        bookingId: booking.id,
        message: customMessage
      })

    } catch (error) {
      console.error('Error sending booking confirmation:', error)
      return { success: false, error: 'Error enviando confirmación' }
    }
  }

  /**
   * Send split payment request via WhatsApp link
   */
  static async sendSplitPaymentRequest(splitPaymentId: string): Promise<WhatsAppLinkResult> {
    try {
      const splitPayment = await prisma.splitPayment.findUnique({
        where: { id: splitPaymentId },
        include: {
          Booking: {
            include: {
              Club: { select: { id: true, name: true } },
              Court: { select: { name: true } }
            }
          }
        }
      })

      if (!splitPayment || !splitPayment.Booking) {
        return { success: false, error: 'Pago dividido no encontrado' }
      }

      const paymentUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://padelyzer.com'
      const paymentLink = `${paymentUrl}/pay/${splitPayment.Booking.id}?split=${splitPayment.id}`
      
      const customMessage =
        `¡Hola ${splitPayment.playerName}! 💸\n\n` +
        `Te han invitado a dividir el pago de una reserva:\n\n` +
        `• Club: ${splitPayment.Booking?.Club?.name || 'Club'}\n` +
        `• Fecha: ${splitPayment.Booking?.date.toLocaleDateString('es-MX') || 'Fecha por confirmar'}\n` +
        `• Hora: ${splitPayment.Booking?.startTime || 'Hora por confirmar'}\n` +
        `• Cancha: ${splitPayment.Booking?.Court?.name || 'Cancha por asignar'}\n` +
        `• Tu parte: $${(splitPayment.amount / 100).toFixed(2)} MXN\n\n` +
        `💳 Puedes pagar tu parte en línea:\n${paymentLink}\n\n` +
        `¡Nos vemos en la cancha! 🎾`

      return await this.generateLink({
        clubId: splitPayment.Booking?.clubId || '',
        notificationType: 'PAYMENT_REMINDER',
        playerName: splitPayment.playerName,
        playerPhone: splitPayment.playerPhone || '',
        bookingId: splitPayment.bookingId || undefined,
        message: customMessage
      })

    } catch (error) {
      console.error('Error sending split payment request:', error)
      return { success: false, error: 'Error enviando solicitud de pago' }
    }
  }
}

export default WhatsAppLinkService