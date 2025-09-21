import { NextRequest, NextResponse } from 'next/server'
import { requireStaffAuth } from '@/lib/auth/actions'
import { WhatsAppLinkService } from '@/lib/services/whatsapp-link-service'

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffAuth()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    // Get notification statistics
    const stats = await WhatsAppLinkService.getNotificationStats(session.clubId, days)

    // Mark expired links
    const expiredCount = await WhatsAppLinkService.markExpiredLinks()

    // Calculate metrics
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0)
    const clickedCount = stats.delivered || 0
    const expiredStat = stats.expired || 0
    const pendingCount = stats.link_generated || stats.pending || 0

    const clickRate = total > 0 ? ((clickedCount / total) * 100).toFixed(1) : '0.0'
    const expiredRate = total > 0 ? ((expiredStat / total) * 100).toFixed(1) : '0.0'

    return NextResponse.json({
      success: true,
      data: {
        period: {
          days,
          from: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        },
        totals: {
          sent: total,
          clicked: clickedCount,
          expired: expiredStat,
          pending: pendingCount
        },
        rates: {
          clickRate: `${clickRate}%`,
          expiredRate: `${expiredRate}%`,
          pendingRate: `${((pendingCount / (total || 1)) * 100).toFixed(1)}%`
        },
        breakdown: stats,
        maintenanceInfo: {
          expiredLinksMarked: expiredCount,
          lastChecked: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Error getting WhatsApp notification stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}