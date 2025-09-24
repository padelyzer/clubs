import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId, bookingId, testMode } = body

    console.log('=== PUBLIC CONFIRM PAYMENT REQUEST ===')
    console.log('PaymentIntentId:', paymentIntentId)
    console.log('BookingId:', bookingId)
    console.log('Test Mode:', testMode)

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Se requiere paymentIntentId' },
        { status: 400 }
      )
    }

    // Find the payment record
    console.log('Searching for payment with paymentIntentId:', paymentIntentId)
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        Booking: {
          include: {
            Club: true,
            Court: true
          }
        },
        BookingGroup: {
          include: {
            Club: true,
            bookings: {
              include: {
                Court: true
              }
            }
          }
        }
      }
    })
    console.log('Payment found:', !!payment)

    let booking
    let clubId

    if (!payment) {
      // Try to find split payment
      const splitPayment = await prisma.splitPayment.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
        include: {
          Booking: {
            include: {
              Club: true
            }
          },
          BookingGroup: {
            include: {
              Club: true
            }
          }
        }
      })

      if (!splitPayment) {
        // Try to find the booking directly if no payment record exists
        if (bookingId) {
          console.log('No payment record found, checking booking directly:', bookingId)
          
          const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
              Club: true
            }
          })

          if (booking && booking.paymentStatus === 'processing') {
            // Update booking directly
            await prisma.booking.update({
              where: { id: booking.id },
              data: {
                paymentStatus: 'completed',
                paymentType: 'ONLINE_FULL'
              }
            })

            // Create payment record for tracking
            const newPayment = await prisma.payment.create({
              data: {
                id: `payment_${booking.clubId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                bookingId: booking.id,
                amount: booking.price,
                currency: 'MXN',
                method: 'STRIPE',
                status: 'completed',
                stripePaymentIntentId: paymentIntentId,
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            })

            // Create transaction record
            await prisma.transaction.create({
              data: {
                id: `txn_${booking.clubId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'INCOME',
                amount: booking.price,
                description: `Pago de reserva - ${booking.playerName}`,
                category: 'BOOKING',
                date: new Date(),
                clubId: booking.clubId,
                bookingId: booking.id,
                reference: `STRIPE-${paymentIntentId}`,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })

            return NextResponse.json({
              success: true,
              message: 'Pago confirmado correctamente'
            })
          }

          // Check if it's a class booking
          const classBooking = await prisma.classBooking.findUnique({
            where: { id: bookingId },
            include: {
              class: {
                include: {
                  Club: true
                }
              }
            }
          })

          if (classBooking) {
            // Update class booking directly
            await prisma.classBooking.update({
              where: { id: classBooking.id },
              data: {
                paymentStatus: 'completed',
                paymentMethod: 'online',
                paidAt: new Date()
              }
            })

            return NextResponse.json({
              success: true,
              message: 'Pago confirmado correctamente'
            })
          }
        }

        return NextResponse.json(
          { error: 'Pago no encontrado' },
          { status: 404 }
        )
      }

      // Update split payment
      await prisma.splitPayment.update({
        where: { id: splitPayment.id },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      })

      booking = splitPayment.Booking || splitPayment.BookingGroup
      clubId = splitPayment.Booking?.clubId || splitPayment.BookingGroup?.clubId

      // Check if all split payments are completed
      if (splitPayment.Booking) {
        const pendingSplitPayments = await prisma.splitPayment.count({
          where: {
            bookingId: splitPayment.bookingId,
            status: { not: 'completed' }
          }
        })

        if (pendingSplitPayments === 0) {
          await prisma.booking.update({
            where: { id: splitPayment.bookingId },
            data: {
              paymentStatus: 'completed',
              paymentType: 'ONLINE_FULL'
            }
          })
        }
      } else if (splitPayment.BookingGroup) {
        const pendingSplitPayments = await prisma.splitPayment.count({
          where: {
            bookingGroupId: splitPayment.bookingGroupId,
            status: { not: 'completed' }
          }
        })

        if (pendingSplitPayments === 0) {
          await prisma.bookingGroup.update({
            where: { id: splitPayment.bookingGroupId },
            data: {
              status: 'CONFIRMED'
            }
          })

          // Update all bookings in the group
          await prisma.booking.updateMany({
            where: { bookingGroupId: splitPayment.bookingGroupId },
            data: {
              paymentStatus: 'completed',
              paymentType: 'ONLINE_FULL'
            }
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Pago dividido confirmado correctamente'
      })
    }

    booking = payment.Booking || payment.BookingGroup
    clubId = payment.Booking?.clubId || payment.BookingGroup?.clubId

    if (testMode) {
      console.log('Test mode payment confirmation')
    } else {
      // Verify with Stripe if not in test mode
      const club = booking?.Club
      if (!club) {
        return NextResponse.json(
          { error: 'Club no encontrado' },
          { status: 400 }
        )
      }

      const stripeProvider = await prisma.paymentProvider.findFirst({
        where: {
          clubId: club.id,
          providerId: 'stripe',
          enabled: true
        }
      })

      if (stripeProvider && stripeProvider.config) {
        const config = stripeProvider.config as any
        if (config.secretKey) {
          const stripe = new Stripe(config.secretKey, {
            apiVersion: '2024-11-20.acacia'
          })

          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
            if (paymentIntent.status !== 'succeeded') {
              return NextResponse.json(
                { error: 'El pago no ha sido completado' },
                { status: 400 }
              )
            }
          } catch (error) {
            console.error('Error verifying with Stripe:', error)
            // Continue anyway in case of Stripe API issues
          }
        }
      }
    }

    // Update payment record
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        updatedAt: new Date()
      }
    })

    // Update booking or bookingGroup
    if (payment.Booking) {
      await prisma.booking.update({
        where: { id: payment.bookingId! },
        data: {
          paymentStatus: 'completed',
          paymentType: 'ONLINE_FULL'
        }
      })
    } else if (payment.BookingGroup) {
      await prisma.bookingGroup.update({
        where: { id: payment.bookingGroupId! },
        data: {
          status: 'CONFIRMED'
        }
      })

      // Update all bookings in the group
      await prisma.booking.updateMany({
        where: { bookingGroupId: payment.bookingGroupId! },
        data: {
          paymentStatus: 'completed',
          paymentType: 'ONLINE_FULL'
        }
      })
    }

    // Create transaction record if doesn't exist
    const existingTransaction = await prisma.transaction.findFirst({
      where: { 
        reference: `STRIPE-${paymentIntentId}`,
        clubId: clubId || booking?.clubId
      }
    })

    if (!existingTransaction) {
      await prisma.transaction.create({
        data: {
          id: `txn_${clubId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'INCOME',
          amount: payment.amount,
          description: `Pago de reserva - ${booking?.playerName || 'Cliente'}`,
          category: 'BOOKING',
          date: new Date(),
          clubId: clubId || booking?.clubId,
          bookingId: payment.bookingId || undefined,
          reference: `STRIPE-${paymentIntentId}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // TODO: Send WhatsApp confirmation notification

    return NextResponse.json({
      success: true,
      message: 'Pago confirmado correctamente'
    })

  } catch (error: any) {
    console.error('Error confirming payment:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}