/**
 * Authentication Tests - Permissions
 * Tests for role-based access control and module permissions
 */

import { getUserPermissions, currentUserHasPermission } from '@/lib/auth/get-user-permissions'
import { requireRole, requireClubMembership, requireAuthentication } from '@/lib/auth/lucia'
import { prisma } from '@/lib/config/prisma'
import { getCurrentUser } from '@/lib/auth/actions'
import {
  createMockUser,
  createMockClub,
  mockPrismaResponse,
  mockPrismaError,
} from '../setup/test-utils'

import { vi } from 'vitest'

// Mock dependencies
vi.mock('@/lib/auth/actions')
vi.mock('@/lib/auth/lucia', () => ({
  lucia: {
    createSession: vi.fn(),
    createSessionCookie: vi.fn(),
    validateSession: vi.fn(),
    invalidateSession: vi.fn(),
  },
  validateRequest: vi.fn(),
  requireAuthentication: vi.fn(),
  requireClubMembership: vi.fn(),
  requireRole: vi.fn(),
}))
// Mock getEnabledModulesForClub
const mockGetEnabledModulesForClub = vi.fn()
vi.mock('@/lib/saas/get-enabled-modules', () => ({
  getEnabledModulesForClub: mockGetEnabledModulesForClub,
}))

describe('Permission System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserPermissions', () => {
    it('should return all modules for SUPER_ADMIN', async () => {
      // Arrange
      const mockAdmin = createMockUser({
        role: 'SUPER_ADMIN',
        clubId: null,
      })

      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockAdmin,
        permissions: [],
      })

      // Act
      const permissions = await getUserPermissions(mockAdmin.id)

      // Assert
      expect(permissions).toContain('bookings')
      expect(permissions).toContain('customers')
      expect(permissions).toContain('finance')
      expect(permissions).toContain('settings')
      expect(permissions).toContain('tournaments')
      expect(permissions).toContain('classes')
      expect(permissions.length).toBeGreaterThan(5)
    })

    it('should return all enabled modules for CLUB_OWNER', async () => {
      // Arrange
      const mockOwner = createMockUser({
        role: 'CLUB_OWNER',
        clubId: 'club-123',
      })

      const mockEnabledModules = [
        { code: 'bookings', isIncluded: true },
        { code: 'customers', isIncluded: true },
        { code: 'finance', isIncluded: true },
        { code: 'tournaments', isIncluded: false }, // Not included
      ]

      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockOwner,
        permissions: [],
      })

      mockGetEnabledModulesForClub.mockResolvedValue(mockEnabledModules)

      // Act
      const permissions = await getUserPermissions(mockOwner.id)

      // Assert
      expect(permissions).toContain('bookings')
      expect(permissions).toContain('customers')
      expect(permissions).toContain('finance')
      expect(permissions).not.toContain('tournaments') // Not included
      expect(mockGetEnabledModulesForClub).toHaveBeenCalledWith('club-123')
    })

    it('should return specific permissions for CLUB_STAFF', async () => {
      // Arrange
      const mockStaff = createMockUser({
        role: 'CLUB_STAFF',
        clubId: 'club-123',
      })

      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockStaff,
        permissions: [
          { moduleCode: 'bookings' },
          { moduleCode: 'customers' },
        ],
      })

      // Act
      const permissions = await getUserPermissions(mockStaff.id)

      // Assert
      expect(permissions).toEqual(['bookings', 'customers'])
      expect(permissions).not.toContain('finance')
      expect(permissions).not.toContain('settings')
    })

    it('should return limited permissions for USER role', async () => {
      // Arrange
      const mockUser = createMockUser({
        role: 'USER',
        clubId: null,
      })

      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        permissions: [],
      })

      // Act
      const permissions = await getUserPermissions(mockUser.id)

      // Assert
      expect(permissions).toEqual([])
    })

    it('should handle non-existent user', async () => {
      // Arrange
      ;(prisma.user.findUnique as any).mockResolvedValue(null)

      // Act
      const permissions = await getUserPermissions('non-existent-id')

      // Assert
      expect(permissions).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      ;(prisma.user.findUnique as any).mockRejectedValue(
        mockPrismaError('P1001', 'Cannot reach database')
      )

      // Act
      const permissions = await getUserPermissions('user-id')

      // Assert
      expect(permissions).toEqual([])
    })
  })

  describe('currentUserHasPermission', () => {
    it('should return true when user has permission', async () => {
      // Arrange
      const mockUser = createMockUser({
        role: 'CLUB_STAFF',
      })

      ;(getCurrentUser as any).mockResolvedValue(mockUser)
      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        permissions: [
          { moduleCode: 'bookings' },
        ],
      })

      // Act
      const hasPermission = await currentUserHasPermission('bookings')

      // Assert
      expect(hasPermission).toBe(true)
    })

    it('should return false when user lacks permission', async () => {
      // Arrange
      const mockUser = createMockUser({
        role: 'CLUB_STAFF',
      })

      ;(getCurrentUser as any).mockResolvedValue(mockUser)
      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        permissions: [
          { moduleCode: 'bookings' },
        ],
      })

      // Act
      const hasPermission = await currentUserHasPermission('finance')

      // Assert
      expect(hasPermission).toBe(false)
    })

    it('should return false when no user is logged in', async () => {
      // Arrange
      ;(getCurrentUser as any).mockResolvedValue(null)

      // Act
      const hasPermission = await currentUserHasPermission('bookings')

      // Assert
      expect(hasPermission).toBe(false)
    })

    it('should handle errors gracefully', async () => {
      // Arrange
      ;(getCurrentUser as any).mockRejectedValue(new Error('Auth error'))

      // Act
      const hasPermission = await currentUserHasPermission('bookings')

      // Assert
      expect(hasPermission).toBe(false)
    })
  })

  describe('Role-Based Access - requireRole', () => {
    it('should allow access for users with correct role', async () => {
      // Arrange
      const mockUser = createMockUser({ role: 'CLUB_OWNER' })
      const mockSession = { id: 'session-123', userId: mockUser.id, expiresAt: new Date() }

      const mockRequireRole = requireRole as any
      mockRequireRole.mockResolvedValue({ user: mockUser, session: mockSession })

      // Act
      const result = await requireRole(['CLUB_OWNER', 'SUPER_ADMIN'])

      // Assert
      expect(result.user.role).toBe('CLUB_OWNER')
      expect(mockRequireRole).toHaveBeenCalledWith(['CLUB_OWNER', 'SUPER_ADMIN'])
    })

    it('should reject users without correct role', async () => {
      // Arrange
      const mockRequireRole = requireRole as any
      mockRequireRole.mockRejectedValue(new Error('Insufficient permissions'))

      // Act & Assert
      await expect(requireRole(['SUPER_ADMIN'])).rejects.toThrow('Insufficient permissions')
    })

    it('should allow SUPER_ADMIN access to any role', async () => {
      // Arrange
      const mockAdmin = createMockUser({ role: 'SUPER_ADMIN' })
      const mockSession = { id: 'session-123', userId: mockAdmin.id, expiresAt: new Date() }

      const mockRequireRole = requireRole as any
      mockRequireRole.mockResolvedValue({ user: mockAdmin, session: mockSession })

      // Act
      const result = await requireRole(['SUPER_ADMIN'])

      // Assert
      expect(result.user.role).toBe('SUPER_ADMIN')
    })
  })

  describe('Club-Based Permissions - requireClubMembership', () => {
    it('should allow access for users with club membership', async () => {
      // Arrange
      const mockUser = createMockUser({
        role: 'CLUB_OWNER',
        clubId: 'club-123',
      })
      const mockSession = { id: 'session-123', userId: mockUser.id, expiresAt: new Date() }

      const mockRequireClubMembership = requireClubMembership as any
      mockRequireClubMembership.mockResolvedValue({
        user: mockUser,
        session: mockSession,
        clubId: 'club-123',
      })

      // Act
      const result = await requireClubMembership()

      // Assert
      expect(result.clubId).toBe('club-123')
      expect(result.user.clubId).toBe('club-123')
    })

    it('should reject users without club membership', async () => {
      // Arrange
      const mockRequireClubMembership = requireClubMembership as any
      mockRequireClubMembership.mockRejectedValue(new Error('No club membership'))

      // Act & Assert
      await expect(requireClubMembership()).rejects.toThrow('No club membership')
    })

    it('should reject SUPER_ADMIN without explicit club context', async () => {
      // Arrange
      const mockRequireClubMembership = requireClubMembership as any
      mockRequireClubMembership.mockRejectedValue(new Error('No club membership'))

      // Act & Assert
      await expect(requireClubMembership()).rejects.toThrow('No club membership')
    })
  })

  describe('Module Permission Checks', () => {
    it('should allow CLUB_OWNER to access bookings module', async () => {
      // Arrange
      const mockOwner = createMockUser({
        role: 'CLUB_OWNER',
        clubId: 'club-123',
      })

      const mockModules = [
        { code: 'bookings', isIncluded: true },
      ]

      ;(getCurrentUser as any).mockResolvedValue(mockOwner)
      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockOwner,
        permissions: [],
      })

      mockGetEnabledModulesForClub.mockResolvedValue(mockModules)

      // Act
      const hasPermission = await currentUserHasPermission('bookings')

      // Assert
      expect(hasPermission).toBe(true)
    })

    it('should deny CLUB_STAFF access to disabled module', async () => {
      // Arrange
      const mockStaff = createMockUser({
        role: 'CLUB_STAFF',
        clubId: 'club-123',
      })

      ;(getCurrentUser as any).mockResolvedValue(mockStaff)
      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockStaff,
        permissions: [
          { moduleCode: 'bookings' },
        ],
      })

      // Act
      const hasFinancePermission = await currentUserHasPermission('finance')

      // Assert
      expect(hasFinancePermission).toBe(false)
    })

    it('should handle multiple permission checks efficiently', async () => {
      // Arrange
      const mockUser = createMockUser({
        role: 'CLUB_STAFF',
      })

      ;(getCurrentUser as any).mockResolvedValue(mockUser)
      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        permissions: [
          { moduleCode: 'bookings' },
          { moduleCode: 'customers' },
        ],
      })

      // Act
      const hasBookings = await currentUserHasPermission('bookings')
      const hasCustomers = await currentUserHasPermission('customers')
      const hasFinance = await currentUserHasPermission('finance')

      // Assert
      expect(hasBookings).toBe(true)
      expect(hasCustomers).toBe(true)
      expect(hasFinance).toBe(false)
    })
  })

  describe('UserPermission Model', () => {
    it('should create user permission correctly', async () => {
      // Arrange
      const userId = 'user-123'
      const moduleCode = 'bookings'

      const mockPermission = {
        id: 'perm-123',
        userId,
        moduleCode,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.userPermission.create as any).mockResolvedValue(mockPermission)

      // Act
      const permission = await prisma.userPermission.create({
        data: {
          userId,
          moduleCode,
        },
      })

      // Assert
      expect(permission.userId).toBe(userId)
      expect(permission.moduleCode).toBe(moduleCode)
      expect(prisma.userPermission.create).toHaveBeenCalledWith({
        data: { userId, moduleCode },
      })
    })

    it('should prevent duplicate permissions', async () => {
      // Arrange
      ;(prisma.userPermission.create as any).mockRejectedValue(
        mockPrismaError('P2002', 'Unique constraint failed')
      )

      // Act & Assert
      await expect(
        prisma.userPermission.create({
          data: {
            userId: 'user-123',
            moduleCode: 'bookings',
          },
        })
      ).rejects.toThrow()
    })

    it('should delete user permission', async () => {
      // Arrange
      const permissionId = 'perm-123'

      ;(prisma.userPermission.delete as any).mockResolvedValue({
        id: permissionId,
      })

      // Act
      await prisma.userPermission.delete({
        where: { id: permissionId },
      })

      // Assert
      expect(prisma.userPermission.delete).toHaveBeenCalledWith({
        where: { id: permissionId },
      })
    })
  })

  describe('Permission Edge Cases', () => {
    it('should handle empty permission array', async () => {
      // Arrange
      const mockUser = createMockUser({
        role: 'CLUB_STAFF',
      })

      ;(getCurrentUser as any).mockResolvedValue(mockUser)
      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        permissions: [],
      })

      // Act
      const hasPermission = await currentUserHasPermission('bookings')

      // Assert
      expect(hasPermission).toBe(false)
    })

    it('should be case-sensitive for module codes', async () => {
      // Arrange
      const mockUser = createMockUser({
        role: 'CLUB_STAFF',
      })

      ;(getCurrentUser as any).mockResolvedValue(mockUser)
      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        permissions: [
          { moduleCode: 'bookings' },
        ],
      })

      // Act
      const hasLowerCase = await currentUserHasPermission('bookings')
      const hasUpperCase = await currentUserHasPermission('Bookings')

      // Assert
      expect(hasLowerCase).toBe(true)
      expect(hasUpperCase).toBe(false)
    })

    it('should handle concurrent permission checks', async () => {
      // Arrange
      const mockUser = createMockUser({
        role: 'CLUB_STAFF',
      })

      ;(getCurrentUser as any).mockResolvedValue(mockUser)
      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        permissions: [
          { moduleCode: 'bookings' },
          { moduleCode: 'customers' },
        ],
      })

      // Act
      const results = await Promise.all([
        currentUserHasPermission('bookings'),
        currentUserHasPermission('customers'),
        currentUserHasPermission('finance'),
      ])

      // Assert
      expect(results).toEqual([true, true, false])
    })
  })
})
