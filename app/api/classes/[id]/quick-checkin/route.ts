import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

// Schema para check-in rápido con pago y asistencia
const quickCheckInSchema = z.object({
  students: z.array(z.object({
    classBookingId: z.string(),
    studentName: z.string(),
    attendanceStatus: z.enum(['PRESENT', 'LATE', 'ABSENT']).default('PRESENT'),
    paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER', 'ONLINE', 'FREE']).optional(),
    paymentAmount: z.number().positive().optional(),
    paymentReference: z.string().optional(),
    notes: z.string().optional()
  }))
})

// POST - Check-in múltiple con pago y asistencia en un solo paso
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id: classId } = paramData
    const body = await request.json()
    const { students } = quickCheckInSchema.parse(body)

    // Verificar que la clase existe
    const classItem = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        instructor: true,
        court: true
      }
    })

    if (!classItem) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    // Procesar cada estudiante en una transacción
    const results = await prisma.$transaction(async (tx) => {
      const processedStudents = []
      let totalRevenue = 0
      let presentCount = 0
      let lateCount = 0
      let absentCount = 0

      for (const student of students) {
        // Obtener la inscripción del estudiante
        const classBooking = await tx.classBooking.findUnique({
          where: { id: student.classBookingId },
          include: {
            player: true
          }
        })

        if (!classBooking || classBooking.classId !== classId) {
          throw new Error(`Inscripción no válida: ${student.studentName}`)
        }

        // 1. REGISTRAR ASISTENCIA
        const updatedBooking = await tx.classBooking.update({
          where: { id: student.classBookingId },
          data: {
            attended: student.attendanceStatus !== 'ABSENT',
            attendanceStatus: student.attendanceStatus,
            attendanceTime: student.attendanceStatus !== 'ABSENT' ? new Date() : null,
            attendanceNotes: student.notes,
            status: 'CHECKED_IN',
            updatedAt: new Date()
          }
        })

        // Contar asistencia
        if (student.attendanceStatus === 'PRESENT') presentCount++
        else if (student.attendanceStatus === 'LATE') lateCount++
        else if (student.attendanceStatus === 'ABSENT') absentCount++

        // 2. PROCESAR PAGO (opcional - NO requerido para asistencia)
        let paymentProcessed = false
        
        // Solo procesar pago si se proporcionó método de pago
        if (classBooking.paymentStatus === 'pending' && 
            student.paymentMethod && 
            student.paymentMethod !== 'FREE') {
          
          // Validar monto de pago
          const paymentAmount = student.paymentAmount || classBooking.dueAmount
          if (paymentAmount < classBooking.dueAmount) {
            throw new Error(`PAGO INSUFICIENTE: ${student.studentName} - Se requieren $${classBooking.dueAmount / 100} MXN, se recibieron $${paymentAmount / 100} MXN`)
          }

          // Crear registro de transacción para el pago
          await tx.transaction.create({
            data: {
              clubId: classItem.clubId,
              type: 'INCOME',
              category: 'CLASS',
              amount: paymentAmount,
              currency: 'MXN',
              description: `Pago de clase: ${classItem.name} - ${student.studentName}`,
              date: new Date(),
              reference: student.paymentReference || `${student.paymentMethod}_${Date.now()}`,
              notes: JSON.stringify({
                classId: classItem.id,
                classBookingId: student.classBookingId,
                studentName: student.studentName,
                paymentMethod: student.paymentMethod,
                className: classItem.name,
                attendanceStatus: student.attendanceStatus
              })
            }
          })

          // Actualizar estado de pago en la inscripción
          await tx.classBooking.update({
            where: { id: student.classBookingId },
            data: {
              paymentStatus: 'completed',
              paymentMethod: student.paymentMethod === 'ONLINE' ? 'online' : 'onsite',
              paidAmount: paymentAmount,
              updatedAt: new Date()
            }
          })

          totalRevenue += paymentAmount
          paymentProcessed = true
        }

        // 3. CREAR NOTIFICACIÓN
        const notificationMessage = 
          student.attendanceStatus === 'ABSENT' 
            ? `${student.studentName} marcado como ausente en ${classItem.name}`
            : paymentProcessed
              ? `Check-in completo: ${student.studentName} - Asistencia: ${student.attendanceStatus} - Pago: ${student.paymentMethod}`
              : `Check-in completo: ${student.studentName} - Asistencia: ${student.attendanceStatus}`

        await tx.notification.create({
          data: {
            clubId: classItem.clubId,
            type: 'WHATSAPP',
            recipient: classBooking.studentPhone,
            template: 'class_quick_checkin',
            status: 'pending'
          }
        })

        processedStudents.push({
          id: student.classBookingId,
          name: student.studentName,
          attendance: student.attendanceStatus,
          paymentProcessed,
          paymentMethod: student.paymentMethod,
          amount: student.paymentAmount || classBooking.dueAmount
        })
      }

      // 4. ACTUALIZAR ESTADO DE LA CLASE
      if (presentCount > 0 || lateCount > 0) {
        if (classItem.status === 'SCHEDULED') {
          await tx.class.update({
            where: { id: classId },
            data: { 
              status: 'IN_PROGRESS',
              updatedAt: new Date()
            }
          })
        }

        // 5. REGISTRAR PAGO AL INSTRUCTOR (solo una vez, al primer check-in)
        const previousCheckIns = await tx.classBooking.count({
          where: {
            classId,
            attended: true,
            id: { 
              notIn: students.map(s => s.classBookingId) 
            }
          }
        })

        if (previousCheckIns === 0 && classItem.instructor && classItem.instructor.paymentType === 'HOURLY') {
          const hours = classItem.duration / 60
          const instructorPayment = Math.round((classItem.instructor.hourlyRate || 0) * hours)
          
          if (instructorPayment > 0) {
            await tx.transaction.create({
              data: {
                clubId: classItem.clubId,
                type: 'EXPENSE',
                category: 'SALARY',
                amount: instructorPayment,
                currency: 'MXN',
                description: `Pago a instructor ${classItem.instructor.name} - Clase: ${classItem.name}`,
                date: new Date(),
                reference: `INSTRUCTOR_${classId}`,
                notes: JSON.stringify({
                  classId: classItem.id,
                  instructorId: classItem.instructorId,
                  instructorName: classItem.instructor.name,
                  className: classItem.name,
                  attendanceCount: presentCount + lateCount,
                  duration: classItem.duration
                })
              }
            })
          }
        }
      }

      return {
        processedStudents,
        totalRevenue,
        attendanceStats: {
          present: presentCount,
          late: lateCount,
          absent: absentCount,
          total: students.length
        }
      }
    })

    // Obtener estadísticas actualizadas de la clase
    const updatedClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                attended: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Check-in completado para ${students.length} estudiante(s)`,
      results: results.processedStudents,
      summary: {
        totalProcessed: students.length,
        totalRevenue: results.totalRevenue,
        attendance: results.attendanceStats,
        classStatus: updatedClass?.status
      }
    })

  } catch (error) {
    console.error('Error in quick check-in:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al procesar check-in' },
      { status: 500 }
    )
  }
}

// GET - Obtener lista de estudiantes para check-in rápido
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id: classId } = paramData
    
    // Obtener clase con todas las inscripciones
    const classItem = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        instructor: true,
        court: true,
        bookings: {
          include: {
            player: true
          },
          orderBy: { studentName: 'asc' }
        }
      }
    })
    
    if (!classItem) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }
    
    // Each student pays the full class price
    const classPrice = classItem.price || 0
    
    // Preparar lista para check-in rápido
    const checkInList = classItem.bookings.map(booking => ({
      classBookingId: booking.id,
      studentName: booking.studentName,
      studentPhone: booking.studentPhone,
      studentEmail: booking.studentEmail,
      currentStatus: {
        attended: booking.attended,
        attendanceStatus: booking.attendanceStatus || 'PENDING',
        paymentStatus: booking.paymentStatus,
        paidAmount: booking.paidAmount || 0,
        dueAmount: booking.dueAmount || classPrice  // Each student pays full price
      },
      needsPayment: booking.paymentStatus === 'pending',
      suggestedPaymentAmount: (booking.dueAmount || classPrice) - (booking.paidAmount || 0)
    }))
    
    // Estadísticas actuales
    const stats = {
      totalEnrolled: classItem.bookings.length,
      checkedIn: classItem.bookings.filter(b => b.attended).length,
      paid: classItem.bookings.filter(b => b.paymentStatus === 'completed').length,
      pending: classItem.bookings.filter(b => !b.attended).length
    }
    
    return NextResponse.json({
      success: true,
      class: {
        id: classItem.id,
        name: classItem.name,
        date: classItem.date,
        time: `${classItem.startTime} - ${classItem.endTime}`,
        instructor: classItem.instructor?.name,
        court: classItem.court?.name,
        status: classItem.status,
        price: classItem.price
      },
      students: checkInList,
      stats
    })
    
  } catch (error) {
    console.error('Error fetching quick check-in list:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener lista de check-in' },
      { status: 500 }
    )
  }
}