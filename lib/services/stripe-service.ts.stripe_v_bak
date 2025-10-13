import Stripe from 'stripe'
import { prisma } from '@/lib/config/prisma'

interface CreatePaymentLinkParams {
  bookingId: string
  amount: number
  description: string
  customerEmail?: string
  customerPhone?: string
  metadata?: Record<string, string>
}

export class StripeService {
  private stripe: Stripe | null = null

  private async getStripeClient(clubId: string): Promise<Stripe | null> {
    try {
      // Get Stripe configuration for the club
      const stripeConfig = await prisma.paymentProvider.findFirst({
        where: {
          clubId,
          providerId: 'stripe',
          enabled: true
        }
      })

      if (!stripeConfig || !stripeConfig.config) {
        console.error('Stripe not configured for club:', clubId)
        return null
      }

      const config = stripeConfig.config as any
      if (!config.secretKey) {
        console.error('Stripe secret key not found for club:', clubId)
        return null
      }

      // Initialize Stripe client with the club's secret key
      this.stripe = new Stripe(config.secretKey, {
        apiVersion: '2024-11-20.acacia'
      })

      return this.stripe
    } catch (error) {
      console.error('Error initializing Stripe client:', error)
      return null
    }
  }

  async createPaymentLink(clubId: string, params: CreatePaymentLinkParams): Promise<string | null> {
    try {
      const stripe = await this.getStripeClient(clubId)
      if (!stripe) return null

      // Create a payment link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price_data: {
              currency: 'mxn',
              product_data: {
                name: params.description,
                description: `Reserva #${params.bookingId}`
              },
              unit_amount: params.amount // Stripe expects amount in cents
            },
            quantity: 1
          }
        ],
        metadata: {
          bookingId: params.bookingId,
          ...params.metadata
        },
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/booking-success?bookingId=${params.bookingId}`
          }
        },
        allow_promotion_codes: false,
        automatic_tax: {
          enabled: false
        }
      })

      return paymentLink.url
    } catch (error) {
      console.error('Error creating Stripe payment link:', error)
      return null
    }
  }

  async createPaymentIntent(clubId: string, params: CreatePaymentLinkParams): Promise<Stripe.PaymentIntent | null> {
    try {
      const stripe = await this.getStripeClient(clubId)
      if (!stripe) return null

      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: params.amount, // Amount in cents
        currency: 'mxn',
        description: params.description,
        metadata: {
          bookingId: params.bookingId,
          ...params.metadata
        },
        automatic_payment_methods: {
          enabled: true
        }
      })

      // Store the payment intent ID in the database
      await prisma.payment.updateMany({
        where: {
          bookingId: params.bookingId,
          method: 'STRIPE'
        },
        data: {
          stripePaymentIntentId: paymentIntent.id
        }
      })

      return paymentIntent
    } catch (error) {
      console.error('Error creating payment intent:', error)
      return null
    }
  }

  async createCheckoutSession(clubId: string, params: CreatePaymentLinkParams): Promise<string | null> {
    try {
      const stripe = await this.getStripeClient(clubId)
      if (!stripe) return null

      // Create a checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'mxn',
              product_data: {
                name: params.description,
                description: `Reserva #${params.bookingId}`
              },
              unit_amount: params.amount
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pay/success?session_id={CHECKOUT_SESSION_ID}&bookingId=${params.bookingId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pay/cancel?bookingId=${params.bookingId}`,
        metadata: {
          bookingId: params.bookingId,
          ...params.metadata
        },
        customer_email: params.customerEmail,
        locale: 'es'
      })

      // Store the session ID
      await prisma.payment.updateMany({
        where: {
          bookingId: params.bookingId,
          method: 'STRIPE'
        },
        data: {
          stripePaymentIntentId: session.payment_intent as string
        }
      })

      return session.url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return null
    }
  }

  async verifyPayment(clubId: string, paymentIntentId: string): Promise<boolean> {
    try {
      const stripe = await this.getStripeClient(clubId)
      if (!stripe) return false

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      return paymentIntent.status === 'succeeded'
    } catch (error) {
      console.error('Error verifying payment:', error)
      return false
    }
  }

  async createSplitPaymentLinks(
    clubId: string,
    bookingId: string,
    splitPayments: Array<{ id: string; amount: number; playerName: string; playerEmail?: string }>
  ): Promise<Array<{ splitPaymentId: string; paymentLink: string }>> {
    const results = []
    
    for (const splitPayment of splitPayments) {
      const link = await this.createPaymentLink(clubId, {
        bookingId,
        amount: splitPayment.amount,
        description: `Pago de ${splitPayment.playerName} - Reserva de Pádel`,
        customerEmail: splitPayment.playerEmail,
        metadata: {
          splitPaymentId: splitPayment.id,
          playerName: splitPayment.playerName
        }
      })

      if (link) {
        results.push({
          splitPaymentId: splitPayment.id,
          paymentLink: link
        })
      }
    }

    return results
  }
}

export const stripeService = new StripeService()