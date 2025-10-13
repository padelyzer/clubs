import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { addDays, startOfWeek } from 'date-fns'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const paramData = await params
    
    const { clubId } = params
    const { searchParams } = new URL(request.url)
    
    // Get date range from query params
    const dateParam = searchParams.get('date')
    const baseDate = dateParam ? new Date(dateParam) : new Date()
    const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 })
    const weekEnd = addDays(weekStart, 6)
    
    // Get club first to validate it exists and is active
    const club = await prisma.club.findFirst({
      where: {
        OR: [
          { id: clubId },
          { slug: clubId }
        ],
        status: 'APPROVED',
        active: true
      },
      select: { id: true }
    })

    if (!club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      )
    }

    // Get bookings for the specified date range (public info only)
    const bookings = await prisma.booking.findMany({
      where: {
        clubId: club.id,
        date: {
          gte: weekStart,
          lte: weekEnd
        },
        status: { not: 'CANCELLED' }
      },
      select: {
        id: true,
        courtId: true,
        date: true,
        startTime: true,
        endTime: true,
        duration: true,
        status: true,
        Court: {
          select: {
            id: true,
            name: true
          }
        }
        // Note: No personal info (playerName, phone, email) exposed
      }
    })

    return NextResponse.json({ bookings })

  } catch (error) {
    console.error('Public bookings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const paramData = await params
    
    const { clubId } = params
    const body = await request.json()
    
    // This would handle creating new bookings from the widget
    // For now, we'll redirect to use the server action instead
    return NextResponse.json(
      { error: 'Use widget booking form instead' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Public booking creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}