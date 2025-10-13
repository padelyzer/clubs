// import { prisma } from '@/lib/config/prisma'

/**
 * NOTA IMPORTANTE: Este servicio está deshabilitado temporalmente.
 *
 * Razón: El modelo NotificationAnalytics no existe en el schema de Prisma actual.
 * Además, varios campos referenciados (readAt, linkClicked, clickedAt, clubId en Notification,
 * y deliveryRate, openRate, clickRate, usageCount en NotificationTemplate) no existen en el schema.
 *
 * Para habilitar este servicio se requiere:
 * 1. Agregar modelo NotificationAnalytics al schema
 * 2. Agregar campos de analytics a Notification y NotificationTemplate
 * 3. Correr migración de base de datos
 *
 * Mientras tanto, las interfaces se mantienen exportadas para compatibilidad.
 */

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
   * @deprecated Servicio deshabilitado - requiere modelo NotificationAnalytics en schema
   */
  static async trackInteraction(event: TrackingEvent) {
    console.warn('NotificationAnalyticsService.trackInteraction: Servicio deshabilitado - modelo no existe en schema')
    return {
      success: false,
      error: 'Analytics service disabled - NotificationAnalytics model not in schema'
    }
  }

  /**
   * Track when a WhatsApp link is clicked
   * @deprecated Servicio deshabilitado - requiere campos adicionales en schema
   */
  static async trackLinkClick(notificationId: string, userAgent?: string) {
    console.warn('NotificationAnalyticsService.trackLinkClick: Servicio deshabilitado - campos no existen en schema')
    return {
      success: false,
      error: 'Analytics service disabled - required fields not in schema'
    }
  }

  /**
   * Get comprehensive analytics for a club
   * @deprecated Servicio deshabilitado - requiere modelo y campos adicionales
   */
  static async getClubAnalytics(clubId: string, dateRange?: { from: Date, to: Date }): Promise<AnalyticsMetrics> {
    console.warn('NotificationAnalyticsService.getClubAnalytics: Servicio deshabilitado')
    return {
      totalSent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      failed: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      responseRate: 0,
      avgResponseTime: 0,
      peakHours: [],
      topTemplates: [],
      deviceBreakdown: {}
    }
  }

  /**
   * Get engagement funnel data
   * @deprecated Servicio deshabilitado - requiere campos adicionales en schema
   */
  static async getEngagementFunnel(clubId: string, dateRange?: { from: Date, to: Date }) {
    console.warn('NotificationAnalyticsService.getEngagementFunnel: Servicio deshabilitado')
    return {
      stages: [
        { name: 'Enviados', count: 0, percentage: 0 },
        { name: 'Entregados', count: 0, percentage: 0 },
        { name: 'Abiertos', count: 0, percentage: 0 },
        { name: 'Clicks', count: 0, percentage: 0 },
        { name: 'Convertidos', count: 0, percentage: 0 }
      ]
    }
  }

  /**
   * Get A/B testing results for templates
   * @deprecated Servicio deshabilitado - requiere campos adicionales en schema
   */
  static async compareTemplates(clubId: string, templateIds: string[]) {
    console.warn('NotificationAnalyticsService.compareTemplates: Servicio deshabilitado')
    return []
  }
}