import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { getDayBoundariesInTimezone } from '@/lib/utils/timezone'
import { parseISO } from 'date-fns'

// Simplified GET endpoint to isolate the 500 error
export async function GET(request: NextRequest) {
  try {
    console.log('[Simple GET] Starting request...')
    
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    console.log('[Simple GET] Auth successful, clubId:', session.clubId)
    
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    console.log('[Simple GET] Date param:', date)
    
    // Get club timezone settings
    const clubSettings = await prisma.clubSettings.findUnique({
      where: { clubId: session.clubId },
      select: { timezone: true }
    })
    const clubTimezone = clubSettings?.timezone || 'America/Mexico_City'
    
    console.log('[Simple GET] Club timezone:', clubTimezone)
    
    const where: any = {
      clubId: session.clubId
    }

    // Date filtering
    if (date) {
      const { start, end } = getDayBoundariesInTimezone(date, clubTimezone)
      where.date = {
        gte: start,
        lt: end
      }
      console.log('[Simple GET] Date boundaries:', { start, end })
    }

    // Status filtering - exclude cancelled by default
    where.status = { not: 'CANCELLED' }
    
    console.log('[Simple GET] Where clause:', where)
    
    // Try to get ONLY individual bookings first (simplest query)
    console.log('[Simple GET] Fetching individual bookings...')
    const individualBookings = await prisma.booking.findMany({
      where: {
        ...where,
        bookingGroupId: null // Only individual bookings
      },
      include: {
        Court: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
      take: 50 // Limit to 50 records
    })
    
    console.log('[Simple GET] Individual bookings found:', individualBookings.length)
    
    // Add computed fields for individual bookings (simplified)
    const bookingsWithStatus = individualBookings.map(booking => ({
      ...booking,
      isGroup: false,
      splitPaymentProgress: 0,
      splitPaymentComplete: true
    }))
    
    console.log('[Simple GET] Processed bookings:', bookingsWithStatus.length)

    return NextResponse.json({ 
      success: true, 
      bookings: bookingsWithStatus,
      debug: {
        clubId: session.clubId,
        date,
        clubTimezone,
        where,
        count: bookingsWithStatus.length
      }
    })

  } catch (error) {
    console.error('[Simple GET] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener reservas (simple)',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}