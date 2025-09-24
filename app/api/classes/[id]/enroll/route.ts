import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'
import { createSplitPayments, generateSplitPaymentLinks } from '@/lib/payments/split-payment'
import { syncClassStudentCounter } from '@/lib/utils/class-counter'

const enrollSchema = z.object({
  studentName: z.string().min(1),
  studentEmail: z.string().email().optional(),
  studentPhone: z.string().min(10),
  paymentMethod: z.enum(['online', 'onsite']).default('online'),
  splitPayment: z.boolean().default(false),
  splitCount: z.number().min(1).default(1)
})

// POST - Enroll student in class with payment
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
    const { id: classId } = await params
    const body = await request.json()
    const validatedData = enrollSchema.parse(body)
    
    // Get class details (verify it belongs to the user's club)
    const classItem = await prisma.class.findFirst({
      where: { 
        id: classId,
        clubId: session.clubId 
      },
      include: {
        instructor: true,
        court: true,
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })
    
    if (!classItem) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }
    
    // Check if class is full
    if (classItem.currentStudents >= classItem.maxStudents) {
      return NextResponse.json(
        { success: false, error: 'La clase está llena' },
        { status: 400 }
      )
    }
    
    // Check if student is already enrolled
    const existingEnrollment = await prisma.classBooking.findFirst({
      where: {
        classId,
        playerPhone: validatedData.studentPhone
      }
    })
    
    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'El estudiante ya está inscrito en esta clase' },
        { status: 400 }
      )
    }
    
    // Create enrollment
    const enrollment = await prisma.classBooking.create({
      data: {
        classId,
        playerName: validatedData.studentName,
        playerEmail: validatedData.studentEmail || null,
        playerPhone: validatedData.studentPhone,
        enrollmentDate: new Date(),
        paymentStatus: validatedData.paymentMethod === 'onsite' ? 'pending' : 'pending',
        paymentMethod: validatedData.paymentMethod,
        status: 'CONFIRMED',
        paidAmount: 0, // Will be updated when payment is completed
        // dueAmount field doesn't exist in schema, using price from class
      }
    })
    
    // Update class enrollment count using sync function
    await syncClassStudentCounter(classId)
    
    // Create notification for successful enrollment
    const notificationMessage = validatedData.paymentMethod === 'onsite' 
      ? `Inscripción exitosa para ${validatedData.studentName}. El pago se realizará en sitio.`
      : `Inscripción exitosa para ${validatedData.studentName}. Link de pago enviado.`
    
    await prisma.notification.create({
      data: {
        clubId: session.clubId,
        type: 'WHATSAPP',
        recipient: validatedData.studentPhone,
        template: validatedData.paymentMethod === 'onsite' ? 'class_enrollment_onsite' : 'class_enrollment_online',
        status: 'pending'
      }
    })
    
    // Create payment record based on method
    let paymentData = null
    
    if (validatedData.paymentMethod === 'online') {
      // Find or create a booking for this class enrollment
      let classBooking = await prisma.booking.findFirst({
        where: {
          classId,
          type: 'CLASS'
        }
      })
      
      if (!classBooking) {
        // This shouldn't happen, but create one if missing
        classBooking = await prisma.booking.create({
          data: {
            clubId: classItem.clubId,
            courtId: classItem.courtId!,
            date: classItem.date,
            startTime: classItem.startTime,
            endTime: classItem.endTime,
            duration: classItem.duration, // Add missing duration field
            price: classItem.price,
            currency: 'MXN',
            type: 'CLASS',
            status: 'CONFIRMED',
            paymentStatus: 'pending',
            playerName: `Clase: ${classItem.name}`,
            playerEmail: classItem.instructor?.email || 'clase@club.mx',
            playerPhone: classItem.instructor?.phone || '',
            classId: classItem.id,
            notes: `Inscripciones para ${classItem.name}`,
            splitPaymentEnabled: true,
            splitPaymentCount: 0 // Will be incremented
          }
        })
      } else if (!classBooking.splitPaymentEnabled) {
        // Update existing booking to enable split payments
        classBooking = await prisma.booking.update({
          where: { id: classBooking.id },
          data: {
            splitPaymentEnabled: true
          }
        })
      }
      
      // Create split payment for this enrollment
      if (validatedData.splitPayment && validatedData.splitCount > 1) {
        // Create multiple split payments for this student
        const splitAmount = Math.ceil(classItem.price / validatedData.splitCount)
        
        for (let i = 0; i < validatedData.splitCount; i++) {
          await prisma.splitPayment.create({
            data: {
              bookingId: classBooking.id,
              playerName: i === 0 ? validatedData.studentName : `${validatedData.studentName} - Pago ${i + 1}`,
              playerEmail: i === 0 ? validatedData.studentEmail : '',
              playerPhone: i === 0 ? validatedData.studentPhone : '',
              amount: splitAmount,
              status: 'pending'
            }
          })
        }
        
        // Generate payment links
        const paymentLinks = await generateSplitPaymentLinks(classBooking.id)
        paymentData = {
          splitPayments: paymentLinks,
          totalAmount: classItem.price,
          splitCount: validatedData.splitCount
        }
      } else {
        // Create single split payment
        const splitPayment = await prisma.splitPayment.create({
          data: {
            bookingId: classBooking.id,
            playerName: validatedData.studentName,
            playerEmail: validatedData.studentEmail || '',
            playerPhone: validatedData.studentPhone,
            amount: classItem.price,
            status: 'pending'
          }
        })
        
        // Generate payment link
        const paymentLinks = await generateSplitPaymentLinks(classBooking.id)
        paymentData = {
          paymentLink: paymentLinks[0]?.paymentLink,
          splitPaymentId: splitPayment.id,
          amount: classItem.price
        }
      }
      
      // Update booking split payment count
      const totalSplitPayments = await prisma.splitPayment.count({
        where: { bookingId: classBooking.id }
      })
      
      await prisma.booking.update({
        where: { id: classBooking.id },
        data: {
          splitPaymentEnabled: true,
          splitPaymentCount: totalSplitPayments
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: validatedData.paymentMethod === 'online' 
        ? 'Inscripción exitosa. Se ha enviado el link de pago por WhatsApp'
        : 'Inscripción exitosa. El pago se realizará en sitio',
      enrollment: {
        id: enrollment.id,
        studentName: enrollment.playerName,
        classId: enrollment.classId,
        className: classItem.name,
        instructor: classItem.instructor?.name,
        date: classItem.date,
        time: `${classItem.startTime} - ${classItem.endTime}`,
        price: classItem.price,
        paymentMethod: validatedData.paymentMethod
      },
      payment: paymentData
    })
    
  } catch (error) {
    console.error('Error enrolling student:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al inscribir estudiante' },
      { status: 500 }
    )
  }
}

// GET - Get enrollments for a class
export async function GET(
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
    const { id: classId } = await params
    
    // First verify the class belongs to the user's club
    const classExists = await prisma.class.findFirst({
      where: { 
        id: classId,
        clubId: session.clubId 
      }
    })
    
    if (!classExists) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }
    
    const enrollments = await prisma.classBooking.findMany({
      where: { classId },
      include: {
        player: true
      },
      orderBy: { enrollmentDate: 'desc' }
    })
    
    return NextResponse.json({
      success: true,
      enrollments
    })
    
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener inscripciones' },
      { status: 500 }
    )
  }
}