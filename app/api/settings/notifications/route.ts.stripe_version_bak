import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

// Validation schemas
const notificationChannelSchema = z.object({
  channelId: z.enum(['email', 'whatsapp', 'sms']),
  name: z.string(),
  enabled: z.boolean(),
  config: z.object({
    apiKey: z.string().optional(),
    accountSid: z.string().optional(),
    authToken: z.string().optional(),
    fromNumber: z.string().optional(),
    fromEmail: z.string().optional()
  }).optional()
})

const notificationTemplateSchema = z.object({
  templateId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  channels: z.array(z.string()),
  triggers: z.array(z.string()),
  subject: z.string().optional(),
  content: z.string(),
  variables: z.array(z.string()),
  enabled: z.boolean()
})

// GET - Retrieve notification settings
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    // Get notification channels
    const channels = await prisma.notificationChannel.findMany({
      where: { clubId: session.clubId }
    })

    // Get notification templates
    const templates = await prisma.notificationTemplate.findMany({
      where: { clubId: session.clubId },
      orderBy: { name: 'asc' }
    })

    // If no channels exist, create defaults
    if (channels.length === 0) {
      const defaultChannels = [
        {
          clubId: session.clubId,
          channelId: 'whatsapp',
          name: 'WhatsApp',
          enabled: false,
          config: {}
        },
        {
          clubId: session.clubId,
          channelId: 'email',
          name: 'Correo electrónico',
          enabled: false,
          config: {}
        },
        {
          clubId: session.clubId,
          channelId: 'sms',
          name: 'SMS',
          enabled: false,
          config: {}
        }
      ]

      for (const channel of defaultChannels) {
        await prisma.notificationChannel.create({ data: channel })
      }
    }

    // If no templates exist, create defaults
    if (templates.length === 0) {
      const defaultTemplates = [
        {
          clubId: session.clubId,
          templateId: 'booking_confirmation',
          name: 'Confirmación de reserva',
          description: 'Se envía cuando se confirma una reserva',
          channels: ['whatsapp', 'email'],
          triggers: ['booking.confirmed'],
          subject: 'Reserva confirmada - {{courtName}}',
          content: 'Hola {{playerName}}, tu reserva para {{courtName}} el {{date}} a las {{time}} ha sido confirmada. Total: {{price}} MXN',
          variables: ['playerName', 'courtName', 'date', 'time', 'price'],
          enabled: true
        },
        {
          clubId: session.clubId,
          templateId: 'payment_reminder',
          name: 'Recordatorio de pago',
          description: 'Recordatorio para pagos pendientes',
          channels: ['whatsapp'],
          triggers: ['payment.reminder'],
          content: 'Hola {{playerName}}, tienes un pago pendiente de {{amount}} MXN para tu reserva del {{date}}. Por favor realiza tu pago.',
          variables: ['playerName', 'amount', 'date'],
          enabled: true
        }
      ]

      for (const template of defaultTemplates) {
        await prisma.notificationTemplate.create({ data: template })
      }
    }

    return NextResponse.json({
      success: true,
      channels: channels.length > 0 ? channels : defaultChannels,
      templates: templates.length > 0 ? templates : defaultTemplates
    })

  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración de notificaciones' },
      { status: 500 }
    )
  }
}

// PUT - Update notification settings
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { channel, template } = body
    
    // Update channel if provided
    if (channel) {
      const validatedChannel = notificationChannelSchema.parse(channel)
      
      await prisma.notificationChannel.upsert({
        where: {
          clubId_channelId: {
            clubId: session.clubId,
            channelId: validatedChannel.channelId
          }
        },
        update: {
          name: validatedChannel.name,
          enabled: validatedChannel.enabled,
          config: validatedChannel.config || {}
        },
        create: {
          clubId: session.clubId,
          ...validatedChannel,
          config: validatedChannel.config || {}
        }
      })
    }

    // Update template if provided
    if (template) {
      const validatedTemplate = notificationTemplateSchema.parse(template)
      
      await prisma.notificationTemplate.upsert({
        where: {
          clubId_templateId: {
            clubId: session.clubId,
            templateId: validatedTemplate.templateId
          }
        },
        update: validatedTemplate,
        create: {
          clubId: session.clubId,
          ...validatedTemplate
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración de notificaciones actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error updating notification settings:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al actualizar configuración de notificaciones' },
      { status: 500 }
    )
  }
}