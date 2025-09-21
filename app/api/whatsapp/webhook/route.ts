import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppService } from '@/lib/services/whatsapp-service'
import crypto from 'crypto'

/**
 * Twilio WhatsApp webhook handler
 * Handles delivery receipts, read receipts, and incoming messages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-twilio-signature')

    // Verify Twilio webhook signature (security)
    if (!verifyTwilioSignature(body, signature)) {
      console.error('Invalid Twilio webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      )
    }

    // Parse form data
    const formData = new URLSearchParams(body)
    const messageStatus = formData.get('MessageStatus')
    const messageSid = formData.get('MessageSid')
    const errorCode = formData.get('ErrorCode')
    const errorMessage = formData.get('ErrorMessage')
    const from = formData.get('From')
    const to = formData.get('To')
    const incomingBody = formData.get('Body')

    console.log('WhatsApp webhook received:', {
      messageStatus,
      messageSid,
      errorCode,
      from,
      to
    })

    // Handle status updates for outgoing messages
    if (messageSid && messageStatus) {
      await handleStatusUpdate(messageSid, messageStatus, errorCode, errorMessage)
    }

    // Handle incoming messages (for opt-out, support, etc.)
    if (incomingBody && from) {
      await handleIncomingMessage(from, incomingBody)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleStatusUpdate(
  messageSid: string, 
  status: string, 
  errorCode?: string | null, 
  errorMessage?: string | null
) {
  try {
    let notificationStatus: 'sent' | 'delivered' | 'failed' = 'sent'

    switch (status) {
      case 'sent':
      case 'queued':
        notificationStatus = 'sent'
        break
      case 'delivered':
      case 'read':
        notificationStatus = 'delivered'
        break
      case 'failed':
      case 'undelivered':
        notificationStatus = 'failed'
        break
    }

    await WhatsAppService.updateNotificationStatus(
      messageSid, 
      notificationStatus, 
      errorMessage || undefined
    )

    console.log(`Updated notification status: ${messageSid} -> ${notificationStatus}`)

  } catch (error) {
    console.error('Error updating notification status:', error)
  }
}

async function handleIncomingMessage(from: string, messageBody: string) {
  try {
    const phoneNumber = from.replace('whatsapp:', '')
    const cleanMessage = messageBody.toLowerCase().trim()

    // Handle opt-out requests
    if (isOptOutMessage(cleanMessage)) {
      await handleOptOut(phoneNumber)
      return
    }

    // Handle common responses
    if (isConfirmationMessage(cleanMessage)) {
      await handleConfirmationResponse(phoneNumber, cleanMessage)
      return
    }

    // Log customer support request
    await logCustomerSupportRequest(phoneNumber, messageBody)

  } catch (error) {
    console.error('Error handling incoming message:', error)
  }
}

function isOptOutMessage(message: string): boolean {
  const optOutKeywords = [
    'stop', 'baja', 'cancelar', 'unsubscribe', 
    'no más', 'no mas', 'opt out', 'salir'
  ]
  
  return optOutKeywords.some(keyword => message.includes(keyword))
}

function isConfirmationMessage(message: string): boolean {
  const confirmKeywords = [
    'sí', 'si', 'yes', 'confirmar', 'ok', 'está bien', 'esta bien'
  ]
  
  return confirmKeywords.some(keyword => message.includes(keyword))
}

async function handleOptOut(phoneNumber: string) {
  try {
    // TODO: Implement opt-out functionality
    // This could involve:
    // 1. Adding phone to opt-out list in database
    // 2. Updating user preferences
    // 3. Sending confirmation message
    
    console.log(`Opt-out request from: ${phoneNumber}`)
    
    // Send confirmation (if allowed)
    // await WhatsAppService.sendTemplateMessage({
    //   to: phoneNumber,
    //   templateName: 'opt_out_confirmation',
    //   templateLanguage: 'es_MX',
    //   templateData: {}
    // })

  } catch (error) {
    console.error('Error handling opt-out:', error)
  }
}

async function handleConfirmationResponse(phoneNumber: string, message: string) {
  try {
    // TODO: Handle confirmation responses
    // This could involve:
    // 1. Finding related booking/payment
    // 2. Updating booking status
    // 3. Triggering follow-up actions
    
    console.log(`Confirmation response from ${phoneNumber}: ${message}`)

  } catch (error) {
    console.error('Error handling confirmation response:', error)
  }
}

async function logCustomerSupportRequest(phoneNumber: string, message: string) {
  try {
    // TODO: Log customer support requests
    // This could involve:
    // 1. Creating support ticket
    // 2. Notifying staff
    // 3. Auto-responding with support info
    
    console.log(`Customer support request from ${phoneNumber}: ${message}`)

  } catch (error) {
    console.error('Error logging customer support request:', error)
  }
}

function verifyTwilioSignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.TWILIO_AUTH_TOKEN) {
    return false
  }

  try {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook`
    const expectedSignature = crypto
      .createHmac('sha1', process.env.TWILIO_AUTH_TOKEN)
      .update(webhookUrl + body)
      .digest('base64')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error('Error verifying Twilio signature:', error)
    return false
  }
}