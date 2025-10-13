import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppLinkService } from '@/lib/services/whatsapp-link-service'
import { NotificationAnalyticsService } from '@/lib/services/notification-analytics-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, action, metadata } = body

    if (!notificationId) {
      return NextResponse.json(
        { error: 'ID de notificación requerido' },
        { status: 400 }
      )
    }

    // If action is specified, use enhanced analytics tracking
    if (action) {
      const userAgent = request.headers.get('user-agent') || undefined
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 undefined

      const result = await NotificationAnalyticsService.trackInteraction({
        notificationId,
        action,
        deviceInfo: userAgent,
        ipAddress: ip,
        metadata
      })

      return NextResponse.json(result)
    }

    // Default behavior - track link click
    const success = await WhatsAppLinkService.trackLinkClick(notificationId)

    if (!success) {
      return NextResponse.json(
        { error: 'Error registrando click en el link' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Click registrado exitosamente'
    })

  } catch (error) {
    console.error('Error tracking WhatsApp link click:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Track link click via GET (for direct link tracking)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')
    const redirect = searchParams.get('redirect')

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notification ID' },
        { status: 400 }
      )
    }

    // Track the click with enhanced analytics
    const userAgent = request.headers.get('user-agent') || undefined
    await NotificationAnalyticsService.trackLinkClick(notificationId, userAgent)

    // If redirect URL provided, redirect to WhatsApp
    if (redirect) {
      return NextResponse.redirect(redirect)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Click tracked successfully' 
    })

  } catch (error) {
    console.error('Error tracking link click:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}