# STORY-010: WhatsApp Notifications

## 🎯 Objetivo
Implementar sistema de notificaciones vía WhatsApp usando Twilio para confirmaciones de reserva, recordatorios, links de pago pendiente y cancelaciones. WhatsApp es el canal preferido en México para comunicación comercial.

## 📋 Contexto para Claude Code
WhatsApp es crítico para la adopción en México. Los clubes están acostumbrados a confirmar por WhatsApp y los usuarios esperan recibir su confirmación ahí. Usamos Twilio WhatsApp Business API para mensajes automáticos profesionales.

## ✅ Criterios de Aceptación
- [ ] Configuración Twilio WhatsApp Business API
- [ ] Templates de mensajes pre-aprobados por WhatsApp
- [ ] Confirmación inmediata al crear reserva
- [ ] Recordatorio 2 horas antes del juego
- [ ] Links de pago para pagos divididos pendientes
- [ ] Notificación de cancelación
- [ ] Dashboard para gestionar templates
- [ ] Rate limiting y error handling

## 📝 Instrucciones para Claude Code

### PASO 1: Configuración Twilio WhatsApp
```typescript
// lib/config/twilio.ts
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER! // +14155238886

export const twilioClient = twilio(accountSid, authToken)

export interface WhatsAppMessage {
  to: string // +521234567890 format
  templateName: string
  templateLanguage: string
  templateData: Record<string, string>
}

export async function sendWhatsAppTemplate(message: WhatsAppMessage) {
  try {
    const result = await twilioClient.messages.create({
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${message.to}`,
      contentSid: getTemplateSid(message.templateName),
      contentVariables: JSON.stringify(message.templateData),
    })

    return {
      success: true,
      messageSid: result.sid,
      status: result.status
    }
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// WhatsApp Business Template SIDs (pre-approved by WhatsApp)
function getTemplateSid(templateName: string): string {
  const templates = {
    'booking_confirmation': process.env.TWILIO_TEMPLATE_BOOKING_CONFIRMATION!,
    'booking_reminder': process.env.TWILIO_TEMPLATE_BOOKING_REMINDER!,
    'payment_pending': process.env.TWILIO_TEMPLATE_PAYMENT_PENDING!,
    'booking_cancelled': process.env.TWILIO_TEMPLATE_BOOKING_CANCELLED!,
    'payment_completed': process.env.TWILIO_TEMPLATE_PAYMENT_COMPLETED!,
  }
  
  return templates[templateName] || templates['booking_confirmation']
}

export function formatPhoneForWhatsApp(phone: string): string {
  // Convert Mexican phone format to WhatsApp format
  // Input: 222-123-4567 or 2221234567
  // Output: +522221234567
  
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `+52${cleaned}`
  } else if (cleaned.length === 12 && cleaned.startsWith('52')) {
    return `+${cleaned}`
  } else if (cleaned.length === 13 && cleaned.startsWith('+52')) {
    return cleaned
  }
  
  return `+52${cleaned.slice(-10)}`
}
```

### PASO 2: Templates de WhatsApp Business
```typescript
// lib/notifications/templates.ts

export const WhatsAppTemplates = {
  // Template 1: Confirmación de Reserva
  BOOKING_CONFIRMATION: {
    name: 'booking_confirmation',
    language: 'es_MX',
    variables: [
      'player_name',      // {{1}}
      'club_name',        // {{2}}
      'court_name',       // {{3}}
      'booking_date',     // {{4}}
      'booking_time',     // {{5}}
      'total_price',      // {{6}}
      'payment_method'    // {{7}}
    ],
    // WhatsApp approved template text:
    // Hola {{1}}! ✅ Reserva confirmada en {{2}}
    // 🏟️ {{3}}
    // 📅 {{4}} a las {{5}}
    // 💰 Total: ${{6}} MXN ({{7}})
    // ¡Te esperamos! 🎾
  },

  // Template 2: Recordatorio 2h antes
  BOOKING_REMINDER: {
    name: 'booking_reminder',
    language: 'es_MX',
    variables: [
      'player_name',      // {{1}}
      'club_name',        // {{2}}
      'court_name',       // {{3}}
      'time_remaining',   // {{4}}
      'club_address'      // {{5}}
    ],
    // WhatsApp approved template text:
    // ¡Hola {{1}}! ⏰ Tu juego en {{2}} es en {{4}}
    // 🏟️ {{3}}
    // 📍 {{5}}
    // ¡Nos vemos pronto! 🎾
  },

  // Template 3: Pago Pendiente (Split)
  PAYMENT_PENDING: {
    name: 'payment_pending',
    language: 'es_MX',
    variables: [
      'player_name',      // {{1}}
      'organizer_name',   // {{2}}
      'club_name',        // {{3}}
      'booking_date',     // {{4}}
      'amount',           // {{5}}
      'payment_link'      // {{6}}
    ],
    // WhatsApp approved template text:
    // ¡Hola {{1}}! {{2}} te invitó a jugar en {{3}}
    // 📅 {{4}}
    // 💳 Tu parte: ${{5}} MXN
    // Paga aquí: {{6}}
    // (Link expira en 24h)
  },

  // Template 4: Pago Completado
  PAYMENT_COMPLETED: {
    name: 'payment_completed',
    language: 'es_MX',
    variables: [
      'player_name',      // {{1}}
      'club_name',        // {{2}}
      'booking_date',     // {{3}}
      'booking_time',     // {{4}}
      'payment_status'    // {{5}}
    ],
    // WhatsApp approved template text:
    // ¡Perfecto {{1}}! ✅ Pago confirmado
    // {{2}} - {{3}} a las {{4}}
    // Status: {{5}}
    // ¡Te esperamos! 🎾
  },

  // Template 5: Cancelación
  BOOKING_CANCELLED: {
    name: 'booking_cancelled',
    language: 'es_MX',
    variables: [
      'player_name',      // {{1}}
      'club_name',        // {{2}}
      'booking_date',     // {{3}}
      'booking_time',     // {{4}}
      'refund_info'       // {{5}}
    ],
    // WhatsApp approved template text:
    // Hola {{1}}, tu reserva fue cancelada
    // {{2}} - {{3}} a las {{4}}
    // {{5}}
    // ¿Preguntas? Responde este mensaje.
  }
}

export function buildTemplateData(templateType: string, data: any): Record<string, string> {
  switch (templateType) {
    case 'BOOKING_CONFIRMATION':
      return {
        '1': data.playerName,
        '2': data.clubName,
        '3': data.courtName,
        '4': data.bookingDate,
        '5': data.bookingTime,
        '6': data.totalPrice.toString(),
        '7': data.paymentMethod
      }
    
    case 'BOOKING_REMINDER':
      return {
        '1': data.playerName,
        '2': data.clubName,
        '3': data.courtName,
        '4': data.timeRemaining,
        '5': data.clubAddress
      }
    
    case 'PAYMENT_PENDING':
      return {
        '1': data.playerName,
        '2': data.organizerName,
        '3': data.clubName,
        '4': data.bookingDate,
        '5': data.amount.toString(),
        '6': data.paymentLink
      }
    
    case 'PAYMENT_COMPLETED':
      return {
        '1': data.playerName,
        '2': data.clubName,
        '3': data.bookingDate,
        '4': data.bookingTime,
        '5': data.paymentStatus
      }
    
    case 'BOOKING_CANCELLED':
      return {
        '1': data.playerName,
        '2': data.clubName,
        '3': data.bookingDate,
        '4': data.bookingTime,
        '5': data.refundInfo
      }
    
    default:
      return {}
  }
}
```

### PASO 3: Service de Notificaciones
```typescript
// lib/notifications/whatsapp-service.ts
import { sendWhatsAppTemplate, formatPhoneForWhatsApp } from '@/lib/config/twilio'
import { buildTemplateData, WhatsAppTemplates } from './templates'
import { prisma } from '@/lib/config/prisma'

export class WhatsAppNotificationService {
  
  static async sendBookingConfirmation(bookingId: string) {
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
        throw new Error('Booking not found')
      }

      const templateData = buildTemplateData('BOOKING_CONFIRMATION', {
        playerName: booking.playerName,
        clubName: booking.club.name,
        courtName: booking.court.name,
        bookingDate: booking.date.toLocaleDateString('es-MX'),
        bookingTime: booking.startTime,
        totalPrice: booking.price,
        paymentMethod: booking.paymentType === 'ONSITE' ? 'Pagar en club' : 'Pago dividido'
      })

      const result = await sendWhatsAppTemplate({
        to: formatPhoneForWhatsApp(booking.playerPhone),
        templateName: WhatsAppTemplates.BOOKING_CONFIRMATION.name,
        templateLanguage: WhatsAppTemplates.BOOKING_CONFIRMATION.language,
        templateData
      })

      // Log notification
      await prisma.notification.create({
        data: {
          bookingId,
          type: 'WHATSAPP',
          template: 'BOOKING_CONFIRMATION',
          recipient: booking.playerPhone,
          status: result.success ? 'sent' : 'failed',
          twilioSid: result.messageSid,
          errorMessage: result.error
        }
      })

      return result
      
    } catch (error) {
      console.error('Booking confirmation error:', error)
      return { success: false, error: error.message }
    }
  }

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
        const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${splitPayment.id}`
        
        const templateData = buildTemplateData('PAYMENT_PENDING', {
          playerName: splitPayment.playerName,
          organizerName: booking.playerName,
          clubName: booking.club.name,
          bookingDate: booking.date.toLocaleDateString('es-MX'),
          amount: splitPayment.amount,
          paymentLink
        })

        const result = await sendWhatsAppTemplate({
          to: formatPhoneForWhatsApp(splitPayment.playerPhone),
          templateName: WhatsAppTemplates.PAYMENT_PENDING.name,
          templateLanguage: WhatsAppTemplates.PAYMENT_PENDING.language,
          templateData
        })

        // Log notification
        await prisma.notification.create({
          data: {
            bookingId,
            splitPaymentId: splitPayment.id,
            type: 'WHATSAPP',
            template: 'PAYMENT_PENDING',
            recipient: splitPayment.playerPhone,
            status: result.success ? 'sent' : 'failed',
            twilioSid: result.messageSid,
            errorMessage: result.error
          }
        })

        results.push(result)
      }

      return { success: true, results }
      
    } catch (error) {
      console.error('Payment pending notifications error:', error)
      return { success: false, error: error.message }
    }
  }

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
        throw new Error('Booking not found')
      }

      // Send to organizer
      const organizerTemplateData = buildTemplateData('BOOKING_REMINDER', {
        playerName: booking.playerName,
        clubName: booking.club.name,
        courtName: booking.court.name,
        timeRemaining: '2 horas',
        clubAddress: `${booking.club.address}, ${booking.club.city}`
      })

      const organizerResult = await sendWhatsAppTemplate({
        to: formatPhoneForWhatsApp(booking.playerPhone),
        templateName: WhatsAppTemplates.BOOKING_REMINDER.name,
        templateLanguage: WhatsAppTemplates.BOOKING_REMINDER.language,
        templateData: organizerTemplateData
      })

      // Send to split payment players
      const splitResults = []
      for (const splitPayment of booking.splitPayments) {
        const playerTemplateData = buildTemplateData('BOOKING_REMINDER', {
          playerName: splitPayment.playerName,
          clubName: booking.club.name,
          courtName: booking.court.name,
          timeRemaining: '2 horas',
          clubAddress: `${booking.club.address}, ${booking.club.city}`
        })

        const result = await sendWhatsAppTemplate({
          to: formatPhoneForWhatsApp(splitPayment.playerPhone),
          templateName: WhatsAppTemplates.BOOKING_REMINDER.name,
          templateLanguage: WhatsAppTemplates.BOOKING_REMINDER.language,
          templateData: playerTemplateData
        })

        splitResults.push(result)
      }

      return { success: true, organizer: organizerResult, players: splitResults }
      
    } catch (error) {
      console.error('Booking reminder error:', error)
      return { success: false, error: error.message }
    }
  }
}
```

### PASO 4: Cron Jobs para Recordatorios
```typescript
// app/api/cron/reminders/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { WhatsAppNotificationService } from '@/lib/notifications/whatsapp-service'
import { addHours, isAfter, isBefore, parseISO } from 'date-fns'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const twoHoursFromNow = addHours(now, 2)
    const threeHoursFromNow = addHours(now, 3)

    // Find bookings that need reminders (2 hours before)
    const bookingsToRemind = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        date: {
          gte: new Date(now.toDateString()), // Today or later
          lte: addHours(now, 24) // Within next 24 hours
        },
        // Check if reminder not already sent
        notifications: {
          none: {
            template: 'BOOKING_REMINDER',
            status: 'sent'
          }
        }
      },
      include: {
        club: true,
        court: true
      }
    })

    const results = []

    for (const booking of bookingsToRemind) {
      // Parse booking datetime
      const bookingDateTime = parseISO(`${booking.date.toISOString().split('T')[0]}T${booking.startTime}:00`)
      
      // Check if booking is exactly 2 hours away (±30 minutes)
      const timeDiff = bookingDateTime.getTime() - now.getTime()
      const isInReminderWindow = timeDiff >= (1.5 * 60 * 60 * 1000) && timeDiff <= (2.5 * 60 * 60 * 1000)
      
      if (isInReminderWindow) {
        const result = await WhatsAppNotificationService.sendBookingReminder(booking.id)
        results.push({
          bookingId: booking.id,
          result
        })
      }
    }

    return Response.json({
      success: true,
      processedBookings: results.length,
      results
    })

  } catch (error) {
    console.error('Reminder cron error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### PASO 5: Integración con Acciones Existentes
```typescript
// lib/notifications/hooks.ts
import { WhatsAppNotificationService } from './whatsapp-service'

export async function onBookingCreated(bookingId: string) {
  try {
    // Send confirmation to organizer
    await WhatsAppNotificationService.sendBookingConfirmation(bookingId)
    
    // If split payment, send pending payment notifications
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { splitPayments: true }
    })
    
    if (booking && booking.splitPayments.length > 0) {
      await WhatsAppNotificationService.sendPaymentPendingNotifications(bookingId)
    }
    
  } catch (error) {
    console.error('Booking created notification hook error:', error)
  }
}

export async function onPaymentCompleted(splitPaymentId: string) {
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

    if (!splitPayment) return

    // Send confirmation to the player who just paid
    const templateData = buildTemplateData('PAYMENT_COMPLETED', {
      playerName: splitPayment.playerName,
      clubName: splitPayment.booking.club.name,
      bookingDate: splitPayment.booking.date.toLocaleDateString('es-MX'),
      bookingTime: splitPayment.booking.startTime,
      paymentStatus: 'Pagado ✅'
    })

    await sendWhatsAppTemplate({
      to: formatPhoneForWhatsApp(splitPayment.playerPhone),
      templateName: WhatsAppTemplates.PAYMENT_COMPLETED.name,
      templateLanguage: WhatsAppTemplates.PAYMENT_COMPLETED.language,
      templateData
    })

  } catch (error) {
    console.error('Payment completed notification hook error:', error)
  }
}
```

### PASO 6: Dashboard de Notificaciones
```tsx
// app/(web)/(auth)/dashboard/notifications/page.tsx
import { requireStaffAuth } from '@/lib/auth/auth'
import { prisma } from '@/lib/config/prisma'
import { NotificationsDashboard } from './notifications-dashboard'

export default async function NotificationsPage() {
  const session = await requireStaffAuth()

  const notifications = await prisma.notification.findMany({
    where: {
      booking: {
        clubId: session.user.clubId
      }
    },
    include: {
      booking: {
        include: {
          court: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  })

  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    failed: notifications.filter(n => n.status === 'failed').length,
    pending: notifications.filter(n => n.status === 'pending').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notificaciones WhatsApp</h1>
        <p className="text-gray-600">
          Historial de mensajes enviados a tus clientes
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              📱
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Enviados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              ✅
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Exitosos</p>
              <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              ❌
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Fallidos</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              ⏳
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      <NotificationsDashboard notifications={notifications} />
    </div>
  )
}
```

### PASO 7: Variables de Entorno
```bash
# .env.local additions for WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886

# WhatsApp Business Template Content SIDs (from Twilio Console)
TWILIO_TEMPLATE_BOOKING_CONFIRMATION=HXxxxxxxxxx
TWILIO_TEMPLATE_BOOKING_REMINDER=HXxxxxxxxxx
TWILIO_TEMPLATE_PAYMENT_PENDING=HXxxxxxxxxx
TWILIO_TEMPLATE_PAYMENT_COMPLETED=HXxxxxxxxxx
TWILIO_TEMPLATE_BOOKING_CANCELLED=HXxxxxxxxxx

# Cron secret for Vercel
CRON_SECRET=your_random_secret_key
```

## 🔍 Verificación
```bash
# Claude, verificar notificaciones WhatsApp:
npm run dev

# Setup requerido:
# 1. Crear cuenta Twilio WhatsApp Business
# 2. Solicitar aprobación de templates
# 3. Configurar webhooks en Twilio
# 4. Setup cron job en Vercel para recordatorios

# Flow de prueba:
# 1. Crear reserva con teléfono válido
# 2. Verificar confirmación inmediata por WhatsApp
# 3. Simular pago dividido y verificar links
# 4. Probar recordatorio 2h antes
```

## ⚠️ NO HACER
- NO enviar mensajes promocionales sin consentimiento
- NO usar SMS como fallback (WhatsApp es preferido)
- NO crear templates adicionales sin aprobación
- NO implementar chatbot conversacional

## Definition of Done
- [ ] Configuración Twilio WhatsApp funcional
- [ ] 5 templates aprobados por WhatsApp
- [ ] Confirmación automática al crear reserva
- [ ] Links de pago en mensajes funcionando
- [ ] Recordatorios 2h antes programados
- [ ] Dashboard de notificaciones mostrando stats
- [ ] Rate limiting y error handling implementado
- [ ] Logs de notificaciones en base de datos