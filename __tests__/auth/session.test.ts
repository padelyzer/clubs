/**
 * Authentication Tests - Session Management
 * Tests for session validation and management
 */

import { GET as getSession } from '@/app/api/auth/session/route'
import { POST as verifySession } from '@/app/api/auth/verify-session/route'
import { validateRequest, lucia } from '@/lib/auth/lucia'
import { prisma } from '@/lib/config/prisma'
import {
  createMockUser,
  createMockSession,
  createMockClub,
  createMockNextRequest,
  mockPrismaResponse,
} from '../setup/test-utils'

import { vi } from 'vitest'

// Mock dependencies
vi.mock('@/lib/auth/lucia', () => ({
  validateRequest: vi.fn(),
  lucia: {
    validateSession: vi.fn(),
    createSession: vi.fn(),
    invalidateSession: vi.fn(),
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(() => []),
  })),
}))

describe('Session Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/auth/session', () => {
    it('should return valid session with user data', async () => {
      // Arrange
      const mockUser = createMockUser({
        role: 'CLUB_OWNER',
        clubId: 'club-123',
      })
      const mockSession = createMockSession({ userId: mockUser.id })

      ;(validateRequest as any).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      })

      // Act
      const response = await getSession()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('authenticated', true)
      expect(data).toHaveProperty('user')
      expect(data).toHaveProperty('session')
      expect(data.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        name: mockUser.name,
      })
      expect(data.session).toMatchObject({
        id: mockSession.id,
        userId: mockUser.id,
      })
    })

    it('should return 200 with authenticated:false when no session exists', async () => {
      // Arrange
      ;(validateRequest as any).mockResolvedValue({
        user: null,
        session: null,
      })

      // Act
      const response = await getSession()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('authenticated', false)
      expect(data.user).toBeNull()
      expect(data.session).toBeNull()
    })

    it('should return user data without club relation', async () => {
      // Arrange
      const mockUser = createMockUser({
        role: 'CLUB_OWNER',
        clubId: 'club-123',
      })
      const mockSession = createMockSession({ userId: mockUser.id })

      ;(validateRequest as any).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      })

      // Act
      const response = await getSession()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('authenticated', true)
      expect(data.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        name: mockUser.name,
      })
      // Route doesn't include club relation
      expect(data.user).not.toHaveProperty('club')
    })

    it('should return SUPER_ADMIN data correctly', async () => {
      // Arrange
      const mockAdmin = createMockUser({
        role: 'SUPER_ADMIN',
        clubId: null,
      })
      const mockSession = createMockSession({ userId: mockAdmin.id })

      ;(validateRequest as any).mockResolvedValue({
        user: mockAdmin,
        session: mockSession,
      })

      // Act
      const response = await getSession()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('authenticated', true)
      expect(data.user.role).toBe('SUPER_ADMIN')
      expect(data.user).toMatchObject({
        id: mockAdmin.id,
        email: mockAdmin.email,
        name: mockAdmin.name,
      })
    })
  })

  describe('POST /api/auth/verify-session', () => {
    it('should verify valid session', async () => {
      // Arrange
      const mockUser = createMockUser()
      const mockSession = createMockSession({ userId: mockUser.id })

      ;(lucia.validateSession as any).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      })

      const request = createMockNextRequest('http://localhost:3000/api/auth/verify-session', {
        method: 'POST',
        body: {
          sessionId: mockSession.id,
        },
      })

      // Act
      const response = await verifySession(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('valid', true)
      expect(data).toHaveProperty('session')
      expect(data).toHaveProperty('user')
      expect(data.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      })
    })

    it('should reject expired session', async () => {
      // Arrange
      const expiredSession = createMockSession({
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      })

      ;(lucia.validateSession as any).mockResolvedValue({
        user: null,
        session: null,
      })

      const request = createMockNextRequest('http://localhost:3000/api/auth/verify-session', {
        method: 'POST',
        body: {
          sessionId: expiredSession.id,
        },
      })

      // Act
      const response = await verifySession(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('valid', false)
      expect(data).toHaveProperty('error')
    })

    it('should reject missing sessionId', async () => {
      // Arrange
      const request = createMockNextRequest('http://localhost:3000/api/auth/verify-session', {
        method: 'POST',
        body: {}, // No sessionId provided
      })

      // Act
      const response = await verifySession(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('valid', false)
      expect(data).toHaveProperty('error', 'No session ID provided')
    })
  })

  describe('Session Refresh', () => {
    it('should return session with expiration time', async () => {
      // Arrange
      const mockUser = createMockUser()
      const expiringSession = createMockSession({
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      })

      ;(validateRequest as any).mockResolvedValue({
        user: mockUser,
        session: expiringSession,
      })

      // Act
      const response = await getSession()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('authenticated', true)
      expect(data.session).toHaveProperty('expiresAt')
      // Session should be valid
      expect(new Date(data.session.expiresAt) > new Date()).toBe(true)
    })
  })

  describe('Session Security', () => {
    it('should handle errors gracefully', async () => {
      // Arrange
      ;(validateRequest as any).mockRejectedValue(
        new Error('Database connection error')
      )

      // Act
      const response = await getSession()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('should return unauthenticated for deleted user', async () => {
      // Arrange
      ;(validateRequest as any).mockResolvedValue({
        user: null,
        session: null,
      })

      // Act
      const response = await getSession()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('authenticated', false)
      expect(data.user).toBeNull()
    })

    it('should return session for inactive user (route does not validate active status)', async () => {
      // Arrange
      const mockUser = createMockUser({ active: false })
      const mockSession = createMockSession({ userId: mockUser.id })

      ;(validateRequest as any).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      })

      // Act
      const response = await getSession()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('authenticated', true)
      expect(data.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
      })
      // Note: Route doesn't check active status
    })
  })

  describe('Multi-Device Sessions', () => {
    it('should return different sessions for different requests', async () => {
      // Arrange
      const mockUser = createMockUser()
      const session1 = createMockSession({ userId: mockUser.id, id: 'session-1' })
      const session2 = createMockSession({ userId: mockUser.id, id: 'session-2' })

      // First request
      ;(validateRequest as any).mockResolvedValueOnce({
        user: mockUser,
        session: session1,
      })

      const response1 = await getSession()
      const data1 = await response1.json()

      // Second request
      ;(validateRequest as any).mockResolvedValueOnce({
        user: mockUser,
        session: session2,
      })

      const response2 = await getSession()
      const data2 = await response2.json()

      // Assert
      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(data1.session.id).not.toBe(data2.session.id)
      expect(data1.user.id).toBe(data2.user.id)
    })
  })

  describe('Session Metadata', () => {
    it('should include session expiration timestamp', async () => {
      // Arrange
      const mockUser = createMockUser()
      const mockSession = createMockSession({ userId: mockUser.id })

      ;(validateRequest as any).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      })

      // Act
      const response = await getSession()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('authenticated', true)
      expect(data.session).toHaveProperty('expiresAt')
      expect(data.session).toHaveProperty('id')
      expect(data.session).toHaveProperty('userId')
    })
  })
})
