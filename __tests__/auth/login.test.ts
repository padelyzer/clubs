/**
 * Authentication Tests - Login
 * Tests for user login functionality
 */

import { POST } from '@/app/api/auth/login/route'
import { prisma } from '@/lib/config/prisma'
import { lucia } from '@/lib/auth/lucia'
import {
  createMockUser,
  createMockNextRequest,
  TEST_CONSTANTS,
  mockPrismaResponse,
  mockPrismaError
} from '../setup/test-utils'
import bcrypt from 'bcryptjs'

import { vi } from 'vitest'

// Mock dependencies
vi.mock('@/lib/auth/lucia')
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  })),
}))

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Successful Login', () => {
    it('should login successfully with correct credentials', async () => {
      // Arrange
      const mockUser = createMockUser({
        email: TEST_CONSTANTS.CLUB_OWNER_EMAIL,
        role: 'CLUB_OWNER',
        clubId: 'club-123',
        active: true,
      })

      const mockSession = {
        id: 'session-123',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }

      ;(prisma.user.findUnique as any).mockResolvedValue(mockUser)
      ;(bcrypt.compare as any).mockResolvedValue(true) // Password matches
      ;(lucia.createSession as any).mockResolvedValue(mockSession)
      ;(lucia.createSessionCookie as any).mockReturnValue({
        name: 'auth_session',
        value: 'session-cookie-value',
        attributes: {},
      })

      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: {
          email: TEST_CONSTANTS.CLUB_OWNER_EMAIL,
          password: TEST_CONSTANTS.TEST_PASSWORD,
        },
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('user')
      expect(data.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        clubId: mockUser.clubId,
      })
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: TEST_CONSTANTS.CLUB_OWNER_EMAIL },
        include: {
          Club: {
            select: {
              id: true,
              name: true,
              slug: true,
              initialSetupCompleted: true,
            },
          },
        },
      })
    })

    it('should login SUPER_ADMIN without clubId requirement', async () => {
      // Arrange
      const mockAdmin = createMockUser({
        email: TEST_CONSTANTS.ADMIN_EMAIL,
        role: 'SUPER_ADMIN',
        clubId: null,
        active: true,
      })

      ;(prisma.user.findUnique as any).mockResolvedValue(mockAdmin)
      ;(bcrypt.compare as any).mockResolvedValue(true) // Password matches
      ;(lucia.createSession as any).mockResolvedValue({
        id: 'admin-session',
        userId: mockAdmin.id,
        expiresAt: new Date(),
      })
      ;(lucia.createSessionCookie as any).mockReturnValue({
        name: 'auth_session',
        value: 'session-cookie-value',
        attributes: {},
      })

      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: {
          email: TEST_CONSTANTS.ADMIN_EMAIL,
          password: TEST_CONSTANTS.TEST_PASSWORD,
        },
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.user.role).toBe('SUPER_ADMIN')
      expect(data.user.clubId).toBeNull()
    })
  })

  describe('Failed Login - Invalid Credentials', () => {
    it('should reject login with incorrect password', async () => {
      // Arrange
      const mockUser = createMockUser({
        email: TEST_CONSTANTS.CLUB_OWNER_EMAIL,
        password: '$2a$10$fake.hash.correct-password',
      })

      ;(prisma.user.findUnique as any).mockResolvedValue(mockUser)
      ;(bcrypt.compare as any).mockResolvedValue(false) // Password doesn't match

      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: {
          email: TEST_CONSTANTS.CLUB_OWNER_EMAIL,
          password: 'wrong-password',
        },
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error', 'Email o contraseña incorrectos')
      expect(lucia.createSession).not.toHaveBeenCalled()
    })

    it('should reject login with non-existent email', async () => {
      // Arrange
      ;(prisma.user.findUnique as any).mockResolvedValue(null)

      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: {
          email: 'nonexistent@example.com',
          password: TEST_CONSTANTS.TEST_PASSWORD,
        },
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error', 'Email o contraseña incorrectos')
    })
  })

  describe('Failed Login - Inactive User', () => {
    it('should reject login for inactive user', async () => {
      // Arrange
      const mockUser = createMockUser({
        email: TEST_CONSTANTS.CLUB_OWNER_EMAIL,
        active: false,
      })

      ;(prisma.user.findUnique as any).mockResolvedValue(mockUser)

      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: {
          email: TEST_CONSTANTS.CLUB_OWNER_EMAIL,
          password: TEST_CONSTANTS.TEST_PASSWORD,
        },
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Failed Login - Missing Club', () => {
    it('should reject CLUB_OWNER without clubId', async () => {
      // Arrange
      const mockUser = createMockUser({
        email: TEST_CONSTANTS.CLUB_OWNER_EMAIL,
        role: 'CLUB_OWNER',
        clubId: null,
        active: true,
      })

      ;(prisma.user.findUnique as any).mockResolvedValue(mockUser)

      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: {
          email: TEST_CONSTANTS.CLUB_OWNER_EMAIL,
          password: TEST_CONSTANTS.TEST_PASSWORD,
        },
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Validation Errors', () => {
    it('should reject login with invalid email format', async () => {
      // Arrange
      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: {
          email: 'invalid-email',
          password: TEST_CONSTANTS.TEST_PASSWORD,
        },
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject login with missing password', async () => {
      // Arrange
      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: {
          email: TEST_CONSTANTS.CLUB_OWNER_EMAIL,
        },
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject login with empty request body', async () => {
      // Arrange
      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: {},
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Database Errors', () => {
    it('should handle database connection errors gracefully', async () => {
      // Arrange
      ;(prisma.user.findUnique as any).mockRejectedValue(
        mockPrismaError('P1001', 'Cannot reach database server')
      )

      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: {
          email: TEST_CONSTANTS.CLUB_OWNER_EMAIL,
          password: TEST_CONSTANTS.TEST_PASSWORD,
        },
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Rate Limiting', () => {
    it('should handle multiple login attempts correctly', async () => {
      // Arrange
      const mockUser = createMockUser({
        email: TEST_CONSTANTS.CLUB_OWNER_EMAIL,
        active: true,
      })

      ;(prisma.user.findUnique as any).mockResolvedValue(mockUser)
      ;(bcrypt.compare as any).mockResolvedValue(true) // Password matches
      ;(lucia.createSession as any).mockResolvedValue({
        id: 'session-123',
        userId: mockUser.id,
        expiresAt: new Date(),
      })
      ;(lucia.createSessionCookie as any).mockReturnValue({
        name: 'auth_session',
        value: 'session-cookie-value',
        attributes: {},
      })

      // Act - Make 3 sequential login attempts
      const requests = Array(3).fill(null).map(() =>
        createMockNextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: {
            email: TEST_CONSTANTS.CLUB_OWNER_EMAIL,
            password: TEST_CONSTANTS.TEST_PASSWORD,
          },
        })
      )

      const responses = await Promise.all(requests.map(req => POST(req)))

      // Assert - All should succeed (rate limiting is separate middleware)
      responses.forEach(response => {
        expect(response.status).toBeLessThan(400)
      })
    })
  })
})
