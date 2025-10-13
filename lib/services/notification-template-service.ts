import { prisma } from '@/lib/config/prisma'
import { NotificationType } from '@prisma/client'

export interface TemplateVariable {
  key: string
  description: string
  example: string
  required: boolean
}

export interface DynamicTemplate {
  id: string
  name: string
  type: NotificationType
  subject?: string
  body: string
  variables: TemplateVariable[]
  performance?: {
    deliveryRate: number
    openRate: number
    clickRate: number
  }
}

export class NotificationTemplateService {
  
  /**
   * Get personalized template based on player history
   */
  static async getPersonalizedTemplate(
    clubId: string,
    playerId: string,
    type: NotificationType,
    data: Record<string, any>
  ): Promise<string> {
    try {
      // Get player history
      const playerHistory = await this.getPlayerHistory(playerId, clubId)
      
      // Get base template
      let template = await this.getTemplate(clubId, type)
      
      // Personalize based on history
      if (playerHistory.bookingsCount > 10) {
        template = this.addVIPPersonalization(template, playerHistory)
      }
      
      // Add contextual elements
      template = await this.addContextualElements(template, data, playerHistory)
      
      // Add special offers if applicable
      template = await this.addSpecialOffers(template, data, playerHistory)
      
      // Replace variables
      template = this.replaceVariables(template, data)
      
      return template
      
    } catch (error) {
      console.error('Error personalizing template:', error)
      // Return default template as fallback
      return this.getDefaultTemplate(type, data)
    }
  }

  /**
   * Get player history for personalization
   */
  private static async getPlayerHistory(playerId: string, clubId: string) {
    const [bookingsCount, lastBooking, totalSpent, favoriteCourtData, preferredTimes] = await Promise.all([
      // Total bookings
      prisma.booking.count({
        where: {
          playerPhone: playerId,
          clubId
        }
      }),
      
      // Last booking
      prisma.booking.findFirst({
        where: {
          playerPhone: playerId,
          clubId
        },
        orderBy: { createdAt: 'desc' },
        include: { Court: true }
      }),
      
      // Total spent
      prisma.booking.aggregate({
        where: {
          playerPhone: playerId,
          clubId,
          paymentStatus: 'completed'
        },
        _sum: { price: true }
      }),
      
      // Favorite court
      prisma.booking.groupBy({
        by: ['courtId'],
        where: {
          playerPhone: playerId,
          clubId
        },
        _count: { courtId: true },
        orderBy: {
          _count: { courtId: 'desc' }
        },
        take: 1
      }),
      
      // Preferred times
      prisma.booking.findMany({
        where: {
          playerPhone: playerId,
          clubId
        },
        select: { startTime: true },
        take: 10
      })
    ])
    
    // Analyze preferred times
    const timePreference = this.analyzeTimePreference(preferredTimes.map(b => b.startTime))
    
    // Get favorite court details
    let favoriteCourt = null
    if (favoriteCourtData.length > 0) {
      favoriteCourt = await prisma.court.findUnique({
        where: { id: favoriteCourtData[0].courtId }
      })
    }
    
    return {
      bookingsCount,
      lastBooking,
      totalSpent: totalSpent._sum.price || 0,
      favoriteCourt,
      timePreference,
      isVIP: bookingsCount > 10,
      isRegular: bookingsCount > 5,
      isNew: bookingsCount <= 2
    }
  }

  /**
   * Add VIP personalization to template
   */
  private static addVIPPersonalization(template: string, playerHistory: any): string {
    const vipGreeting = '⭐ ¡Hola, jugador VIP! ⭐\n\n'
    const vipFooter = '\n\n🏆 Gracias por ser parte de nuestro club exclusivo.'
    
    if (playerHistory.bookingsCount > 20) {
      return vipGreeting + template + vipFooter
    }
    
    if (playerHistory.bookingsCount > 10) {
      return '⭐ ' + template + '\n\n💫 Valoramos tu preferencia.'
    }
    
    return template
  }

  /**
   * Add contextual elements based on booking data
   */
  private static async addContextualElements(
    template: string,
    data: Record<string, any>,
    playerHistory: any
  ): Promise<string> {
    const contextElements = []
    
    // Weather-based suggestions
    if (data.bookingTime) {
      const hour = parseInt(data.bookingTime.split(':')[0])
      if (hour >= 6 && hour <= 10) {
        contextElements.push('☀️ ¡Excelente elección para jugar temprano!')
      } else if (hour >= 18 && hour <= 22) {
        contextElements.push('🌙 Disfruta del juego nocturno con nuestra iluminación LED')
      }
    }
    
    // Day-based suggestions
    const bookingDate = data.bookingDate ? new Date(data.bookingDate) : null
    if (bookingDate) {
      const dayOfWeek = bookingDate.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        contextElements.push('🎉 ¡Fin de semana deportivo!')
      }
    }
    
    // Favorite court mention
    if (playerHistory.favoriteCourt && data.courtName === playerHistory.favoriteCourt.name) {
      contextElements.push(`🎯 Tu cancha favorita ${data.courtName} te espera`)
    }
    
    // Add context to template
    if (contextElements.length > 0) {
      template += '\n\n' + contextElements.join('\n')
    }
    
    return template
  }

  /**
   * Add special offers based on conditions
   */
  private static async addSpecialOffers(
    template: string,
    data: Record<string, any>,
    playerHistory: any
  ): Promise<string> {
    const offers = []
    
    // Off-peak discount
    if (data.bookingTime) {
      const hour = parseInt(data.bookingTime.split(':')[0])
      if (hour >= 14 && hour <= 16) {
        offers.push('💰 Recuerda: 20% de descuento en horario off-peak (2PM-4PM)')
      }
    }
    
    // Loyalty reward
    if (playerHistory.bookingsCount === 9) {
      offers.push('🎁 ¡Tu próxima reserva será la #10! Tendrás una sorpresa especial')
    }
    
    // Weekend package
    const bookingDate = data.bookingDate ? new Date(data.bookingDate) : null
    if (bookingDate && bookingDate.getDay() === 5) {
      offers.push('📦 Pregunta por nuestro paquete de fin de semana')
    }
    
    // Referral program
    if (playerHistory.isRegular && !playerHistory.isVIP) {
      offers.push('👥 Invita a un amigo y ambos obtienen 15% de descuento')
    }
    
    // Add offers to template
    if (offers.length > 0) {
      template += '\n\n--- Ofertas Especiales ---\n' + offers.join('\n')
    }
    
    return template
  }

  /**
   * Analyze time preference from booking history
   */
  private static analyzeTimePreference(times: string[]): string {
    if (times.length === 0) return 'any'
    
    const hours = times.map(t => parseInt(t.split(':')[0]))
    const avgHour = Math.round(hours.reduce((a, b) => a + b, 0) / hours.length)
    
    if (avgHour >= 6 && avgHour < 12) return 'morning'
    if (avgHour >= 12 && avgHour < 18) return 'afternoon'
    if (avgHour >= 18 && avgHour < 23) return 'evening'
    return 'night'
  }

  /**
   * Get template from database or default
   */
  private static async getTemplate(clubId: string, type: NotificationType): Promise<string> {
    // Try to get custom template
    const customTemplate = await prisma.notificationTemplate.findFirst({
      where: {
        clubId,
        enabled: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (customTemplate) {
      return customTemplate.content
    }

    // Return default template
    return this.getDefaultTemplate(type, {})
  }

  /**
   * Get default template
   */
  private static getDefaultTemplate(type: NotificationType, data: Record<string, any>): string {
    const templates: Partial<Record<NotificationType, string>> = {
      WHATSAPP:
        `Hola {playerName} 👋\n\n` +
        `{message}`,

      EMAIL:
        `¡Hola {playerName}! 🎾\n\n` +
        `Tu reserva ha sido confirmada:\n\n` +
        `📅 Fecha: {bookingDate}\n` +
        `⏰ Hora: {bookingTime}\n` +
        `🏟️ Cancha: {courtName}\n` +
        `💰 Total: ${data.totalPrice || '{totalPrice}'}\n\n` +
        `¡Te esperamos!`,

      REMINDER:
        `⏰ Recordatorio - {playerName}\n\n` +
        `Tu juego es en {hoursRemaining} horas:\n` +
        `📍 {clubName}\n` +
        `🎾 Cancha: {courtName}\n` +
        `⏰ Hora: {bookingTime}\n\n` +
        `¡No olvides tu equipamiento!`,

      PAYMENT_REMINDER:
        `💰 Pago Pendiente - {playerName}\n\n` +
        `Tienes un pago pendiente de ${data.amount || '{amount}'}\n` +
        `Para tu reserva del {bookingDate}\n\n` +
        `Completa tu pago aquí: {paymentLink}`,

      CANCELLATION:
        `❌ Reserva Cancelada - {playerName}\n\n` +
        `Tu reserva del {bookingDate} a las {bookingTime} ha sido cancelada.\n\n` +
        `{refundInfo}`,

      EMAIL_CONFIRMATION:
        `¡Hola {playerName}! 🎾\n\n` +
        `Tu reserva ha sido confirmada:\n\n` +
        `📅 Fecha: {bookingDate}\n` +
        `⏰ Hora: {bookingTime}\n` +
        `🏟️ Cancha: {courtName}\n` +
        `💰 Total: ${data.totalPrice || '{totalPrice}'}\n\n` +
        `¡Te esperamos!`,

      PAYMENT_RECEIVED:
        `✅ Pago Recibido - {playerName}\n\n` +
        `Hemos recibido tu pago de ${data.amount || '{amount}'}\n` +
        `Para tu reserva del {bookingDate}\n\n` +
        `¡Gracias!`
    }

    return templates[type] || templates.WHATSAPP || 'Hola {playerName} 👋\n\n{message}'
  }

  /**
   * Replace variables in template
   */
  private static replaceVariables(template: string, data: Record<string, any>): string {
    let result = template
    
    // Replace all variables in format {variableName}
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'g')
      result = result.replace(regex, data[key] || '')
    })
    
    return result
  }

  /**
   * Create or update template
   */
  static async createTemplate(
    clubId: string,
    name: string,
    type: NotificationType,
    body: string,
    variables?: TemplateVariable[]
  ) {
    try {
      // Check if template exists
      const existing = await prisma.notificationTemplate.findFirst({
        where: { clubId, name }
      })

      // Convert variables to string array for schema
      const variableStrings = variables?.map(v => v.key) || []

      if (existing) {
        // Update existing
        return await prisma.notificationTemplate.update({
          where: { id: existing.id },
          data: {
            content: body,
            variables: variableStrings,
            updatedAt: new Date()
          }
        })
      }

      // Create new
      return await prisma.notificationTemplate.create({
        data: {
          id: `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          clubId,
          templateId: `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
          name,
          content: body,
          variables: variableStrings,
          enabled: true,
          updatedAt: new Date()
        }
      })

    } catch (error) {
      console.error('Error creating template:', error)
      throw error
    }
  }

  /**
   * Test template with sample data
   */
  static async testTemplate(
    templateId: string,
    sampleData: Record<string, any>
  ): Promise<string> {
    try {
      const template = await prisma.notificationTemplate.findUnique({
        where: { id: templateId }
      })

      if (!template) {
        throw new Error('Template not found')
      }

      return this.replaceVariables(template.content, sampleData)

    } catch (error) {
      console.error('Error testing template:', error)
      throw error
    }
  }

  /**
   * Get all templates for a club
   */
  static async getClubTemplates(clubId: string): Promise<DynamicTemplate[]> {
    const templates = await prisma.notificationTemplate.findMany({
      where: { clubId },
      orderBy: { createdAt: 'desc' }
    })

    return templates.map(t => ({
      id: t.id,
      name: t.name,
      type: 'WHATSAPP' as NotificationType, // Default type since schema doesn't have type field
      subject: t.subject || undefined,
      body: t.content,
      variables: t.variables.map(v => ({
        key: v,
        description: '',
        example: '',
        required: false
      })),
      performance: {
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0
      }
    }))
  }

  /**
   * Clone successful template
   */
  static async cloneTemplate(templateId: string, newName: string) {
    const original = await prisma.notificationTemplate.findUnique({
      where: { id: templateId }
    })

    if (!original) {
      throw new Error('Template not found')
    }

    return await prisma.notificationTemplate.create({
      data: {
        id: `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clubId: original.clubId,
        templateId: `${newName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        name: newName,
        subject: original.subject,
        content: original.content,
        variables: original.variables,
        enabled: true,
        updatedAt: new Date()
      }
    })
  }

  /**
   * A/B test templates
   */
  static async runABTest(
    clubId: string,
    templateAId: string,
    templateBId: string,
    testSize: number = 100
  ) {
    // Get upcoming bookings for test
    const bookings = await prisma.booking.findMany({
      where: {
        clubId,
        date: { gte: new Date() },
        status: 'CONFIRMED'
      },
      take: testSize,
      orderBy: { date: 'asc' }
    })
    
    const halfSize = Math.floor(bookings.length / 2)
    const groupA = bookings.slice(0, halfSize)
    const groupB = bookings.slice(halfSize)
    
    // Send notifications with different templates
    const resultsA = await this.sendWithTemplate(groupA, templateAId)
    const resultsB = await this.sendWithTemplate(groupB, templateBId)
    
    return {
      templateA: {
        sent: resultsA.length,
        delivered: resultsA.filter(r => r.delivered).length,
        clicked: resultsA.filter(r => r.clicked).length
      },
      templateB: {
        sent: resultsB.length,
        delivered: resultsB.filter(r => r.delivered).length,
        clicked: resultsB.filter(r => r.clicked).length
      }
    }
  }

  /**
   * Send notifications with specific template
   */
  private static async sendWithTemplate(bookings: any[], templateId: string) {
    // Implementation would send notifications and track results
    // This is a placeholder for the actual implementation
    return bookings.map(b => ({
      bookingId: b.id,
      delivered: Math.random() > 0.1,
      clicked: Math.random() > 0.5
    }))
  }
}