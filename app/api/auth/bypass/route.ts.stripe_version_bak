import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Crear una respuesta con información de usuario simulada
    const mockUser = {
      id: 'demo-user-001',
      email: 'demo@padelyzer.com',
      name: 'Usuario Demo',
      role: 'CLUB_OWNER',
      clubId: 'club-demo-001',
      active: true
    }

    const response = NextResponse.json({
      authenticated: true,
      user: mockUser,
      session: {
        id: 'mock-session-001',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      message: 'Sesión simulada para pruebas de desarrollo'
    })

    // Establecer cookies de sesión simuladas
    response.cookies.set('auth-session', 'mock-session-token', {
      httpOnly: true,
      secure: false, // Solo para desarrollo
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Error en bypass:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

