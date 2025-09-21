import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import Stripe from 'stripe'
import { withRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for payment operations
    const rateLimitResponse = await withRateLimit(request, 'api')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const session = await requireAuthAPI()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { bookingId, splitPaymentId } = body
    
    console.log('=== CREATE PAYMENT INTENT REQUEST ===')
    console.log('BookingId:', bookingId)
    console.log('SplitPaymentId:', splitPaymentId)

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
      // Handle split payment
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
              Club: true,
              Court: true
            }
          },
          bookingGroup: {
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

      if (!splitPayment) {
        return NextResponse.json(
          { error: 'Pago dividido no encontrado' },
          { status: 404 }
        )
      }

      // Check if payment is already completed
      if (splitPayment.status === 'completed') {
        return NextResponse.json(
          { error: 'Este pago ya fue completado' },
          { status: 400 }
        )
      }

      // If payment is in processing status and has a Payment Intent, verify it's still valid
      if (splitPayment.status === 'processing' && splitPayment.stripePaymentIntentId) {
        console.log('Split payment already has Payment Intent, checking if it\'s still valid:', splitPayment.stripePaymentIntentId)
        
        // We'll check this Payment Intent later in the flow to see if it's still valid
        // Don't return early here - let the main flow handle it
      }

      // Check if it's for a booking or bookingGroup
      if (splitPayment.bookingGroup) {
        booking = splitPayment.bookingGroup
        booking.isGroup = true
      } else if (splitPayment.booking) {
        booking = splitPayment.booking
        booking.isGroup = false
      } else {
        return NextResponse.json(
          { error: 'Pago dividido sin reserva asociada' },
          { status: 400 }
        )
      }
      
      amount = splitPayment.amount
      paymentType = 'split'

    } else {
      // Handle full payment - try booking first, then bookingGroup, then classBooking
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
        // Try as bookingGroup - filtered by club
        const bookingGroup = await prisma.bookingGroup.findFirst({
          where: { 
            id: bookingId,
            clubId: session.clubId 
          },
          include: {
            Club: true,
            bookings: {
              include: {
                Court: true
              }
            }
          }
        })
        
        if (bookingGroup) {
          booking = bookingGroup
          booking.isGroup = true
          amount = bookingGroup.totalPrice
        } else {
          // Try as classBooking
          const classBooking = await prisma.classBooking.findUnique({
            where: { id: bookingId },
            include: {
              class: {
                include: {
                  Club: true,
                  Court: true
                }
              }
            }
          })
          
          if (classBooking) {
            // Transform classBooking to match expected structure
            booking = {
              id: classBooking.id,
              date: classBooking.class.date,
              startTime: classBooking.class.startTime,
              endTime: classBooking.class.endTime,
              playerName: classBooking.studentName,
              playerEmail: classBooking.studentEmail,
              playerPhone: classBooking.studentPhone,
              totalPlayers: 1,
              price: classBooking.dueAmount || classBooking.class.price,
              Club: classBooking.class.Club,
              Court: classBooking.class.Court,
              clubId: classBooking.class.clubId,
              courtId: classBooking.class.courtId,
              splitPaymentEnabled: false,
              splitPaymentCount: 0,
              isClass: true,
              isGroup: false
            }
            amount = classBooking.dueAmount || classBooking.class.price
          } else {
            return NextResponse.json(
              { error: 'Reserva no encontrada' },
              { status: 404 }
            )
          }
        }
      } else {
        booking.isGroup = false
        amount = booking.price
      }
      
      paymentType = 'full'
    }

    const club = booking.Club || booking.club
    
    if (!club) {
      return NextResponse.json(
        { error: 'No se pudo encontrar la información del club' },
        { status: 400 }
      )
    }

    // Buscar configuración de Stripe del club en PaymentProvider
    const stripeProvider = await prisma.paymentProvider.findFirst({
      where: {
        clubId: club.id,
        providerId: 'stripe',
        enabled: true
      }
    })

    if (!stripeProvider || !stripeProvider.config) {
      return NextResponse.json(
        { error: 'El club no tiene configurado Stripe. Contacte al administrador.' },
        { status: 400 }
      )
    }

    const config = stripeProvider.config as any
    if (!config.secretKey || !config.publicKey) {
      return NextResponse.json(
        { error: 'Configuración de Stripe incompleta para este club. Contacte al administrador.' },
        { status: 400 }
      )
    }

    console.log('Using club-specific Stripe keys for club:', club.id)
    const stripeSecretKey = config.secretKey

    // Inicializar Stripe con la llave correspondiente
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia'
    })

    // Check if there's already a payment with a valid Payment Intent
    let existingPaymentIntent = null
    
    if (splitPaymentId) {
      // For split payments, check the splitPayment we already fetched
      const splitPayment = await prisma.splitPayment.findUnique({
        where: { id: splitPaymentId }
      })
      if (splitPayment?.stripePaymentIntentId && splitPayment.status === 'processing') {
        console.log('Found existing Payment Intent for split payment:', splitPayment.stripePaymentIntentId)
        existingPaymentIntent = splitPayment.stripePaymentIntentId
      }
    } else if (!booking.isClass) {
      // Check if regular payment already has a payment intent
      const existingPayment = await prisma.payment.findFirst({
        where: booking.isGroup 
          ? { bookingGroupId: booking.id }
          : { bookingId: booking.id },
        orderBy: { createdAt: 'desc' } // Get the most recent payment
      })
      console.log('Checking for existing payment for booking:', booking.id, 'isGroup:', booking.isGroup)
      console.log('Found existing payment:', existingPayment ? {
        id: existingPayment.id,
        status: existingPayment.status,
        stripePaymentIntentId: existingPayment.stripePaymentIntentId
      } : 'none')
      
      if (existingPayment?.stripePaymentIntentId && existingPayment.status === 'processing') {
        console.log('Found existing Payment Intent for booking:', existingPayment.stripePaymentIntentId)
        existingPaymentIntent = existingPayment.stripePaymentIntentId
      }
    }

    let paymentIntent
    
    if (existingPaymentIntent) {
      // Retrieve existing Payment Intent from Stripe
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(existingPaymentIntent)
        console.log('Retrieved existing Payment Intent:', paymentIntent.id, 'Status:', paymentIntent.status)
        
        // If the payment intent is already succeeded or canceled, create a new one
        if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'canceled') {
          console.log('Existing Payment Intent is already', paymentIntent.status, '- creating new one')
          existingPaymentIntent = null // Force creation of new payment intent
        }
      } catch (error) {
        console.log('Could not retrieve Payment Intent, creating new one:', error.message)
        existingPaymentIntent = null // Force creation of new payment intent
      }
    }
    
    if (!existingPaymentIntent) {
      // Create new payment intent only if needed
      const courtInfo = booking.isGroup 
        ? booking.bookings.map(b => b.court.name).join(', ')
        : booking.court?.name || 'Cancha'
      
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Amount should be in cents (centavos)
        currency: 'mxn',
        payment_method_types: ['card', 'oxxo'],
        description: `Reserva pádel - ${club.name} - ${courtInfo} (${new Date(booking.date).toLocaleDateString('es-MX')})`,
        metadata: {
          booking_id: booking.id,
          club_id: club.id,
          court_name: courtInfo,
          club_name: club.name,
          payment_type: paymentType,
          is_group: booking.isGroup ? 'true' : 'false',
          is_class: booking.isClass ? 'true' : 'false',
          ...(booking.isClass && { class_booking_id: booking.id }),
          ...(splitPaymentId && { split_payment_id: splitPaymentId }),
        }
      })
      console.log('Created new Payment Intent:', paymentIntent.id)
    }

    // Update payment record only if Payment Intent changed
    if (splitPaymentId) {
      const splitPayment = await prisma.splitPayment.findUnique({
        where: { id: splitPaymentId }
      })
      
      // Only update if Payment Intent ID is different
      if (splitPayment && splitPayment.stripePaymentIntentId !== paymentIntent.id) {
        console.log('Updating split payment with new Payment Intent:', paymentIntent.id)
        await prisma.splitPayment.update({
          where: { id: splitPaymentId },
          data: {
            stripePaymentIntentId: paymentIntent.id,
            status: 'processing',
          }
        })
      }
    } else {
      // For ClassBooking, we don't create a Payment record, we'll update the classBooking directly
      if (!booking.isClass) {
        // Create or update main payment record for regular bookings and groups
        const existingPayment = await prisma.payment.findFirst({
          where: booking.isGroup 
            ? { bookingGroupId: booking.id }
            : { bookingId: booking.id },
          orderBy: { createdAt: 'desc' }
        })

        if (existingPayment) {
          // Only update if Payment Intent ID is different or missing
          if (existingPayment.stripePaymentIntentId !== paymentIntent.id) {
            console.log('Updating existing payment record with Payment Intent:', paymentIntent.id)
            await prisma.payment.update({
              where: { id: existingPayment.id },
              data: {
                stripePaymentIntentId: paymentIntent.id,
                status: 'processing',
                amount, // Update amount in case it changed
              }
            })
          } else {
            console.log('Payment record already has this Payment Intent, no update needed')
          }
        } else {
          console.log('Creating new payment record with Payment Intent:', paymentIntent.id)
          await prisma.payment.create({
            data: {
              id: `payment_${club.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              ...(booking.isGroup 
                ? { bookingGroupId: booking.id }
                : { bookingId: booking.id }),
              amount,
              currency: 'MXN',
              method: 'STRIPE',
              status: 'processing',
              stripePaymentIntentId: paymentIntent.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          })
        }
      }

      // Update booking, bookingGroup, or classBooking status
      if (booking.isClass) {
        await prisma.classBooking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: 'processing',
            paymentMethod: 'online',
          }
        })
      } else if (booking.isGroup) {
        await prisma.bookingGroup.update({
          where: { id: booking.id },
          data: {
            paymentStatus: 'processing',
          }
        })
      } else {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: 'processing',
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      bookingDetails: {
        id: booking.id,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        clubName: club.name,
        courtName: booking.isGroup ? booking.bookings.map(b => b.court.name).join(', ') : booking.court?.name,
        playerName: booking.isGroup ? booking.name : booking.playerName,
        totalPlayers: booking.totalPlayers || 1,
        price: booking.price,
        splitPaymentEnabled: booking.splitPaymentEnabled || false,
        splitPaymentCount: booking.splitPaymentCount || 0,
        isGroup: booking.isGroup || false
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