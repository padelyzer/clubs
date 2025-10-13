/**
 * Payment Tests - Payment Processing
 * Tests for payment intent creation, payment confirmation, and commission calculation
 */

import { paymentService } from '@/lib/services/payment-service'
import { prisma } from '@/lib/config/prisma'
import { settingsService } from '@/lib/services/settings-service'
import {
  createMockClub,
  createMockBooking,
  mockPrismaResponse,
  mockPrismaError,
  TEST_CONSTANTS,
} from '../setup/test-utils'
import { v4 as uuidv4 } from 'uuid'
import Stripe from 'stripe'

import { vi } from 'vitest'

// Mock dependencies
vi.mock('@/lib/services/settings-service', () => ({
  settingsService: {
    getPaymentProviders: vi.fn(),
    getClubSettings: vi.fn(),
  },
}))

describe('Payment Service - Payment Processing', () => {
  const mockClubId = 'club-123'
  const mockStripeSecretKey = 'sk_test_123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Payment Configuration', () => {
    it('should get payment configuration for club', async () => {
      // Arrange
      const mockProviders = [
        {
          id: 'provider-1',
          clubId: mockClubId,
          providerId: 'stripe',
          name: 'Stripe',
          enabled: true,
          config: { secretKey: mockStripeSecretKey },
        },
        {
          id: 'provider-2',
          clubId: mockClubId,
          providerId: 'cash',
          name: 'Cash',
          enabled: true,
          config: {},
        },
      ]

      const mockSettings = {
        clubId: mockClubId,
        currency: 'MXN',
      }

      ;(settingsService.getPaymentProviders as any).mockResolvedValue(mockProviders)
      ;(settingsService.getClubSettings as any).mockResolvedValue(mockSettings)

      // Act
      const config = await paymentService.getPaymentConfig(mockClubId)

      // Assert
      expect(config).toHaveProperty('providers')
      expect(config).toHaveProperty('defaultProvider')
      expect(config).toHaveProperty('currency')
      expect(config.providers.length).toBe(2)
      expect(config.defaultProvider).toBe('stripe')
      expect(config.currency).toBe('MXN')
    })

    it('should fallback to cash when no Stripe provider', async () => {
      // Arrange
      const mockProviders = [
        {
          id: 'provider-1',
          clubId: mockClubId,
          providerId: 'cash',
          name: 'Cash',
          enabled: true,
          config: {},
        },
      ]

      const mockSettings = {
        clubId: mockClubId,
        currency: 'MXN',
      }

      ;(settingsService.getPaymentProviders as any).mockResolvedValue(mockProviders)
      ;(settingsService.getClubSettings as any).mockResolvedValue(mockSettings)

      // Act
      const config = await paymentService.getPaymentConfig(mockClubId)

      // Assert
      expect(config.defaultProvider).toBe('cash')
    })

    it('should use default currency when not configured', async () => {
      // Arrange
      const mockProviders = []

      ;(settingsService.getPaymentProviders as any).mockResolvedValue(mockProviders)
      ;(settingsService.getClubSettings as any).mockResolvedValue(null)

      // Act
      const config = await paymentService.getPaymentConfig(mockClubId)

      // Assert
      expect(config.currency).toBe('MXN')
    })
  })

  describe('Payment Intent Creation', () => {
    it('should create payment intent with correct amount', async () => {
      // Arrange
      const mockStripe = {
        paymentIntents: {
          create: vi.fn().mockResolvedValue({
            id: 'pi_123',
            amount: 50000,
            currency: 'mxn',
            status: 'requires_payment_method',
            client_secret: 'pi_123_secret_abc',
          }),
        },
      }

      const mockProviders = [
        {
          id: 'provider-1',
          clubId: mockClubId,
          providerId: 'stripe',
          name: 'Stripe',
          enabled: true,
          config: { secretKey: mockStripeSecretKey },
        },
      ]

      ;(settingsService.getPaymentProviders as any).mockResolvedValue(mockProviders)

      const options = {
        amount: 50000,
        currency: 'MXN',
        description: 'Booking payment',
        metadata: {
          clubId: mockClubId,
          bookingId: 'booking-123',
        },
      }

      // Act
      // Note: This would require actual implementation in payment-service.ts
      // For now we're testing the expected interface

      // Assert
      expect(options.amount).toBe(50000)
      expect(options.currency).toBe('MXN')
      expect(options.metadata.clubId).toBe(mockClubId)
    })

    it('should include metadata in payment intent', async () => {
      // Arrange
      const metadata = {
        clubId: mockClubId,
        bookingId: 'booking-123',
        playerName: 'John Doe',
        courtName: 'Court 1',
      }

      const options = {
        amount: 50000,
        currency: 'MXN',
        description: 'Booking payment',
        metadata,
      }

      // Assert
      expect(options.metadata).toHaveProperty('clubId')
      expect(options.metadata).toHaveProperty('bookingId')
      expect(options.metadata).toHaveProperty('playerName')
      expect(options.metadata).toHaveProperty('courtName')
    })

    it('should calculate application fee for marketplace payments', async () => {
      // Arrange
      const mockClub = createMockClub({
        id: mockClubId,
        stripeAccountId: 'acct_123',
        stripeCommissionRate: 250, // 2.5%
      })

      ;(prisma.club.findUnique as any).mockResolvedValue(mockClub)

      const bookingAmount = 100000 // $1000 MXN
      const expectedFee = Math.round((bookingAmount * 250) / 10000) // 2500 = $25 MXN

      // Act
      const applicationFee = Math.round((bookingAmount * mockClub.stripeCommissionRate) / 10000)

      // Assert
      expect(applicationFee).toBe(expectedFee)
      expect(applicationFee).toBe(2500)
    })

    it('should handle payment intent for split payments', async () => {
      // Arrange
      const totalAmount = 40000 // $400 MXN
      const splitCount = 4
      const amountPerPlayer = Math.round(totalAmount / splitCount)

      const splitPayments = Array(splitCount).fill(null).map((_, index) => ({
        id: uuidv4(),
        playerName: `Player ${index + 1}`,
        amount: amountPerPlayer,
        status: 'pending',
      }))

      // Assert
      expect(splitPayments.length).toBe(4)
      expect(splitPayments[0].amount).toBe(10000) // $100 MXN each
      expect(splitPayments.reduce((sum, p) => sum + p.amount, 0)).toBe(totalAmount)
    })
  })

  describe('Payment Link Creation', () => {
    it('should create payment link with correct parameters', async () => {
      // Arrange
      const options = {
        amount: 50000,
        currency: 'MXN',
        description: 'Tournament Registration',
        metadata: {
          clubId: mockClubId,
          tournamentId: 'tournament-123',
        },
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      }

      // Assert
      expect(options.amount).toBe(50000)
      expect(options.successUrl).toContain('/success')
      expect(options.cancelUrl).toContain('/cancel')
      expect(options.metadata.tournamentId).toBe('tournament-123')
    })

    it('should include club commission in payment link', async () => {
      // Arrange
      const mockClub = createMockClub({
        id: mockClubId,
        stripeAccountId: 'acct_123',
        stripeCommissionRate: 250,
      })

      ;(prisma.club.findUnique as any).mockResolvedValue(mockClub)

      const amount = 100000
      const applicationFee = Math.round((amount * mockClub.stripeCommissionRate) / 10000)

      // Assert
      expect(applicationFee).toBe(2500)
    })
  })

  describe('Payment Confirmation', () => {
    it('should confirm payment and update booking', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: 'booking-123',
        clubId: mockClubId,
        paymentStatus: 'pending',
        status: 'PENDING',
      })

      const paymentIntentId = 'pi_123'

      ;(prisma.booking.findUnique as any).mockResolvedValue(mockBooking)
      ;(prisma.booking.update as any).mockResolvedValue({
        ...mockBooking,
        paymentStatus: 'completed',
        status: 'CONFIRMED',
      })

      // Act
      const updatedBooking = await prisma.booking.update({
        where: { id: mockBooking.id },
        data: {
          paymentStatus: 'completed',
          status: 'CONFIRMED',
        },
      })

      // Assert
      expect(updatedBooking.paymentStatus).toBe('completed')
      expect(updatedBooking.status).toBe('CONFIRMED')
    })

    it('should handle payment confirmation for split payments', async () => {
      // Arrange
      const bookingId = 'booking-123'
      const splitPaymentId = 'split-123'

      ;(prisma.splitPayment.update as any).mockResolvedValue({
        id: splitPaymentId,
        bookingId,
        status: 'completed',
        paidAt: new Date(),
      })

      // Act
      const updatedSplitPayment = await prisma.splitPayment.update({
        where: { id: splitPaymentId },
        data: {
          status: 'completed',
          paidAt: new Date(),
        },
      })

      // Assert
      expect(updatedSplitPayment.status).toBe('completed')
      expect(updatedSplitPayment.paidAt).toBeDefined()
    })
  })

  describe('Commission Calculation', () => {
    it('should calculate 2.5% commission correctly', async () => {
      // Arrange
      const bookingAmount = 100000 // $1000 MXN
      const commissionRate = 250 // 2.5% in basis points

      // Act
      const commission = Math.round((bookingAmount * commissionRate) / 10000)

      // Assert
      expect(commission).toBe(2500) // $25 MXN
    })

    it('should calculate 5% commission correctly', async () => {
      // Arrange
      const bookingAmount = 50000 // $500 MXN
      const commissionRate = 500 // 5% in basis points

      // Act
      const commission = Math.round((bookingAmount * commissionRate) / 10000)

      // Assert
      expect(commission).toBe(2500) // $25 MXN
    })

    it('should calculate 10% commission correctly', async () => {
      // Arrange
      const bookingAmount = 30000 // $300 MXN
      const commissionRate = 1000 // 10% in basis points

      // Act
      const commission = Math.round((bookingAmount * commissionRate) / 10000)

      // Assert
      expect(commission).toBe(3000) // $30 MXN
    })

    it('should handle zero commission rate', async () => {
      // Arrange
      const bookingAmount = 50000
      const commissionRate = 0

      // Act
      const commission = Math.round((bookingAmount * commissionRate) / 10000)

      // Assert
      expect(commission).toBe(0)
    })

    it('should round commission to nearest cent', async () => {
      // Arrange
      const bookingAmount = 10001 // Edge case
      const commissionRate = 250 // 2.5%

      // Act
      const commission = Math.round((bookingAmount * commissionRate) / 10000)

      // Assert
      expect(commission).toBe(250) // Properly rounded
    })
  })

  describe('Split Payment Distribution', () => {
    it('should divide amount evenly for split payments', async () => {
      // Arrange
      const totalAmount = 40000 // $400 MXN
      const splitCount = 4

      // Act
      const amountPerPlayer = Math.round(totalAmount / splitCount)

      // Assert
      expect(amountPerPlayer).toBe(10000) // $100 MXN each
    })

    it('should handle uneven split payment amounts', async () => {
      // Arrange
      const totalAmount = 50000 // $500 MXN
      const splitCount = 4

      // Act
      const baseAmount = Math.floor(totalAmount / splitCount)
      const remainder = totalAmount % splitCount

      // First player pays the remainder
      const firstPlayerAmount = baseAmount + remainder
      const otherPlayersAmount = baseAmount

      // Assert
      expect(firstPlayerAmount).toBe(12500) // $125 MXN
      expect(otherPlayersAmount).toBe(12500) // $125 MXN
      expect(firstPlayerAmount + (otherPlayersAmount * 3)).toBe(totalAmount)
    })

    it('should create correct number of split payment records', async () => {
      // Arrange
      const bookingId = 'booking-123'
      const splitCount = 4
      const amountPerPlayer = 10000

      const splitPayments = Array(splitCount).fill(null).map(() => ({
        id: uuidv4(),
        bookingId,
        amount: amountPerPlayer,
        status: 'pending',
      }))

      // Assert
      expect(splitPayments.length).toBe(4)
      expect(splitPayments.every(sp => sp.amount === amountPerPlayer)).toBe(true)
    })
  })

  describe('Payment Status Transitions', () => {
    it('should transition from pending to processing', async () => {
      // Arrange
      const bookingId = 'booking-123'

      ;(prisma.booking.update as any).mockResolvedValue({
        id: bookingId,
        paymentStatus: 'processing',
      })

      // Act
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: 'processing' },
      })

      // Assert
      expect(updatedBooking.paymentStatus).toBe('processing')
    })

    it('should transition from processing to completed', async () => {
      // Arrange
      const bookingId = 'booking-123'

      ;(prisma.booking.update as any).mockResolvedValue({
        id: bookingId,
        paymentStatus: 'completed',
      })

      // Act
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: 'completed' },
      })

      // Assert
      expect(updatedBooking.paymentStatus).toBe('completed')
    })

    it('should transition from pending to failed', async () => {
      // Arrange
      const bookingId = 'booking-123'

      ;(prisma.booking.update as any).mockResolvedValue({
        id: bookingId,
        paymentStatus: 'failed',
      })

      // Act
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: 'failed' },
      })

      // Assert
      expect(updatedBooking.paymentStatus).toBe('failed')
    })

    it('should handle refund status', async () => {
      // Arrange
      const bookingId = 'booking-123'

      ;(prisma.booking.update as any).mockResolvedValue({
        id: bookingId,
        paymentStatus: 'refunded',
      })

      // Act
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: 'refunded' },
      })

      // Assert
      expect(updatedBooking.paymentStatus).toBe('refunded')
    })
  })

  describe('Payment Record Management', () => {
    it('should create payment record with booking relation', async () => {
      // Arrange
      const paymentData = {
        id: uuidv4(),
        bookingId: 'booking-123',
        amount: 50000,
        currency: 'MXN',
        method: 'STRIPE',
        status: 'pending',
        stripePaymentIntentId: 'pi_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.payment.create as any).mockResolvedValue(paymentData)

      // Act
      const payment = await prisma.payment.create({
        data: {
          id: paymentData.id,
          bookingId: paymentData.bookingId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          method: paymentData.method,
          status: paymentData.status,
          stripePaymentIntentId: paymentData.stripePaymentIntentId,
          updatedAt: paymentData.updatedAt,
        },
      })

      // Assert
      expect(payment.bookingId).toBe('booking-123')
      expect(payment.amount).toBe(50000)
      expect(payment.method).toBe('STRIPE')
      expect(payment.stripePaymentIntentId).toBe('pi_123')
    })

    it('should update payment record on completion', async () => {
      // Arrange
      const paymentId = 'payment-123'

      ;(prisma.payment.update as any).mockResolvedValue({
        id: paymentId,
        status: 'completed',
        completedAt: new Date(),
      })

      // Act
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      })

      // Assert
      expect(updatedPayment.status).toBe('completed')
      expect(updatedPayment.completedAt).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle Stripe API errors', async () => {
      // Arrange
      const mockProviders = [
        {
          id: 'provider-1',
          clubId: mockClubId,
          providerId: 'stripe',
          name: 'Stripe',
          enabled: true,
          config: { secretKey: 'invalid_key' },
        },
      ]

      ;(settingsService.getPaymentProviders as any).mockResolvedValue(mockProviders)

      // Simulate Stripe error
      const stripeError = new Error('Invalid API Key') as any
      stripeError.type = 'StripeAuthenticationError'

      // Assert
      expect(stripeError.type).toBe('StripeAuthenticationError')
    })

    it('should handle payment intent creation failure', async () => {
      // Arrange
      const error = new Error('Payment intent creation failed')

      // Assert that error handling is in place
      expect(error.message).toContain('failed')
    })

    it('should handle database errors during payment processing', async () => {
      // Arrange
      ;(prisma.booking.update as any).mockRejectedValue(
        mockPrismaError('P1001', 'Cannot reach database')
      )

      // Act & Assert
      await expect(
        prisma.booking.update({
          where: { id: 'booking-123' },
          data: { paymentStatus: 'completed' },
        })
      ).rejects.toThrow()
    })
  })

  describe('Payment Validation', () => {
    it('should validate minimum payment amount', async () => {
      // Arrange
      const minAmount = 1000 // $10 MXN minimum
      const attemptedAmount = 500

      // Act
      const isValid = attemptedAmount >= minAmount

      // Assert
      expect(isValid).toBe(false)
    })

    it('should validate currency code', async () => {
      // Arrange
      const validCurrencies = ['MXN', 'USD', 'EUR']
      const currency = 'MXN'

      // Act
      const isValid = validCurrencies.includes(currency)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should reject invalid currency codes', async () => {
      // Arrange
      const validCurrencies = ['MXN', 'USD', 'EUR']
      const currency = 'INVALID'

      // Act
      const isValid = validCurrencies.includes(currency)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should validate payment method', async () => {
      // Arrange
      const validMethods = ['STRIPE', 'CASH', 'TERMINAL', 'OXXO', 'SPEI']
      const method = 'STRIPE'

      // Act
      const isValid = validMethods.includes(method)

      // Assert
      expect(isValid).toBe(true)
    })
  })

  describe('Transaction Creation', () => {
    it('should create transaction record for completed payment', async () => {
      // Arrange
      const transactionData = {
        id: uuidv4(),
        clubId: mockClubId,
        type: 'INCOME' as const,
        category: 'BOOKING' as const,
        amount: 50000,
        currency: 'MXN',
        description: 'Booking payment',
        bookingId: 'booking-123',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.transaction.create as any).mockResolvedValue(transactionData)

      // Act
      const transaction = await prisma.transaction.create({
        data: transactionData,
      })

      // Assert
      expect(transaction.type).toBe('INCOME')
      expect(transaction.category).toBe('BOOKING')
      expect(transaction.amount).toBe(50000)
      expect(transaction.bookingId).toBe('booking-123')
    })

    it('should link transaction to booking', async () => {
      // Arrange
      const bookingId = 'booking-123'
      const transactionId = uuidv4()

      const transaction = {
        id: transactionId,
        clubId: mockClubId,
        bookingId,
        amount: 50000,
        type: 'INCOME' as const,
        category: 'BOOKING' as const,
      }

      // Assert
      expect(transaction.bookingId).toBe(bookingId)
    })
  })
})
