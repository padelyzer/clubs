/**
 * Simple in-memory rate limiter for development and basic production use
 * This is a fallback when Redis/Upstash is not available
 * 
 * WARNING: This resets on server restart and doesn't work across multiple instances
 * For production with multiple instances, use Redis/Upstash
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Store requests by IP address
const requestStore = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of requestStore.entries()) {
    if (entry.resetTime < now) {
      requestStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  windowMs?: number   // Time window in milliseconds (default: 15 minutes)
  maxRequests?: number // Max requests per window (default: 100)
  message?: string    // Error message
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: Date
}

/**
 * Check rate limit for a given identifier (usually IP address)
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): Promise<RateLimitResult> {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
  } = config

  const now = Date.now()
  const resetTime = now + windowMs

  // Get or create entry
  let entry = requestStore.get(identifier)
  
  if (!entry || entry.resetTime < now) {
    // Create new entry
    entry = {
      count: 0,
      resetTime: resetTime
    }
    requestStore.set(identifier, entry)
  }

  // Increment count
  entry.count++

  // Check if limit exceeded
  const remaining = Math.max(0, maxRequests - entry.count)
  const success = entry.count <= maxRequests

  return {
    success,
    limit: maxRequests,
    remaining,
    reset: new Date(entry.resetTime)
  }
}

/**
 * Get client identifier from request headers
 */
export function getClientIdentifier(headers: Headers): string {
  // Try to get real IP from various headers (in order of preference)
  const possibleHeaders = [
    'x-real-ip',
    'x-forwarded-for',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'fastly-client-ip', // Fastly
    'x-vercel-forwarded-for', // Vercel
  ]

  for (const header of possibleHeaders) {
    const value = headers.get(header)
    if (value) {
      // Handle x-forwarded-for which can contain multiple IPs
      const ip = value.split(',')[0].trim()
      if (ip) return ip
    }
  }

  // Fallback to a generic identifier
  return 'anonymous'
}

/**
 * Rate limiting middleware for API routes
 */
export async function withRateLimit(
  request: Request,
  config: RateLimitConfig = {}
): Promise<Response | null> {
  // Skip rate limiting in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.ENABLE_DEV_RATE_LIMIT) {
    return null
  }

  const identifier = getClientIdentifier(request.headers)
  const result = await checkRateLimit(identifier, config)

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: config.message || 'Too many requests. Please try again later.',
        retryAfter: result.reset.toISOString()
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toISOString(),
          'Retry-After': Math.ceil((result.reset.getTime() - Date.now()) / 1000).toString()
        }
      }
    )
  }

  // Return null to continue with the request
  return null
}