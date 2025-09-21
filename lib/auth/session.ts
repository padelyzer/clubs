/**
 * Unified session management using Lucia Auth
 * This replaces the JWT-based getSession()
 */

import { validateRequest } from './lucia'
import { redirect } from 'next/navigation'
import type { User, Session } from 'lucia'

export interface SessionData {
  userId: string
  email: string
  name: string | null
  role: 'USER' | 'CLUB_OWNER' | 'CLUB_STAFF' | 'SUPER_ADMIN'
  clubId: string | null
  clubName?: string | null
  active: boolean
}

/**
 * Get current session data - compatible with legacy getSession() format
 * Use this for gradual migration from JWT to Lucia
 */
export async function getSession(): Promise<SessionData | null> {
  const { user, session } = await validateRequest()
  
  if (!user || !session) {
    return null
  }
  
  // Return in the same format as the old JWT getSession
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    clubId: user.clubId,
    active: user.active
  }
}

/**
 * Get current user - Lucia native format
 */
export async function getCurrentUser(): Promise<User | null> {
  const { user } = await validateRequest()
  return user
}

/**
 * Get full session details - Lucia native format
 */
export async function getSessionDetails(): Promise<{ user: User; session: Session } | null> {
  const result = await validateRequest()
  
  if (!result.user || !result.session) {
    return null
  }
  
  return result
}

/**
 * Require authentication or redirect to login
 */
export async function requireAuth(redirectTo: string = '/login') {
  const session = await getSession()
  
  if (!session) {
    redirect(redirectTo)
  }
  
  return session
}

/**
 * Require super admin role or redirect
 */
export async function requireSuperAdmin(redirectTo: string = '/unauthorized') {
  const session = await requireAuth()
  
  if (session.role !== 'SUPER_ADMIN') {
    redirect(redirectTo)
  }
  
  return session
}

/**
 * Require club access (owner or staff) or redirect
 */
export async function requireClubAccess(clubId: string, redirectTo: string = '/unauthorized') {
  const session = await requireAuth()
  
  if (session.clubId !== clubId && session.role !== 'SUPER_ADMIN') {
    redirect(redirectTo)
  }
  
  return session
}

/**
 * Check if user has any of the specified roles
 */
export async function hasRole(roles: string[]): Promise<boolean> {
  const session = await getSession()
  
  if (!session) {
    return false
  }
  
  return roles.includes(session.role)
}

/**
 * Check if user is staff or higher (CLUB_STAFF, CLUB_OWNER, SUPER_ADMIN)
 */
export async function isStaffOrHigher(): Promise<boolean> {
  return hasRole(['CLUB_STAFF', 'CLUB_OWNER', 'SUPER_ADMIN'])
}

/**
 * Check if user is club owner or higher
 */
export async function isOwnerOrHigher(): Promise<boolean> {
  return hasRole(['CLUB_OWNER', 'SUPER_ADMIN'])
}