import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withRateLimit } from "@/lib/rate-limit";
import { withRequestLogging, logSecurityEvent } from "@/lib/logging/middleware";

// Define protected routes
const protectedRoutes = ["/dashboard", "/admin", "/c/"];
const authRoutes = ["/login", "/register"];
const publicRoutes = ["/", "/about", "/contact"];

// Session cookie name - must match Lucia configuration
const SESSION_COOKIE_NAME = "padelyzer-session";

async function middlewareHandler(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check authentication for protected routes
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));

  if (isProtectedRoute || isAuthRoute) {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;

    if (!sessionId && isProtectedRoute) {
      // Log security event for unauthorized access attempt
      logSecurityEvent("Unauthorized access attempt", request, {
        path,
        hasSession: !!sessionId,
      });

      // No session and trying to access protected route, redirect to login
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }

    if (sessionId && isAuthRoute) {
      // Has session and trying to access auth route, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Check if user is accessing /dashboard without club slug
    // We'll defer this to a client-side redirect since middleware can't access database
    if (sessionId && path.startsWith("/dashboard")) {
      // Let the page handle the redirect to the correct club
      const response = NextResponse.next();
      response.headers.set('x-redirect-to-club', 'true');
      return response;
    }
  }
  
  // Rate limiting for API routes
  if (path.startsWith("/api/")) {
    // Different rate limits for different endpoints
    let limiterType: "api" | "auth" | "booking" = "api";
    
    if (path.includes("/auth") || path.includes("/login") || path.includes("/register")) {
      limiterType = "auth";
    } else if (path.includes("/bookings") && request.method === "POST") {
      limiterType = "booking";
    }
    
    const rateLimitResponse = await withRateLimit(request, limiterType);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }
  
  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Add CSP header in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://api.stripe.com https://*.sentry.io https://*.axiom.co;"
    );
  }

  return response;
}

// Export the middleware wrapped with logging
export const middleware = withRequestLogging(middlewareHandler);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
  ],
};