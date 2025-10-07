import { NextRequest, NextResponse } from 'next/server'
import { retrievePaymentIntent } from '@/lib/config/stripe'
import { prisma } from '@/lib/config/prisma'

interface Params {
  paymentIntentId: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const paramData = await params
    
    const { paymentIntentId } = paramData

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Se requiere paymentIntentId' },
        { status: 400 }
      )
    }

    // Retrieve payment intent from Stripe
    const response = await retrievePaymentIntent(paymentIntentId)

    if (!response.success || !response.data) {
      return NextResponse.json(
        { error: 'Payment Intent no encontrado' },
        { status: 404 }
      )
    }

    const paymentIntent = response.data
    const metadata = paymentIntent.metadata
    const bookingId = metadata.booking_id
    const splitPaymentId = metadata.split_payment_id

    // Get payment details from database
    let paymentDetails = null

    if (splitPaymentId) {
      paymentDetails = await prisma.splitPayment.findUnique({
        where: { id: splitPaymentId },
        include: {
          booking: {
            include: {
              club: true,
              court: true
            }
          }
        }
      })
    } else if (bookingId) {
      paymentDetails = await prisma.payment.findFirst({
        where: { bookingId },
        include: {
          booking: {
            include: {
              club: true,
              court: true
            }
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        clientSecret: paymentIntent.client_secret,
        created: paymentIntent.created,
        paymentMethod: paymentIntent.payment_method,
        lastPaymentError: paymentIntent.last_payment_error,
      },
      paymentDetails,
      metadata,
    })

  } catch (error) {
    console.error('Error getting payment status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}