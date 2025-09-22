import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',  // Permitir logout sin autenticación
  '/api/public',
  '/widget',
  '/api/widget',
  '/pay',
  '/opt-out',
  '/api/health',
  '/_next',
  '/favicon.ico',
]

// Rutas de API que requieren autenticación especial
const protectedApiRoutes = [
  '/api/admin',
  '/api/dashboard',
  '/api/settings',
]

// Rutas que requieren super admin
const superAdminRoutes = [
  '/admin',
  '/api/admin/system',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Log de seguridad para requests sospechosos
  if (process.env.NODE_ENV === 'production') {
    // Detectar intentos de acceso a archivos sensibles
    if (pathname.includes('.env') || pathname.includes('.git') || pathname.includes('.sql')) {
      console.error(`[SECURITY] Attempted access to sensitive file: ${pathname} from ${request.headers.get('x-forwarded-for')}`)
      return new NextResponse(null, { status: 404 })
    }
  }

  // Permitir rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificación simple de autenticación basada en cookies
  // NOTA: Esta es una verificación básica. La validación real debe hacerse en las rutas
  const sessionCookie = request.cookies.get('auth_session')?.value || 
                       request.cookies.get('lucia-auth')?.value ||
                       request.cookies.get('padelyzer-session')?.value
  
  if (!sessionCookie) {
    // No hay cookie de sesión - redirigir o retornar error
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      )
    }
    
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Para verificaciones más específicas (como super admin), 
  // dejar que las rutas individuales lo manejen
  
  // Agregar headers de seguridad
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
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