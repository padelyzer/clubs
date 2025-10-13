import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { requireAuthAPI } from '@/lib/auth/actions'
import { z } from 'zod'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'

const paymentUpdateSchema = z.object({
  bookingId: z.string(),
  amount: z.number().positive(),
  method: z.enum(['cash', 'transfer', 'terminal', 'online']),
  reference: z.string().optional(),
  sendReceipt: z.boolean().default(true)
})

// GET - Get all pending payments for classes
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get('instructorId')
    const status = searchParams.get('status') || 'pending'
    
    const where: any = {
      class: {
        clubId: session.clubId
      },
      paymentStatus: status
    }
    
    if (instructorId) {
      where.Class.instructorId = instructorId
    }

    const pendingPayments = await prisma.classBooking.findMany({
      where,
      include: {
        Class: {
          include: {
            Instructor: true,
            Court: true
          }
        },
        Player: true
      },
      orderBy: [
        { Class: { date: 'desc' } },
        { playerName: 'asc' }
      ]
    })

    // Group by class for better organization
    const paymentsByClass = pendingPayments.reduce((acc: any, booking) => {
      const classId = booking.classId
      if (!acc[classId]) {
        acc[classId] = {
          class: booking.Class,
          bookings: [],
          totalDue: 0,
          totalPaid: 0
        }
      }

      const dueAmount = booking.Class.price - (booking.paidAmount || 0)

      acc[classId].bookings.push({
        id: booking.id,
        studentName: booking.playerName,
        studentPhone: booking.playerPhone,
        studentEmail: booking.playerEmail,
        enrollmentDate: booking.enrollmentDate,
        dueAmount: dueAmount,
        paidAmount: booking.paidAmount,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
        attended: booking.checkedIn
      })

      acc[classId].totalDue += dueAmount
      acc[classId].totalPaid += (booking.paidAmount || 0)
      
      return acc
    }, {})
    
    // Calculate summary statistics
    const summary = {
      totalClasses: Object.keys(paymentsByClass).length,
      totalStudents: pendingPayments.length,
      totalDue: pendingPayments.reduce((sum, b) => sum + (b.Class.price - (b.paidAmount || 0)), 0),
      totalPaid: pendingPayments.reduce((sum, b) => sum + (b.paidAmount || 0), 0),
      totalPending: 0
    }

    summary.totalPending = summary.totalDue - summary.totalPaid
    
    return NextResponse.json({
      success: true,
      summary,
      paymentsByClass: Object.values(paymentsByClass),
      payments: pendingPayments
    })
    
  } catch (error) {
    console.error('Error fetching pending payments:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener pagos pendientes' },
      { status: 500 }
    )
  }
}

// POST - Record a payment for a class booking
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const validatedData = paymentUpdateSchema.parse(body)
    
    // Get booking details
    const booking = await prisma.classBooking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        Class: {
          include: {
            Instructor: true
          }
        }
      }
    })
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }
    
    // Calculate due amount
    const dueAmount = booking.Class.price - (booking.paidAmount || 0)

    // Update payment
    const updatedBooking = await prisma.classBooking.update({
      where: { id: validatedData.bookingId },
      data: {
        paidAmount: (booking.paidAmount || 0) + validatedData.amount,
        paymentStatus: (booking.paidAmount || 0) + validatedData.amount >= dueAmount ? 'completed' : 'pending',
        paymentMethod: validatedData.method,
        updatedAt: new Date()
      }
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        id: `txn_${session.clubId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clubId: session.clubId,
        type: 'INCOME',
        category: 'CLASS',
        amount: validatedData.amount,
        currency: 'MXN',
        description: `Pago de clase: ${booking.Class.name}`,
        date: new Date(),
        reference: validatedData.reference,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    // Send receipt if requested
    if (validatedData.sendReceipt && booking.playerPhone) {
      const remainingAmount = dueAmount - (booking.paidAmount || 0) - validatedData.amount
      const message = `✅ Pago recibido para clase "${booking.Class.name}"
Monto: ${formatCurrency(validatedData.amount / 100)}
Método: ${getPaymentMethodName(validatedData.method)}
${validatedData.reference ? `Referencia: ${validatedData.reference}` : ''}
${remainingAmount > 0 ? `Saldo pendiente: ${formatCurrency(remainingAmount / 100)}` : 'Pago completo ✓'}

Gracias por tu pago!`

      try {
        await sendWhatsAppMessage(booking.playerPhone, message)
      } catch (error) {
        console.error('Error sending receipt:', error)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Pago registrado exitosamente',
      booking: updatedBooking,
      paymentComplete: updatedBooking.paymentStatus === 'completed'
    })
    
  } catch (error) {
    console.error('Error recording payment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al registrar pago' },
      { status: 500 }
    )
  }
}

// PUT - Send payment reminder
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { bookingIds, message } = body
    
    if (!bookingIds || bookingIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se seleccionaron estudiantes' },
        { status: 400 }
      )
    }
    
    const bookings = await prisma.classBooking.findMany({
      where: {
        id: { in: bookingIds },
        paymentStatus: 'pending' // Only pending, not partial (doesn't exist in enum)
      },
      include: {
        Class: true
      }
    })

    const results = []

    for (const booking of bookings) {
      if (booking.playerPhone) {
        const dueAmount = booking.Class.price - (booking.paidAmount || 0)
        const customMessage = message || `📢 Recordatorio: Tienes un pago pendiente de ${formatCurrency(dueAmount / 100)} para la clase "${booking.Class.name}". Por favor realiza tu pago lo antes posible.`

        try {
          await sendWhatsAppMessage(booking.playerPhone, customMessage)

          await prisma.notification.create({
            data: {
              id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              bookingId: booking.id,
              type: 'REMINDER',
              template: 'payment_reminder',
              recipient: booking.playerName,
              recipientPhone: booking.playerPhone,
              message: customMessage,
              status: 'sent',
              sentAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })

          results.push({ studentName: booking.playerName, status: 'sent' })
        } catch (error) {
          results.push({ studentName: booking.playerName, status: 'failed', error })
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Recordatorios enviados: ${results.filter(r => r.status === 'sent').length}/${results.length}`,
      results
    })
    
  } catch (error) {
    console.error('Error sending payment reminders:', error)
    return NextResponse.json(
      { success: false, error: 'Error al enviar recordatorios' },
      { status: 500 }
    )
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}

function getPaymentMethodName(method: string): string {
  const methods: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    terminal: 'Terminal',
    online: 'En línea'
  }
  return methods[method] || method
}