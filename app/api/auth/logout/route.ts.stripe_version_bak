import { NextRequest, NextResponse } from 'next/server'
import { lucia, validateRequest } from '@/lib/auth/lucia'
import { cookies } from 'next/headers'

// GET method for direct URL access
export async function GET(request: NextRequest) {
  try {
    const { session } = await validateRequest()

    if (session) {
      await lucia.invalidateSession(session.id)
    }

    const sessionCookie = lucia.createBlankSessionCookie()
    const cookiesStore = await cookies()

    // Usar URL dinámica basada en el request
    const url = new URL('/login', request.url)
    const response = NextResponse.redirect(url)

    // Establecer cookie vacía de Lucia
    response.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )

    // Limpiar cualquier otra cookie de sesión legacy
    response.cookies.set('padelyzer-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    // En caso de error, redirigir de todos modos
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }
}

// POST method for API calls
export async function POST() {
  try {
    const { session } = await validateRequest()

    if (session) {
      await lucia.invalidateSession(session.id)
    }

    const sessionCookie = lucia.createBlankSessionCookie()
    
    const response = NextResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    })

    // Establecer cookie vacía de Lucia
    response.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )

    // Limpiar cualquier otra cookie de sesión legacy
    response.cookies.set('padelyzer-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Logout POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cerrar sesión' },
      { status: 500 }
    )
  }
}