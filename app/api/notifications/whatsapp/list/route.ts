import { NextRequest, NextResponse } from 'next/server'
import { requireStaffAuth } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffAuth()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // pending, link_generated, delivered, expired, failed
    const type = searchParams.get('type') // notification type filter
    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      clubId: session.clubId,
      whatsappLink: {
        not: null
      }
    }

    if (status) {
      whereClause.status = status
    }

    if (type) {
      whereClause.type = type
    }

    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        select: {
          id: true,
          type: true,
          status: true,
          recipient: true,
          recipientPhone: true,
          message: true,
          whatsappLink: true,
          createdAt: true,
          updatedAt: true,
          sentAt: true,
          Booking: {
            select: {
              id: true,
              date: true,
              startTime: true,
              Court: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.notification.count({
        where: whereClause
      })
    ])

    const totalPages = Math.ceil(total / limit)

    // Format notifications for display
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      status: notification.status,
      recipient: notification.recipient,
      recipientPhone: notification.recipientPhone,
      message: notification.message?.substring(0, 100) + (notification.message && notification.message.length > 100 ? '...' : ''),
      whatsappLink: notification.whatsappLink,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      sentAt: notification.sentAt,
      bookingInfo: notification.Booking
    }))

    return NextResponse.json({
      success: true,
      data: {
        notifications: formattedNotifications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: {
          status,
          type
        }
      }
    })

  } catch (error) {
    console.error('Error getting WhatsApp notifications:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}