/**
 * Test Utilities for Padelyzer
 * Common helpers and fixtures for testing
 */

import { v4 as uuidv4 } from 'uuid'
import type { User, Club, Court, Booking, Session } from '@prisma/client'

// Mock User Factory
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: uuidv4(),
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: new Date(),
  image: null,
  password: '$2a$10$hashedPasswordExample',
  role: 'CLUB_OWNER',
  clubId: uuidv4(),
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Mock Club Factory
export const createMockClub = (overrides?: Partial<Club>): Club => ({
  id: uuidv4(),
  name: 'Test Club',
  slug: 'test-club',
  email: 'club@example.com',
  phone: '1234567890',
  address: '123 Test St',
  city: 'Test City',
  state: 'Puebla',
  country: 'Mexico',
  postalCode: '12345',
  website: 'https://testclub.com',
  logo: null,
  description: 'Test club description',
  status: 'APPROVED',
  active: true,
  stripeAccountId: null,
  stripeOnboardingCompleted: false,
  stripePayoutsEnabled: false,
  stripeChargesEnabled: false,
  stripeDetailsSubmitted: false,
  stripeRequirements: null,
  stripeCommissionRate: 250,
  createdAt: new Date(),
  updatedAt: new Date(),
  approvedAt: new Date(),
  approvedBy: null,
  whatsappNumber: null,
  initialSetupCompleted: true,
  initialSetupCompletedAt: new Date(),
  ...overrides,
})

// Mock Court Factory
export const createMockCourt = (overrides?: Partial<Court>): Court => ({
  id: uuidv4(),
  clubId: uuidv4(),
  name: 'Court 1',
  type: 'PADEL',
  indoor: false,
  order: 1,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Mock Booking Factory
export const createMockBooking = (overrides?: Partial<Booking>): Booking => ({
  id: uuidv4(),
  clubId: uuidv4(),
  courtId: uuidv4(),
  date: new Date(),
  startTime: '09:00',
  endTime: '10:30',
  duration: 90,
  playerId: null,
  playerName: 'Test Player',
  playerEmail: 'player@example.com',
  playerPhone: '1234567890',
  totalPlayers: 4,
  price: 50000,
  amount: 50000,
  currency: 'MXN',
  paymentStatus: 'pending',
  paymentType: 'ONSITE',
  status: 'PENDING',
  checkedIn: false,
  checkedInAt: null,
  checkedInBy: null,
  splitPaymentEnabled: false,
  splitPaymentCount: 4,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  cancelledAt: null,
  bookingGroupId: null,
  ...overrides,
})

// Mock Session Factory
export const createMockSession = (overrides?: Partial<Session>): Session => ({
  id: uuidv4(),
  userId: uuidv4(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  ...overrides,
})

// Test Data Constants
export const TEST_CONSTANTS = {
  ADMIN_EMAIL: 'admin@padelyzer.com',
  CLUB_OWNER_EMAIL: 'owner@testclub.com',
  CLUB_STAFF_EMAIL: 'staff@testclub.com',
  USER_EMAIL: 'user@example.com',
  TEST_PHONE: '+525512345678',
  TEST_PASSWORD: 'TestPassword123!',
  STRIPE_TEST_TOKEN: 'tok_visa',
  STRIPE_TEST_PAYMENT_INTENT: 'pi_test_123456789',
} as const

// Helper: Create authenticated request context
export const createAuthContext = (user: Partial<User> = {}) => {
  const mockUser = createMockUser(user)
  return {
    user: mockUser,
    session: createMockSession({ userId: mockUser.id }),
  }
}

// Helper: Create booking availability slot
export const createTimeSlot = (startTime: string, endTime: string, available = true) => ({
  startTime,
  endTime,
  available,
  bookings: [] as any[],
})

// Helper: Generate date range
export const getDateRange = (daysFromNow: number) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date
}

// Helper: Mock Prisma response
export const mockPrismaResponse = <T>(data: T) => {
  return Promise.resolve(data)
}

// Helper: Mock Prisma error
export const mockPrismaError = (code: string, message: string) => {
  const error = new Error(message) as any
  error.code = code
  return Promise.reject(error)
}

// Helper: Wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper: Create mock NextRequest
export const createMockNextRequest = (
  url: string,
  options: {
    method?: string
    body?: any
    headers?: Record<string, string>
    cookies?: Record<string, string>
  } = {}
) => {
  const { method = 'GET', body, headers = {}, cookies = {} } = options

  return {
    url,
    method,
    json: async () => body,
    headers: new Headers(headers),
    cookies: {
      get: (name: string) => cookies[name] ? { value: cookies[name] } : undefined,
      getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
    },
  } as any
}

// Helper: Create mock NextResponse
export const mockNextResponse = {
  json: (data: any, init?: { status?: number }) => ({
    json: async () => data,
    status: init?.status || 200,
    ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
  }),
}

// Helper: Validate UUID
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Helper: Generate mock Stripe event
export const createMockStripeEvent = (type: string, data: any) => ({
  id: `evt_${uuidv4()}`,
  object: 'event',
  type,
  data: {
    object: data,
  },
  created: Math.floor(Date.now() / 1000),
  livemode: false,
})
