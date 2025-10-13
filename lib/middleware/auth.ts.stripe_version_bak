import { NextRequest, NextResponse } from 'next/server'
import { validateAuthToken, JWTPayload } from '@/lib/auth/jwt-config'
import { rateLimiters } from './rate-limiter'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

/**
 * Authentication middleware for API routes
 */
export function requireAuth(allowedRoles?: string[]) {
  return async function authMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    try {
      // Validate JWT token
      const user = await validateAuthToken(request)
      
      if (!user) {
        return new NextResponse(
          JSON.stringify({
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // Check if user role is allowed
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return new NextResponse(
          JSON.stringify({
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: allowedRoles,
            current: user.role
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // Add user to request for handlers to use
      ;(request as AuthenticatedRequest).user = user
      
      return null // Continue processing
    } catch (error) {
      return new NextResponse(
        JSON.stringify({
          error: 'Authentication failed',
          code: 'AUTH_FAILED'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

/**
 * CSRF Protection middleware
 */
export function requireCSRF() {
  return function csrfMiddleware(request: NextRequest): NextResponse | null {
    // Skip CSRF for GET requests
    if (request.method === 'GET') {
      return null
    }

    // Check for CSRF token in header
    const csrfToken = request.headers.get('x-csrf-token')
    const sessionToken = request.cookies.get('csrf_token')?.value

    if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
      return new NextResponse(
        JSON.stringify({
          error: 'CSRF token mismatch',
          code: 'CSRF_MISMATCH'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return null // Continue processing
  }
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Club ownership middleware - ensures user can only access their club's data
 */
export function requireClubAccess() {
  return function clubAccessMiddleware(
    request: NextRequest
  ): NextResponse | null {
    const user = (request as AuthenticatedRequest).user

    if (!user) {
      return new NextResponse(
        JSON.stringify({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Super admins can access all clubs
    if (user.role === 'SUPER_ADMIN') {
      return null
    }

    // Extract club ID from URL path
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const clubIdIndex = pathSegments.findIndex(segment => segment === 'clubs') + 1
    const urlClubId = pathSegments[clubIdIndex]

    // Check if user belongs to the club being accessed
    if (user.clubId !== urlClubId) {
      return new NextResponse(
        JSON.stringify({
          error: 'Access denied to this club',
          code: 'CLUB_ACCESS_DENIED'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return null // Continue processing
  }
}

/**
 * Combine multiple middleware functions
 */
export function combineMiddleware(...middlewares: Array<(request: NextRequest) => Promise<NextResponse | null> | NextResponse | null>) {
  return async function combinedMiddleware(request: NextRequest): Promise<NextResponse | null> {
    for (const middleware of middlewares) {
      const result = await middleware(request)
      if (result) {
        return result // Stop processing if middleware returns a response
      }
    }
    return null // Continue processing
  }
}

/**
 * API route wrapper with authentication, rate limiting, and validation
 */
export function createSecureHandler(options: {
  requireAuth?: boolean
  allowedRoles?: string[]
  requireCSRF?: boolean
  requireClubAccess?: boolean
  rateLimit?: boolean
}) {
  return function secureWrapper(
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    return async function secureHandler(request: NextRequest): Promise<NextResponse> {
      try {
        const middlewares: Array<(request: NextRequest) => Promise<NextResponse | null> | NextResponse | null> = []

        // Add rate limiting
        if (options.rateLimit !== false) {
          const rateLimiter = rateLimiters.api
          middlewares.push(rateLimiter)
        }

        // Add CSRF protection
        if (options.requireCSRF) {
          middlewares.push(requireCSRF())
        }

        // Add authentication
        if (options.requireAuth) {
          middlewares.push(requireAuth(options.allowedRoles))
        }

        // Add club access control
        if (options.requireClubAccess) {
          middlewares.push(requireClubAccess())
        }

        // Run all middleware
        for (const middleware of middlewares) {
          const result = await middleware(request)
          if (result) {
            return result
          }
        }

        // All middleware passed, run the actual handler
        return await handler(request)
      } catch (error) {
        console.error
        return new NextResponse(
          JSON.stringify({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }
  }
}

/**
 * Extract user from authenticated request
 */
export function getUser(request: NextRequest): JWTPayload | null {
  return (request as AuthenticatedRequest).user || null
}

/**
 * Check if user has specific role
 */
export function hasRole(request: NextRequest, role: string): boolean {
  const user = getUser(request)
  return user?.role === role
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(request: NextRequest, roles: string[]): boolean {
  const user = getUser(request)
  return user ? roles.includes(user.role) : false
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders() {
  return function securityHeadersMiddleware(request: NextRequest): NextResponse | null {
    // This is handled in the main middleware.ts file
    return null
  }
}

/**
 * Content-Type validation middleware
 */
export function requireContentType(expectedType: string) {
  return function contentTypeMiddleware(request: NextRequest): NextResponse | null {
    // Skip for GET requests
    if (request.method === 'GET') {
      return null
    }

    const contentType = request.headers.get('content-type')
    
    if (!contentType || !contentType.includes(expectedType)) {
      return new NextResponse(
        JSON.stringify({
          error: `Expected Content-Type: ${expectedType}`,
          code: 'INVALID_CONTENT_TYPE'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return null
  }
}

/**
 * Request size validation middleware
 */
export function limitRequestSize(maxSizeBytes: number) {
  return function requestSizeMiddleware(request: NextRequest): NextResponse | null {
    const contentLength = request.headers.get('content-length')
    
    if (contentLength && parseInt(contentLength) > maxSizeBytes) {
      return new NextResponse(
        JSON.stringify({
          error: `Request too large. Maximum size: ${maxSizeBytes} bytes`,
          code: 'REQUEST_TOO_LARGE'
        }),
        {
          status: 413,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return null
  }
}