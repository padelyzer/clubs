import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { getDayBoundariesInTimezone } from '@/lib/utils/timezone'

// Emergency ultra-simplified GET endpoint to isolate the 500 error
export async function GET(request: NextRequest) {
  try {
    console.log('[Emergency GET] Starting...')
    
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    console.log('[Emergency GET] Auth OK, clubId:', session.clubId)
    
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    console.log('[Emergency GET] Date:', date)
    
    // Get club timezone settings (minimal)
    let clubTimezone = 'America/Mexico_City'
    try {
      const clubSettings = await prisma.clubSettings.findUnique({
        where: { clubId: session.clubId },
        select: { timezone: true }
      })
      clubTimezone = clubSettings?.timezone || 'America/Mexico_City'
    } catch (err) {
      console.log('[Emergency GET] Club settings error:', err)
    }
    
    console.log('[Emergency GET] Timezone:', clubTimezone)
    
    // Build where clause (minimal)
    const where: any = {
      clubId: session.clubId,
      status: { not: 'CANCELLED' }
    }

    // Add date filter if provided
    if (date) {
      try {
        const { start, end } = getDayBoundariesInTimezone(date, clubTimezone)
        where.date = {
          gte: start,
          lt: end
        }
        console.log('[Emergency GET] Date filter applied')
      } catch (err) {
        console.log('[Emergency GET] Date filter error:', err)
      }
    }
    
    console.log('[Emergency GET] Where clause:', where)
    
    // ONLY try to get individual bookings (most basic query)
    console.log('[Emergency GET] Querying individual bookings...')
    const individualBookings = await prisma.booking.findMany({
      where: {
        ...where,
        bookingGroupId: null // Only individual bookings
      },
      select: {
        id: true,
        courtId: true,
        date: true,
        startTime: true,
        endTime: true,
        duration: true,
        playerName: true,
        playerPhone: true,
        totalPlayers: true,
        price: true,
        status: true,
        paymentStatus: true,
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
      take: 10 // Limit to 10 for safety
    })
    
    console.log('[Emergency GET] Found bookings:', individualBookings.length)
    
    // Minimal processing
    const bookingsWithStatus = individualBookings.map(booking => ({
      ...booking,
      isGroup: false,
      splitPaymentEnabled: false,
      splitPaymentProgress: 0,
      splitPaymentComplete: true
    }))
    
    console.log('[Emergency GET] Processed successfully')

    return NextResponse.json({ 
      success: true, 
      bookings: bookingsWithStatus,
      debug: {
        clubId: session.clubId,
        date,
        clubTimezone,
        count: bookingsWithStatus.length,
        where
      }
    })

  } catch (error) {
    console.error('[Emergency GET] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener reservas (emergency)',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}