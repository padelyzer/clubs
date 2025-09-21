import { NextResponse } from 'next/server'

export const runtime = 'edge'

// GET method for direct URL access
export async function GET() {
  try {
    // Determinar URL de login
    const loginUrl = 'https://pdzr4.vercel.app/login'

    // Crear respuesta de redirección
    const response = NextResponse.redirect(loginUrl)

    // Limpiar cookies de sesión
    response.cookies.set('padelyzer-session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    response.cookies.set('auth_session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    // En caso de error, redirigir de todos modos
    return NextResponse.redirect('https://pdzr4.vercel.app/login')
  }
}

// POST method for API calls
export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    })

    // Limpiar cookies de sesión
    response.cookies.set('padelyzer-session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    response.cookies.set('auth_session', '', {
      httpOnly: true,
      secure: true,
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