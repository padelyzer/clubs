import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

// Validation schema for pricing rules
const pricingSchema = z.object({
  dayOfWeek: z.number().min(0).max(6).nullable(), // null = all days
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  price: z.number().min(0) // Price in cents
})

const bulkPricingSchema = z.array(pricingSchema)

// GET - Retrieve club pricing
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const pricing = await prisma.pricing.findMany({
      where: { clubId: session.clubId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Return empty pricing if none exists - let user configure manually
    if (pricing.length === 0) {
      return NextResponse.json({
        success: true,
        pricing: [],
        message: 'No hay precios configurados'
      })
    }

    // Format pricing with day names
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const formattedPricing = pricing.map(price => ({
      ...price,
      dayName: price.dayOfWeek !== null ? daysOfWeek[price.dayOfWeek] : 'Todos los días',
      formattedPrice: `$${(price.price / 100).toFixed(2)} MXN`
    }))

    return NextResponse.json({
      success: true,
      pricing: formattedPricing
    })

  } catch (error) {
    console.error('Error fetching pricing:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener precios' },
      { status: 500 }
    )
  }
}

// POST - Create new pricing rule
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    
    const validatedData = pricingSchema.parse(body)
    
    // Check for overlapping pricing rules
    const overlapping = await prisma.pricing.findFirst({
      where: {
        clubId: session.clubId,
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

    // Create pricing rule
    const pricingId = `pricing_${session.clubId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const pricing = await prisma.pricing.create({
      data: {
        id: pricingId,
        clubId: session.clubId,
        ...validatedData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      pricing,
      message: 'Precio creado exitosamente' 
    })

  } catch (error) {
    console.error('Error creating pricing:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al crear precio' },
      { status: 500 }
    )
  }
}

// PUT - Update pricing rule
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de precio requerido' },
        { status: 400 }
      )
    }

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

    // Check for overlapping pricing rules (excluding current rule)
    const overlapping = await prisma.pricing.findFirst({
      where: {
        clubId: session.clubId,
        dayOfWeek: validatedData.dayOfWeek,
        id: { not: id }, // Exclude current rule
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
          error: 'Ya existe un precio para este horario' 
        },
        { status: 409 }
      )
    }

    // Update pricing rule
    const updatedPricing = await prisma.pricing.update({
      where: { id },
      data: validatedData
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
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de precio requerido' },
        { status: 400 }
      )
    }

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