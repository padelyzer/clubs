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
      console.log('[ApiAuth] No authorization header')
      return null
    }
    
    const sessionDataStr = authHeader.replace('Bearer ', '')
    
    if (!sessionDataStr) {
      console.log('[ApiAuth] No session data in header')
      return null
    }
    
    // Decode session data
    const sessionData: SessionData = JSON.parse(decodeURIComponent(sessionDataStr))
    
    // Verify session hasn't expired
    if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
      console.log('[ApiAuth] Session expired')
      return null
    }
    
    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId }
    })
    
    if (!user || !user.active) {
      console.log('[ApiAuth] User not found or inactive')
      return null
    }
    
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
    console.error('[ApiAuth] Error getting API session:', error)
    return null
  }
}

// Require super admin for API routes
export async function requireApiSuperAdmin(request: NextRequest): Promise<ApiSession> {
  const session = await getApiSession(request)
  
  if (!session) {
    throw new Error('Unauthorized: No valid session')
  }
  
  if (session.user.role !== 'super_admin') {
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
  
  if (session.user.role !== 'super_admin' && session.user.role !== 'club_admin') {
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
  
  const allowedRoles = ['super_admin', 'club_admin', 'club_staff']
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Unauthorized: Club staff access required')
  }
  
  return session
}