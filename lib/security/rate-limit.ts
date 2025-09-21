import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (for development/MVP)
// For production, use Upstash Redis or similar service
const requestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  requests: number;
  window: number; // in milliseconds
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = { requests: 10, window: 60000 }
): Promise<NextResponse | null> {
  const identifier = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();

  const userRequest = requestCounts.get(identifier);

  if (!userRequest || now > userRequest.resetTime) {
    // First request or window expired
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + config.window
    });
    return null; // Allow request
  }

  if (userRequest.count >= config.requests) {
    // Rate limit exceeded
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // Increment count
  userRequest.count++;
  requestCounts.set(identifier, userRequest);

  return null; // Allow request
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

export default rateLimit;