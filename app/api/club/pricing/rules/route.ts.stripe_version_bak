import { NextRequest, NextResponse } from 'next/server'
import { requireClubStaff } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// GET - Obtener reglas de precio del club
export async function GET(request: NextRequest) {
  try {
    const session = await requireClubStaff()
    
    const rules = await prisma.priceRule.findMany({
      where: { clubId: session.clubId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      rules
    })
  } catch (error) {
    console.error('Error fetching price rules:', error)
    return NextResponse.json(
      { error: 'Error al obtener reglas de precio' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva regla de precio
export async function POST(request: NextRequest) {
  try {
    const session = await requireClubStaff()
    const body = await request.json()

    const rule = await prisma.priceRule.create({
      data: {
        clubId: session.clubId,
        name: body.name,
        type: body.type,
        priceModifier: body.priceModifier,
        startTime: body.startTime,
        endTime: body.endTime,
        daysOfWeek: body.daysOfWeek,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        active: body.active !== false
      }
    })

    return NextResponse.json({
      success: true,
      rule
    })
  } catch (error) {
    console.error('Error creating price rule:', error)
    return NextResponse.json(
      { error: 'Error al crear regla de precio' },
      { status: 500 }
    )
  }
}