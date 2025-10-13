import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { parse, format, addMinutes } from 'date-fns'
import { 
  getNowInTimezone, 
  getDayBoundariesInTimezone, 
  isTimeInPast 
} from '@/lib/utils/timezone'

// GET - Check availability for a specific date and court
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    
    const date = searchParams.get('date')
    const courtId = searchParams.get('courtId')
    const duration = parseInt(searchParams.get('duration') || '90')
    
    if (!date || !courtId) {
      return NextResponse.json(
        { success: false, error: 'Fecha y cancha son requeridas' },
        { status: 400 }
      )
    }
    
    // Get club settings for timezone
    const clubSettings = await prisma.clubSettings.findUnique({
      where: { clubId: session.clubId }
    })
    
    const timezone = clubSettings?.timezone || 'America/Mexico_City'
    
    // Parse date correctly to avoid timezone issues  
    const [year, month, day] = date.split('-').map(Number)
    const bookingDate = new Date(year, month - 1, day) // month is 0-indexed
    const { start: startOfDay, end: endOfDay } = getDayBoundariesInTimezone(date, timezone)
    
    // Get all bookings for this court on this date
    const existingBookings = await prisma.booking.findMany({
      where: {
        clubId: session.clubId,
        courtId,
        date: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: {
          not: 'CANCELLED'
        }
      },
      select: {
        startTime: true,
        endTime: true,
        playerName: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })
    
    // Get operating hours from schedule rules
    const today = bookingDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    const scheduleRule = await prisma.scheduleRule.findFirst({
      where: {
        clubId: session.clubId,
        dayOfWeek: today,
        enabled: true
      }
    })
    
    // Use schedule rule times or defaults
    const openTime = scheduleRule?.startTime || '07:00'
    const closeTime = scheduleRule?.endTime || '23:00'
    
    console.log('Schedule rule for day', today, ':', scheduleRule)
    
    // Generate all possible time slots
    const allSlots = []
    let currentTime = parse(openTime, 'HH:mm', new Date())
    const endTime = parse(closeTime, 'HH:mm', new Date())
    
    while (currentTime < endTime) {
      const slotStart = format(currentTime, 'HH:mm')
      const slotEnd = format(addMinutes(currentTime, duration), 'HH:mm')
      
      // Check if this slot would exceed closing time
      const slotEndTime = addMinutes(currentTime, duration)
      const closeDateTime = parse(closeTime, 'HH:mm', new Date())
      
      if (slotEndTime <= closeDateTime) {
        allSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
          available: true,
          conflict: null
        })
      }
      
      // Move to next 30-minute interval
      currentTime = addMinutes(currentTime, 30)
    }
    
    console.log('=== AVAILABILITY API DEBUG ===')
    console.log('Date received:', date)
    console.log('CourtId:', courtId)
    console.log('Duration:', duration)
    console.log('Timezone:', timezone)
    console.log('All slots generated:', allSlots.length)
    
    // Check each slot for conflicts
    const slotsWithAvailability = allSlots.map(slot => {
      // Check if this slot overlaps with any existing booking
      const hasConflict = existingBookings.some(booking => {
        // Check for time overlap
        return (
          (slot.startTime >= booking.startTime && slot.startTime < booking.endTime) ||
          (slot.endTime > booking.startTime && slot.endTime <= booking.endTime) ||
          (slot.startTime <= booking.startTime && slot.endTime >= booking.endTime)
        )
      })
      
      if (hasConflict) {
        const conflictingBooking = existingBookings.find(booking => {
          return (
            (slot.startTime >= booking.startTime && slot.startTime < booking.endTime) ||
            (slot.endTime > booking.startTime && slot.endTime <= booking.endTime) ||
            (slot.startTime <= booking.startTime && slot.endTime >= booking.endTime)
          )
        })
        
        return {
          ...slot,
          available: false,
          conflict: conflictingBooking ? {
            playerName: conflictingBooking.playerName,
            startTime: conflictingBooking.startTime,
            endTime: conflictingBooking.endTime
          } : null
        }
      }
      
      // Check if slot is in the past (for today's date)
      const nowInClubTz = getNowInTimezone(timezone)
      const isToday = bookingDate.toDateString() === nowInClubTz.toDateString()
      
      console.log(`Slot ${slot.startTime}: bookingDate=${bookingDate.toDateString()}, nowInClubTz=${nowInClubTz.toDateString()}, isToday=${isToday}`)
      
      if (isToday && isTimeInPast(slot.startTime, bookingDate, timezone, 0)) {
        console.log(`❌ FILTERING OUT past slot: ${slot.startTime}`)
        return {
          ...slot,
          available: false,
          conflict: { reason: 'past_time' }
        }
      }
      
      return slot
    })
    
    // Return availability data
    return NextResponse.json({
      success: true,
      date,
      courtId,
      slots: slotsWithAvailability,
      summary: {
        total: slotsWithAvailability.length,
        available: slotsWithAvailability.filter(s => s.available).length,
        occupied: slotsWithAvailability.filter(s => !s.available).length
      }
    })
    
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar disponibilidad' },
      { status: 500 }
    )
  }
}