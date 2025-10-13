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
      type,
      indoor,
      active
    } = body

    // Validación básica
    if (!name) {
      return NextResponse.json(
        { error: 'Nombre de cancha es requerido' },
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
        type: type || 'PADEL',
        indoor: indoor || false,
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