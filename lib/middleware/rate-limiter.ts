import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number    // Time window in milliseconds
  maxRequests: number // Max requests per window
  message?: string    // Custom error message
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (in production, use Redis)
const rateLimitStore: RateLimitStore = {}

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now()
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key]
    }
  })
}, 60000) // Clean every minute

/**
 * Rate limiting middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = config

  return async function rateLimiter(
    request: NextRequest,
    response?: NextResponse
  ): Promise<NextResponse | null> {
    // Get client identifier (IP + User-Agent for better uniqueness)
    const clientId = getClientId(request)
    const now = Date.now()
    const windowStart = now - windowMs

    // Initialize or get existing record
    if (!rateLimitStore[clientId] || rateLimitStore[clientId].resetTime < now) {
      rateLimitStore[clientId] = {
        count: 0,
        resetTime: now + windowMs
      }
    }

    const record = rateLimitStore[clientId]

    // Check if rate limit exceeded
    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      
      return new NextResponse(
        JSON.stringify({
          error: message,
          retryAfter,
          limit: maxRequests,
          window: windowMs / 1000
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': record.resetTime.toString()
          }
        }
      )
    }

    // Increment counter
    record.count++

    // Add rate limit headers to response
    if (response) {
      response.headers.set('X-RateLimit-Limit', maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count).toString())
      response.headers.set('X-RateLimit-Reset', record.resetTime.toString())
    }

    return null // Continue processing
  }
}

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest): string {
  // Get IP address (considering proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || request.ip || 'unknown'
  
  // Combine with User-Agent for better uniqueness
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return `${ip}:${userAgent.substring(0, 50)}`
}

/**
 * Predefined rate limiters for different endpoints
 */
export const rateLimiters = {
  // Relaxed rate limiting for testing
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // Incrementado para testing
    message: 'Too many authentication attempts, please try again in 15 minutes'
  }),

  // API rate limiting
  api: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'API rate limit exceeded, please slow down'
  }),

  // Booking/payment endpoints
  booking: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 10, // 10 bookings per minute
    message: 'Too many booking attempts, please wait before trying again'
  }),

  // WhatsApp/notification endpoints
  notifications: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30, // 30 notifications per minute
    message: 'Too many notification requests, please slow down'
  }),

  // Admin endpoints
  admin: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100, // 100 admin requests per minute
    message: 'Admin API rate limit exceeded'
  }),

  // File upload endpoints
  upload: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 uploads per 5 minutes
    message: 'Too many file uploads, please wait before uploading again'
  }),

  // Widget endpoints (more permissive for public widgets)
  widget: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 200, // 200 requests per minute
    message: 'Widget rate limit exceeded'
  }),

  // Registration endpoints
  registration: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 registrations per hour per IP
    message: 'Too many registration attempts, please try again later'
  })
}

/**
 * Apply rate limiting based on path
 */
export function getRateLimiterForPath(pathname: string) {
  if (pathname.startsWith('/api/auth') || pathname.includes('/login')) {
    return rateLimiters.auth
  }
  
  if (pathname.startsWith('/api/admin')) {
    return rateLimiters.admin
  }
  
  if (pathname.includes('/booking') || pathname.includes('/payment')) {
    return rateLimiters.booking
  }
  
  if (pathname.includes('/whatsapp') || pathname.includes('/notification')) {
    return rateLimiters.notifications
  }
  
  if (pathname.includes('/upload')) {
    return rateLimiters.upload
  }
  
  if (pathname.startsWith('/widget') || pathname.startsWith('/api/public')) {
    return rateLimiters.widget
  }
  
  if (pathname.includes('/register')) {
    return rateLimiters.registration
  }
  
  if (pathname.startsWith('/api')) {
    return rateLimiters.api
  }
  
  return null // No rate limiting for other routes
}

/**
 * Utility to check rate limit without incrementing
 */
export function checkRateLimit(clientId: string, config: RateLimitConfig): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const record = rateLimitStore[clientId]
  
  if (!record || record.resetTime < now) {
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    }
  }
  
  return {
    allowed: record.count < config.maxRequests,
    remaining: Math.max(0, config.maxRequests - record.count),
    resetTime: record.resetTime
  }
}