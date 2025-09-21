import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { requireAuthAPI } from '@/lib/auth/actions'

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

    const { id } = await params

    // Check for regular booking payment
    const booking = await prisma.booking.findUnique({
      where: { 
        id,
        clubId: session.clubId
      },
      include: {
        payments: {
          where: {
            status: 'processing'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (booking && booking.payments.length > 0) {
      const payment = booking.payments[0]
      return NextResponse.json({
        hasPaymentIntent: true,
        paymentIntentId: payment.stripePaymentIntentId,
        paymentLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/${id}`,
        status: payment.status
      })
    }

    // Check for booking group payment
    const bookingGroup = await prisma.bookingGroup.findUnique({
      where: { 
        id,
        clubId: session.clubId
      },
      include: {
        payments: {
          where: {
            status: 'processing'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (bookingGroup && bookingGroup.payments.length > 0) {
      const payment = bookingGroup.payments[0]
      return NextResponse.json({
        hasPaymentIntent: true,
        paymentIntentId: payment.stripePaymentIntentId,
        paymentLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/${id}`,
        status: payment.status
      })
    }

    // Check for class booking
    const classBooking = await prisma.classBooking.findUnique({
      where: { id },
      include: {
        class: true
      }
    })

    if (classBooking && classBooking.class?.clubId === session.clubId) {
      // For class bookings, check if payment is processing
      if (classBooking.paymentStatus === 'processing') {
        return NextResponse.json({
          hasPaymentIntent: true,
          paymentIntentId: null, // ClassBookings don't store Payment Intent ID directly
          paymentLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/${id}`,
          status: classBooking.paymentStatus
        })
      }
    }

    // No payment intent found
    return NextResponse.json({
      hasPaymentIntent: false,
      paymentIntentId: null,
      paymentLink: null,
      status: null
    })

  } catch (error) {
    console.error('Error checking payment:', error)
    return NextResponse.json(
      { error: 'Error al verificar pago' },
      { status: 500 }
    )
  }
}