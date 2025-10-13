import twilio from 'twilio'

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'

export async function sendWhatsAppMessage(to: string, message: string) {
  // If Twilio credentials are not configured, fall back to logging
  if (!client || process.env.NODE_ENV === 'development') {
    console.log(`[WhatsApp] Would send to ${to}: ${message}`)
    return { success: true, message: 'Development mode - message logged' }
  }

  try {
    // Ensure phone number has whatsapp: prefix
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
    
    const result = await client.messages.create({
      body: message,
      from: TWILIO_WHATSAPP_FROM,
      to: formattedTo
    })

    return { 
      success: true, 
      messageId: result.sid,
      status: result.status 
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}