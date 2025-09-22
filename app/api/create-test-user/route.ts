import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Solo permitir en desarrollo o con un token específico
    const authHeader = request.headers.get('authorization')
    if (authHeader !== 'Bearer create-test-user-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, name, role = 'CLUB_STAFF' } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Actualizar contraseña del usuario existente
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          active: true,
          name: name || existingUser.name
        }
      })

      return NextResponse.json({
        success: true,
        message: 'User password updated',
        user: {
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role
        }
      })
    } else {
      // Crear nuevo usuario con ID generado
      const { randomBytes } = require('crypto')
      const id = randomBytes(16).toString('hex')
      
      const newUser = await prisma.user.create({
        data: {
          id,
          email,
          name: name || 'Test User',
          password: hashedPassword,
          role: role as any,
          active: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'User created',
        user: {
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      })
    }

  } catch (error) {
    console.error('Create test user error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}