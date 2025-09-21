import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppService } from '@/lib/services/whatsapp-service'
import { prisma } from '@/lib/config/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clubId = searchParams.get('clubId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!clubId) {
      return NextResponse.json(
        { error: 'Missing clubId parameter' },
        { status: 400 }
      )
    }

    // Parse dates
    const fromDate = dateFrom ? new Date(dateFrom) : undefined
    const toDate = dateTo ? new Date(dateTo) : undefined

    // Get notification stats
    const stats = await WhatsAppService.getNotificationStats(clubId, fromDate, toDate)

    // Get template breakdown
    const templateStats = await getTemplateBreakdown(clubId, fromDate, toDate)

    // Get recent notifications
    const recentNotifications = await getRecentNotifications(clubId, 10)

    // Get daily stats for charts
    const dailyStats = await getDailyStats(clubId, fromDate, toDate)

    return NextResponse.json({
      success: true,
      overview: stats,
      templateBreakdown: templateStats,
      recentNotifications,
      dailyStats
    })

  } catch (error: any) {
    console.error('WhatsApp stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

async function getTemplateBreakdown(clubId: string, dateFrom?: Date, dateTo?: Date) {
  try {
    const whereClause = {
      booking: { clubId },
      ...(dateFrom && dateTo && {
        createdAt: {
          gte: dateFrom,
          lte: dateTo
        }
      })
    }

    const templateGroups = await prisma.notification.groupBy({
      by: ['template', 'status'],
      where: whereClause,
      _count: {
        id: true
      }
    })

    // Reorganize data by template
    const templates: Record<string, any> = {}
    
    templateGroups.forEach(group => {
      if (!templates[group.template]) {
        templates[group.template] = {
          template: group.template,
          total: 0,
          sent: 0,
          delivered: 0,
          failed: 0,
          pending: 0
        }
      }
      
      templates[group.template].total += group._count.id
      templates[group.template][group.status] += group._count.id
    })

    return Object.values(templates)

  } catch (error) {
    console.error('Error getting template breakdown:', error)
    return []
  }
}

async function getRecentNotifications(clubId: string, limit: number = 10) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        booking: { clubId }
      },
      include: {
        Booking: {
          include: {
            Court: true
          }
        },
        SplitPayment: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return notifications.map(notification => ({
      id: notification.id,
      template: notification.template,
      recipient: notification.recipient,
      status: notification.status,
      createdAt: notification.createdAt,
      sentAt: notification.sentAt,
      errorMessage: notification.errorMessage,
      booking: {
        id: notification.Booking.id,
        playerName: notification.Booking.playerName,
        date: notification.Booking.date,
        startTime: notification.Booking.startTime,
        court: notification.Booking.Court.name
      },
      splitPayment: notification.SplitPayment ? {
        playerName: notification.SplitPayment.playerName,
        amount: notification.SplitPayment.amount
      } : null
    }))

  } catch (error) {
    console.error('Error getting recent notifications:', error)
    return []
  }
}

async function getDailyStats(clubId: string, dateFrom?: Date, dateTo?: Date) {
  try {
    const startDate = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    const endDate = dateTo || new Date()

    const dailyGroups = await prisma.notification.groupBy({
      by: ['status'],
      where: {
        booking: { clubId },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // For simplicity, return aggregated data
    // In a real implementation, you might want daily breakdown
    return dailyGroups.map(group => ({
      status: group.status,
      count: group._count.id
    }))

  } catch (error) {
    console.error('Error getting daily stats:', error)
    return []
  }
}