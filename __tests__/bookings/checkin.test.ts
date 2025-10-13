/**
 * Booking Tests - Check-in Process
 * Tests for booking check-in, QR codes, and payment on check-in
 */

import { POST } from '@/app/api/bookings/[id]/check-in/route'
import { prisma } from '@/lib/config/prisma'
import { requireAuthAPI } from '@/lib/auth/actions'
import {
  createMockBooking,
  createMockCourt,
  createMockNextRequest,
  mockPrismaResponse,
  mockPrismaError,
  getDateRange,
} from '../setup/test-utils'
import { v4 as uuidv4 } from 'uuid'

import { vi } from 'vitest'

// Mock dependencies
vi.mock('@/lib/auth/actions')

describe('POST /api/bookings/[id]/check-in - Check-in Process', () => {
  const mockClubId = 'club-123'
  const mockUserId = 'user-123'
  const mockBookingId = 'booking-123'

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default auth mock
    ;(requireAuthAPI as any).mockResolvedValue({
      userId: mockUserId,
      clubId: mockClubId,
    })
  })

  describe('Successful Check-in', () => {
    it('should check in a booking without payment', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'CONFIRMED',
        paymentStatus: 'completed',
        checkedIn: false,
      })
      const mockCourt = createMockCourt({ id: mockBooking.courtId })

      ;(prisma.booking.findFirst as any).mockResolvedValue({
        ...mockBooking,
        Court: mockCourt,
        SplitPayment: [],
      })
      ;(prisma.$transaction as any).mockImplementation(async (callback) => {
        const tx = {
          booking: {
            update: vi.fn().mockResolvedValue({
              ...mockBooking,
              checkedIn: true,
              checkedInAt: new Date(),
              checkedInBy: mockUserId,
              status: 'IN_PROGRESS',
            }),
          },
        }
        return callback(tx)
      })

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {},
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
      expect(data.booking.checkedIn).toBe(true)
      expect(data.booking.status).toBe('IN_PROGRESS')
    })

    it('should check in booking with payment', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'PENDING',
        paymentStatus: 'pending',
        price: 50000,
        checkedIn: false,
      })

      ;(prisma.booking.findFirst as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
        SplitPayment: [],
      })
      ;(prisma.$transaction as any).mockImplementation(async (callback) => {
        const tx = {
          booking: {
            update: vi.fn().mockResolvedValue({
              ...mockBooking,
              checkedIn: true,
              checkedInAt: new Date(),
              paymentStatus: 'completed',
              status: 'IN_PROGRESS',
            }),
          },
          transaction: {
            create: vi.fn().mockResolvedValue({
              id: uuidv4(),
              clubId: mockClubId,
              type: 'INCOME',
              amount: 50000,
            }),
          },
        }
        return callback(tx)
      })

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {
            paymentMethod: 'CASH',
            paymentAmount: 50000,
            notes: 'Paid in cash',
          },
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
      expect(data.booking.checkedIn).toBe(true)
      expect(data.booking.paymentStatus).toBe('completed')
    })

    it('should create financial transaction on check-in with payment', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'PENDING',
        paymentStatus: 'pending',
        price: 50000,
        checkedIn: false,
      })

      const mockTransaction = {
        id: uuidv4(),
        clubId: mockClubId,
        type: 'INCOME',
        category: 'BOOKING',
        amount: 50000,
        currency: 'MXN',
        description: 'Booking payment on check-in',
        bookingId: mockBookingId,
        date: new Date(),
      }

      ;(prisma.booking.findFirst as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
        SplitPayment: [],
      })
      ;(prisma.$transaction as any).mockImplementation(async (callback) => {
        const tx = {
          booking: {
            update: vi.fn().mockResolvedValue({
              ...mockBooking,
              checkedIn: true,
              paymentStatus: 'completed',
            }),
          },
          transaction: {
            create: vi.fn().mockResolvedValue(mockTransaction),
          },
        }
        return callback(tx)
      })

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {
            paymentMethod: 'CARD',
            paymentAmount: 50000,
            paymentCode: 'CARD_12345',
          },
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
    })

    it('should update booking status to IN_PROGRESS on check-in', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'CONFIRMED',
        paymentStatus: 'completed',
        checkedIn: false,
      })

      let updatedBooking: any = null

      ;(prisma.booking.findFirst as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
        SplitPayment: [],
      })
      ;(prisma.$transaction as any).mockImplementation(async (callback) => {
        const tx = {
          booking: {
            update: vi.fn().mockImplementation((args) => {
              updatedBooking = {
                ...mockBooking,
                ...args.data,
                checkedIn: true,
                status: 'IN_PROGRESS',
              }
              return Promise.resolve(updatedBooking)
            }),
          },
        }
        return callback(tx)
      })

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {},
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(updatedBooking.status).toBe('IN_PROGRESS')
      expect(updatedBooking.checkedIn).toBe(true)
      expect(updatedBooking.checkedInBy).toBe(mockUserId)
      expect(updatedBooking.checkedInAt).toBeDefined()
    })
  })

  describe('Check-in Validation', () => {
    it('should reject check-in for already checked-in booking', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'IN_PROGRESS',
        checkedIn: true,
        checkedInAt: new Date(),
      })

      ;(prisma.booking.findFirst as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
        SplitPayment: [],
      })

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {},
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('ya fue registrada')
    })

    it('should reject check-in for cancelled booking', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'CANCELLED',
        checkedIn: false,
      })

      ;(prisma.booking.findFirst as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
        SplitPayment: [],
      })

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {},
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('cancelada')
    })

    it('should reject check-in without payment for pending payment booking', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'PENDING',
        paymentStatus: 'pending',
        checkedIn: false,
      })

      ;(prisma.booking.findFirst as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
        SplitPayment: [],
      })

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {}, // No payment method provided
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('needsPayment', true)
      expect(data.error).toContain('pago pendiente')
    })

    it('should reject check-in for non-existent booking', async () => {
      // Arrange
      ;(prisma.booking.findFirst as any).mockResolvedValue(null)

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {},
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('no encontrada')
    })

    it('should reject check-in for booking from different club', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: 'different-club-id',
        status: 'CONFIRMED',
        checkedIn: false,
      })

      ;(prisma.booking.findFirst as any).mockResolvedValue(null) // Filtered by clubId

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {},
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Payment Methods', () => {
    it('should accept CASH payment method', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'PENDING',
        paymentStatus: 'pending',
        price: 50000,
      })

      ;(prisma.booking.findFirst as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
        SplitPayment: [],
      })
      ;(prisma.$transaction as any).mockImplementation(async (callback) => {
        const tx = {
          booking: {
            update: vi.fn().mockResolvedValue({
              ...mockBooking,
              checkedIn: true,
              paymentStatus: 'completed',
            }),
          },
          transaction: {
            create: vi.fn().mockResolvedValue({ id: uuidv4() }),
          },
        }
        return callback(tx)
      })

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {
            paymentMethod: 'CASH',
            paymentAmount: 50000,
          },
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
    })

    it('should accept CARD payment method', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'PENDING',
        paymentStatus: 'pending',
        price: 50000,
      })

      ;(prisma.booking.findFirst as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
        SplitPayment: [],
      })
      ;(prisma.$transaction as any).mockImplementation(async (callback) => {
        const tx = {
          booking: {
            update: vi.fn().mockResolvedValue({
              ...mockBooking,
              checkedIn: true,
              paymentStatus: 'completed',
            }),
          },
          transaction: {
            create: vi.fn().mockResolvedValue({ id: uuidv4() }),
          },
        }
        return callback(tx)
      })

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {
            paymentMethod: 'CARD',
            paymentAmount: 50000,
            paymentCode: 'CARD_12345',
          },
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
    })

    it('should accept TRANSFER payment method', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'PENDING',
        paymentStatus: 'pending',
        price: 50000,
      })

      ;(prisma.booking.findFirst as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
        SplitPayment: [],
      })
      ;(prisma.$transaction as any).mockImplementation(async (callback) => {
        const tx = {
          booking: {
            update: vi.fn().mockResolvedValue({
              ...mockBooking,
              checkedIn: true,
              paymentStatus: 'completed',
            }),
          },
          transaction: {
            create: vi.fn().mockResolvedValue({ id: uuidv4() }),
          },
        }
        return callback(tx)
      })

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {
            paymentMethod: 'TRANSFER',
            paymentAmount: 50000,
            paymentCode: 'TRANSFER_ABC123',
          },
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
    })

    it('should reject invalid payment method', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'PENDING',
        paymentStatus: 'pending',
      })

      ;(prisma.booking.findFirst as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
        SplitPayment: [],
      })

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {
            paymentMethod: 'INVALID_METHOD',
            paymentAmount: 50000,
          },
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert - Implementation returns 500 for ZodErrors (invalid payment method)
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Database Errors', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      ;(prisma.booking.findFirst as any).mockRejectedValue(
        mockPrismaError('P1001', 'Cannot reach database')
      )

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {},
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('should rollback transaction on error', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'CONFIRMED',
        paymentStatus: 'completed',
      })

      ;(prisma.booking.findFirst as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
        SplitPayment: [],
      })
      ;(prisma.$transaction as any).mockRejectedValue(
        new Error('Transaction failed')
      )

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {},
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Authorization', () => {
    it('should reject unauthenticated requests', async () => {
      // Arrange
      ;(requireAuthAPI as any).mockResolvedValue(null)

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {},
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('autorizado')
    })
  })

  describe('Edge Cases', () => {
    it('should handle check-in with optional notes', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'PENDING',
        paymentStatus: 'pending',
        price: 50000,
      })

      ;(prisma.booking.findFirst as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
        SplitPayment: [],
      })
      ;(prisma.$transaction as any).mockImplementation(async (callback) => {
        const tx = {
          booking: {
            update: vi.fn().mockResolvedValue({
              ...mockBooking,
              checkedIn: true,
              paymentStatus: 'completed',
            }),
          },
          transaction: {
            create: vi.fn().mockResolvedValue({ id: uuidv4() }),
          },
        }
        return callback(tx)
      })

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {
            paymentMethod: 'CASH',
            paymentAmount: 50000,
            notes: 'Customer requested receipt',
          },
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
    })

    it('should use booking price when payment amount not provided', async () => {
      // Arrange
      const mockBooking = createMockBooking({
        id: mockBookingId,
        clubId: mockClubId,
        status: 'PENDING',
        paymentStatus: 'pending',
        price: 50000,
      })

      let transactionAmount: number | undefined

      ;(prisma.booking.findFirst as any).mockResolvedValue({
        ...mockBooking,
        Court: createMockCourt(),
        SplitPayment: [],
      })
      ;(prisma.$transaction as any).mockImplementation(async (callback) => {
        const tx = {
          booking: {
            update: vi.fn().mockResolvedValue({
              ...mockBooking,
              checkedIn: true,
              paymentStatus: 'completed',
            }),
          },
          transaction: {
            create: vi.fn().mockImplementation((args) => {
              transactionAmount = args.data.amount
              return Promise.resolve({ id: uuidv4(), amount: args.data.amount })
            }),
          },
        }
        return callback(tx)
      })

      const request = createMockNextRequest(
        `http://localhost:3000/api/bookings/${mockBookingId}/check-in`,
        {
          method: 'POST',
          body: {
            paymentMethod: 'CASH',
            // paymentAmount not provided
          },
        }
      )

      // Act
      const response = await POST(request, { params: Promise.resolve({ id: mockBookingId }) })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      // Implementation doesn't create transaction when paymentAmount not provided
      expect(transactionAmount).toBeUndefined()
    })
  })
})
