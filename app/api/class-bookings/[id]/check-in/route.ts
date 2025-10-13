import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// Validation schema for class booking check-in
const checkInSchema = z.object({
  paymentMethod: z.enum(['CARD', 'TRANSFER', 'CASH', 'ONLINE']).optional(),
  paymentCode: z.string().optional(),
  paymentAmount: z.number().positive().optional(),
  notes: z.string().optional()
})

// POST - Check in class booking (student enrollment)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id } = paramData
    const body = await request.json().catch(() => ({}))
    const validatedData = checkInSchema.parse(body)

    // Find the class booking
    const classBooking = await prisma.classBooking.findUnique({
      where: { id },
      include: {
        Class: {
          include: {
            Instructor: true,
            Court: true
          }
        },
        Player: true
      }
    })

    if (!classBooking) {
      return NextResponse.json(
        { success: false, error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }

    // Check if already checked in
    if (classBooking.checkedIn) {
      return NextResponse.json(
        { success: false, error: 'Este estudiante ya fue registrado' },
        { status: 400 }
      )
    }

    // Check if class is cancelled
    if (classBooking.Class.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'No se puede hacer check-in de una clase cancelada' },
        { status: 400 }
      )
    }

    // Calculate due amount
    const dueAmount = classBooking.Class.price - (classBooking.paidAmount || 0)

    // Check payment status - STRICT VALIDATION
    const needsPayment = classBooking.paymentStatus === 'pending'

    if (needsPayment) {
      // Require payment method and amount for pending payments
      if (!validatedData.paymentMethod) {
        return NextResponse.json(
          {
            success: false,
            error: 'PAGO REQUERIDO: Esta inscripción tiene pago pendiente. Debe registrar el método de pago antes del check-in.',
            needsPayment: true,
            dueAmount: dueAmount,
            paymentDetails: {
              studentName: classBooking.playerName,
              className: classBooking.Class.name,
              amountDue: dueAmount / 100, // Convert to pesos
              currency: 'MXN'
            }
          },
          { status: 402 } // Payment Required
        )
      }

      // Validate payment amount if provided
      if (validatedData.paymentAmount && validatedData.paymentAmount < dueAmount) {
        return NextResponse.json(
          {
            success: false,
            error: `El monto de pago es insuficiente. Se requieren $${dueAmount / 100} MXN, se recibieron $${validatedData.paymentAmount / 100} MXN.`,
            needsPayment: true,
            dueAmount: dueAmount,
            providedAmount: validatedData.paymentAmount
          },
          { status: 400 }
        )
      }
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Process payment if needed
      if (needsPayment && validatedData.paymentMethod) {
        // Create transaction record for payment
        await tx.transaction.create({
          data: {
            id: uuidv4(),
            clubId: classBooking.Class.clubId,
            type: 'INCOME',
            category: 'CLASS',
            amount: validatedData.paymentAmount || dueAmount,
            currency: 'MXN',
            description: `Pago de clase: ${classBooking.Class.name} - ${classBooking.playerName}`,
            date: new Date(),
            reference: validatedData.paymentCode || `MANUAL_${Date.now()}`,
            updatedAt: new Date(),
            notes: JSON.stringify({
              classId: classBooking.classId,
              classBookingId: classBooking.id,
              studentName: classBooking.playerName,
              paymentMethod: validatedData.paymentMethod,
              className: classBooking.Class.name
            })
          }
        })

        // Update payment status
        await tx.classBooking.update({
          where: { id },
          data: {
            paymentStatus: 'completed',
            paymentMethod: validatedData.paymentMethod === 'ONLINE' ? 'online' : 'onsite',
            paidAmount: validatedData.paymentAmount || dueAmount,
            updatedAt: new Date()
          }
        })
      }

      // Update attendance
      const updatedBooking = await tx.classBooking.update({
        where: { id },
        data: {
          checkedIn: true,
          checkedInAt: new Date(),
          notes: validatedData.notes ? `${classBooking.notes || ''}\n${validatedData.notes}`.trim() : classBooking.notes,
          updatedAt: new Date()
        },
        include: {
          Class: {
            include: {
              Instructor: true,
              Court: true
            }
          },
          Player: true
        }
      })

      // Register instructor payment if this is the first check-in for this class
      if (classBooking.Class.Instructor) {
        const firstCheckIn = await tx.classBooking.findFirst({
          where: {
            classId: classBooking.classId,
            checkedIn: true,
            id: { not: id }
          }
        })

        if (!firstCheckIn && classBooking.Class.Instructor.paymentType === 'HOURLY') {
          const hours = classBooking.Class.duration / 60
          const instructorPayment = Math.round((classBooking.Class.Instructor.hourlyRate || 0) * hours)

          if (instructorPayment > 0) {
            await tx.transaction.create({
              data: {
                id: uuidv4(),
                clubId: classBooking.Class.clubId,
                type: 'EXPENSE',
                category: 'SALARY',
                amount: instructorPayment,
                currency: 'MXN',
                description: `Pago a instructor ${classBooking.Class.Instructor.name} - Clase: ${classBooking.Class.name}`,
                date: new Date(),
                reference: `INSTRUCTOR_${classBooking.classId}`,
                updatedAt: new Date(),
                notes: JSON.stringify({
                  classId: classBooking.classId,
                  instructorId: classBooking.Class.instructorId,
                  instructorName: classBooking.Class.Instructor.name,
                  className: classBooking.Class.name,
                  hours: hours,
                  hourlyRate: classBooking.Class.Instructor.hourlyRate,
                  attendanceTriggered: true
                })
              }
            })
          }
        }
      }

      // Update class status if needed
      const attendanceCount = await tx.classBooking.count({
        where: {
          classId: classBooking.classId,
          checkedIn: true
        }
      })

      if (attendanceCount === 1 && classBooking.Class.status === 'SCHEDULED') {
        await tx.class.update({
          where: { id: classBooking.classId },
          data: { status: 'IN_PROGRESS' }
        })
      }

      // Create notification for successful check-in
      await tx.notification.create({
        data: {
          id: uuidv4(),
          bookingId: classBooking.id,
          type: 'WHATSAPP',
          recipient: classBooking.playerPhone,
          template: 'class_checkin_success',
          status: 'pending',
          updatedAt: new Date()
        }
      })

      return updatedBooking
    })

    const message = needsPayment
      ? `Check-in realizado para ${result.playerName}. Pago registrado: ${validatedData.paymentMethod}`
      : `Check-in realizado para ${result.playerName}`

    return NextResponse.json({ 
      success: true, 
      booking: result,
      message,
      paymentProcessed: needsPayment
    })

  } catch (error) {
    console.error('Error checking in class booking:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
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
    const paramData = await params
    const { id } = paramData

    // Find the class booking
    const classBooking = await prisma.classBooking.findUnique({
      where: { id },
      include: {
        Class: true
      }
    })

    if (!classBooking) {
      return NextResponse.json(
        { success: false, error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }

    if (!classBooking.checkedIn) {
      return NextResponse.json(
        { success: false, error: 'Este estudiante no está registrado' },
        { status: 400 }
      )
    }

    // Undo check-in
    const updatedBooking = await prisma.classBooking.update({
      where: { id },
      data: {
        checkedIn: false,
        checkedInAt: null,
        updatedAt: new Date()
      },
      include: {
        Class: {
          include: {
            Instructor: true,
            Court: true
          }
        },
        Player: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      booking: updatedBooking,
      message: 'Check-in deshecho exitosamente' 
    })

  } catch (error) {
    console.error('Error undoing class booking check-in:', error)
    return NextResponse.json(
      { success: false, error: 'Error al deshacer check-in' },
      { status: 500 }
    )
  }
}

// GET - Get check-in status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id } = paramData

    const classBooking = await prisma.classBooking.findUnique({
      where: { id },
      include: {
        Class: {
          include: {
            Instructor: true,
            Court: true
          }
        },
        Player: true
      }
    })

    if (!classBooking) {
      return NextResponse.json(
        { success: false, error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      booking: classBooking,
      checkedIn: classBooking.checkedIn,
      needsPayment: classBooking.paymentStatus === 'pending'
    })

  } catch (error) {
    console.error('Error fetching class booking check-in status:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener estado de check-in' },
      { status: 500 }
    )
  }
}