import { prisma } from '@/lib/config/prisma'
import { sendWhatsAppNotification, sendSMSNotification, sendEmailNotification } from '@/lib/payments/notifications'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { v4 as uuidv4 } from 'uuid'

interface BookingData {
  id: string
  playerName: string
  playerEmail: string
  playerPhone: string
  date: Date
  startTime: string
  endTime: string
  duration: number
  price: number
  court: {
    name: string
  }
  club: {
    name: string
    phone: string
    address: string
  }
}

export async function sendWidgetBookingConfirmation(booking: BookingData) {
  try {
    const bookingDate = format(new Date(booking.date), 'EEEE dd \'de\' MMMM', { locale: es })
    const bookingCode = booking.id.slice(-8).toUpperCase()

    // WhatsApp message for customer
    const whatsappMessage = `🎾 *Reserva Confirmada - ${booking.club.name}*

✅ *Detalles de tu reserva:*
📅 Fecha: ${bookingDate}
⏰ Hora: ${booking.startTime} - ${booking.endTime}
🏟️ Cancha: ${booking.court.name}
💰 Total: $${booking.price}
👤 Organizador: ${booking.playerName}

📍 *Ubicación:*
${booking.club.address}

📞 *Contacto del club:*
${booking.club.phone}

💳 *Pago:*
Se realiza en el club al llegar

📋 *Instrucciones:*
• Llega 10 minutos antes
• Código de reserva: *${bookingCode}*
• Cancela con al menos 2 horas de anticipación

¡Te esperamos! 🎾`

    // SMS message (shorter version)
    const smsMessage = `🎾 Reserva confirmada en ${booking.club.name}
${bookingDate} ${booking.startTime}-${booking.endTime}
Cancha: ${booking.court.name}
Total: $${booking.price}
Código: ${bookingCode}
Llega 10 min antes. ¡Te esperamos!`

    // Email message
    const emailSubject = `Reserva Confirmada - ${booking.club.name}`
    const emailMessage = `
Hola ${booking.playerName},

¡Tu reserva ha sido confirmada exitosamente!

DETALLES DE LA RESERVA:
• Fecha: ${bookingDate}
• Hora: ${booking.startTime} - ${booking.endTime}
• Cancha: ${booking.court.name}
• Duración: ${booking.duration} minutos
• Total: $${booking.price}
• Código de reserva: ${bookingCode}

CLUB:
${booking.club.name}
${booking.club.address}
Teléfono: ${booking.club.phone}

IMPORTANTE:
- El pago se realiza directamente en el club
- Llega 10 minutos antes de tu hora reservada
- Para cancelar, llama al club con al menos 2 horas de anticipación

¡Que disfrutes tu partido!

Saludos,
Equipo ${booking.club.name}
`

    // Send notifications
    const notifications = []

    // Always send WhatsApp/SMS to player
    if (booking.playerPhone) {
      const whatsappResult = await sendWhatsAppNotification(
        booking.playerPhone,
        whatsappMessage,
        'widget_booking_confirmation'
      )

      if (whatsappResult.success) {
        notifications.push(
          prisma.notification.create({
            data: {
              id: uuidv4(),
              bookingId: booking.id,
              type: 'WHATSAPP',
              template: 'widget_booking_confirmation',
              recipient: booking.playerPhone,
              status: 'sent',
              twilioSid: whatsappResult.messageId,
              sentAt: new Date(),
              updatedAt: new Date()
            }
          })
        )
      } else {
        // Fallback to SMS if WhatsApp fails
        const smsResult = await sendSMSNotification(
          booking.playerPhone,
          smsMessage,
          'widget_booking_confirmation_sms'
        )

        notifications.push(
          prisma.notification.create({
            data: {
              id: uuidv4(),
              bookingId: booking.id,
              type: 'SMS',
              template: 'widget_booking_confirmation_sms',
              recipient: booking.playerPhone,
              status: smsResult.success ? 'sent' : 'failed',
              twilioSid: smsResult.messageId,
              errorMessage: smsResult.error,
              sentAt: smsResult.success ? new Date() : undefined,
              updatedAt: new Date()
            }
          })
        )
      }
    }

    // Send email if provided
    if (booking.playerEmail) {
      const emailResult = await sendEmailNotification(
        booking.playerEmail,
        emailSubject,
        emailMessage,
        'widget_booking_confirmation_email'
      )

      notifications.push(
        prisma.notification.create({
          data: {
            id: uuidv4(),
            bookingId: booking.id,
            type: 'EMAIL',
            template: 'widget_booking_confirmation_email',
            recipient: booking.playerEmail,
            status: emailResult.success ? 'sent' : 'failed',
            errorMessage: emailResult.error,
            sentAt: emailResult.success ? new Date() : undefined,
            updatedAt: new Date()
          }
        })
      )
    }

    // Execute all notification database inserts
    await Promise.all(notifications)

    return { success: true }

  } catch (error) {
    console.error('Error sending widget booking confirmation:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendClubNotification(booking: BookingData) {
  try {
    const bookingDate = format(new Date(booking.date), 'EEEE dd \'de\' MMMM', { locale: es })
    const bookingCode = booking.id.slice(-8).toUpperCase()

    // Notification to club about new widget booking
    const clubMessage = `🎾 *Nueva Reserva desde Widget*

📋 *Detalles:*
📅 ${bookingDate}
⏰ ${booking.startTime} - ${booking.endTime}
🏟️ ${booking.court.name}
💰 $${booking.price}

👤 *Cliente:*
Nombre: ${booking.playerName}
Teléfono: ${booking.playerPhone}
${booking.playerEmail ? `Email: ${booking.playerEmail}` : ''}

📝 *Código:* ${bookingCode}
💳 *Pago:* En el club

*Padelyzer Widget*`

    // Send to club phone
    const result = await sendWhatsAppNotification(
      booking.club.phone,
      clubMessage,
      'widget_booking_club_notification'
    )

    if (result.success) {
      await prisma.notification.create({
        data: {
          id: uuidv4(),
          bookingId: booking.id,
          type: 'WHATSAPP',
          template: 'widget_booking_club_notification',
          recipient: booking.club.phone,
          status: 'sent',
          twilioSid: result.messageId,
          sentAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    return { success: true }

  } catch (error) {
    console.error('Error sending club notification:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}