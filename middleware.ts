import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/public',
  '/widget',
  '/api/widget',
  '/pay',
  '/opt-out',
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

  // Verificar autenticación para rutas protegidas
  try {
    const session = await getSession()
    
    if (!session) {
      // Redirigir a login si no hay sesión
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

    // Verificar permisos de super admin
    if (superAdminRoutes.some(route => pathname.startsWith(route))) {
      if (session.role !== 'super_admin') {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden - Super Admin access required' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        )
      }
    }

    // Agregar headers de seguridad para APIs
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.next()
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      return response
    }

    return NextResponse.next()
  } catch (error) {
    console.error('[Middleware] Auth error:', error)
    
    // En caso de error, redirigir a login por seguridad
    if (!pathname.startsWith('/api/')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    )
  }
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