import { NextRequest, NextResponse } from 'next/server'
import { requireStaffAuth } from '@/lib/auth/actions'
import { WhatsAppLinkService } from '@/lib/services/whatsapp-link-service'
import { NotificationType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffAuth()
    const body = await request.json()

    const { 
      notificationType,
      playerName,
      playerPhone,
      bookingId,
      bookingGroupId,
      message,
      expirationHours 
    } = body

    // Validate required fields
    if (!notificationType || !playerName) {
      return NextResponse.json(
        { error: 'Tipo de notificación y nombre del jugador son requeridos' },
        { status: 400 }
      )
    }

    // Validate notification type
    const validTypes: NotificationType[] = [
      'BOOKING_CONFIRMATION',
      'PAYMENT_REMINDER', 
      'BOOKING_CANCELLATION',
      'SPLIT_PAYMENT_REQUEST',
      'SPLIT_PAYMENT_COMPLETED',
      'GENERAL'
    ]

    if (!validTypes.includes(notificationType)) {
      return NextResponse.json(
        { error: 'Tipo de notificación inválido' },
        { status: 400 }
      )
    }

    // Generate WhatsApp link
    const result = await WhatsAppLinkService.generateLink({
      clubId: session.clubId,
      notificationType,
      playerName,
      playerPhone,
      bookingId,
      bookingGroupId,
      message,
      expirationHours
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        notificationId: result.notificationId,
        whatsappLink: result.whatsappLink,
        message: result.message
      }
    })

  } catch (error) {
    console.error('Error generating WhatsApp notification:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}