import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import bcrypt from 'bcryptjs'
import { createFallbackToken } from '@/lib/auth/fallback-auth'
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

    // Verificar contraseña
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

    // Crear token JWT como fallback
    const token = await createFallbackToken(user)

    // Determinar URL de redirección
    let redirectUrl = '/dashboard'
    if (user.role === 'SUPER_ADMIN') {
      redirectUrl = '/admin/dashboard'
    } else if (user.role === 'PLAYER') {
      redirectUrl = '/bookings'
    } else if (user.Club && !user.Club.initialSetupCompleted) {
      redirectUrl = `/c/${user.Club.slug}/setup`
    }

    return NextResponse.json({
      success: true,
      token,
      session: {
        userId: user.id,
        email: user.email,
        role: user.role,
        clubId: user.clubId,
        name: user.name
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clubId: user.clubId,
        clubName: user.Club?.name
      },
      redirectUrl
    })

  } catch (error) {
    console.error('Login fallback error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}