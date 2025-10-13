import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppService } from '@/lib/services/whatsapp-service'
import { prisma } from '@/lib/config/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const paramData = await params
    
    const messageId = params.messageId

    if (!messageId) {
      return NextResponse.json(
        { error: 'Missing messageId parameter' },
        { status: 400 }
      )
    }

    // Get status from Twilio
    const twilioStatus = await WhatsAppService.getMessageStatus(messageId)
    
    // Get notification from database
    const notification = await prisma.notification.findFirst({
      where: { twilioSid: messageId },
      include: {
        Booking: {
          include: {
            Club: true,
            Court: true
          }
        },
        SplitPayment: true
      }
    })

    if (!notification) {
      return NextResponse.json({
        success: true,
        twilioStatus,
        databaseRecord: null
      })
    }

    return NextResponse.json({
      success: true,
      twilioStatus,
      databaseRecord: {
        id: notification.id,
        template: notification.template,
        recipient: notification.recipient,
        status: notification.status,
        createdAt: notification.createdAt,
        sentAt: notification.sentAt,
        updatedAt: notification.updatedAt,
        errorMessage: notification.errorMessage,
        booking: {
          id: notification.Booking.id,
          playerName: notification.Booking.playerName,
          date: notification.Booking.date,
          startTime: notification.Booking.startTime,
          club: notification.Booking.Club.name,
          court: notification.Booking.Court.name
        },
        splitPayment: notification.SplitPayment ? {
          id: notification.SplitPayment.id,
          playerName: notification.SplitPayment.playerName,
          amount: notification.SplitPayment.amount,
          status: notification.SplitPayment.status
        } : null
      }
    })

  } catch (error: any) {
    console.error('WhatsApp status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}