import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/config/auth'
import { prisma } from '@/lib/config/prisma'

// GET /api/clubs/by-slug/[slug] - Get club info by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { slug } = params

    // Get club with settings and courts
    const club = await prisma.club.findUnique({
      where: { slug },
      include: {
        ClubSettings: true,
        Court: {
          where: { active: true },
          orderBy: { name: 'asc' }
        }
      }
    })

    if (!club) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      )
    }

    // Verify user has access to this club
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, clubId: true }
    })

    if (!user || (user.role !== 'SUPER_ADMIN' && user.clubId !== club.id)) {
      return NextResponse.json(
        { error: 'Sin acceso a este club' },
        { status: 403 }
      )
    }

    // Format response
    return NextResponse.json({
      club: {
        id: club.id,
        name: club.name,
        slug: club.slug,
        email: club.email,
        phone: club.phone,
        address: club.address,
        city: club.city,
        state: club.state,
        settings: club.ClubSettings ? {
          openTime: club.ClubSettings.openTime,
          closeTime: club.ClubSettings.closeTime,
          slotDuration: club.ClubSettings.slotDuration,
          currency: club.ClubSettings.currency
        } : null
      },
      courts: club.Court.map(court => ({
        id: court.id,
        name: court.name,
        type: court.type,
        active: court.active
      }))
    })

  } catch (error) {
    console.error('[Get Club By Slug] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener información del club' },
      { status: 500 }
    )
  }
}