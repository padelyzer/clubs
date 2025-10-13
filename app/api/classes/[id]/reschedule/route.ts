import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { requireAuthAPI } from '@/lib/auth/actions'
import { z } from 'zod'
import { parseISO, format } from 'date-fns'

const rescheduleSchema = z.object({
  date: z.string(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  courtId: z.string().optional(),
  notifyStudents: z.boolean().default(true),
  reason: z.string().optional()
})

const cancelSchema = z.object({
  reason: z.string().min(1),
  notifyStudents: z.boolean().default(true),
  refundStudents: z.boolean().default(false)
})

// POST - Reschedule a class
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
    const validatedData = rescheduleSchema.parse(body)
    
    // Get current class details
    const currentClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        ClassBooking: {
          include: {
            Player: true
          }
        },
        Instructor: true,
        Court: true
      }
    })
    
    if (!currentClass) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }
    
    if (currentClass.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'No se puede reprogramar una clase cancelada' },
        { status: 400 }
      )
    }
    
    // Check for conflicts at new time
    const newDate = parseISO(validatedData.date)
    const courtId = validatedData.courtId || currentClass.courtId
    
    if (courtId) {
      const conflicts = await prisma.booking.findMany({
        where: {
          courtId,
          date: newDate,
          status: { not: 'CANCELLED' },
          OR: [
            {
              AND: [
                { startTime: { lte: validatedData.startTime } },
                { endTime: { gt: validatedData.startTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: validatedData.endTime } },
                { endTime: { gte: validatedData.endTime } }
              ]
            },
            {
              AND: [
                { startTime: { gte: validatedData.startTime } },
                { endTime: { lte: validatedData.endTime } }
              ]
            }
          ]
        }
      })
      
      if (conflicts.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Existe un conflicto con otra reserva en ese horario',
            conflicts 
          },
          { status: 400 }
        )
      }
      
      // Check for other classes at the same time
      const classConflicts = await prisma.class.findMany({
        where: {
          id: { not: classId },
          courtId,
          date: newDate,
          status: { not: 'CANCELLED' },
          OR: [
            {
              AND: [
                { startTime: { lte: validatedData.startTime } },
                { endTime: { gt: validatedData.startTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: validatedData.endTime } },
                { endTime: { gte: validatedData.endTime } }
              ]
            }
          ]
        }
      })
      
      if (classConflicts.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Existe un conflicto con otra clase en ese horario',
            conflicts: classConflicts 
          },
          { status: 400 }
        )
      }
    }
    
    // Store original schedule for notifications
    const originalSchedule = {
      date: currentClass.date,
      startTime: currentClass.startTime,
      endTime: currentClass.endTime,
      court: currentClass.Court?.name
    }
    
    // Update class schedule
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        date: newDate,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        ...(validatedData.courtId && { courtId: validatedData.courtId }),
        updatedAt: new Date()
      },
      include: {
        Court: true,
        Instructor: true
      }
    })

    // Create reschedule log
    await prisma.classHistory.create({
      data: {
        classId,
        action: 'RESCHEDULED',
        previousData: originalSchedule,
        newData: {
          date: updatedClass.date,
          startTime: updatedClass.startTime,
          endTime: updatedClass.endTime,
          court: updatedClass.Court?.name
        },
        reason: validatedData.reason,
        performedBy: session.userEmail || 'system',
        performedAt: new Date()
      }
    })

    // Notify students if requested
    if (validatedData.notifyStudents && currentClass.ClassBooking.length > 0) {
      const notifications = []

      for (const booking of currentClass.ClassBooking) {
        if (booking.playerPhone) {
          notifications.push({
            classId,
            studentId: booking.id,
            studentPhone: booking.playerPhone,
            studentName: booking.playerName,
            type: 'RESCHEDULE',
            message: `Hola ${booking.playerName}, tu clase "${currentClass.name}" ha sido reprogramada. Nueva fecha: ${format(newDate, 'dd/MM/yyyy')} de ${validatedData.startTime} a ${validatedData.endTime}. ${validatedData.reason ? `Motivo: ${validatedData.reason}` : ''}`,
            status: 'pending'
          })
        }
      }
      
      // Store notifications for processing
      if (notifications.length > 0) {
        await prisma.classNotification.createMany({
          data: notifications
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Clase reprogramada exitosamente',
      class: updatedClass,
      notifiedStudents: validatedData.notifyStudents ? currentClass.ClassBooking.length : 0
    })
    
  } catch (error) {
    console.error('Error rescheduling class:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al reprogramar clase' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel a class
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
    const paramData = await params
    const { id: classId } = paramData
    const body = await request.json()
    const validatedData = cancelSchema.parse(body)
    
    // Get class details
    const classToCancel = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        ClassBooking: {
          include: {
            Player: true
          }
        },
        Instructor: true,
        Court: true
      }
    })
    
    if (!classToCancel) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }
    
    if (classToCancel.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'La clase ya está cancelada' },
        { status: 400 }
      )
    }
    
    // Update class status
    const cancelledClass = await prisma.class.update({
      where: { id: classId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        notes: validatedData.reason, // Store cancel reason in notes
        updatedAt: new Date()
      }
    })
    
    // Create cancellation log
    await prisma.classHistory.create({
      data: {
        classId,
        action: 'CANCELLED',
        previousData: { status: classToCancel.status },
        newData: { status: 'CANCELLED' },
        reason: validatedData.reason,
        performedBy: session.userEmail || 'system',
        performedAt: new Date()
      }
    })

    // Handle refunds if requested
    if (validatedData.refundStudents) {
      const refunds = []

      for (const booking of classToCancel.ClassBooking) {
        if (booking.paymentStatus === 'completed' && booking.paidAmount > 0) {
          refunds.push({
            classBookingId: booking.id,
            studentId: booking.playerId || '',
            amount: booking.paidAmount,
            status: 'pending',
            reason: `Cancelación de clase: ${validatedData.reason}`
          })
          
          // Update booking payment status
          await prisma.classBooking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: 'refunded',
              status: 'CANCELLED',
              updatedAt: new Date()
            }
          })
        } else {
          // Just cancel the booking without refund
          await prisma.classBooking.update({
            where: { id: booking.id },
            data: {
              status: 'CANCELLED',
              updatedAt: new Date()
            }
          })
        }
      }
      
      // Create refund records
      if (refunds.length > 0) {
        await prisma.classRefund.createMany({
          data: refunds
        })
      }
    } else {
      // Cancel all bookings without refund
      await prisma.classBooking.updateMany({
        where: { classId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      })
    }
    
    // Notify students if requested
    if (validatedData.notifyStudents && classToCancel.ClassBooking.length > 0) {
      const notifications = []

      for (const booking of classToCancel.ClassBooking) {
        if (booking.playerPhone) {
          const refundMessage = validatedData.refundStudents && booking.paymentStatus === 'completed' 
            ? ' Tu pago será reembolsado en los próximos días.' 
            : ''
          
          notifications.push({
            classId,
            studentId: booking.id,
            studentPhone: booking.playerPhone,
            studentName: booking.playerName,
            type: 'CANCELLATION',
            message: `Hola ${booking.playerName}, lamentamos informarte que la clase "${classToCancel.name}" del ${format(classToCancel.date, 'dd/MM/yyyy')} ha sido cancelada. Motivo: ${validatedData.reason}.${refundMessage}`,
            status: 'pending'
          })
        }
      }
      
      // Store notifications for processing
      if (notifications.length > 0) {
        await prisma.classNotification.createMany({
          data: notifications
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Clase cancelada exitosamente',
      class: cancelledClass,
      notifiedStudents: validatedData.notifyStudents ? classToCancel.ClassBooking.length : 0,
      refundedStudents: validatedData.refundStudents ?
        classToCancel.ClassBooking.filter(b => b.paymentStatus === 'completed').length : 0
    })
    
  } catch (error) {
    console.error('Error cancelling class:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al cancelar clase' },
      { status: 500 }
    )
  }
}