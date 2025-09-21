import { twilioClient, formatPhoneForWhatsApp } from '@/lib/config/twilio'
import { prisma } from '@/lib/config/prisma'

/**
 * Interactive WhatsApp messages with buttons and quick replies
 * Note: These features require WhatsApp Business API approval from Meta
 */

export interface InteractiveButton {
  id: string
  title: string
  type?: 'reply' | 'url' | 'phone_number'
  payload?: string // For reply buttons
  url?: string     // For URL buttons
  phone?: string   // For phone number buttons
}

export interface QuickReply {
  id: string
  title: string
  payload?: string
}

export interface ListSection {
  title: string
  rows: Array<{
    id: string
    title: string
    description?: string
  }>
}

/**
 * Send message with interactive buttons
 */
export async function sendInteractiveButtonMessage(
  to: string,
  bodyText: string,
  buttons: InteractiveButton[],
  headerText?: string,
  footerText?: string
) {
  try {
    const formattedPhone = formatPhoneForWhatsApp(to)
    
    // Note: Twilio's implementation of interactive messages may vary
    // This is a basic structure - actual implementation depends on Twilio's API
    
    const messageBody = {
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedPhone}`,
      body: bodyText,
      // For interactive messages, Twilio might require specific formatting
      // This is a placeholder - check Twilio documentation for exact format
    }

    const result = await twilioClient.messages.create(messageBody)

    return {
      success: true,
      messageSid: result.sid,
      status: result.status
    }
  } catch (error: any) {
    console.error('Interactive button message error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Send message with quick reply options
 */
export async function sendQuickReplyMessage(
  to: string,
  bodyText: string,
  quickReplies: QuickReply[]
) {
  try {
    const formattedPhone = formatPhoneForWhatsApp(to)
    
    // For now, send as regular message with options
    // In the future, use proper quick reply format when available
    const optionsText = quickReplies
      .map((reply, index) => `${index + 1}. ${reply.title}`)
      .join('\n')
    
    const fullMessage = `${bodyText}\n\n${optionsText}\n\nResponde con el número de tu opción.`

    const result = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedPhone}`,
      body: fullMessage
    })

    return {
      success: true,
      messageSid: result.sid,
      status: result.status
    }
  } catch (error: any) {
    console.error('Quick reply message error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Send list message with multiple options
 */
export async function sendListMessage(
  to: string,
  bodyText: string,
  buttonText: string,
  sections: ListSection[]
) {
  try {
    const formattedPhone = formatPhoneForWhatsApp(to)
    
    // For now, format as text list
    // In the future, use proper list message format
    let messageText = `${bodyText}\n\n`
    
    sections.forEach((section, sectionIndex) => {
      messageText += `*${section.title}*\n`
      section.rows.forEach((row, rowIndex) => {
        messageText += `${sectionIndex + 1}.${rowIndex + 1} ${row.title}`
        if (row.description) {
          messageText += ` - ${row.description}`
        }
        messageText += '\n'
      })
      messageText += '\n'
    })
    
    messageText += `Responde con el número de tu opción (ej: 1.1, 2.3)`

    const result = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedPhone}`,
      body: messageText
    })

    return {
      success: true,
      messageSid: result.sid,
      status: result.status
    }
  } catch (error: any) {
    console.error('List message error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Send booking confirmation with action buttons
 */
export async function sendBookingConfirmationWithActions(bookingId: string) {
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

    const bodyText = `¡Hola ${booking.playerName}! Reserva confirmada en ${booking.club.name}

Cancha: ${booking.court.name}
Fecha: ${booking.date.toLocaleDateString('es-MX')} a las ${booking.startTime}
Total: $${(booking.price / 100).toFixed(2)} MXN

¡Te esperamos!`

    const buttons: InteractiveButton[] = [
      {
        id: 'view_booking',
        title: 'Ver Reserva',
        type: 'url',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingId}`
      },
      {
        id: 'contact_club',
        title: 'Contactar Club',
        type: 'phone_number',
        phone: booking.club.phone
      },
      {
        id: 'add_calendar',
        title: 'Agregar al Calendario',
        type: 'reply',
        payload: `calendar_${bookingId}`
      }
    ]

    return await sendInteractiveButtonMessage(
      booking.playerPhone,
      bodyText,
      buttons
    )

  } catch (error: any) {
    console.error('Booking confirmation with actions error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Send payment reminder with payment options
 */
export async function sendPaymentReminderWithOptions(splitPaymentId: string) {
  try {
    const splitPayment = await prisma.splitPayment.findUnique({
      where: { id: splitPaymentId },
      include: {
        booking: {
          include: {
            club: true
          }
        }
      }
    })

    if (!splitPayment) {
      return { success: false, error: 'Split payment not found' }
    }

    const bodyText = `¡Hola ${splitPayment.playerName}! 

${splitPayment.booking.playerName} te invitó a jugar en ${splitPayment.booking.club.name}
Fecha: ${splitPayment.booking.date.toLocaleDateString('es-MX')}
Tu parte: $${(splitPayment.amount / 100).toFixed(2)} MXN`

    const quickReplies: QuickReply[] = [
      {
        id: 'pay_now',
        title: 'Pagar Ahora',
        payload: `pay_${splitPaymentId}`
      },
      {
        id: 'view_details',
        title: 'Ver Detalles',
        payload: `details_${splitPaymentId}`
      },
      {
        id: 'cancel',
        title: 'Cancelar',
        payload: `cancel_${splitPaymentId}`
      },
      {
        id: 'contact',
        title: 'Contactar Organizador',
        payload: `contact_${splitPayment.booking.id}`
      }
    ]

    return await sendQuickReplyMessage(
      splitPayment.playerPhone,
      bodyText,
      quickReplies
    )

  } catch (error: any) {
    console.error('Payment reminder with options error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Send check-in reminder with location and options
 */
export async function sendCheckInReminderWithLocation(bookingId: string) {
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

    const bodyText = `¡Hola ${booking.playerName}! Tu juego en ${booking.club.name} es en 30 minutos

Cancha: ${booking.court.name}
Ubicación: ${booking.club.address}, ${booking.club.city}

¿Ya llegaste?`

    const quickReplies: QuickReply[] = [
      {
        id: 'arrived',
        title: 'Ya llegué',
        payload: `arrived_${bookingId}`
      },
      {
        id: 'on_way',
        title: 'Voy en camino',
        payload: `on_way_${bookingId}`
      },
      {
        id: 'running_late',
        title: 'Voy tarde',
        payload: `late_${bookingId}`
      },
      {
        id: 'directions',
        title: 'Ver Ubicación',
        payload: `directions_${bookingId}`
      }
    ]

    return await sendQuickReplyMessage(
      booking.playerPhone,
      bodyText,
      quickReplies
    )

  } catch (error: any) {
    console.error('Check-in reminder with location error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Process interactive message response
 */
export async function processInteractiveResponse(
  from: string,
  messageBody: string,
  buttonId?: string,
  listId?: string
) {
  try {
    const phoneNumber = from.replace('whatsapp:', '')
    
    // Parse response based on payload format
    if (buttonId) {
      await handleButtonResponse(phoneNumber, buttonId)
    } else if (listId) {
      await handleListResponse(phoneNumber, listId)
    } else {
      // Try to parse text response
      await handleTextResponse(phoneNumber, messageBody)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Interactive response processing error:', error)
    return { success: false, error: error.message }
  }
}

async function handleButtonResponse(phoneNumber: string, buttonId: string) {
  console.log(`[Interactive] Button response: ${phoneNumber} -> ${buttonId}`)
  
  // Parse button ID to determine action
  if (buttonId.startsWith('pay_')) {
    const splitPaymentId = buttonId.replace('pay_', '')
    // Handle payment action
    console.log(`User ${phoneNumber} wants to pay split payment ${splitPaymentId}`)
  } else if (buttonId.startsWith('cancel_')) {
    const splitPaymentId = buttonId.replace('cancel_', '')
    // Handle cancellation
    console.log(`User ${phoneNumber} wants to cancel split payment ${splitPaymentId}`)
  } else if (buttonId.startsWith('arrived_')) {
    const bookingId = buttonId.replace('arrived_', '')
    // Handle check-in
    console.log(`User ${phoneNumber} has arrived for booking ${bookingId}`)
  }
  
  // Process based on button type
  const actions = await processButtonAction(phoneNumber, buttonId)
  return actions
}

async function handleListResponse(phoneNumber: string, listId: string) {
  console.log(`[Interactive] List response: ${phoneNumber} -> ${listId}`)
  
  // Handle list selections based on ID
  const actions = await processListSelection(phoneNumber, listId)
  return actions
}

async function handleTextResponse(phoneNumber: string, messageBody: string) {
  console.log(`[Interactive] Text response: ${phoneNumber} -> ${messageBody}`)
  
  // Parse numbered responses (1, 2, 3, etc.)
  const numberMatch = messageBody.match(/^(\d+)/)
  if (numberMatch) {
    const optionNumber = parseInt(numberMatch[1])
    console.log(`User selected option ${optionNumber}`)
  }
  
  // Process common text responses
  const actions = await processTextResponse(phoneNumber, messageBody, optionNumber)
  return actions
}

/**
 * Process button actions
 */
async function processButtonAction(phoneNumber: string, buttonId: string) {
  switch (buttonId) {
    case 'confirm_booking':
      // Update booking status in database
      await updateBookingStatus(phoneNumber, 'CONFIRMED')
      return {
        success: true,
        message: '✅ Tu reserva ha sido confirmada. Te enviaremos un recordatorio 2 horas antes del partido.',
        action: 'booking_confirmed'
      }
    
    case 'cancel_booking':
      await updateBookingStatus(phoneNumber, 'CANCELLED')
      return {
        success: true,
        message: '❌ Reserva cancelada. Si necesitas hacer otra reserva, visita nuestro sitio web.',
        action: 'booking_cancelled'
      }
    
    case 'opt_out':
      await updateNotificationPreferences(phoneNumber, false)
      return {
        success: true,
        message: '🔕 Has sido removido de las notificaciones automáticas.',
        action: 'user_opted_out'
      }
    
    default:
      return {
        success: false,
        message: 'No pudimos procesar tu solicitud. Por favor contacta al club directamente.'
      }
  }
}

/**
 * Process list selections
 */
async function processListSelection(phoneNumber: string, listId: string) {
  // Handle court selections, time slots, etc.
  return {
    success: true,
    message: `Selección procesada: ${listId}`,
    action: 'list_selection_processed'
  }
}

/**
 * Process text responses
 */
async function processTextResponse(phoneNumber: string, messageBody: string, optionNumber?: number) {
  if (optionNumber) {
    // Handle numbered responses
    switch (optionNumber) {
      case 1:
        return { success: true, message: 'Opción 1 seleccionada', action: 'option_1' }
      case 2:
        return { success: true, message: 'Opción 2 seleccionada', action: 'option_2' }
      default:
        return { success: false, message: 'Opción no válida' }
    }
  }
  
  // Handle common text commands
  const lowerBody = messageBody.toLowerCase()
  if (lowerBody.includes('stop') || lowerBody.includes('baja')) {
    await updateNotificationPreferences(phoneNumber, false)
    return { success: true, message: '🔕 Has sido dado de baja de las notificaciones.', action: 'opted_out' }
  }
  
  return { success: false, message: 'No entendí tu mensaje. Escribe "STOP" para darte de baja.' }
}

/**
 * Helper functions
 */
async function updateBookingStatus(phoneNumber: string, status: string) {
  try {
    await prisma.booking.updateMany({
      where: { 
        playerPhone: phoneNumber,
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      data: { status: status as any }
    })
  } catch (error) {
    console.error('Error updating booking status:', error)
  }
}

async function updateNotificationPreferences(phoneNumber: string, optedIn: boolean) {
  try {
    await prisma.userNotificationPreferences.upsert({
      where: { phoneNumber },
      update: { 
        bookingConfirmations: optedIn,
        paymentReminders: optedIn,
        bookingReminders: optedIn,
        optOutDate: optedIn ? null : new Date()
      },
      create: {
        phoneNumber,
        userId: 'anonymous', // For users without accounts
        bookingConfirmations: optedIn,
        paymentReminders: optedIn,
        bookingReminders: optedIn,
        optOutDate: optedIn ? null : new Date(),
        source: 'whatsapp'
      }
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
  }
}

/**
 * Send promotional message with interactive options
 */
export async function sendPromotionalMessageWithActions(
  phoneNumber: string,
  clubName: string,
  promotion: {
    title: string
    description: string
    discountAmount: number
    validUntil: string
    terms?: string
  }
) {
  try {
    const bodyText = `¡Oferta especial en ${clubName}!

${promotion.title}

${promotion.description}
${promotion.discountAmount}% de descuento
Válido hasta ${promotion.validUntil}

${promotion.terms ? `\nTérminos: ${promotion.terms}` : ''}`

    const quickReplies: QuickReply[] = [
      {
        id: 'book_now',
        title: 'Reservar Ahora',
        payload: 'promo_book'
      },
      {
        id: 'more_info',
        title: 'Más Información',
        payload: 'promo_info'
      },
      {
        id: 'share',
        title: 'Compartir',
        payload: 'promo_share'
      },
      {
        id: 'no_thanks',
        title: 'No me interesa',
        payload: 'promo_decline'
      }
    ]

    return await sendQuickReplyMessage(
      phoneNumber,
      bodyText,
      quickReplies
    )

  } catch (error: any) {
    console.error('Promotional message with actions error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}