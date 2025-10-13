import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

export async function GET(request: NextRequest) {
  try {
    // Solo permitir con token específico
    const authHeader = request.headers.get('authorization')
    if (authHeader !== 'Bearer list-users-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'CLUB_OWNER' },
          { role: 'CLUB_STAFF' }
        ]
      },
      select: {
        email: true,
        name: true,
        role: true,
        active: true,
        Club: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      take: 10
    })

    return NextResponse.json({
      success: true,
      users
    })

  } catch (error) {
    console.error('List users error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}