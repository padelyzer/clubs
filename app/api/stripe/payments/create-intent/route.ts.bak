import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { createPaymentIntent, calculateApplicationFee } from '@/lib/config/stripe'
import { prisma } from '@/lib/config/prisma'

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
    const { bookingId, splitPaymentId } = body

    if (!bookingId && !splitPaymentId) {
      return NextResponse.json(
        { error: 'Se requiere bookingId o splitPaymentId' },
        { status: 400 }
      )
    }

    let booking
    let amount
    let paymentType

    if (splitPaymentId) {
      // Handle split payment - verify it belongs to user's club
      const splitPayment = await prisma.splitPayment.findFirst({
        where: { 
          id: splitPaymentId,
          booking: {
            clubId: session.clubId
          }
        },
        include: {
          booking: {
            include: {
              club: true,
              court: true
            }
          }
        }
      })

      if (!splitPayment) {
        return NextResponse.json(
          { error: 'Pago dividido no encontrado' },
          { status: 404 }
        )
      }

      if (splitPayment.status !== 'pending') {
        return NextResponse.json(
          { error: 'Este pago ya fue procesado' },
          { status: 400 }
        )
      }

      booking = splitPayment.booking
      amount = splitPayment.amount
      paymentType = 'split'

    } else {
      // Handle full payment - verify booking belongs to user's club
      booking = await prisma.booking.findFirst({
        where: { 
          id: bookingId,
          clubId: session.clubId 
        },
        include: {
          club: true,
          court: true
        }
      })

      if (!booking) {
        return NextResponse.json(
          { error: 'Reserva no encontrada' },
          { status: 404 }
        )
      }

      if (booking.paymentStatus === 'completed') {
        return NextResponse.json(
          { error: 'Esta reserva ya fue pagada' },
          { status: 400 }
        )
      }

      amount = booking.price
      paymentType = 'full'
    }

    const club = booking.club

    if (!club.stripeAccountId || !club.stripeOnboardingCompleted) {
      return NextResponse.json(
        { error: 'El club no tiene configurados los pagos' },
        { status: 400 }
      )
    }

    // Calculate application fee (platform commission)
    const applicationFeeAmount = await calculateApplicationFee(amount, club.stripeCommissionRate / 100)

    // Create payment intent
    const response = await createPaymentIntent({
      amount,
      currency: 'mxn',
      connectedAccountId: club.stripeAccountId,
      applicationFeeAmount,
      paymentMethods: ['card', 'oxxo'],
      metadata: {
        booking_id: booking.id,
        club_id: club.id,
        court_name: booking.court.name,
        club_name: club.name,
        payment_type: paymentType,
        ...(splitPaymentId && { split_payment_id: splitPaymentId }),
      }
    })

    if (!response.success || !response.data) {
      return NextResponse.json(
        { error: response.error || 'Error creando intento de pago' },
        { status: 500 }
      )
    }

    const paymentIntent = response.data

    // Update payment record
    if (splitPaymentId) {
      await prisma.splitPayment.update({
        where: { id: splitPaymentId },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          stripeApplicationFee: applicationFeeAmount,
          status: 'processing',
        }
      })
    } else {
      // Create or update main payment record
      const existingPayment = await prisma.payment.findFirst({
        where: { bookingId: booking.id }
      })

      if (existingPayment) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            stripePaymentIntentId: paymentIntent.id,
            stripeApplicationFee: applicationFeeAmount,
            status: 'processing',
          }
        })
      } else {
        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount,
            currency: 'MXN',
            method: 'STRIPE',
            status: 'processing',
            stripePaymentIntentId: paymentIntent.id,
            stripeApplicationFee: applicationFeeAmount,
          }
        })
      }

      // Update booking status
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'processing',
        }
      })
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      applicationFeeAmount,
      bookingDetails: {
        id: booking.id,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        clubName: club.name,
        courtName: booking.court.name,
      }
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}