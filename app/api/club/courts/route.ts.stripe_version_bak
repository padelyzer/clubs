import { NextRequest, NextResponse } from 'next/server'
import { requireClubStaff } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// GET - Obtener todas las canchas del club
export async function GET(request: NextRequest) {
  try {
    const session = await requireClubStaff()
    
    const courts = await prisma.court.findMany({
      where: { clubId: session.clubId },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      courts
    })
  } catch (error) {
    console.error('Error fetching courts:', error)
    return NextResponse.json(
      { error: 'Error al obtener canchas' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva cancha
export async function POST(request: NextRequest) {
  try {
    const session = await requireClubStaff()
    const body = await request.json()

    const {
      name,
      description,
      courtType,
      surface,
      isIndoor,
      hasLighting,
      basePrice,
      peakPrice,
      maxPlayers,
      active
    } = body

    // Validación básica
    if (!name || !courtType) {
      return NextResponse.json(
        { error: 'Nombre y tipo de cancha son requeridos' },
        { status: 400 }
      )
    }

    // Obtener el siguiente orden
    const lastCourt = await prisma.court.findFirst({
      where: { clubId: session.clubId },
      orderBy: { order: 'desc' }
    })
    
    const nextOrder = lastCourt ? lastCourt.order + 1 : 1

    // Crear la cancha
    const court = await prisma.court.create({
      data: {
        clubId: session.clubId,
        name,
        description: description || null,
        courtType: courtType || 'PADEL',
        surface: surface || 'ARTIFICIAL_GRASS',
        isIndoor: isIndoor || false,
        hasLighting: hasLighting || true,
        basePrice: basePrice || 600,
        peakPrice: peakPrice || null,
        maxPlayers: maxPlayers || 4,
        order: nextOrder,
        active: active !== false
      }
    })

    return NextResponse.json({
      success: true,
      court
    })
  } catch (error) {
    console.error('Error creating court:', error)
    return NextResponse.json(
      { error: 'Error al crear la cancha' },
      { status: 500 }
    )
  }
}