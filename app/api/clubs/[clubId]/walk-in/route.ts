import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/config/auth'
import { prisma } from '@/lib/config/prisma'
import { generateBookingCode } from '@/lib/utils/booking-codes'

// POST /api/clubs/[clubId]/walk-in - Registrar cliente walk-in
export async function POST(
  request: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { clubId } = params
    const body = await request.json()
    const {
      courtId,
      startTime,
      duration = 90,
      customerName,
      customerEmail = '',
      customerPhone = '',
      paymentMethod = 'cash',
      amount,
      notes = ''
    } = body

    // Validate required fields
    if (!courtId || !startTime || !customerName || !amount) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Verify user has access to this club
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        role: true, 
        clubId: true,
        club: {
          select: {
            id: true,
            settings: true
          }
        }
      }
    })

    if (!user || (user.role !== 'SUPER_ADMIN' && user.clubId !== clubId)) {
      return NextResponse.json(
        { error: 'Sin acceso a este club' },
        { status: 403 }
      )
    }

    // Verify court belongs to club
    const court = await prisma.court.findFirst({
      where: {
        id: courtId,
        clubId: clubId,
        active: true
      }
    })

    if (!court) {
      return NextResponse.json(
        { error: 'Cancha no válida' },
        { status: 400 }
      )
    }

    // Calculate end time
    const today = new Date()
    const [hours, minutes] = startTime.split(':').map(Number)
    const endHours = Math.floor((hours * 60 + minutes + duration) / 60)
    const endMinutes = (hours * 60 + minutes + duration) % 60
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`

    // Create walk-in booking
    const booking = await prisma.booking.create({
      data: {
        courtId,
        date: today,
        startTime,
        endTime,
        duration,
        price: amount,
        status: 'checked_in',
        paymentStatus: 'paid',
        source: 'walk_in',
        bookingCode: await generateBookingCode(),
        playerName: customerName,
        playerEmail: customerEmail,
        playerPhone: customerPhone,
        checkedInAt: new Date(),
        checkedInBy: session.user.id,
        notes: `Walk-in. Pago: ${paymentMethod}. ${notes}`.trim()
      }
    })

    // Create transaction
    await prisma.transaction.create({
      data: {
        id: `txn-walkin-${booking.id}`,
        clubId: clubId,
        bookingId: booking.id,
        type: 'booking_payment',
        amount: amount,
        currency: user.club?.settings?.currency || 'MXN',
        status: 'completed',
        paymentMethod: paymentMethod,
        description: `Walk-in: ${customerName} - ${court.name}`,
        metadata: {
          walkIn: true,
          registeredBy: session.user.id,
          registeredAt: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        court: court.name,
        time: `${startTime} - ${endTime}`,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        },
        amount: amount,
        paymentMethod: paymentMethod
      }
    })

  } catch (error) {
    console.error('[Walk-in] Error:', error)
    return NextResponse.json(
      { error: 'Error al registrar walk-in' },
      { status: 500 }
    )
  }
}

// GET /api/clubs/[clubId]/walk-in - Obtener info para walk-in (canchas disponibles ahora)
export async function GET(
  request: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { clubId } = params

    // Verify user has access to this club
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, clubId: true }
    })

    if (!user || (user.role !== 'SUPER_ADMIN' && user.clubId !== clubId)) {
      return NextResponse.json(
        { error: 'Sin acceso a este club' },
        { status: 403 }
      )
    }

    // Get available courts
    const courts = await prisma.court.findMany({
      where: {
        clubId: clubId,
        active: true
      },
      select: {
        id: true,
        name: true,
        type: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Get current time and next available slots
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinutes = now.getMinutes()
    
    // Round to next 30 min slot
    const nextSlotMinutes = currentMinutes < 30 ? 30 : 0
    const nextSlotHour = currentMinutes < 30 ? currentHour : currentHour + 1
    
    const availableSlots = []
    for (let i = 0; i < 4; i++) {
      const hour = nextSlotHour + Math.floor(i * 0.5)
      const minutes = i % 2 === 0 ? nextSlotMinutes : (nextSlotMinutes + 30) % 60
      if (hour < 22) { // Assuming club closes at 22:00
        availableSlots.push(
          `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        )
      }
    }

    return NextResponse.json({
      courts,
      suggestedSlots: availableSlots,
      defaultDuration: 90
    })

  } catch (error) {
    console.error('[Walk-in Info] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener información' },
      { status: 500 }
    )
  }
}