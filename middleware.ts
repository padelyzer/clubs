import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Log de seguridad para requests sospechosos
  if (pathname.includes('.env') || pathname.includes('.git') || pathname.includes('.sql')) {
    console.error(`[SECURITY] Attempted access to sensitive file: ${pathname}`)
    return new NextResponse(null, { status: 404 })
  }

  // Agregar headers de seguridad a todas las respuestas
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Por ahora, permitir todas las rutas y dejar que cada ruta maneje su propia autenticación
  // Esto evita conflictos con el sistema de autenticación de Lucia
  return response
}

// Configurar qué rutas debe procesar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp)$).*)',
  ],
}