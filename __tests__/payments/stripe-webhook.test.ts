/**
 * Payment Tests - Stripe Webhooks
 * Tests for Stripe webhook handling, signature validation, and event processing
 */

import { POST } from '@/app/api/webhooks/stripe/route'
import { prisma } from '@/lib/config/prisma'
import { paymentService } from '@/lib/services/payment-service'
import {
  createMockBooking,
  createMockCourt,
  createMockNextRequest,
  createMockStripeEvent,
  mockPrismaResponse,
  mockPrismaError,
  TEST_CONSTANTS,
} from '../setup/test-utils'
import { v4 as uuidv4 } from 'uuid'
import Stripe from 'stripe'

import { vi } from 'vitest'

// Mock dependencies
vi.mock('@/lib/services/payment-service', () => ({
  paymentService: {
    verifyWebhook: vi.fn(),
  },
}))

// Create a mock for headers that can be configured per test
const mockHeadersGet = vi.fn((name: string) => {
  if (name === 'stripe-signature') return 'valid-signature'
  return null
})

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: mockHeadersGet,
  })),
}))

describe('POST /api/webhooks/stripe - Stripe Webhook Handler', () => {
  const mockClubId = 'club-123'
  const mockBookingId = 'booking-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Webhook Signature Validation', () => {
    it('should verify webhook signature before processing', async () => {
      // Arrange
      const paymentIntent: Stripe.PaymentIntent = {
        id: 'pi_123',
        object: 'payment_intent',
        amount: 50000,
        currency: 'mxn',
        status: 'succeeded',
        metadata: {
          clubId: mockClubId,
          bookingId: mockBookingId,
        },
      } as any

      const event = createMockStripeEvent('payment_intent.succeeded', paymentIntent)

      ;(paymentService.verifyWebhook as any).mockResolvedValue(event)
      ;(prisma.booking.findUnique as any).mockResolvedValue(
        createMockBooking({ id: mockBookingId })
      )
      ;(prisma.booking.update as any).mockResolvedValue({})
      ;(prisma.payment.updateMany as any).mockResolvedValue({ count: 1 })
      ;(prisma.transaction.findFirst as any).mockResolvedValue(null)
      ;(prisma.transaction.create as any).mockResolvedValue({})

      const body = JSON.stringify(event)
      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })

      // Override request.text() to return the body
      request.text = vi.fn().mockResolvedValue(body)

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(paymentService.verifyWebhook).toHaveBeenCalledWith(
        mockClubId,
        body,
        'valid-signature'
      )
    })

    it('should reject webhook with missing signature', async () => {
      // Arrange
      mockHeadersGet.mockReturnValue(null) // No signature

      const event = createMockStripeEvent('payment_intent.succeeded', {})
      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'Missing signature')

      // Reset mock
      mockHeadersGet.mockImplementation((name: string) => {
        if (name === 'stripe-signature') return 'valid-signature'
        return null
      })
    })

    it('should reject webhook with invalid signature', async () => {
      // Arrange
      ;(paymentService.verifyWebhook as any).mockResolvedValue(null)

      const event = createMockStripeEvent('payment_intent.succeeded', {
        metadata: { clubId: mockClubId },
      })
      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'invalid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'Webhook verification failed')
    })

    it('should reject webhook without clubId in metadata', async () => {
      // Arrange
      const event = createMockStripeEvent('payment_intent.succeeded', {
        metadata: {}, // Missing clubId
      })
      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'Invalid club context')
    })
  })

  describe('payment_intent.succeeded Event', () => {
    it('should update booking status on successful payment', async () => {
      // Arrange
      const paymentIntent: Stripe.PaymentIntent = {
        id: 'pi_123',
        object: 'payment_intent',
        amount: 50000,
        currency: 'mxn',
        status: 'succeeded',
        metadata: {
          clubId: mockClubId,
          bookingId: mockBookingId,
        },
      } as any

      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'PENDING',
        paymentStatus: 'pending',
      })

      const event = createMockStripeEvent('payment_intent.succeeded', paymentIntent)

      ;(paymentService.verifyWebhook as any).mockResolvedValue(event)
      ;(prisma.booking.findUnique as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
      })
      ;(prisma.booking.update as any).mockResolvedValue({
        ...mockBooking,
        status: 'CONFIRMED',
        paymentStatus: 'completed',
      })
      ;(prisma.payment.updateMany as any).mockResolvedValue({ count: 1 })
      ;(prisma.transaction.findFirst as any).mockResolvedValue(null)
      ;(prisma.transaction.create as any).mockResolvedValue({
        id: uuidv4(),
        clubId: mockClubId,
      })

      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('received', true)
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: mockBookingId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'completed',
        },
      })
    })

    it('should update payment record with payment intent ID', async () => {
      // Arrange
      const paymentIntentId = 'pi_123456789'
      const paymentIntent: Stripe.PaymentIntent = {
        id: paymentIntentId,
        object: 'payment_intent',
        amount: 50000,
        currency: 'mxn',
        status: 'succeeded',
        metadata: {
          clubId: mockClubId,
          bookingId: mockBookingId,
        },
      } as any

      const event = createMockStripeEvent('payment_intent.succeeded', paymentIntent)

      ;(paymentService.verifyWebhook as any).mockResolvedValue(event)
      ;(prisma.booking.findUnique as any).mockResolvedValue(
        createMockBooking({ id: mockBookingId })
      )
      ;(prisma.booking.update as any).mockResolvedValue({})
      ;(prisma.payment.updateMany as any).mockResolvedValue({ count: 1 })
      ;(prisma.transaction.findFirst as any).mockResolvedValue(null)
      ;(prisma.transaction.create as any).mockResolvedValue({})

      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      expect(prisma.payment.updateMany).toHaveBeenCalledWith({
        where: {
          bookingId: mockBookingId,
          OR: [
            { method: 'STRIPE' },
            { stripePaymentIntentId: paymentIntentId },
          ],
        },
        data: {
          status: 'completed',
          stripePaymentIntentId: paymentIntentId,
        },
      })
    })

    it('should create financial transaction for booking payment', async () => {
      // Arrange
      const paymentIntent: Stripe.PaymentIntent = {
        id: 'pi_123',
        object: 'payment_intent',
        amount: 50000,
        currency: 'mxn',
        status: 'succeeded',
        metadata: {
          clubId: mockClubId,
          bookingId: mockBookingId,
        },
      } as any

      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        price: 50000,
      })

      const event = createMockStripeEvent('payment_intent.succeeded', paymentIntent)

      ;(paymentService.verifyWebhook as any).mockResolvedValue(event)
      ;(prisma.booking.findUnique as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
      })
      ;(prisma.booking.update as any).mockResolvedValue({})
      ;(prisma.payment.updateMany as any).mockResolvedValue({ count: 1 })
      ;(prisma.transaction.findFirst as any).mockResolvedValue(null)
      ;(prisma.transaction.create as any).mockResolvedValue({
        id: uuidv4(),
        type: 'INCOME',
        category: 'BOOKING',
        amount: 50000,
      })

      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      expect(prisma.transaction.create).toHaveBeenCalled()
    })

    it('should handle payment without bookingId in metadata', async () => {
      // Arrange
      const paymentIntentId = 'pi_123'
      const paymentIntent: Stripe.PaymentIntent = {
        id: paymentIntentId,
        object: 'payment_intent',
        amount: 50000,
        currency: 'mxn',
        status: 'succeeded',
        metadata: {
          clubId: mockClubId,
          // No bookingId
        },
      } as any

      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
      })

      const event = createMockStripeEvent('payment_intent.succeeded', paymentIntent)

      ;(paymentService.verifyWebhook as any).mockResolvedValue(event)
      ;(prisma.payment.findFirst as any).mockResolvedValue({
        id: 'payment-123',
        bookingId: mockBookingId,
        stripePaymentIntentId: paymentIntentId,
        Booking: {
          ...mockBooking,
          Court: createMockCourt(),
        },
      })
      ;(prisma.booking.update as any).mockResolvedValue({})
      ;(prisma.payment.updateMany as any).mockResolvedValue({ count: 1 })
      ;(prisma.transaction.findFirst as any).mockResolvedValue(null)
      ;(prisma.transaction.create as any).mockResolvedValue({})

      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      expect(prisma.payment.findFirst).toHaveBeenCalledWith({
        where: {
          stripePaymentIntentId: paymentIntentId,
        },
        include: {
          Booking: {
            include: { Court: true },
          },
        },
      })
    })

    it('should not create duplicate transactions', async () => {
      // Arrange
      const paymentIntent: Stripe.PaymentIntent = {
        id: 'pi_123',
        object: 'payment_intent',
        amount: 50000,
        currency: 'mxn',
        status: 'succeeded',
        metadata: {
          clubId: mockClubId,
          bookingId: mockBookingId,
        },
      } as any

      const event = createMockStripeEvent('payment_intent.succeeded', paymentIntent)
      const existingTransaction = {
        id: 'txn-123',
        reference: 'pi_123',
        amount: 50000,
      }

      ;(paymentService.verifyWebhook as any).mockResolvedValue(event)
      ;(prisma.booking.findUnique as any).mockResolvedValue(
        createMockBooking({ id: mockBookingId })
      )
      ;(prisma.booking.update as any).mockResolvedValue({})
      ;(prisma.payment.updateMany as any).mockResolvedValue({ count: 1 })
      ;(prisma.transaction.findFirst as any).mockResolvedValue(existingTransaction)

      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      expect(prisma.transaction.create).not.toHaveBeenCalled()
    })
  })

  describe('payment_intent.payment_failed Event', () => {
    it('should update booking status on failed payment', async () => {
      // Arrange
      const paymentIntent: Stripe.PaymentIntent = {
        id: 'pi_123',
        object: 'payment_intent',
        amount: 50000,
        currency: 'mxn',
        status: 'requires_payment_method',
        last_payment_error: {
          message: 'Card declined',
        },
        metadata: {
          clubId: mockClubId,
          bookingId: mockBookingId,
        },
      } as any

      const event = createMockStripeEvent('payment_intent.payment_failed', paymentIntent)

      ;(paymentService.verifyWebhook as any).mockResolvedValue(event)
      ;(prisma.booking.update as any).mockResolvedValue({
        id: mockBookingId,
        paymentStatus: 'failed',
      })
      ;(prisma.payment.updateMany as any).mockResolvedValue({ count: 1 })

      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: mockBookingId },
        data: {
          paymentStatus: 'failed',
          status: 'PENDING',
        },
      })
    })

    it('should update payment record to failed status', async () => {
      // Arrange
      const paymentIntentId = 'pi_123'
      const paymentIntent: Stripe.PaymentIntent = {
        id: paymentIntentId,
        object: 'payment_intent',
        amount: 50000,
        currency: 'mxn',
        status: 'requires_payment_method',
        metadata: {
          clubId: mockClubId,
          bookingId: mockBookingId,
        },
      } as any

      const event = createMockStripeEvent('payment_intent.payment_failed', paymentIntent)

      ;(paymentService.verifyWebhook as any).mockResolvedValue(event)
      ;(prisma.booking.update as any).mockResolvedValue({})
      ;(prisma.payment.updateMany as any).mockResolvedValue({ count: 1 })

      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      expect(prisma.payment.updateMany).toHaveBeenCalledWith({
        where: {
          bookingId: mockBookingId,
          method: 'STRIPE',
        },
        data: {
          status: 'failed',
        },
      })
    })
  })

  describe('charge.refunded Event', () => {
    it('should handle refund event', async () => {
      // Arrange
      const charge: Stripe.Charge = {
        id: 'ch_123',
        object: 'charge',
        amount: 50000,
        currency: 'mxn',
        refunded: true,
        payment_intent: 'pi_123',
        metadata: {
          clubId: mockClubId,
          bookingId: mockBookingId,
        },
      } as any

      const event = createMockStripeEvent('charge.refunded', charge)

      ;(paymentService.verifyWebhook as any).mockResolvedValue(event)

      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('received', true)
    })
  })

  describe('Unhandled Event Types', () => {
    it('should acknowledge unhandled event types', async () => {
      // Arrange
      const event = createMockStripeEvent('customer.created', {
        id: 'cus_123',
        metadata: { clubId: mockClubId },
      })

      ;(paymentService.verifyWebhook as any).mockResolvedValue(event)

      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('received', true)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid JSON body', async () => {
      // Arrange
      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'invalid-json',
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue('invalid-json')

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      const paymentIntent: Stripe.PaymentIntent = {
        id: 'pi_123',
        object: 'payment_intent',
        amount: 50000,
        currency: 'mxn',
        status: 'succeeded',
        metadata: {
          clubId: mockClubId,
          bookingId: mockBookingId,
        },
      } as any

      const event = createMockStripeEvent('payment_intent.succeeded', paymentIntent)

      ;(paymentService.verifyWebhook as any).mockResolvedValue(event)
      ;(prisma.booking.findUnique as any).mockRejectedValue(
        mockPrismaError('P1001', 'Cannot reach database')
      )

      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      // Webhook returns 200 even on internal errors (Stripe best practice)
      // to prevent Stripe from retrying
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('received', true)
    })

    it('should return 500 on unexpected errors', async () => {
      // Arrange
      ;(paymentService.verifyWebhook as any).mockRejectedValue(
        new Error('Unexpected error')
      )

      const event = createMockStripeEvent('payment_intent.succeeded', {
        metadata: { clubId: mockClubId },
      })
      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Idempotency', () => {
    it('should handle duplicate webhook events idempotently', async () => {
      // Arrange
      const paymentIntent: Stripe.PaymentIntent = {
        id: 'pi_123',
        object: 'payment_intent',
        amount: 50000,
        currency: 'mxn',
        status: 'succeeded',
        metadata: {
          clubId: mockClubId,
          bookingId: mockBookingId,
        },
      } as any

      const mockBooking = createMockBooking({
        id: mockBookingId,
        status: 'CONFIRMED',
        paymentStatus: 'completed', // Already processed
      })

      const event = createMockStripeEvent('payment_intent.succeeded', paymentIntent)

      ;(paymentService.verifyWebhook as any).mockResolvedValue(event)
      ;(prisma.booking.findUnique as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
      })
      ;(prisma.booking.update as any).mockResolvedValue(mockBooking)
      ;(prisma.payment.updateMany as any).mockResolvedValue({ count: 0 }) // No updates
      ;(prisma.transaction.findFirst as any).mockResolvedValue({
        id: 'txn-123',
        reference: 'pi_123',
      })

      const request = createMockNextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: event,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      request.text = vi.fn().mockResolvedValue(JSON.stringify(event))

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      expect(prisma.transaction.create).not.toHaveBeenCalled()
    })
  })
})
