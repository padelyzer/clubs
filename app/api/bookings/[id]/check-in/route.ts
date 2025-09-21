import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

// Validation schema for check-in with payment
const checkInSchema = z.object({
  paymentMethod: z.enum(['CARD', 'TRANSFER', 'CASH']).optional(),
  paymentCode: z.string().optional(),
  paymentAmount: z.number().positive().optional(),
  notes: z.string().optional()
})

// POST - Check in booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { id } = await params
    const body = await request.json().catch(() => ({}))

    // Validate request body
    const validatedData = checkInSchema.parse(body)

    // Check if booking exists and belongs to club
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        clubId: session.clubId
      },
      include: {
        court: true,
        splitPayments: true
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    if (existingBooking.checkedIn) {
      return NextResponse.json(
        { success: false, error: 'Esta reserva ya fue registrada' },
        { status: 400 }
      )
    }

    if (existingBooking.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'No se puede registrar una reserva cancelada' },
        { status: 400 }
      )
    }

    // Check payment status and handle payment if needed
    const needsPayment = existingBooking.paymentStatus === 'pending'
    
    if (needsPayment && !validatedData.paymentMethod) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Esta reserva tiene pago pendiente. Debe registrar el pago antes del check-in.',
          needsPayment: true,
          booking: existingBooking
        },
        { status: 400 }
      )
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // If payment is needed, process it first
      if (needsPayment && validatedData.paymentMethod) {
        const paymentData = {
          amount: validatedData.paymentAmount || existingBooking.price,
          method: validatedData.paymentMethod,
          status: 'COMPLETED' as const,
          transactionId: validatedData.paymentCode || `MANUAL_${Date.now()}`,
          paidAt: new Date(),
          notes: validatedData.notes
        }

        // Update booking payment status
        await tx.booking.update({
          where: { id },
          data: {
            paymentStatus: 'completed',
            paymentType: validatedData.paymentMethod === 'CARD' ? 'ONLINE_FULL' : 
                        validatedData.paymentMethod === 'TRANSFER' ? 'ONLINE_FULL' : 'ONSITE',
            notes: validatedData.paymentCode ? 
                   `${existingBooking.notes || ''}\nPago: ${validatedData.paymentMethod} - Ref: ${validatedData.paymentCode}`.trim() : 
                   existingBooking.notes,
            updatedAt: new Date()
          }
        })

        // Create payment record if needed (depending on your schema)
        // This might need adjustment based on your actual payment table structure
      }

      // Update booking with check-in info
      const booking = await tx.booking.update({
        where: { id },
        data: {
          checkedIn: true,
          checkedInAt: new Date(),
          checkedInBy: session.userId,
          status: 'IN_PROGRESS',
          updatedAt: new Date()
        },
        include: {
          court: true,
          splitPayments: true
        }
      })

      return booking
    })

    const message = needsPayment 
      ? `Check-in realizado para ${existingBooking.playerName} en ${existingBooking.court.name}. Pago registrado: ${validatedData.paymentMethod}${validatedData.paymentCode ? ` (${validatedData.paymentCode})` : ''}`
      : `Check-in realizado para ${existingBooking.playerName} en ${existingBooking.court.name}`

    return NextResponse.json({ 
      success: true, 
      booking: result,
      message,
      paymentProcessed: needsPayment
    })

  } catch (error) {
    console.error('Error checking in booking:', error)
    return NextResponse.json(
      { success: false, error: 'Error al realizar check-in' },
      { status: 500 }
    )
  }
}

// DELETE - Undo check-in
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { id } = await params

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

    if (!existingBooking.checkedIn) {
      return NextResponse.json(
        { success: false, error: 'Esta reserva no está registrada' },
        { status: 400 }
      )
    }

    // Undo check-in
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
        status: 'CONFIRMED',
        updatedAt: new Date()
      },
      include: {
        court: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      booking,
      message: 'Check-in deshecho exitosamente' 
    })

  } catch (error) {
    console.error('Error undoing check-in:', error)
    return NextResponse.json(
      { success: false, error: 'Error al deshacer check-in' },
      { status: 500 }
    )
  }
}