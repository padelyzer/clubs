import { prisma } from '@/lib/config/prisma'
import { NotificationType } from '@prisma/client'

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

export class WhatsAppService {
  /**
   * Send WhatsApp template message using Twilio
   */
  static async sendTemplateMessage(message: SendWhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      const formattedPhone = formatPhoneForWhatsApp(message.to)
      
      const result = await twilioClient.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${formattedPhone}`,
        contentSid: this.getTemplateSid(message.templateName),
        contentVariables: JSON.stringify(message.templateData),
      })

      return {
        success: true,
        messageSid: result.sid,
        status: result.status
      }
    } catch (error: any) {
      console.error('WhatsApp send error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp message'
      }
    }
  }

  /**
   * Send interactive message with buttons
   */
  static async sendInteractiveMessage(to: string, body: string, buttons: Array<{id: string, title: string}>) {
    try {
      const formattedPhone = formatPhoneForWhatsApp(to)
      
      const result = await twilioClient.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${formattedPhone}`,
        body,
        // Note: Interactive messages with buttons require specific Twilio setup
        // This is a basic implementation - may need adjustment based on Twilio configuration
      })

      return {
        success: true,
        messageSid: result.sid,
        status: result.status
      }
    } catch (error: any) {
      console.error('WhatsApp interactive message error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get message status from Twilio
   */
  static async getMessageStatus(messageSid: string) {
    try {
      const message = await twilioClient.messages(messageSid).fetch()
      return {
        success: true,
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        dateUpdated: message.dateUpdated
      }
    } catch (error: any) {
      console.error('Error fetching message status:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Send booking confirmation message
   */
  static async sendBookingConfirmation(bookingId: string): Promise<WhatsAppResponse> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          club: true,
          court: true,
          splitPayments: true
        }
      })

      if (!booking) {
        return { success: false, error: 'Booking not found' }
      }

      const templateData = buildTemplateData('BOOKING_CONFIRMATION', {
        playerName: booking.playerName,
        clubName: booking.club.name,
        courtName: booking.court.name,
        bookingDate: booking.date.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        bookingTime: booking.startTime,
        totalPrice: (booking.price / 100).toFixed(2),
        paymentMethod: booking.paymentType === 'ONSITE' ? 'Pagar en club' : 'Pago dividido'
      })

      const result = await this.sendTemplateMessage({
        to: booking.playerPhone,
        templateName: WhatsAppTemplates.BOOKING_CONFIRMATION.name,
        templateLanguage: WhatsAppTemplates.BOOKING_CONFIRMATION.language,
        templateData
      })

      // Log notification
      await this.logNotification({
        bookingId,
        type: 'WHATSAPP',
        template: 'BOOKING_CONFIRMATION',
        recipient: booking.playerPhone,
        status: result.success ? 'sent' : 'failed',
        twilioSid: result.messageSid,
        errorMessage: result.error
      })

      return result
    } catch (error: any) {
      console.error('Booking confirmation error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send payment completed notification to individual player
   */
  static async sendPaymentCompleted(splitPaymentId: string): Promise<WhatsAppResponse> {
    try {
      const splitPayment = await prisma.splitPayment.findUnique({
        where: { id: splitPaymentId },
        include: {
          booking: {
            include: {
              club: true,
              court: true
            }
          },
          bookingGroup: {
            include: {
              club: true,
              bookings: {
                include: {
                  court: true
                }
              }
            }
          }
        }
      })

      if (!splitPayment) {
        return { success: false, error: 'Split payment not found' }
      }

      const bookingData = splitPayment.bookingGroup || splitPayment.booking
      const isGroup = !!splitPayment.bookingGroup
      const courtInfo = isGroup 
        ? splitPayment.bookingGroup.bookings.map(b => b.court.name).join(', ')
        : splitPayment.booking.court.name

      const templateData = buildTemplateData('PAYMENT_COMPLETED', {
        playerName: splitPayment.playerName,
        clubName: bookingData.club.name,
        courtName: courtInfo,
        bookingDate: bookingData.date.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        bookingTime: bookingData.startTime,
        amount: (splitPayment.amount / 100).toFixed(2),
        receiptNumber: splitPayment.stripeChargeId || 'N/A'
      })

      const result = await this.sendTemplateMessage({
        to: splitPayment.playerPhone,
        templateName: WhatsAppTemplates.PAYMENT_COMPLETED?.name || 'payment_completed',
        templateLanguage: WhatsAppTemplates.PAYMENT_COMPLETED?.language || 'es',
        templateData
      })

      // Log notification
      await this.logNotification({
        bookingId: bookingData.id,
        splitPaymentId,
        type: 'WHATSAPP',
        template: 'PAYMENT_COMPLETED',
        recipient: splitPayment.playerPhone,
        status: result.success ? 'sent' : 'failed',
        twilioSid: result.messageSid,
        errorMessage: result.error
      })

      return result
    } catch (error: any) {
      console.error('Payment completed notification error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send booking fully paid notification to organizer
   */
  static async sendBookingFullyPaid(bookingId: string): Promise<WhatsAppResponse> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          club: true,
          court: true,
          splitPayments: true
        }
      })

      if (!booking) {
        return { success: false, error: 'Booking not found' }
      }

      const completedPayments = booking.splitPayments.filter(sp => sp.status === 'completed')
      
      const templateData = buildTemplateData('BOOKING_FULLY_PAID', {
        playerName: booking.playerName,
        clubName: booking.club.name,
        courtName: booking.court.name,
        bookingDate: booking.date.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        bookingTime: booking.startTime,
        totalAmount: (booking.price / 100).toFixed(2),
        playersCount: completedPayments.length.toString()
      })

      const result = await this.sendTemplateMessage({
        to: booking.playerPhone,
        templateName: WhatsAppTemplates.BOOKING_FULLY_PAID?.name || 'booking_fully_paid',
        templateLanguage: WhatsAppTemplates.BOOKING_FULLY_PAID?.language || 'es',
        templateData
      })

      // Log notification
      await this.logNotification({
        bookingId,
        type: 'WHATSAPP',
        template: 'BOOKING_FULLY_PAID',
        recipient: booking.playerPhone,
        status: result.success ? 'sent' : 'failed',
        twilioSid: result.messageSid,
        errorMessage: result.error
      })

      return result
    } catch (error: any) {
      console.error('Booking fully paid notification error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send payment pending notifications to split payment players
   */
  static async sendPaymentPendingNotifications(bookingId: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          club: true,
          court: true,
          splitPayments: {
            where: { status: 'pending' }
          }
        }
      })

      if (!booking || booking.splitPayments.length === 0) {
        return { success: false, error: 'No pending payments found' }
      }

      const results = []

      for (const splitPayment of booking.splitPayments) {
        // Use stripePaymentIntentId if available, otherwise use local payment page
        const paymentLink = splitPayment.stripePaymentIntentId || 
          `${process.env.NEXT_PUBLIC_APP_URL}/pay/${booking.id}?split=${splitPayment.id}`
        
        const templateData = buildTemplateData('PAYMENT_PENDING', {
          playerName: splitPayment.playerName,
          organizerName: booking.playerName,
          clubName: booking.club.name,
          bookingDate: booking.date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          amount: (splitPayment.amount / 100).toFixed(2),
          paymentLink
        })

        const result = await this.sendTemplateMessage({
          to: splitPayment.playerPhone,
          templateName: WhatsAppTemplates.PAYMENT_PENDING.name,
          templateLanguage: WhatsAppTemplates.PAYMENT_PENDING.language,
          templateData
        })

        // Log notification
        await this.logNotification({
          bookingId,
          splitPaymentId: splitPayment.id,
          type: 'WHATSAPP',
          template: 'PAYMENT_PENDING',
          recipient: splitPayment.playerPhone,
          status: result.success ? 'sent' : 'failed',
          twilioSid: result.messageSid,
          errorMessage: result.error
        })

        results.push(result)
      }

      return { success: true, results }
    } catch (error: any) {
      console.error('Payment pending notifications error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send payment link notification for Stripe payments
   */
  static async sendPaymentLink(bookingId: string, paymentLink: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          club: true,
          court: true
        }
      })

      if (!booking) {
        return { success: false, error: 'Booking not found' }
      }

      const templateData = buildTemplateData('PAYMENT_LINK', {
        playerName: booking.playerName,
        clubName: booking.club.name,
        courtName: booking.court.name,
        bookingDate: booking.date.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        bookingTime: booking.startTime,
        totalPrice: (booking.price / 100).toFixed(2),
        paymentLink
      })

      const result = await this.sendTemplateMessage({
        to: booking.playerPhone,
        templateName: WhatsAppTemplates.PAYMENT_LINK?.name || 'payment_link',
        templateLanguage: WhatsAppTemplates.PAYMENT_LINK?.language || 'es_MX',
        templateData
      })

      // Log notification
      await this.logNotification({
        bookingId,
        type: 'WHATSAPP',
        template: 'PAYMENT_LINK',
        recipient: booking.playerPhone,
        status: result.success ? 'sent' : 'failed',
        twilioSid: result.messageSid,
        errorMessage: result.error
      })

      return result
    } catch (error: any) {
      console.error('Payment link notification error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send booking reminder (2 hours before)
   */
  static async sendBookingReminder(bookingId: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          club: true,
          court: true,
          splitPayments: {
            where: { status: 'completed' }
          }
        }
      })

      if (!booking) {
        return { success: false, error: 'Booking not found' }
      }

      const results = []

      // Send to organizer
      const organizerTemplateData = buildTemplateData('BOOKING_REMINDER', {
        playerName: booking.playerName,
        clubName: booking.club.name,
        courtName: booking.court.name,
        timeRemaining: '2 horas',
        clubAddress: `${booking.club.address}, ${booking.club.city}`
      })

      const organizerResult = await this.sendTemplateMessage({
        to: booking.playerPhone,
        templateName: WhatsAppTemplates.BOOKING_REMINDER.name,
        templateLanguage: WhatsAppTemplates.BOOKING_REMINDER.language,
        templateData: organizerTemplateData
      })

      await this.logNotification({
        bookingId,
        type: 'WHATSAPP',
        template: 'BOOKING_REMINDER',
        recipient: booking.playerPhone,
        status: organizerResult.success ? 'sent' : 'failed',
        twilioSid: organizerResult.messageSid,
        errorMessage: organizerResult.error
      })

      results.push({ type: 'organizer', result: organizerResult })

      // Send to split payment players
      for (const splitPayment of booking.splitPayments) {
        const playerTemplateData = buildTemplateData('BOOKING_REMINDER', {
          playerName: splitPayment.playerName,
          clubName: booking.club.name,
          courtName: booking.court.name,
          timeRemaining: '2 horas',
          clubAddress: `${booking.club.address}, ${booking.club.city}`
        })

        const result = await this.sendTemplateMessage({
          to: splitPayment.playerPhone,
          templateName: WhatsAppTemplates.BOOKING_REMINDER.name,
          templateLanguage: WhatsAppTemplates.BOOKING_REMINDER.language,
          templateData: playerTemplateData
        })

        await this.logNotification({
          bookingId,
          splitPaymentId: splitPayment.id,
          type: 'WHATSAPP',
          template: 'BOOKING_REMINDER',
          recipient: splitPayment.playerPhone,
          status: result.success ? 'sent' : 'failed',
          twilioSid: result.messageSid,
          errorMessage: result.error
        })

        results.push({ type: 'player', result })
      }

      return { success: true, results }
    } catch (error: any) {
      console.error('Booking reminder error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send payment completion confirmation
   */
  static async sendPaymentCompleted(splitPaymentId: string) {
    try {
      const splitPayment = await prisma.splitPayment.findUnique({
        where: { id: splitPaymentId },
        include: {
          booking: {
            include: {
              club: true,
              court: true
            }
          }
        }
      })

      if (!splitPayment) {
        return { success: false, error: 'Split payment not found' }
      }

      const templateData = buildTemplateData('PAYMENT_COMPLETED', {
        playerName: splitPayment.playerName,
        clubName: splitPayment.booking.club.name,
        bookingDate: splitPayment.booking.date.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        bookingTime: splitPayment.booking.startTime,
        paymentStatus: 'Pagado ✅'
      })

      const result = await this.sendTemplateMessage({
        to: splitPayment.playerPhone,
        templateName: WhatsAppTemplates.PAYMENT_COMPLETED.name,
        templateLanguage: WhatsAppTemplates.PAYMENT_COMPLETED.language,
        templateData
      })

      await this.logNotification({
        bookingId: splitPayment.bookingId,
        splitPaymentId: splitPayment.id,
        type: 'WHATSAPP',
        template: 'PAYMENT_COMPLETED',
        recipient: splitPayment.playerPhone,
        status: result.success ? 'sent' : 'failed',
        twilioSid: result.messageSid,
        errorMessage: result.error
      })

      return result
    } catch (error: any) {
      console.error('Payment completed notification error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send booking cancellation notification
   */
  static async sendBookingCancellation(bookingId: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          club: true,
          court: true,
          splitPayments: true
        }
      })

      if (!booking) {
        return { success: false, error: 'Booking not found' }
      }

      const results = []
      const refundInfo = booking.paymentStatus === 'completed' 
        ? 'Reembolso procesándose en 3-5 días hábiles' 
        : 'Sin cargo aplicado'

      // Send to organizer
      const organizerTemplateData = buildTemplateData('BOOKING_CANCELLED', {
        playerName: booking.playerName,
        clubName: booking.club.name,
        bookingDate: booking.date.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        bookingTime: booking.startTime,
        refundInfo
      })

      const organizerResult = await this.sendTemplateMessage({
        to: booking.playerPhone,
        templateName: WhatsAppTemplates.BOOKING_CANCELLED.name,
        templateLanguage: WhatsAppTemplates.BOOKING_CANCELLED.language,
        templateData: organizerTemplateData
      })

      await this.logNotification({
        bookingId,
        type: 'WHATSAPP',
        template: 'BOOKING_CANCELLED',
        recipient: booking.playerPhone,
        status: organizerResult.success ? 'sent' : 'failed',
        twilioSid: organizerResult.messageSid,
        errorMessage: organizerResult.error
      })

      results.push({ type: 'organizer', result: organizerResult })

      // Send to split payment players
      for (const splitPayment of booking.splitPayments) {
        const playerTemplateData = buildTemplateData('BOOKING_CANCELLED', {
          playerName: splitPayment.playerName,
          clubName: booking.club.name,
          bookingDate: booking.date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          bookingTime: booking.startTime,
          refundInfo: splitPayment.status === 'completed' 
            ? 'Reembolso procesándose en 3-5 días hábiles' 
            : 'Sin cargo aplicado'
        })

        const result = await this.sendTemplateMessage({
          to: splitPayment.playerPhone,
          templateName: WhatsAppTemplates.BOOKING_CANCELLED.name,
          templateLanguage: WhatsAppTemplates.BOOKING_CANCELLED.language,
          templateData: playerTemplateData
        })

        await this.logNotification({
          bookingId,
          splitPaymentId: splitPayment.id,
          type: 'WHATSAPP',
          template: 'BOOKING_CANCELLED',
          recipient: splitPayment.playerPhone,
          status: result.success ? 'sent' : 'failed',
          twilioSid: result.messageSid,
          errorMessage: result.error
        })

        results.push({ type: 'player', result })
      }

      return { success: true, results }
    } catch (error: any) {
      console.error('Booking cancellation notification error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Bulk send messages
   */
  static async sendBulkMessages(recipients: Array<{phone: string, templateName: string, templateData: Record<string, string>}>) {
    const results = []
    
    for (const recipient of recipients) {
      const result = await this.sendTemplateMessage({
        to: recipient.phone,
        templateName: recipient.templateName,
        templateLanguage: 'es_MX',
        templateData: recipient.templateData
      })
      
      results.push({
        phone: recipient.phone,
        result
      })
      
      // Rate limiting - small delay between messages
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    return { success: true, results }
  }

  /**
   * Get WhatsApp template SID from environment
   */
  private static getTemplateSid(templateName: string): string {
    const templates: Record<string, string> = {
      'booking_confirmation': process.env.TWILIO_TEMPLATE_BOOKING_CONFIRMATION!,
      'booking_reminder': process.env.TWILIO_TEMPLATE_BOOKING_REMINDER!,
      'payment_pending': process.env.TWILIO_TEMPLATE_PAYMENT_PENDING!,
      'booking_cancelled': process.env.TWILIO_TEMPLATE_BOOKING_CANCELLED!,
      'payment_completed': process.env.TWILIO_TEMPLATE_PAYMENT_COMPLETED!,
    }
    
    return templates[templateName] || templates['booking_confirmation']
  }

  /**
   * Log notification to database
   */
  private static async logNotification(data: {
    bookingId: string
    splitPaymentId?: string
    type: 'WHATSAPP' | 'EMAIL' | 'SMS'
    template: string
    recipient: string
    status: 'pending' | 'sent' | 'delivered' | 'failed'
    twilioSid?: string
    errorMessage?: string
  }) {
    try {
      await prisma.notification.create({
        data: {
          bookingId: data.bookingId,
          splitPaymentId: data.splitPaymentId,
          type: data.type,
          template: data.template,
          recipient: data.recipient,
          status: data.status,
          twilioSid: data.twilioSid,
          errorMessage: data.errorMessage,
          sentAt: data.status === 'sent' ? new Date() : null
        }
      })
    } catch (error) {
      console.error('Error logging notification:', error)
    }
  }

  /**
   * Update notification status (for webhooks)
   */
  static async updateNotificationStatus(twilioSid: string, status: 'delivered' | 'failed', errorMessage?: string) {
    try {
      await prisma.notification.updateMany({
        where: { twilioSid },
        data: {
          status,
          errorMessage,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error updating notification status:', error)
    }
  }

  /**
   * Get notification statistics for a club
   */
  static async getNotificationStats(clubId: string, dateFrom?: Date, dateTo?: Date) {
    try {
      const whereClause = {
        booking: {
          clubId
        },
        ...(dateFrom && dateTo && {
          createdAt: {
            gte: dateFrom,
            lte: dateTo
          }
        })
      }

      const [total, sent, delivered, failed] = await Promise.all([
        prisma.notification.count({ where: whereClause }),
        prisma.notification.count({ where: { ...whereClause, status: 'sent' } }),
        prisma.notification.count({ where: { ...whereClause, status: 'delivered' } }),
        prisma.notification.count({ where: { ...whereClause, status: 'failed' } }),
      ])

      return {
        total,
        sent,
        delivered,
        failed,
        pending: total - sent - delivered - failed,
        deliveryRate: total > 0 ? ((delivered / total) * 100).toFixed(2) : '0.00',
        successRate: total > 0 ? (((sent + delivered) / total) * 100).toFixed(2) : '0.00'
      }
    } catch (error) {
      console.error('Error getting notification stats:', error)
      return {
        total: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        pending: 0,
        deliveryRate: '0.00',
        successRate: '0.00'
      }
    }
  }
}