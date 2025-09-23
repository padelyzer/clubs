// API authentication utilities for hybrid session system
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import type { SessionData } from './hybrid-session'

export interface ApiSession {
  user: {
    id: string
    email: string
    role: string
    clubId: string | null
  }
  session: {
    id: string
  }
}

// Extract session from request headers (hybrid auth)
export async function getApiSession(request: NextRequest): Promise<ApiSession | null> {
  try {
    // Get session data from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[ApiAuth] No authorization header found in request')
      return null
    }
    
    const sessionDataStr = authHeader.replace('Bearer ', '')
    
    if (!sessionDataStr) {
      console.log('[ApiAuth] No session data in authorization header')
      return null
    }
    
    console.log('[ApiAuth] Attempting to decode session data')
    
    // Decode session data
    let sessionData: SessionData
    try {
      sessionData = JSON.parse(decodeURIComponent(sessionDataStr))
    } catch (parseError) {
      console.error('[ApiAuth] Failed to parse session data:', parseError)
      return null
    }
    
    // Verify session hasn't expired
    if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
      console.log('[ApiAuth] Session expired:', {
        expiresAt: new Date(sessionData.expiresAt),
        now: new Date()
      })
      return null
    }
    
    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId }
    })
    
    if (!user) {
      console.log('[ApiAuth] User not found:', sessionData.userId)
      return null
    }
    
    if (!user.active) {
      console.log('[ApiAuth] User is inactive:', sessionData.userId)
      return null
    }
    
    console.log('[ApiAuth] Session validated successfully for user:', user.email)
    
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        clubId: user.clubId
      },
      session: {
        id: sessionData.sessionId
      }
    }
  } catch (error) {
    console.error('[ApiAuth] Unexpected error getting API session:', error)
    return null
  }
}

// Require super admin for API routes
export async function requireApiSuperAdmin(request: NextRequest): Promise<ApiSession> {
  const session = await getApiSession(request)
  
  if (!session) {
    console.error('[ApiAuth] requireApiSuperAdmin: No session found')
    throw new Error('Unauthorized: No valid session')
  }
  
  console.log('[ApiAuth] requireApiSuperAdmin: Checking role:', session.user.role)
  
  // Check for super admin role (handle different case variations)
  const normalizedRole = session.user.role?.toLowerCase()
  const isSuperAdmin = normalizedRole === 'super_admin' || 
                       normalizedRole === 'superadmin' ||
                       session.user.role === 'SUPER_ADMIN' ||
                       session.user.role === 'SUPERADMIN'
  
  if (!isSuperAdmin) {
    console.error('[ApiAuth] requireApiSuperAdmin: User is not super_admin. Current role:', session.user.role)
    throw new Error('Unauthorized: Super admin access required')
  }
  
  return session
}

// Require club admin for API routes
export async function requireApiClubAdmin(request: NextRequest): Promise<ApiSession> {
  const session = await getApiSession(request)
  
  if (!session) {
    throw new Error('Unauthorized: No valid session')
  }
  
  // Roles in DB are uppercase
  const allowedRoles = ['SUPER_ADMIN', 'CLUB_OWNER', 'CLUB_STAFF']
  if (!allowedRoles.includes(session.user.role)) {
    console.error('[ApiAuth] requireApiClubAdmin: Invalid role:', session.user.role)
    throw new Error('Unauthorized: Club admin access required')
  }
  
  return session
}

// Require club staff for API routes
export async function requireApiClubStaff(request: NextRequest): Promise<ApiSession> {
  const session = await getApiSession(request)
  
  if (!session) {
    throw new Error('Unauthorized: No valid session')
  }
  
  // Roles in DB are uppercase
  const allowedRoles = ['SUPER_ADMIN', 'CLUB_OWNER', 'CLUB_STAFF']
  if (!allowedRoles.includes(session.user.role)) {
    console.error('[ApiAuth] requireApiClubStaff: Invalid role:', session.user.role)
    throw new Error('Unauthorized: Club staff access required')
  }
  
  return session
}