import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

// DELETE - Cancel student enrollment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bookingId: string }> }
) {
  try {
    // Get club ID
    const club = await prisma.club.findFirst()
    if (!club) {
      return NextResponse.json(
        { success: false, error: 'Club no encontrado' },
        { status: 404 }
      )
    }
    const paramData = await params
    const { id: classId, bookingId } = paramData
    
    // Verify the booking exists and belongs to this class
    const classBooking = await prisma.classBooking.findUnique({
      where: { 
        id: bookingId,
        classId: classId
      },
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
    
    // Check if payment has been made - only allow cancellation if not paid
    if (classBooking.paymentStatus === 'completed') {
      return NextResponse.json(
        { success: false, error: 'No se puede cancelar una inscripción pagada. Contacte al administrador.' },
        { status: 400 }
      )
    }
    
    // Check if student already attended
    if (classBooking.attended) {
      return NextResponse.json(
        { success: false, error: 'No se puede cancelar después de asistir a la clase' },
        { status: 400 }
      )
    }
    
    // Delete the booking
    await prisma.classBooking.delete({
      where: { id: bookingId }
    })
    
    // Update class current students count
    await prisma.class.update({
      where: { id: classId },
      data: {
        currentStudents: {
          decrement: 1
        }
      }
    })
    
    // Create notification for cancellation
    await prisma.notification.create({
      data: {
        clubId: club.id,
        type: 'WHATSAPP',
        template: 'class_cancellation',
        recipient: classBooking.studentPhone,
        status: 'pending',
        message: `Su inscripción a la clase "${classBooking.class.name}" ha sido cancelada.`
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `Inscripción de ${classBooking.studentName} cancelada exitosamente`
    })
    
  } catch (error) {
    console.error('Error cancelling enrollment:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al cancelar inscripción' 
      },
      { status: 500 }
    )
  }
}

// GET - Get specific booking details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bookingId: string }> }
) {
  try {
    const paramData = await params
    const { id: classId, bookingId } = paramData
    
    const classBooking = await prisma.classBooking.findUnique({
      where: { 
        id: bookingId,
        classId: classId
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
    
    if (!classBooking) {
      return NextResponse.json(
        { success: false, error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      booking: classBooking
    })
    
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener detalles de la inscripción' 
      },
      { status: 500 }
    )
  }
}