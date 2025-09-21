import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { stripe, calculateApplicationFee } from '@/lib/config/stripe'
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
    const { bookingId, splitPaymentId, customerInfo } = body

    if (!bookingId && !splitPaymentId) {
      return NextResponse.json(
        { error: 'Se requiere bookingId o splitPaymentId' },
        { status: 400 }
      )
    }

    if (!customerInfo?.name || !customerInfo?.email) {
      return NextResponse.json(
        { error: 'Se requiere información del cliente (nombre y email)' },
        { status: 400 }
      )
    }

    let booking
    let amount
    let paymentType

    if (splitPaymentId) {
      // Handle split payment - verify it belongs to the user's club
      const splitPayment = await prisma.splitPayment.findFirst({
        where: { 
          id: splitPaymentId,
          Booking: {
            clubId: session.clubId
          }
        },
        include: {
          Booking: {
            include: {
              Club: true,
              Court: true
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

      booking = splitPayment.Booking
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
          Club: true,
          Court: true
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

    const club = booking.Club

    if (!club.stripeAccountId || !club.stripeOnboardingCompleted) {
      return NextResponse.json(
        { error: 'El club no tiene configurados los pagos' },
        { status: 400 }
      )
    }

    // Calculate application fee (platform commission)
    const applicationFeeAmount = await calculateApplicationFee(amount, club.stripeCommissionRate / 100)

    // For SPEI, we need to create the payment intent on the connected account
    // as SPEI is only available for Mexican connected accounts
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'mxn',
      payment_method_types: ['customer_balance'],
      payment_method_data: {
        type: 'customer_balance',
      },
      payment_method_options: {
        customer_balance: {
          funding_type: 'bank_transfer',
          bank_transfer: {
            type: 'mx_bank_transfer',
          },
        },
      },
      application_fee_amount: applicationFeeAmount,
      metadata: {
        booking_id: booking.id,
        club_id: club.id,
        court_name: booking.Court.name,
        club_name: club.name,
        payment_type: paymentType,
        payment_method: 'spei',
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        ...(splitPaymentId && { split_payment_id: splitPaymentId }),
      }
    }, {
      stripeAccount: club.stripeAccountId,
    })

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
            method: 'SPEI',
          }
        })
      } else {
        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount,
            currency: 'MXN',
            method: 'SPEI',
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

    // Generate SPEI transfer details
    const transferDetails = {
      bankName: 'STP',
      clabe: '646180157000000004', // Example CLABE - in production, this would be dynamic
      reference: `PAD${booking.id.substring(0, 8).toUpperCase()}${Date.now().toString().slice(-4)}`,
      amount: amount / 100,
      beneficiaryName: club.name,
      concept: `Reserva ${booking.Court.name} - ${club.name}`,
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      applicationFeeAmount,
      paymentMethod: 'spei',
      transferDetails,
      instructions: {
        title: 'Transfiere vía SPEI',
        description: 'Realiza una transferencia bancaria SPEI con los siguientes datos:',
        expirationHours: 72,
        steps: [
          'Ingresa a tu banca en línea o app móvil',
          'Selecciona "Transferir a otra cuenta"',
          'Ingresa la CLABE y referencia proporcionadas',
          'Confirma el monto exacto',
          'Autoriza la transferencia'
        ]
      },
      bookingDetails: {
        id: booking.id,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        clubName: club.name,
        courtName: booking.Court.name,
      }
    })

  } catch (error) {
    console.error('Error creating SPEI payment:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}