import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { lucia } from '@/lib/auth/lucia'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar entrada
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        Club: {
          select: {
            id: true,
            name: true,
            slug: true,
            initialSetupCompleted: true
          }
        }
      }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: 'Email o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Verificar contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Email o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Verificar si el usuario está activo
    if (!user.active) {
      return NextResponse.json(
        { success: false, error: 'Tu cuenta está desactivada. Contacta al administrador.' },
        { status: 403 }
      )
    }

    // Crear sesión con Lucia
    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    // Determinar URL de redirección basada en el rol y estado del club
    let redirectUrl = '/dashboard'
    if (user.role === 'SUPER_ADMIN') {
      redirectUrl = '/admin/dashboard'
    } else if (user.role === 'PLAYER') {
      redirectUrl = '/bookings'
    } else if (user.Club && !user.Club.initialSetupCompleted) {
      redirectUrl = `/c/${user.Club.slug}/setup`
    }

    // Crear datos de sesión para el cliente
    const sessionData = {
      sessionId: session.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      clubId: user.clubId,
      expiresAt: session.expiresAt.getTime()
    }

    // Crear la respuesta con datos adicionales para el cliente
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clubId: user.clubId,
        clubName: user.Club?.name
      },
      redirectUrl,
      // Incluir datos de sesión para localStorage respaldo
      sessionData
    })

    // Método 1: Establecer cookie (funcionará para usuarios sin bloqueadores)
    const cookieString = `${sessionCookie.name}=${sessionCookie.value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
    response.headers.set('Set-Cookie', cookieString)
    
    console.log('[Login] Setting hybrid session:', {
      cookieName: sessionCookie.name,
      sessionId: session.id,
      method: 'cookie + localStorage respaldo'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}