import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppService } from '@/lib/services/whatsapp-service'
import { validateTemplateData } from '@/lib/whatsapp/templates'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, templateName, templateData, bookingId } = body

    // Validate required fields
    if (!to || !templateName) {
      return NextResponse.json(
        { error: 'Missing required fields: to, templateName' },
        { status: 400 }
      )
    }

    // Validate phone number format
    if (!to.match(/^\+?[1-9]\d{1,14}$/)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // For booking-specific templates, use service methods
    if (bookingId) {
      let result
      
      switch (templateName) {
        case 'booking_confirmation':
          result = await WhatsAppService.sendBookingConfirmation(bookingId)
          break
        case 'booking_reminder':
          result = await WhatsAppService.sendBookingReminder(bookingId)
          break
        case 'payment_pending':
          result = await WhatsAppService.sendPaymentPendingNotifications(bookingId)
          break
        case 'booking_cancelled':
          result = await WhatsAppService.sendBookingCancellation(bookingId)
          break
        default:
          return NextResponse.json(
            { error: 'Invalid template for booking' },
            { status: 400 }
          )
      }

      return NextResponse.json(result)
    }

    // For custom messages, send directly
    const result = await WhatsAppService.sendTemplateMessage({
      to,
      templateName,
      templateLanguage: 'es_MX',
      templateData: templateData || {}
    })

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('WhatsApp send API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Get message status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageSid = searchParams.get('messageSid')

    if (!messageSid) {
      return NextResponse.json(
        { error: 'Missing messageSid parameter' },
        { status: 400 }
      )
    }

    const result = await WhatsAppService.getMessageStatus(messageSid)
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('WhatsApp status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}