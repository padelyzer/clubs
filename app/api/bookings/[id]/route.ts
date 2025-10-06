import { NextRequest, NextResponse } from 'next/server'
import { requireStaffAuth } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'
import { addMinutes, format, parse, parseISO } from 'date-fns'
import { onBookingCancelled, onBookingConfirmed, onPlayerCheckIn } from '@/lib/whatsapp/notification-hooks'

const updateBookingSchema = z.object({
  courtId: z.string().min(1).optional(),
  date: z.string().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  duration: z.number().min(30).max(240).optional(),
  playerName: z.string().min(1).optional(),
  playerEmail: z.string().email().optional(),
  playerPhone: z.string().min(10).optional(),
  totalPlayers: z.number().min(1).max(8).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
  checkedIn: z.boolean().optional()
})

// GET - Get specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    
    const session = await requireStaffAuth()
    const { id } = paramData

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        clubId: session.clubId
      },
      include: {
        Court: true,
        Club: {
          include: {
            ClubSettings: true
          }
        },
        SplitPayment: {
          orderBy: { createdAt: 'asc' }
        },
        Payment: {
          orderBy: { createdAt: 'desc' }
        },
        Notification: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Add computed fields
    const splitPaymentProgress = booking.splitPaymentEnabled 
      ? booking.SplitPayment.filter(sp => sp.status === 'completed').length
      : 0

    const bookingWithStatus = {
      ...booking,
      splitPaymentProgress,
      splitPaymentComplete: booking.splitPaymentEnabled 
        ? splitPaymentProgress === booking.splitPaymentCount
        : true
    }

    return NextResponse.json({ 
      success: true, 
      booking: bookingWithStatus 
    })

  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener reserva' },
      { status: 500 }
    )
  }
}

// PUT - Update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    
    const session = await requireStaffAuth()
    const { id } = paramData
    const body = await request.json()
    
    const validatedData = updateBookingSchema.parse(body)

    // Check if booking exists and belongs to club
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Calculate new end time if duration or start time changed
    let endTime = existingBooking.endTime
    if (validatedData.startTime || validatedData.duration) {
      const startTime = validatedData.startTime || existingBooking.startTime
      const duration = validatedData.duration || existingBooking.duration
      
      const startTimeDate = parse(startTime, 'HH:mm', new Date())
      const endTimeDate = addMinutes(startTimeDate, duration)
      endTime = format(endTimeDate, 'HH:mm')
    }

    // Check for conflicts if time/date/court changed
    if (validatedData.courtId || validatedData.date || validatedData.startTime || validatedData.duration) {
      const courtId = validatedData.courtId || existingBooking.courtId
      const date = validatedData.date ? parseISO(validatedData.date) : existingBooking.date
      const startTime = validatedData.startTime || existingBooking.startTime

      const conflicts = await checkBookingConflicts(
        session.clubId,
        courtId,
        date,
        startTime,
        endTime,
        id // Exclude current booking from conflict check
      )

      if (conflicts.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Ya existe una reserva en este horario',
            conflicts 
          },
          { status: 409 }
        )
      }
    }

    // Handle check-in
    const updateData: any = {
      ...validatedData,
      endTime,
      updatedAt: new Date()
    }

    const isCheckingIn = validatedData.checkedIn === true && !existingBooking.checkedIn
    const isConfirming = validatedData.status === 'CONFIRMED' && existingBooking.status !== 'CONFIRMED'

    if (isCheckingIn) {
      updateData.checkedInAt = new Date()
      updateData.checkedInBy = session.id
      updateData.status = 'IN_PROGRESS'
    }

    if (validatedData.date) {
      updateData.date = parseISO(validatedData.date)
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        Court: true,
        SplitPayment: true
      }
    })

    // Trigger WhatsApp notifications
    try {
      if (isCheckingIn) {
        await onPlayerCheckIn(booking.id)
      } else if (isConfirming) {
        await onBookingConfirmed(booking.id)
      }
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error)
      // Don't fail the update if notification fails
    }

    return NextResponse.json({ 
      success: true, 
      booking,
      message: 'Reserva actualizada exitosamente' 
    })

  } catch (error) {
    console.error('Error updating booking:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al actualizar reserva' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    
    const session = await requireStaffAuth()
    const { id } = paramData

    // Check if booking exists and belongs to club
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Update booking status to cancelled
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        Court: true
      }
    })

    // Cancel any pending split payments
    await prisma.splitPayment.updateMany({
      where: {
        bookingId: id,
        status: 'pending'
      },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    })

    // Trigger WhatsApp cancellation notifications
    try {
      await onBookingCancelled(booking.id)
    } catch (error) {
      console.error('Error sending WhatsApp cancellation notification:', error)
      // Don't fail the cancellation if notification fails
    }

    return NextResponse.json({ 
      success: true, 
      booking,
      message: 'Reserva cancelada exitosamente' 
    })

  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cancelar reserva' },
      { status: 500 }
    )
  }
}

// Helper function for conflict checking
async function checkBookingConflicts(
  clubId: string,
  courtId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
) {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

  const where: any = {
    clubId,
    courtId,
    date: {
      gte: startOfDay,
      lt: endOfDay
    },
    status: {
      not: 'CANCELLED'
    },
    OR: [
      // New booking starts during existing booking
      {
        AND: [
          { startTime: { lte: startTime } },
          { endTime: { gt: startTime } }
        ]
      },
      // New booking ends during existing booking
      {
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gte: endTime } }
        ]
      },
      // New booking completely contains existing booking
      {
        AND: [
          { startTime: { gte: startTime } },
          { endTime: { lte: endTime } }
        ]
      }
    ]
  }

  if (excludeBookingId) {
    where.id = { not: excludeBookingId }
  }

  return await prisma.booking.findMany({
    where,
    include: {
      Court: true
    }
  })
}