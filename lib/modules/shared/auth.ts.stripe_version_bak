// Unified authentication service

import { validateRequest, requireAuthentication, requireClubMembership, requireRole } from '@/lib/auth/lucia'
import { AuthSession } from './types'
import { ResponseBuilder } from './response'

export class AuthService {
  /**
   * Get authenticated session with role validation
   */
  static async getSession(): Promise<AuthSession | null> {
    try {
      const { user } = await validateRequest()
      
      if (!user) {
        return null
      }

      return {
        userId: user.id,
        clubId: user.clubId,
        role: user.role,
        email: user.email,
        name: user.name,
        active: user.active
      }
    } catch {
      return null
    }
  }

  /**
   * Require any authenticated user
   */
  static async requireAuth(): Promise<AuthSession> {
    try {
      const { user } = await requireAuthentication()
      
      return {
        userId: user.id,
        clubId: user.clubId,
        role: user.role,
        email: user.email,
        name: user.name,
        active: user.active
      }
    } catch (error) {
      throw ResponseBuilder.unauthorized()
    }
  }

  /**
   * Require authenticated user with specific role
   */
  static async requireRole(role: 'SUPER_ADMIN' | 'CLUB_OWNER' | 'CLUB_STAFF' | 'USER'): Promise<AuthSession> {
    const session = await AuthService.requireAuth()

    const roleHierarchy = {
      'SUPER_ADMIN': 4,
      'CLUB_OWNER': 3,
      'CLUB_STAFF': 2,
      'USER': 1
    }

    if (roleHierarchy[session.role] < roleHierarchy[role]) {
      throw ResponseBuilder.forbidden()
    }

    return session
  }

  /**
   * Require admin role
   */
  static async requireAdmin(): Promise<AuthSession> {
    return AuthService.requireRole('SUPER_ADMIN')
  }

  /**
   * Require staff role (staff, owner or admin)
   */
  static async requireStaff(): Promise<AuthSession> {
    try {
      const { user } = await requireRole(['CLUB_STAFF', 'CLUB_OWNER', 'SUPER_ADMIN'])
      
      return {
        userId: user.id,
        clubId: user.clubId,
        role: user.role,
        email: user.email,
        name: user.name,
        active: user.active
      }
    } catch (error) {
      throw ResponseBuilder.forbidden('Staff access required')
    }
  }

  /**
   * Require club staff (must have clubId and be staff)
   */
  static async requireClubStaff(): Promise<AuthSession> {
    try {
      const { user, clubId } = await requireClubMembership()
      
      if (!['CLUB_STAFF', 'CLUB_OWNER', 'SUPER_ADMIN'].includes(user.role)) {
        throw ResponseBuilder.forbidden('Staff access required')
      }
      
      return {
        userId: user.id,
        clubId: clubId,
        role: user.role,
        email: user.email,
        name: user.name,
        active: user.active
      }
    } catch (error) {
      if (error instanceof Response) {
        throw error
      }
      throw ResponseBuilder.forbidden('Club staff access required')
    }
  }

  /**
   * Check if user has permission for specific club
   */
  static async requireClubAccess(clubId: string): Promise<AuthSession> {
    const session = await AuthService.requireAuth()

    // Super admins have access to all clubs
    if (session.role === 'SUPER_ADMIN') {
      return session
    }

    // Staff must belong to the specific club
    if (session.clubId !== clubId) {
      throw ResponseBuilder.forbidden('Access denied to this club')
    }

    return session
  }

  /**
   * Get current user session (optional)
   */
  static async getCurrentUser(): Promise<AuthSession | null> {
    return await this.getSession()
  }
}