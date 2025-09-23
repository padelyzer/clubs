import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (for development/MVP)
// For production, use Upstash Redis or similar service
const requestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  requests: number;
  window: number; // in milliseconds
}

// Rate limit result interface
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

// Updated rate limit function that returns a result object
export async function rateLimit(
  request: NextRequest,
  configOrType: RateLimitConfig | string = { requests: 10, window: 60000 }
): Promise<RateLimitResult> {
  // Handle string parameter (e.g., 'admin', 'public')
  let config: RateLimitConfig;
  if (typeof configOrType === 'string') {
    // Different limits for different types
    switch (configOrType) {
      case 'admin':
        config = { requests: 100, window: 60000 }; // 100 requests per minute for admin
        break;
      case 'public':
        config = { requests: 20, window: 60000 }; // 20 requests per minute for public
        break;
      default:
        config = { requests: 10, window: 60000 }; // Default
    }
  } else {
    config = configOrType;
  }
  const identifier = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();

  const userRequest = requestCounts.get(identifier);

  if (!userRequest || now > userRequest.resetTime) {
    // First request or window expired
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + config.window
    });
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests - 1,
      reset: new Date(now + config.window)
    };
  }

  if (userRequest.count >= config.requests) {
    // Rate limit exceeded
    return {
      success: false,
      limit: config.requests,
      remaining: 0,
      reset: new Date(userRequest.resetTime)
    };
  }

  // Increment count
  userRequest.count++;
  requestCounts.set(identifier, userRequest);

  return {
    success: true,
    limit: config.requests,
    remaining: config.requests - userRequest.count,
    reset: new Date(userRequest.resetTime)
  };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean every minute

// Helper function to create rate limit response
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

// Legacy rate limit function for backward compatibility
export async function rateLimitLegacy(
  request: NextRequest,
  config: RateLimitConfig = { requests: 10, window: 60000 }
): Promise<NextResponse | null> {
  const result = await rateLimit(request, config);
  
  if (!result.success) {
    return createRateLimitResponse();
  }
  
  return null;
}

export default rateLimit;