import { prisma } from '@/lib/config/prisma'

export interface TrackingEvent {
  notificationId: string
  action: 'opened' | 'clicked' | 'replied' | 'shared' | 'ignored' | 'delivered' | 'failed'
  deviceInfo?: string
  ipAddress?: string
  location?: string
  sessionId?: string
  metadata?: Record<string, any>
}

export interface AnalyticsMetrics {
  totalSent: number
  delivered: number
  opened: number
  clicked: number
  replied: number
  failed: number
  deliveryRate: number
  openRate: number
  clickRate: number
  responseRate: number
  avgResponseTime: number
  peakHours: Array<{ hour: number, count: number }>
  topTemplates: Array<{ template: string, performance: number }>
  deviceBreakdown: Record<string, number>
}

export class NotificationAnalyticsService {
  
  /**
   * Track a notification interaction
   */
  static async trackInteraction(event: TrackingEvent) {
    try {
      // Create analytics record
      const analytics = await prisma.notificationAnalytics.create({
        data: {
          notificationId: event.notificationId,
          action: event.action,
          deviceInfo: event.deviceInfo,
          ipAddress: event.ipAddress,
          location: event.location,
          sessionId: event.sessionId || this.generateSessionId(),
          metadata: event.metadata || {},
          timestamp: new Date()
        }
      })

      // Update notification status based on action
      await this.updateNotificationStatus(event.notificationId, event.action)

      // Calculate and update session duration if this is a follow-up interaction
      if (event.sessionId) {
        await this.updateSessionDuration(event.sessionId)
      }

      // Update template performance metrics
      await this.updateTemplateMetrics(event.notificationId, event.action)

      return {
        success: true,
        analyticsId: analytics.id,
        sessionId: analytics.sessionId
      }

    } catch (error) {
      console.error('Error tracking interaction:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Update notification status based on interaction
   */
  private static async updateNotificationStatus(notificationId: string, action: string) {
    const statusMap = {
      'opened': { readAt: new Date() },
      'clicked': { linkClicked: true, clickedAt: new Date() },
      'delivered': { deliveredAt: new Date(), status: 'delivered' },
      'failed': { status: 'failed' }
    }

    const updateData = statusMap[action]
    if (updateData) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: updateData
      })
    }
  }

  /**
   * Track when a WhatsApp link is clicked
   */
  static async trackLinkClick(notificationId: string, userAgent?: string) {
    try {
      // Track the click event
      await this.trackInteraction({
        notificationId,
        action: 'clicked',
        deviceInfo: userAgent,
        metadata: { 
          clickType: 'whatsapp_link',
          timestamp: new Date().toISOString()
        }
      })

      // Update notification
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          linkClicked: true,
          clickedAt: new Date(),
          status: 'delivered'
        }
      })

      return { success: true }

    } catch (error) {
      console.error('Error tracking link click:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get comprehensive analytics for a club
   */
  static async getClubAnalytics(clubId: string, dateRange?: { from: Date, to: Date }): Promise<AnalyticsMetrics> {
    const where = {
      notification: { clubId },
      ...(dateRange && {
        timestamp: {
          gte: dateRange.from,
          lte: dateRange.to
        }
      })
    }

    // Get base metrics
    const [totalSent, delivered, opened, clicked, replied, failed] = await Promise.all([
      prisma.notification.count({ where: { clubId } }),
      prisma.notification.count({ where: { clubId, status: 'delivered' } }),
      prisma.notification.count({ where: { clubId, readAt: { not: null } } }),
      prisma.notification.count({ where: { clubId, linkClicked: true } }),
      prisma.notificationAnalytics.count({ 
        where: { ...where, action: 'replied' } 
      }),
      prisma.notification.count({ where: { clubId, status: 'failed' } })
    ])

    // Calculate rates
    const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0
    const openRate = delivered > 0 ? (opened / delivered) * 100 : 0
    const clickRate = opened > 0 ? (clicked / opened) * 100 : 0
    const responseRate = delivered > 0 ? (replied / delivered) * 100 : 0

    // Get average response time
    const avgResponseTime = await this.calculateAvgResponseTime(clubId, dateRange)

    // Get peak hours
    const peakHours = await this.getPeakHours(clubId, dateRange)

    // Get top performing templates
    const topTemplates = await this.getTopTemplates(clubId, dateRange)

    // Get device breakdown
    const deviceBreakdown = await this.getDeviceBreakdown(clubId, dateRange)

    return {
      totalSent,
      delivered,
      opened,
      clicked,
      replied,
      failed,
      deliveryRate,
      openRate,
      clickRate,
      responseRate,
      avgResponseTime,
      peakHours,
      topTemplates,
      deviceBreakdown
    }
  }

  /**
   * Calculate average response time
   */
  private static async calculateAvgResponseTime(clubId: string, dateRange?: { from: Date, to: Date }) {
    const notifications = await prisma.notification.findMany({
      where: {
        clubId,
        sentAt: { not: null },
        readAt: { not: null },
        ...(dateRange && {
          sentAt: {
            gte: dateRange.from,
            lte: dateRange.to
          }
        })
      },
      select: {
        sentAt: true,
        readAt: true
      }
    })

    if (notifications.length === 0) return 0

    const totalResponseTime = notifications.reduce((sum, n) => {
      const responseTime = n.readAt.getTime() - n.sentAt.getTime()
      return sum + responseTime
    }, 0)

    return Math.round(totalResponseTime / notifications.length / 1000 / 60) // in minutes
  }

  /**
   * Get peak hours for notifications
   */
  private static async getPeakHours(clubId: string, dateRange?: { from: Date, to: Date }) {
    const analytics = await prisma.notificationAnalytics.findMany({
      where: {
        notification: { clubId },
        action: 'opened',
        ...(dateRange && {
          timestamp: {
            gte: dateRange.from,
            lte: dateRange.to
          }
        })
      },
      select: {
        timestamp: true
      }
    })

    // Group by hour
    const hourCounts = analytics.reduce((acc, a) => {
      const hour = new Date(a.timestamp).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    // Convert to array and sort
    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 hours
  }

  /**
   * Get top performing templates
   */
  private static async getTopTemplates(clubId: string, dateRange?: { from: Date, to: Date }) {
    const templates = await prisma.notificationTemplate.findMany({
      where: { clubId },
      select: {
        name: true,
        deliveryRate: true,
        openRate: true,
        clickRate: true,
        usageCount: true
      },
      orderBy: {
        deliveryRate: 'desc'
      },
      take: 5
    })

    return templates.map(t => ({
      template: t.name,
      performance: ((t.deliveryRate || 0) + (t.openRate || 0) + (t.clickRate || 0)) / 3
    }))
  }

  /**
   * Get device breakdown
   */
  private static async getDeviceBreakdown(clubId: string, dateRange?: { from: Date, to: Date }) {
    const analytics = await prisma.notificationAnalytics.findMany({
      where: {
        notification: { clubId },
        deviceInfo: { not: null },
        ...(dateRange && {
          timestamp: {
            gte: dateRange.from,
            lte: dateRange.to
          }
        })
      },
      select: {
        deviceInfo: true
      }
    })

    // Parse device info and categorize
    const breakdown = analytics.reduce((acc, a) => {
      const device = this.parseDeviceType(a.deviceInfo)
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return breakdown
  }

  /**
   * Parse device type from user agent
   */
  private static parseDeviceType(userAgent: string): string {
    if (!userAgent) return 'Unknown'
    
    const ua = userAgent.toLowerCase()
    if (ua.includes('mobile') || ua.includes('android')) return 'Mobile'
    if (ua.includes('iphone')) return 'iPhone'
    if (ua.includes('ipad')) return 'iPad'
    if (ua.includes('tablet')) return 'Tablet'
    if (ua.includes('windows')) return 'Windows'
    if (ua.includes('mac')) return 'Mac'
    return 'Desktop'
  }

  /**
   * Update template performance metrics
   */
  private static async updateTemplateMetrics(notificationId: string, action: string) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        select: {
          template: true,
          clubId: true
        }
      })

      if (!notification?.template) return

      // Find template
      const template = await prisma.notificationTemplate.findFirst({
        where: {
          clubId: notification.clubId,
          name: notification.template
        }
      })

      if (!template) return

      // Update metrics based on action
      const updates: any = {
        usageCount: template.usageCount + 1,
        lastUsedAt: new Date()
      }

      // Calculate new rates (simplified - in production, store raw counts)
      if (action === 'delivered') {
        const currentDeliveryRate = template.deliveryRate || 0
        updates.deliveryRate = ((currentDeliveryRate * template.usageCount) + 100) / (template.usageCount + 1)
      }

      if (action === 'opened') {
        const currentOpenRate = template.openRate || 0
        updates.openRate = ((currentOpenRate * template.usageCount) + 100) / (template.usageCount + 1)
      }

      if (action === 'clicked') {
        const currentClickRate = template.clickRate || 0
        updates.clickRate = ((currentClickRate * template.usageCount) + 100) / (template.usageCount + 1)
      }

      await prisma.notificationTemplate.update({
        where: { id: template.id },
        data: updates
      })

    } catch (error) {
      console.error('Error updating template metrics:', error)
    }
  }

  /**
   * Generate session ID for tracking
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Update session duration
   */
  private static async updateSessionDuration(sessionId: string) {
    try {
      const sessionAnalytics = await prisma.notificationAnalytics.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'asc' }
      })

      if (sessionAnalytics.length < 2) return

      const firstInteraction = sessionAnalytics[0]
      const lastInteraction = sessionAnalytics[sessionAnalytics.length - 1]
      const duration = Math.round(
        (lastInteraction.timestamp.getTime() - firstInteraction.timestamp.getTime()) / 1000
      )

      // Update all session records with duration
      await prisma.notificationAnalytics.updateMany({
        where: { sessionId },
        data: { sessionDuration: duration }
      })

    } catch (error) {
      console.error('Error updating session duration:', error)
    }
  }

  /**
   * Get engagement funnel data
   */
  static async getEngagementFunnel(clubId: string, dateRange?: { from: Date, to: Date }) {
    const where = {
      clubId,
      ...(dateRange && {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to
        }
      })
    }

    const [sent, delivered, opened, clicked, converted] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, status: 'delivered' } }),
      prisma.notification.count({ where: { ...where, readAt: { not: null } } }),
      prisma.notification.count({ where: { ...where, linkClicked: true } }),
      // Assuming conversion is when a booking is confirmed after notification
      prisma.notification.count({ 
        where: { 
          ...where, 
          linkClicked: true,
          booking: {
            status: 'confirmed'
          }
        } 
      })
    ])

    return {
      stages: [
        { name: 'Enviados', count: sent, percentage: 100 },
        { name: 'Entregados', count: delivered, percentage: sent > 0 ? (delivered / sent) * 100 : 0 },
        { name: 'Abiertos', count: opened, percentage: sent > 0 ? (opened / sent) * 100 : 0 },
        { name: 'Clicks', count: clicked, percentage: sent > 0 ? (clicked / sent) * 100 : 0 },
        { name: 'Convertidos', count: converted, percentage: sent > 0 ? (converted / sent) * 100 : 0 }
      ]
    }
  }

  /**
   * Get A/B testing results for templates
   */
  static async compareTemplates(clubId: string, templateIds: string[]) {
    const templates = await prisma.notificationTemplate.findMany({
      where: {
        clubId,
        id: { in: templateIds }
      }
    })

    return templates.map(t => ({
      id: t.id,
      name: t.name,
      usageCount: t.usageCount,
      metrics: {
        deliveryRate: t.deliveryRate || 0,
        openRate: t.openRate || 0,
        clickRate: t.clickRate || 0,
        overallScore: ((t.deliveryRate || 0) + (t.openRate || 0) + (t.clickRate || 0)) / 3
      }
    })).sort((a, b) => b.metrics.overallScore - a.metrics.overallScore)
  }
}