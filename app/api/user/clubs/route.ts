import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Super Admin tiene acceso a todos los clubs
    if (session.role === 'SUPER_ADMIN') {
      const clubs = await prisma.club.findMany({
        where: {
          status: 'APPROVED',
          active: true
        },
        select: {
          id: true,
          name: true,
          slug: true
        },
        orderBy: {
          name: 'asc'
        }
      })

      const currentClub = session.clubId ? 
        clubs.find(c => c.id === session.clubId) : 
        clubs[0]

      return NextResponse.json({
        clubs,
        currentClub,
        canSwitchClubs: true
      })
    }

    // Usuario normal - solo su club
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        Club: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!user?.Club) {
      return NextResponse.json({
        clubs: [],
        currentClub: null,
        canSwitchClubs: false
      })
    }

    return NextResponse.json({
      clubs: [user.Club],
      currentClub: user.Club,
      canSwitchClubs: false
    })

  } catch (error) {
    console.error('Error fetching user clubs:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}