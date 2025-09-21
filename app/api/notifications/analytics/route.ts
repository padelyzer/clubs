import { NextRequest, NextResponse } from 'next/server'
import { requireStaffAuth } from '@/lib/auth/actions'
import { NotificationAnalyticsService } from '@/lib/services/notification-analytics-service'

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffAuth()
    const { searchParams } = new URL(request.url)
    
    const clubId = searchParams.get('clubId') || session.clubId
    const range = searchParams.get('range') || '7days'
    
    // Calculate date range
    const now = new Date()
    let from = new Date()
    
    switch (range) {
      case '24h':
        from.setDate(from.getDate() - 1)
        break
      case '7days':
        from.setDate(from.getDate() - 7)
        break
      case '30days':
        from.setDate(from.getDate() - 30)
        break
      case '90days':
        from.setDate(from.getDate() - 90)
        break
      default:
        from.setDate(from.getDate() - 7)
    }
    
    // Get comprehensive analytics
    const metrics = await NotificationAnalyticsService.getClubAnalytics(
      clubId,
      { from, to: now }
    )
    
    // Get engagement funnel
    const engagementFunnel = await NotificationAnalyticsService.getEngagementFunnel(
      clubId,
      { from, to: now }
    )
    
    // Generate weekly trend data (mock for now - would come from real data)
    const weeklyTrend = generateWeeklyTrend()
    
    return NextResponse.json({
      metrics,
      peakHours: metrics.peakHours,
      topTemplates: metrics.topTemplates,
      deviceBreakdown: metrics.deviceBreakdown,
      engagementFunnel: engagementFunnel.stages,
      weeklyTrend
    })
    
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Error fetching analytics' },
      { status: 500 }
    )
  }
}

// Helper function to generate weekly trend (replace with real data)
function generateWeeklyTrend() {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  return days.map(day => ({
    day,
    sent: Math.floor(Math.random() * 100) + 50,
    delivered: Math.floor(Math.random() * 80) + 40,
    opened: Math.floor(Math.random() * 60) + 20
  }))
}