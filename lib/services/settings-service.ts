/**
 * Settings Service
 * Manages all club settings (schedule, pricing, payments, notifications, widget)
 */

import { prisma } from '@/lib/config/prisma'

// Types for settings
export interface ClubSettings {
  slotDuration: number
  bufferTime: number
  advanceBookingDays: number
  allowSameDayBooking: boolean
  currency: string
  taxIncluded: boolean
  taxRate: number
  cancellationFee: number
  noShowFee: number
  acceptCash?: boolean
  terminalEnabled?: boolean
  terminalId?: string
  transferEnabled?: boolean
  bankName?: string
  accountNumber?: string
  clabe?: string
  accountHolder?: string
}

export interface ScheduleRule {
  id?: string
  name: string
  dayOfWeek: number
  startTime: string
  endTime: string
  enabled: boolean
}

export interface PriceRule {
  id?: string
  name: string
  type: 'base' | 'peak' | 'off_peak' | 'weekend' | 'holiday'
  price: number
  conditions: {
    days?: string[]
    timeStart?: string
    timeEnd?: string
    minPlayers?: number
    maxPlayers?: number
  }
  enabled: boolean
}

export interface DiscountRule {
  id?: string
  name: string
  type: 'percentage' | 'fixed'
  value: number
  conditions: {
    minBookings?: number
    advanceDays?: number
    recurringBooking?: boolean
  }
  enabled: boolean
}

export interface PaymentProvider {
  id?: string
  providerId: string
  name: string
  enabled: boolean
  config: Record<string, any>
  fees: {
    percentage: number
    fixed: number
  }
}

export interface NotificationChannel {
  id?: string
  channelId: string
  name: string
  enabled: boolean
  config: Record<string, any>
}

export interface NotificationTemplate {
  id?: string
  templateId: string
  name: string
  description?: string
  channels: string[]
  triggers: string[]
  subject?: string
  content: string
  variables: string[]
  enabled: boolean
}

export interface WidgetSettings {
  theme: 'light' | 'dark' | 'auto'
  primaryColor: string
  language: 'es' | 'en'
  showLogo: boolean
  showPrices: boolean
  showAvailability: boolean
  allowGuestBooking: boolean
  width: string
  height: string
  borderRadius: string
  headerText: string
  footerText: string
}

export class SettingsService {
  // Club Settings
  async getClubSettings(clubId: string): Promise<ClubSettings | null> {
    try {
      const settings = await prisma.clubSettings.findUnique({
        where: { clubId }
      })

      if (!settings) {
        return null
      }

      return {
        slotDuration: settings.slotDuration,
        bufferTime: settings.bufferTime,
        advanceBookingDays: settings.advanceBookingDays,
        allowSameDayBooking: settings.allowSameDayBooking,
        currency: settings.currency,
        taxIncluded: settings.taxIncluded,
        taxRate: Number(settings.taxRate),
        cancellationFee: Number(settings.cancellationFee),
        noShowFee: Number(settings.noShowFee),
        acceptCash: settings.acceptCash ?? true,
        terminalEnabled: settings.terminalEnabled ?? false,
        terminalId: settings.terminalId ?? undefined,
        transferEnabled: settings.transferEnabled ?? false,
        bankName: settings.bankName ?? undefined,
        accountNumber: settings.accountNumber ?? undefined,
        clabe: settings.clabe ?? undefined,
        accountHolder: settings.accountHolder ?? undefined
      }
    } catch (error) {
      console.error('Error getting club settings:', error)
      return null
    }
  }

  async updateClubSettings(clubId: string, settings: ClubSettings): Promise<boolean> {
    try {
      const settingsId = `club_settings_${clubId}_${Date.now()}`
      await prisma.clubSettings.upsert({
        where: { clubId },
        update: settings,
        create: {
          id: settingsId,
          clubId,
          ...settings,
          updatedAt: new Date()
        }
      })
      return true
    } catch (error) {
      console.error('Error updating club settings:', error)
      return false
    }
  }

  // Schedule Rules
  async getScheduleRules(clubId: string): Promise<ScheduleRule[]> {
    try {
      const rules = await prisma.scheduleRule.findMany({
        where: { clubId },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
      })

      return rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        dayOfWeek: rule.dayOfWeek,
        startTime: rule.startTime,
        endTime: rule.endTime,
        enabled: rule.enabled
      }))
    } catch (error) {
      console.error('Error getting schedule rules:', error)
      return []
    }
  }

  async updateScheduleRules(clubId: string, rules: ScheduleRule[]): Promise<boolean> {
    try {
      // Delete existing rules
      await prisma.scheduleRule.deleteMany({
        where: { clubId }
      })

      // Create new rules
      if (rules.length > 0) {
        await prisma.scheduleRule.createMany({
          data: rules.map(rule => ({
            id: `schedule_rule_${clubId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            clubId,
            name: rule.name,
            dayOfWeek: rule.dayOfWeek,
            startTime: rule.startTime,
            endTime: rule.endTime,
            enabled: rule.enabled,
            createdAt: new Date(),
            updatedAt: new Date()
          }))
        })
      }

      return true
    } catch (error) {
      console.error('Error updating schedule rules:', error)
      return false
    }
  }

  // Price Rules
  async getPriceRules(clubId: string): Promise<PriceRule[]> {
    try {
      const rules = await prisma.priceRule.findMany({
        where: { clubId },
        orderBy: { createdAt: 'asc' }
      })

      return rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        type: rule.type as PriceRule['type'],
        price: rule.price,
        conditions: rule.conditions as PriceRule['conditions'],
        enabled: rule.enabled
      }))
    } catch (error) {
      console.error('Error getting price rules:', error)
      return []
    }
  }

  async updatePriceRules(clubId: string, rules: PriceRule[]): Promise<boolean> {
    try {
      // Delete existing rules
      await prisma.priceRule.deleteMany({
        where: { clubId }
      })

      // Create new rules
      if (rules.length > 0) {
        await prisma.priceRule.createMany({
          data: rules.map(rule => ({
            id: `price_rule_${clubId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            clubId,
            name: rule.name,
            type: rule.type,
            price: rule.price,
            conditions: rule.conditions,
            enabled: rule.enabled,
            createdAt: new Date(),
            updatedAt: new Date()
          }))
        })
      }

      return true
    } catch (error) {
      console.error('Error updating price rules:', error)
      return false
    }
  }

  // Discount Rules
  async getDiscountRules(clubId: string): Promise<DiscountRule[]> {
    try {
      const rules = await prisma.discountRule.findMany({
        where: { clubId },
        orderBy: { createdAt: 'asc' }
      })

      return rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        type: rule.type as DiscountRule['type'],
        value: rule.value,
        conditions: rule.conditions as DiscountRule['conditions'],
        enabled: rule.enabled
      }))
    } catch (error) {
      console.error('Error getting discount rules:', error)
      return []
    }
  }

  async updateDiscountRules(clubId: string, rules: DiscountRule[]): Promise<boolean> {
    try {
      // Delete existing rules
      await prisma.discountRule.deleteMany({
        where: { clubId }
      })

      // Create new rules
      if (rules.length > 0) {
        await prisma.discountRule.createMany({
          data: rules.map(rule => ({
            id: `discount_rule_${clubId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            clubId,
            name: rule.name,
            type: rule.type,
            value: rule.value,
            conditions: rule.conditions,
            enabled: rule.enabled,
            createdAt: new Date(),
            updatedAt: new Date()
          }))
        })
      }

      return true
    } catch (error) {
      console.error('Error updating discount rules:', error)
      return false
    }
  }

  // Payment Providers
  async getPaymentProviders(clubId: string): Promise<PaymentProvider[]> {
    try {
      const providers = await prisma.paymentProvider.findMany({
        where: { clubId },
        orderBy: { createdAt: 'asc' }
      })

      return providers.map(provider => ({
        id: provider.id,
        providerId: provider.providerId,
        name: provider.name,
        enabled: provider.enabled,
        config: provider.config as Record<string, any>,
        fees: provider.fees as { percentage: number; fixed: number }
      }))
    } catch (error) {
      console.error('Error getting payment providers:', error)
      return []
    }
  }

  async updatePaymentProviders(clubId: string, providers: PaymentProvider[]): Promise<boolean> {
    try {
      console.log('[SettingsService] Updating payment providers for club:', clubId)
      console.log('[SettingsService] Providers to update:', JSON.stringify(providers, null, 2))
      
      // Update or create each provider
      for (const provider of providers) {
        const upsertData = {
          where: {
            clubId_providerId: {
              clubId,
              providerId: provider.providerId
            }
          },
          update: {
            name: provider.name,
            enabled: provider.enabled,
            config: provider.config,
            fees: provider.fees,
            updatedAt: new Date()
          },
          create: {
            id: `payment_provider_${clubId}_${provider.providerId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            clubId,
            providerId: provider.providerId,
            name: provider.name,
            enabled: provider.enabled,
            config: provider.config,
            fees: provider.fees,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
        
        console.log('[SettingsService] Upserting provider:', provider.providerId)
        await prisma.paymentProvider.upsert(upsertData)
        console.log('[SettingsService] Provider upserted successfully')
      }

      return true
    } catch (error) {
      console.error('[SettingsService] Error updating payment providers:', error)
      console.error('[SettingsService] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      return false
    }
  }

  // Notification Channels
  async getNotificationChannels(clubId: string): Promise<NotificationChannel[]> {
    try {
      const channels = await prisma.notificationChannel.findMany({
        where: { clubId },
        orderBy: { createdAt: 'asc' }
      })

      return channels.map(channel => ({
        id: channel.id,
        channelId: channel.channelId,
        name: channel.name,
        enabled: channel.enabled,
        config: channel.config as Record<string, any>
      }))
    } catch (error) {
      console.error('Error getting notification channels:', error)
      return []
    }
  }

  async updateNotificationChannels(clubId: string, channels: NotificationChannel[]): Promise<boolean> {
    try {
      // Update or create each channel
      for (const channel of channels) {
        await prisma.notificationChannel.upsert({
          where: {
            clubId_channelId: {
              clubId,
              channelId: channel.channelId
            }
          },
          update: {
            name: channel.name,
            enabled: channel.enabled,
            config: channel.config
          },
          create: {
            id: `notification_channel_${clubId}_${channel.channelId}_${Date.now()}`,
            clubId,
            channelId: channel.channelId,
            name: channel.name,
            enabled: channel.enabled,
            config: channel.config,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
      }

      return true
    } catch (error) {
      console.error('Error updating notification channels:', error)
      return false
    }
  }

  // Notification Templates
  async getNotificationTemplates(clubId: string): Promise<NotificationTemplate[]> {
    try {
      const templates = await prisma.notificationTemplate.findMany({
        where: { clubId },
        orderBy: { createdAt: 'asc' }
      })

      return templates.map(template => ({
        id: template.id,
        templateId: template.templateId,
        name: template.name,
        description: template.description || undefined,
        channels: template.channels,
        triggers: template.triggers,
        subject: template.subject || undefined,
        content: template.content,
        variables: template.variables,
        enabled: template.enabled
      }))
    } catch (error) {
      console.error('Error getting notification templates:', error)
      return []
    }
  }

  async updateNotificationTemplates(clubId: string, templates: NotificationTemplate[]): Promise<boolean> {
    try {
      // Update or create each template
      for (const template of templates) {
        await prisma.notificationTemplate.upsert({
          where: {
            clubId_templateId: {
              clubId,
              templateId: template.templateId
            }
          },
          update: {
            name: template.name,
            description: template.description,
            channels: template.channels,
            triggers: template.triggers,
            subject: template.subject,
            content: template.content,
            variables: template.variables,
            enabled: template.enabled
          },
          create: {
            id: `notification_template_${clubId}_${template.templateId}_${Date.now()}`,
            clubId,
            templateId: template.templateId,
            name: template.name,
            description: template.description,
            channels: template.channels,
            triggers: template.triggers,
            subject: template.subject,
            content: template.content,
            variables: template.variables,
            enabled: template.enabled,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
      }

      return true
    } catch (error) {
      console.error('Error updating notification templates:', error)
      return false
    }
  }

  // Widget Settings
  async getWidgetSettings(clubId: string): Promise<WidgetSettings | null> {
    try {
      const settings = await prisma.widgetSettings.findUnique({
        where: { clubId }
      })

      if (!settings) {
        return null
      }

      return {
        theme: settings.theme as WidgetSettings['theme'],
        primaryColor: settings.primaryColor,
        language: settings.language as WidgetSettings['language'],
        showLogo: settings.showLogo,
        showPrices: settings.showPrices,
        showAvailability: settings.showAvailability,
        allowGuestBooking: settings.allowGuestBooking,
        width: settings.width,
        height: settings.height,
        borderRadius: settings.borderRadius,
        headerText: settings.headerText,
        footerText: settings.footerText
      }
    } catch (error) {
      console.error('Error getting widget settings:', error)
      return null
    }
  }

  async updateWidgetSettings(clubId: string, settings: WidgetSettings): Promise<boolean> {
    try {
      await prisma.widgetSettings.upsert({
        where: { clubId },
        update: settings,
        create: {
          id: `widget_settings_${clubId}_${Date.now()}`,
          clubId,
          ...settings,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      return true
    } catch (error) {
      console.error('Error updating widget settings:', error)
      return false
    }
  }
}

// Export singleton instance
export const settingsService = new SettingsService()