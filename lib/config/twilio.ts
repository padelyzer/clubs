import twilio, { Twilio } from 'twilio'

// Check if Twilio is configured
const isTwilioConfigured =
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_WHATSAPP_NUMBER

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER

// Initialize Twilio client lazily (only when configured)
let _twilioClient: Twilio | null = null

export function getTwilioClient(): Twilio {
  if (!isTwilioConfigured) {
    throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER')
  }

  if (!_twilioClient) {
    _twilioClient = twilio(accountSid!, authToken!, {
      region: process.env.TWILIO_REGION || 'us1',
      edge: process.env.TWILIO_EDGE || 'sydney'
    })
  }

  return _twilioClient
}

// Legacy export for backward compatibility - will throw at runtime if not configured
export const twilioClient: Twilio = new Proxy({} as Twilio, {
  get(_target, prop) {
    return getTwilioClient()[prop as keyof Twilio]
  }
})

// Twilio configuration constants
export const TWILIO_CONFIG = {
  maxRetries: 3,
  timeoutMs: 30000,
  rateLimitDelay: 1000, // 1 second between messages
  batchSize: 5 // Max concurrent sends
}

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
      error: (error as Error).message
    }
  }
}

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