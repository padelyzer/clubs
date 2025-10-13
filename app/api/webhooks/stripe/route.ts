import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/config/prisma'
import { paymentService } from '@/lib/services/payment-service'
import { generateId } from '@/lib/utils/generate-id'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // We need to determine which club this webhook is for
    // This could be done through the webhook URL or by checking the event data
    let event: Stripe.Event | null = null
    let clubId: string | null = null

    // First, try to parse the event without verification to get metadata
    try {
      const tempEvent = JSON.parse(body) as Stripe.Event
      
      // Extract club ID from metadata
      if (tempEvent.data.object && typeof tempEvent.data.object === 'object') {
        const metadata = (tempEvent.data.object as any).metadata
        if (metadata && metadata.clubId) {
          clubId = metadata.clubId
        }
      }
    } catch (e) {
      console.error('Error parsing webhook body:', e)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (!clubId) {
      console.error('Could not determine club ID from webhook')
      return NextResponse.json({ error: 'Invalid club context' }, { status: 400 })
    }

    // Now verify the webhook with the appropriate club's secret
    event = await paymentService.verifyWebhook(clubId, body, signature)
    
    if (!event) {
      console.error('Webhook verification failed')
      return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
    }

    console.log(`Processing Stripe webhook: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_link.updated':
        await handlePaymentLinkUpdated(event.data.object as any)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' }, 
      { status: 500 }
    )
  }
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const metadata = paymentIntent.metadata
    
    // Handle booking payments - try metadata first, then fallback to payment lookup
    let bookingId = metadata.bookingId
    let booking = null
    
    if (bookingId) {
      // Use bookingId from metadata
      booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { Court: true }
      })
    } else {
      // Fallback: find payment by stripe payment intent ID
      console.log(`No bookingId in metadata, searching by payment intent: ${paymentIntent.id}`)
      const payment = await prisma.payment.findFirst({
        where: {
          stripePaymentIntentId: paymentIntent.id
        },
        include: {
          Booking: {
            include: { Court: true }
          }
        }
      })
      
      if (payment && payment.Booking) {
        bookingId = payment.Booking.id
        booking = payment.Booking
        console.log(`✅ Found booking via payment lookup: ${bookingId}`)
      }
    }
    
    if (bookingId && booking) {
      // Update booking status
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'completed'
        }
      })
      
      // Update payment record
      await prisma.payment.updateMany({
        where: {
          bookingId,
          OR: [
            { method: 'STRIPE' },
            { stripePaymentIntentId: paymentIntent.id }
          ]
        },
        data: {
          status: 'completed',
          stripePaymentIntentId: paymentIntent.id
        }
      })
      
      // Create financial transaction for booking
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          reference: paymentIntent.id
        }
      })
      
      if (!existingTransaction) {
        await prisma.transaction.create({
          data: {
            id: generateId(),
            clubId: booking.clubId,
            type: 'INCOME',
            category: 'BOOKING',
            amount: paymentIntent.amount,
            currency: booking.currency || 'MXN',
            description: `Reserva ${booking.Court.name} - ${booking.date.toLocaleDateString()} ${booking.startTime}`,
            date: new Date(),
            reference: paymentIntent.id,
            bookingId,
            updatedAt: new Date(),
            metadata: {
              bookingId,
              paymentMethod: 'stripe',
              source: 'stripe_webhook'
            }
          }
        })
        console.log(`✅ Financial transaction created for booking: ${bookingId} with Stripe reference: ${paymentIntent.id}`)
      } else {
        console.log(`⚠️ Transaction already exists for payment intent: ${paymentIntent.id}`)
      }
      
      console.log(`Payment succeeded for booking: ${bookingId}`)
      return
    }
    
    // Handle split payments for bookings
    if (metadata.splitPaymentId) {
      const splitPaymentId = metadata.splitPaymentId
      
      // Update split payment status
      await prisma.splitPayment.update({
        where: { id: splitPaymentId },
        data: {
          status: 'completed',
          paidAt: new Date()
        }
      })
      
      // Check if all split payments are complete
      const splitPayment = await prisma.splitPayment.findUnique({
        where: { id: splitPaymentId },
        include: {
          Booking: {
            include: {
              SplitPayment: true
            }
          }
        }
      })

      if (splitPayment?.Booking) {
        const allPaid = splitPayment.Booking.SplitPayment.every(sp => sp.status === 'completed')

        if (allPaid) {
          // Update booking status if all split payments are complete
          await prisma.booking.update({
            where: { id: splitPayment.Booking.id },
            data: {
              status: 'CONFIRMED',
              paymentStatus: 'completed'
            }
          })
        }
      }
      
      console.log(`Split payment succeeded: ${splitPaymentId}`)
      return
    }
    
    // Handle tournament payments (existing code)
    const tournamentId = metadata.tournamentId
    const registrationId = metadata.registrationId

    if (!tournamentId || !registrationId) {
      console.error('Missing tournament or registration ID in payment intent metadata')
      return
    }

    // Update tournament registration
    await prisma.tournamentRegistration.update({
      where: { id: registrationId },
      data: {
        paymentStatus: 'completed',
        confirmed: true,
        paidAmount: paymentIntent.amount,
        paymentReference: paymentIntent.id
      }
    })

    // Create financial transaction
    await createFinancialTransaction(tournamentId, paymentIntent.amount, 'payment_intent', paymentIntent.id)

    console.log(`Payment intent succeeded for registration: ${registrationId}`)

  } catch (error) {
    console.error('Error handling payment intent succeeded:', error)
  }
}

// Handle failed payment intent
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const metadata = paymentIntent.metadata
    
    // Handle booking payment failures
    if (metadata.bookingId) {
      const bookingId = metadata.bookingId
      
      // Update booking status
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'PENDING',
          paymentStatus: 'failed'
        }
      })
      
      // Update payment record
      await prisma.payment.updateMany({
        where: {
          bookingId,
          method: 'STRIPE'
        },
        data: {
          status: 'failed'
        }
      })
      
      console.log(`Payment failed for booking: ${bookingId}`)
      return
    }
    
    // Handle split payment failures
    if (metadata.splitPaymentId) {
      const splitPaymentId = metadata.splitPaymentId
      
      // Update split payment status
      await prisma.splitPayment.update({
        where: { id: splitPaymentId },
        data: {
          status: 'failed'
        }
      })
      
      console.log(`Split payment failed: ${splitPaymentId}`)
      return
    }
    
    // Handle tournament payment failures (existing code)
    const tournamentId = metadata.tournamentId
    const registrationId = metadata.registrationId

    if (!tournamentId || !registrationId) {
      console.error('Missing tournament or registration ID in payment intent metadata')
      return
    }

    // Update tournament registration
    await prisma.tournamentRegistration.update({
      where: { id: registrationId },
      data: {
        paymentStatus: 'failed',
        confirmed: false
      }
    })

    console.log(`Payment intent failed for registration: ${registrationId}`)

  } catch (error) {
    console.error('Error handling payment intent failed:', error)
  }
}

// Handle completed checkout session (for payment links)
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata
    if (!metadata) {
      console.error('Missing metadata in checkout session')
      return
    }

    const { type, tournamentId, registrationId } = metadata

    if (type !== 'tournament_registration' || !tournamentId || !registrationId) {
      console.error('Invalid or missing metadata in checkout session')
      return
    }

    // Find existing registration to update
    const existingRegistration = await prisma.tournamentRegistration.findUnique({
      where: { id: registrationId }
    })

    if (existingRegistration) {
      // Update existing registration
      await prisma.tournamentRegistration.update({
        where: { id: registrationId },
        data: {
          paymentStatus: 'completed',
          confirmed: true,
          paidAmount: session.amount_total || 0,
          paymentReference: session.id
        }
      })

      // Create financial transaction
      await createFinancialTransaction(
        tournamentId,
        session.amount_total || 0,
        'payment_link',
        session.id
      )

      console.log(`Checkout session completed for registration: ${registrationId}`)
    }

  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

// Handle payment link updates
async function handlePaymentLinkUpdated(paymentLink: any) {
  try {
    // This webhook is triggered when payment link status changes
    // We might use it for analytics or cleanup
    console.log(`Payment link updated: ${paymentLink.id}`)
  } catch (error) {
    console.error('Error handling payment link updated:', error)
  }
}

// Helper: Create or find player
async function createOrFindPlayer(
  tournamentId: string,
  name: string, 
  email: string | undefined,
  phone: string
) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { clubId: true }
    })

    if (!tournament) return null

    let player = await prisma.player.findFirst({
      where: {
        clubId: tournament.clubId,
        phone
      }
    })

    if (!player) {
      player = await prisma.player.create({
        data: {
          id: generateId(),
          clubId: tournament.clubId,
          name,
          email,
          phone,
          updatedAt: new Date()
        }
      })
    }

    return player
  } catch (error) {
    console.error('Error creating/finding player:', error)
    return null
  }
}

// Helper: Create financial transaction
async function createFinancialTransaction(
  tournamentId: string,
  amount: number,
  method: string,
  transactionId: string
) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { 
        clubId: true, 
        name: true,
        currency: true
      }
    })

    if (!tournament) return

    // Create income transaction
    await prisma.transaction.create({
      data: {
        id: generateId(),
        clubId: tournament.clubId,
        type: 'INCOME',
        category: 'TOURNAMENT',
        amount,
        currency: tournament.currency || 'MXN',
        description: `Inscripción ${tournament.name}`,
        date: new Date(),
        reference: transactionId,
        updatedAt: new Date(),
        metadata: {
          tournamentId,
          paymentMethod: method,
          source: 'stripe_webhook'
        }
      }
    })

    console.log(`Financial transaction created for tournament: ${tournamentId}`)

  } catch (error) {
    console.error('Error creating financial transaction:', error)
  }
}