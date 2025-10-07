import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

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
        class: {
          include: {
            instructor: true,
            court: true
          }
        },
        player: true
      }
    })

    if (!classBooking) {
      return NextResponse.json(
        { success: false, error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }

    // Check if already checked in
    if (classBooking.attended) {
      return NextResponse.json(
        { success: false, error: 'Este estudiante ya fue registrado' },
        { status: 400 }
      )
    }

    // Check if class is cancelled
    if (classBooking.class.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'No se puede hacer check-in de una clase cancelada' },
        { status: 400 }
      )
    }

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
            dueAmount: classBooking.dueAmount,
            paymentDetails: {
              studentName: classBooking.studentName,
              className: classBooking.class.name,
              amountDue: classBooking.dueAmount / 100, // Convert to pesos
              currency: 'MXN'
            }
          },
          { status: 402 } // Payment Required
        )
      }
      
      // Validate payment amount if provided
      if (validatedData.paymentAmount && validatedData.paymentAmount < classBooking.dueAmount) {
        return NextResponse.json(
          { 
            success: false, 
            error: `El monto de pago es insuficiente. Se requieren $${classBooking.dueAmount / 100} MXN, se recibieron $${validatedData.paymentAmount / 100} MXN.`,
            needsPayment: true,
            dueAmount: classBooking.dueAmount,
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
            clubId: classBooking.class.clubId,
            type: 'INCOME',
            category: 'CLASS',
            amount: validatedData.paymentAmount || classBooking.dueAmount,
            currency: 'MXN',
            description: `Pago de clase: ${classBooking.class.name} - ${classBooking.studentName}`,
            date: new Date(),
            reference: validatedData.paymentCode || `MANUAL_${Date.now()}`,
            notes: JSON.stringify({
              classId: classBooking.classId,
              classBookingId: classBooking.id,
              studentName: classBooking.studentName,
              paymentMethod: validatedData.paymentMethod,
              className: classBooking.class.name
            })
          }
        })

        // Update payment status
        await tx.classBooking.update({
          where: { id },
          data: {
            paymentStatus: 'completed',
            paymentMethod: validatedData.paymentMethod === 'ONLINE' ? 'online' : 'onsite',
            paidAmount: validatedData.paymentAmount || classBooking.dueAmount,
            updatedAt: new Date()
          }
        })
      }

      // Update attendance
      const updatedBooking = await tx.classBooking.update({
        where: { id },
        data: {
          attended: true,
          attendanceStatus: 'PRESENT',
          attendanceTime: new Date(),
          attendanceNotes: validatedData.notes,
          status: 'CHECKED_IN',
          updatedAt: new Date()
        },
        include: {
          class: {
            include: {
              instructor: true,
              court: true
            }
          },
          player: true
        }
      })

      // Register instructor payment if this is the first check-in for this class
      if (classBooking.class.instructor) {
        const firstCheckIn = await tx.classBooking.findFirst({
          where: {
            classId: classBooking.classId,
            attended: true,
            id: { not: id }
          }
        })

        if (!firstCheckIn && classBooking.class.instructor.paymentType === 'HOURLY') {
          const hours = classBooking.class.duration / 60
          const instructorPayment = Math.round((classBooking.class.instructor.hourlyRate || 0) * hours)
          
          if (instructorPayment > 0) {
            await tx.transaction.create({
              data: {
                clubId: classBooking.class.clubId,
                type: 'EXPENSE',
                category: 'SALARY',
                amount: instructorPayment,
                currency: 'MXN',
                description: `Pago a instructor ${classBooking.class.instructor.name} - Clase: ${classBooking.class.name}`,
                date: new Date(),
                reference: `INSTRUCTOR_${classBooking.classId}`,
                notes: JSON.stringify({
                  classId: classBooking.classId,
                  instructorId: classBooking.class.instructorId,
                  instructorName: classBooking.class.instructor.name,
                  className: classBooking.class.name,
                  hours: hours,
                  hourlyRate: classBooking.class.instructor.hourlyRate,
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
          attended: true
        }
      })

      if (attendanceCount === 1 && classBooking.class.status === 'SCHEDULED') {
        await tx.class.update({
          where: { id: classBooking.classId },
          data: { status: 'IN_PROGRESS' }
        })
      }

      // Create notification for successful check-in
      await tx.notification.create({
        data: {
          type: 'WHATSAPP',
          recipient: classBooking.studentPhone,
          template: 'class_checkin_success',
          status: 'pending'
        }
      })

      return updatedBooking
    })

    const message = needsPayment 
      ? `Check-in realizado para ${result.studentName}. Pago registrado: ${validatedData.paymentMethod}`
      : `Check-in realizado para ${result.studentName}`

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
        { success: false, error: 'Datos inválidos', details: error.errors },
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
        class: true
      }
    })

    if (!classBooking) {
      return NextResponse.json(
        { success: false, error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }

    if (!classBooking.attended) {
      return NextResponse.json(
        { success: false, error: 'Este estudiante no está registrado' },
        { status: 400 }
      )
    }

    // Undo check-in
    const updatedBooking = await prisma.classBooking.update({
      where: { id },
      data: {
        attended: false,
        attendanceStatus: null,
        attendanceTime: null,
        attendanceNotes: null,
        status: 'ENROLLED',
        updatedAt: new Date()
      },
      include: {
        class: {
          include: {
            instructor: true,
            court: true
          }
        },
        player: true
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
        class: {
          include: {
            instructor: true,
            court: true
          }
        },
        player: true
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
      checkedIn: classBooking.attended,
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