import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Check if Redis is configured
const isRedisConfigured = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Create Redis instance if configured
const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Rate limiter configurations for different endpoints
export const rateLimiters = {
  // General API calls: 100 requests per minute
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        analytics: true,
        prefix: "api",
      })
    : null,

  // Auth operations: 5 attempts per 15 minutes
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        analytics: true,
        prefix: "auth",
      })
    : null,

  // Booking creation: 20 bookings per hour per IP
  booking: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 h"),
        analytics: true,
        prefix: "booking",
      })
    : null,

  // Admin operations: 200 requests per minute
  admin: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(200, "1 m"),
        analytics: true,
        prefix: "admin",
      })
    : null,

  // Export operations: 10 per hour
  export: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        analytics: true,
        prefix: "export",
      })
    : null,

  // Stripe webhooks: 1000 per minute (high for webhooks)
  webhook: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(1000, "1 m"),
        analytics: true,
        prefix: "webhook",
      })
    : null,
};

// Helper function to check rate limit
export async function checkRateLimit(
  identifier: string,
  limiter: keyof typeof rateLimiters = "api"
) {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === "development") {
    return { success: true, limit: 100, remaining: 100, reset: new Date() };
  }

  // Skip if Redis is not configured
  if (!rateLimiters[limiter]) {
    if (process.env.NODE_ENV === "production") {
      console.error("❌ Rate limiting disabled in production - Upstash not configured!");
    }
    return { success: true, limit: 100, remaining: 100, reset: new Date() };
  }

  try {
    const result = await rateLimiters[limiter]!.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: new Date(result.reset),
    };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail open - allow request if rate limiting fails
    return { success: true, limit: 100, remaining: 100, reset: new Date() };
  }
}

// Middleware helper for rate limiting
export async function withRateLimit(
  request: NextRequest,
  limiterType: keyof typeof rateLimiters = "api"
) {
  // Extract IP address
  const ip = request.headers.get("x-real-ip") ??
             request.headers.get("x-forwarded-for") ??
             "unknown";

  const { success, limit, reset, remaining } = await checkRateLimit(ip, limiterType);

  if (!success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Por favor, intenta de nuevo más tarde",
        code: "RATE_LIMIT_EXCEEDED",
        limit,
        remaining,
        reset: reset.toISOString(),
      },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toISOString(),
        },
      }
    );
  }

  return null; // Continue with request
}

// Helper function to create rate limit response for API routes
export function createRateLimitResponse(message = "Too many requests") {
  return NextResponse.json(
    {
      error: message,
      code: "RATE_LIMIT_EXCEEDED",
    },
    {
      status: 429,
      headers: {
        "Retry-After": "60",
      },
    }
  );
}