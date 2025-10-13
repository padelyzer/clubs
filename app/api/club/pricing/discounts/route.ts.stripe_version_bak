import { NextRequest, NextResponse } from 'next/server'
import { requireClubStaff } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// GET - Obtener descuentos del club
export async function GET(request: NextRequest) {
  try {
    const session = await requireClubStaff()
    
    const discounts = await prisma.discountRule.findMany({
      where: { clubId: session.clubId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      discounts
    })
  } catch (error) {
    console.error('Error fetching discounts:', error)
    return NextResponse.json(
      { error: 'Error al obtener descuentos' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo descuento
export async function POST(request: NextRequest) {
  try {
    const session = await requireClubStaff()
    const body = await request.json()

    const discount = await prisma.discountRule.create({
      data: {
        clubId: session.clubId,
        name: body.name,
        code: body.code || null,
        discountType: body.discountType,
        discountValue: body.discountValue,
        minBookings: body.minBookings || 1,
        maxUses: body.maxUses || null,
        usedCount: 0,
        validFrom: new Date(body.validFrom),
        validUntil: new Date(body.validUntil),
        active: body.active !== false
      }
    })

    return NextResponse.json({
      success: true,
      discount
    })
  } catch (error) {
    console.error('Error creating discount:', error)
    return NextResponse.json(
      { error: 'Error al crear descuento' },
      { status: 500 }
    )
  }
}