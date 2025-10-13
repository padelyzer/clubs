import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const checkInSchema = z.object({
  studentId: z.string().min(1),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE']).default('PRESENT'),
  notes: z.string().optional()
})

// POST - Check-in student for class
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
    const paramData = await params
    const { id: classId } = paramData
    const body = await request.json()
    const { studentId, status, notes } = checkInSchema.parse(body)
    
    // Verify class exists and belongs to the user's club
    const classItem = await prisma.class.findFirst({
      where: { 
        id: classId,
        clubId: session.clubId 
      },
      include: {
        Instructor: true,
        Court: true
      }
    })
    
    if (!classItem) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }
    
    // Check if student is enrolled
    const enrollment = await prisma.classBooking.findUnique({
      where: { id: studentId },
      include: {
        Player: true
      }
    })
    
    if (!enrollment || enrollment.classId !== classId) {
      return NextResponse.json(
        { success: false, error: 'Estudiante no inscrito en esta clase' },
        { status: 400 }
      )
    }
    
    // Update attendance (using checkedIn field since attended doesn't exist)
    const updatedEnrollment = await prisma.classBooking.update({
      where: { id: studentId },
      data: {
        checkedIn: status === 'PRESENT' || status === 'LATE',
        checkedInAt: status === 'PRESENT' || status === 'LATE' ? new Date() : null,
        notes: notes || enrollment.notes,
        updatedAt: new Date()
      }
    }) as any

    // Store attendance status in extended object (not in DB)
    updatedEnrollment.attendanceStatus = status

    // If marking as present, register instructor expense
    if ((status === 'PRESENT' || status === 'LATE') && !enrollment.checkedIn) {
      if (classItem.Instructor) {
        // Calculate instructor payment based on individual instructor configuration
        let instructorPayment = 0

        if (classItem.Instructor.paymentType === 'HOURLY') {
          // Calculate based on class duration and instructor's hourly rate
          const hours = classItem.duration / 60
          instructorPayment = Math.round((classItem.Instructor.hourlyRate || 0) * hours)
        }
        // Note: MONTHLY, COMMISSION, and MIXED payment types don't trigger automatic per-class expenses

        // Only register expense if this is the first student checking in
        const firstCheckIn = await prisma.classBooking.findFirst({
          where: {
            classId,
            checkedIn: true,
            id: { not: studentId }
          }
        })

        if (!firstCheckIn && instructorPayment > 0) {
          // Create expense transaction for instructor payment
          await prisma.transaction.create({
            data: {
              id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              clubId: classItem.clubId,
              type: 'EXPENSE',
              category: 'SALARY',
              amount: instructorPayment,
              currency: 'MXN',
              description: `Pago a instructor ${classItem.Instructor.name} - Clase: ${classItem.name}`,
              date: new Date(),
              reference: `INSTRUCTOR_${classId}`,
              notes: JSON.stringify({
                classId,
                instructorId: classItem.instructorId,
                instructorName: classItem.Instructor.name,
                className: classItem.name,
                classDate: classItem.date,
                classType: classItem.type,
                classDuration: classItem.duration,
                paymentType: classItem.Instructor.paymentType,
                hourlyRate: classItem.Instructor.hourlyRate,
                fixedSalary: classItem.Instructor.fixedSalary,
                hours: classItem.duration / 60,
                attendanceTriggered: true
              }),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
          
          console.log(`Instructor payment registered: ${instructorPayment / 100} MXN for class ${classItem.name}`)
        }
      }
      
      // Optional: Create a reminder for student payment if pending
      if (enrollment.paymentStatus === 'pending') {
        console.log(`Payment pending for student ${enrollment.playerName}`)
      }
    }

    // Get updated attendance stats for the class (using checkedIn field)
    const allBookings = await prisma.classBooking.findMany({
      where: { classId }
    })

    const stats = {
      present: allBookings.filter(b => b.checkedIn).length,
      late: 0, // We don't have late tracking without attendanceStatus field
      absent: 0, // Would need additional logic or field
      pending: allBookings.filter(b => !b.checkedIn).length
    }

    return NextResponse.json({
      success: true,
      message: `Check-in exitoso para ${enrollment.playerName}`,
      enrollment: updatedEnrollment,
      attendanceStats: stats
    })
    
  } catch (error) {
    console.error('Error in attendance check-in:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al registrar asistencia' },
      { status: 500 }
    )
  }
}

// GET - Get attendance list for a class
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
    const paramData = await params
    const { id: classId } = paramData
    
    const classItem = await prisma.class.findFirst({
      where: {
        id: classId,
        clubId: session.clubId
      },
      include: {
        Instructor: true,
        Court: true
      }
    })

    if (!classItem) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    // Get class bookings separately since ClassBooking relation may not exist on Class
    const classBookings = await prisma.classBooking.findMany({
      where: { classId },
      include: {
        Player: true
      },
      orderBy: { playerName: 'asc' }
    })

    // Calculate attendance statistics (using checkedIn field)
    const stats = {
      total: classBookings.length,
      present: classBookings.filter((b: any) => b.checkedIn).length,
      late: 0, // No late tracking without attendanceStatus
      absent: 0, // Would need additional logic
      pending: classBookings.filter((b: any) => !b.checkedIn).length,
      paidCount: classBookings.filter((b: any) => b.paymentStatus === 'completed').length,
      unpaidCount: classBookings.filter((b: any) => b.paymentStatus === 'pending').length
    }

    // Format attendance list
    const attendanceList = classBookings.map((booking: any) => ({
      id: booking.id,
      studentName: booking.playerName,
      studentPhone: booking.playerPhone,
      studentEmail: booking.playerEmail,
      player: booking.Player,
      attended: booking.checkedIn,
      attendanceStatus: booking.checkedIn ? 'PRESENT' : 'PENDING',
      attendanceTime: booking.checkedInAt,
      attendanceNotes: booking.notes,
      paymentStatus: booking.paymentStatus,
      paidAmount: booking.paidAmount,
      enrollmentDate: booking.enrollmentDate
    }))
    
    return NextResponse.json({
      success: true,
      class: {
        id: classItem.id,
        name: classItem.name,
        date: classItem.date,
        time: `${classItem.startTime} - ${classItem.endTime}`,
        instructor: classItem.Instructor?.name || 'Sin instructor',
        court: classItem.Court?.name || 'Sin cancha',
        status: classItem.status
      },
      attendance: attendanceList,
      stats
    })
    
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener lista de asistencia' },
      { status: 500 }
    )
  }
}

// PUT - Update multiple attendance records at once
export async function PUT(
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
    const paramData = await params
    const { id: classId } = paramData
    const body = await request.json()
    
    // Verify class exists and belongs to the user's club
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
    
    // Expect an array of attendance updates
    const updates = z.array(z.object({
      studentId: z.string(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
      notes: z.string().optional()
    })).parse(body.updates)
    
    // Batch update attendance (using checkedIn field)
    const updatePromises = updates.map(update =>
      prisma.classBooking.update({
        where: { id: update.studentId },
        data: {
          checkedIn: update.status === 'PRESENT' || update.status === 'LATE',
          checkedInAt: update.status === 'PRESENT' || update.status === 'LATE' ? new Date() : null,
          notes: update.notes,
          updatedAt: new Date()
        }
      })
    )
    
    await Promise.all(updatePromises)
    
    // Update class status if needed
    const now = new Date()
    const classItem = await prisma.class.findUnique({
      where: { id: classId }
    })
    
    if (classItem) {
      const classDate = new Date(classItem.date)
      const [hours, minutes] = classItem.startTime.split(':').map(Number)
      classDate.setHours(hours, minutes, 0, 0)
      
      // If class has started, mark it as in progress
      if (now >= classDate && classItem.status === 'SCHEDULED') {
        await prisma.class.update({
          where: { id: classId },
          data: { status: 'IN_PROGRESS' }
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Asistencia actualizada para ${updates.length} estudiantes`
    })
    
  } catch (error) {
    console.error('Error updating attendance:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al actualizar asistencia' },
      { status: 500 }
    )
  }
}