import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { requireStaffAuth } from '@/lib/auth/actions'

export async function GET(request: NextRequest) {
  try {
    // Check auth
    const user = await requireStaffAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get bookingId from query params
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
    }

    // Find the most recent WhatsApp notification for this booking
    const notification = await prisma.notification.findFirst({
      where: {
        bookingId,
        whatsappLink: { not: null }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        whatsappLink: true,
        linkClicked: true,
        clickedAt: true,
        status: true,
        type: true,
        createdAt: true
      }
    })

    if (!notification) {
      // If no notification exists, we could generate one on the fly
      // For now, just return empty
      return NextResponse.json({ 
        whatsappLink: null,
        message: 'No WhatsApp notification found for this booking'
      })
    }

    return NextResponse.json({
      whatsappLink: notification.whatsappLink,
      notificationId: notification.id,
      status: notification.status,
      type: notification.type,
      linkClicked: notification.linkClicked,
      clickedAt: notification.clickedAt,
      createdAt: notification.createdAt
    })

  } catch (error) {
    console.error('Error fetching WhatsApp link:', error)
    return NextResponse.json(
      { error: 'Error fetching WhatsApp link' },
      { status: 500 }
    )
  }
}