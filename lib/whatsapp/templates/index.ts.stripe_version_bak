/**
 * WhatsApp Business Templates for Padelyzer
 * These templates must be pre-approved by WhatsApp Business API
 */

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
    // Hola {{1}}! Reserva confirmada en {{2}}
    // Cancha: {{3}}
    // Fecha: {{4}} a las {{5}}
    // Total: ${{6}} MXN ({{7}})
    // ¡Te esperamos!
    description: 'Confirmación inmediata al crear una reserva'
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
    // ¡Hola {{1}}! Tu juego en {{2}} es en {{4}}
    // Cancha: {{3}}
    // Ubicación: {{5}}
    // ¡Nos vemos pronto!
    description: 'Recordatorio 2 horas antes del juego'
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
    // Fecha: {{4}}
    // Tu parte: ${{5}} MXN
    // Paga aquí: {{6}}
    // (Link expira en 24h)
    description: 'Notificación de pago pendiente para jugadores invitados'
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
    // ¡Perfecto {{1}}! Pago confirmado
    // {{2}} - {{3}} a las {{4}}
    // Status: {{5}}
    // ¡Te esperamos!
    description: 'Confirmación de pago exitoso'
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
    description: 'Notificación de cancelación de reserva'
  },

  // Template 6: Check-in Pendiente
  CHECKIN_REMINDER: {
    name: 'checkin_reminder',
    language: 'es_MX',
    variables: [
      'player_name',      // {{1}}
      'club_name',        // {{2}}
      'court_name',       // {{3}}
      'checkin_code'      // {{4}}
    ],
    // WhatsApp approved template text:
    // ¡Hola {{1}}! Ya llegaste a {{2}}?
    // Cancha: {{3}}
    // Código de check-in: {{4}}
    // Presenta este código en recepción
    description: 'Recordatorio de check-in al llegar al club'
  },

  // Template 7: Promoción/Oferta
  PROMOTION: {
    name: 'promotion',
    language: 'es_MX',
    variables: [
      'player_name',      // {{1}}
      'club_name',        // {{2}}
      'promotion_title',  // {{3}}
      'discount_amount',  // {{4}}
      'expiry_date'       // {{5}}
    ],
    // WhatsApp approved template text:
    // ¡Hola {{1}}! {{3}} en {{2}}
    // {{4}}% de descuento
    // Válido hasta {{5}}
    // ¡Reserva ya!
    description: 'Promociones y ofertas especiales'
  }
}

export type TemplateType = keyof typeof WhatsAppTemplates

/**
 * Build template data object for WhatsApp message
 */
export function buildTemplateData(templateType: TemplateType, data: any): Record<string, string> {
  switch (templateType) {
    case 'BOOKING_CONFIRMATION':
      return {
        '1': data.playerName || '',
        '2': data.clubName || '',
        '3': data.courtName || '',
        '4': data.bookingDate || '',
        '5': data.bookingTime || '',
        '6': data.totalPrice?.toString() || '',
        '7': data.paymentMethod || ''
      }
    
    case 'BOOKING_REMINDER':
      return {
        '1': data.playerName || '',
        '2': data.clubName || '',
        '3': data.courtName || '',
        '4': data.timeRemaining || '',
        '5': data.clubAddress || ''
      }
    
    case 'PAYMENT_PENDING':
      return {
        '1': data.playerName || '',
        '2': data.organizerName || '',
        '3': data.clubName || '',
        '4': data.bookingDate || '',
        '5': data.amount?.toString() || '',
        '6': data.paymentLink || ''
      }
    
    case 'PAYMENT_COMPLETED':
      return {
        '1': data.playerName || '',
        '2': data.clubName || '',
        '3': data.bookingDate || '',
        '4': data.bookingTime || '',
        '5': data.paymentStatus || ''
      }
    
    case 'BOOKING_CANCELLED':
      return {
        '1': data.playerName || '',
        '2': data.clubName || '',
        '3': data.bookingDate || '',
        '4': data.bookingTime || '',
        '5': data.refundInfo || ''
      }
    
    case 'CHECKIN_REMINDER':
      return {
        '1': data.playerName || '',
        '2': data.clubName || '',
        '3': data.courtName || '',
        '4': data.checkinCode || ''
      }
    
    case 'PROMOTION':
      return {
        '1': data.playerName || '',
        '2': data.clubName || '',
        '3': data.promotionTitle || '',
        '4': data.discountAmount?.toString() || '',
        '5': data.expiryDate || ''
      }
    
    default:
      return {}
  }
}

/**
 * Validate template data - ensure all required variables are provided
 */
export function validateTemplateData(templateType: TemplateType, data: any): boolean {
  const template = WhatsAppTemplates[templateType]
  if (!template) return false

  const templateData = buildTemplateData(templateType, data)
  
  // Check that all required variables have values
  for (let i = 1; i <= template.variables.length; i++) {
    if (!templateData[i.toString()] || templateData[i.toString()].trim() === '') {
      console.warn(`Missing template variable ${i} for template ${templateType}`)
      return false
    }
  }

  return true
}

/**
 * Get available templates list for dashboard
 */
export function getTemplatesList() {
  return Object.entries(WhatsAppTemplates).map(([key, template]) => ({
    id: key,
    name: template.name,
    language: template.language,
    description: template.description,
    variables: template.variables
  }))
}

/**
 * Get template preview text (for testing/preview purposes)
 */
export function getTemplatePreview(templateType: TemplateType, data: any): string {
  const previews: Record<TemplateType, string> = {
    BOOKING_CONFIRMATION: `Hola ${data.playerName}! Reserva confirmada en ${data.clubName}
Cancha: ${data.courtName}
Fecha: ${data.bookingDate} a las ${data.bookingTime}
Total: $${data.totalPrice} MXN (${data.paymentMethod})
¡Te esperamos!`,

    BOOKING_REMINDER: `¡Hola ${data.playerName}! Tu juego en ${data.clubName} es en ${data.timeRemaining}
Cancha: ${data.courtName}
Ubicación: ${data.clubAddress}
¡Nos vemos pronto!`,

    PAYMENT_PENDING: `¡Hola ${data.playerName}! ${data.organizerName} te invitó a jugar en ${data.clubName}
Fecha: ${data.bookingDate}
Tu parte: $${data.amount} MXN
Paga aquí: ${data.paymentLink}
(Link expira en 24h)`,

    PAYMENT_COMPLETED: `¡Perfecto ${data.playerName}! Pago confirmado
${data.clubName} - ${data.bookingDate} a las ${data.bookingTime}
Status: ${data.paymentStatus}
¡Te esperamos!`,

    BOOKING_CANCELLED: `Hola ${data.playerName}, tu reserva fue cancelada
${data.clubName} - ${data.bookingDate} a las ${data.bookingTime}
${data.refundInfo}
¿Preguntas? Responde este mensaje.`,

    CHECKIN_REMINDER: `¡Hola ${data.playerName}! Ya llegaste a ${data.clubName}?
Cancha: ${data.courtName}
Código de check-in: ${data.checkinCode}
Presenta este código en recepción`,

    PROMOTION: `¡Hola ${data.playerName}! ${data.promotionTitle} en ${data.clubName}
${data.discountAmount}% de descuento
Válido hasta ${data.expiryDate}
¡Reserva ya!`
  }

  return previews[templateType] || 'Template preview not available'
}