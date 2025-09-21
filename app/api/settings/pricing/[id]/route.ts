import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const pricingSchema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  price: z.number().min(0),
  dayOfWeek: z.number().min(0).max(6).optional().nullable()
})

// PUT - Update pricing rule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { id } = await params
    const body = await request.json()
    
    const validatedData = pricingSchema.parse(body)
    
    // Check if pricing exists and belongs to club
    const existingPricing = await prisma.pricing.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!existingPricing) {
      return NextResponse.json(
        { success: false, error: 'Precio no encontrado' },
        { status: 404 }
      )
    }

    // Check for overlapping pricing rules (excluding current pricing)
    const overlapping = await prisma.pricing.findFirst({
      where: {
        clubId: session.clubId,
        id: { not: id }, // Exclude current pricing
        dayOfWeek: validatedData.dayOfWeek,
        OR: [
          {
            AND: [
              { startTime: { lte: validatedData.startTime } },
              { endTime: { gt: validatedData.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: validatedData.endTime } },
              { endTime: { gte: validatedData.endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: validatedData.startTime } },
              { endTime: { lte: validatedData.endTime } }
            ]
          }
        ]
      }
    })

    if (overlapping) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe un precio para este horario',
          overlapping 
        },
        { status: 409 }
      )
    }

    // Convert price to cents if it's in pesos
    const priceInCents = validatedData.price < 1000 ? validatedData.price * 100 : validatedData.price

    // Update pricing rule
    const updatedPricing = await prisma.pricing.update({
      where: { id },
      data: {
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        price: priceInCents,
        dayOfWeek: validatedData.dayOfWeek
      }
    })

    return NextResponse.json({
      success: true,
      pricing: updatedPricing,
      message: 'Precio actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating pricing:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al actualizar precio' },
      { status: 500 }
    )
  }
}

// DELETE - Delete pricing rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { id } = await params
    
    // Check if pricing exists and belongs to club
    const pricing = await prisma.pricing.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!pricing) {
      return NextResponse.json(
        { success: false, error: 'Precio no encontrado' },
        { status: 404 }
      )
    }

    // Don't delete if it's the only pricing rule
    const count = await prisma.pricing.count({
      where: { clubId: session.clubId }
    })

    if (count === 1) {
      return NextResponse.json(
        { success: false, error: 'No puedes eliminar el único precio configurado' },
        { status: 400 }
      )
    }

    // Delete pricing
    await prisma.pricing.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Precio eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting pricing:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar precio' },
      { status: 500 }
    )
  }
}