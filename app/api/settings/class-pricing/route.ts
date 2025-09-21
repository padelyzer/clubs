import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { requireAuthAPI } from '@/lib/auth/actions'

// GET - Obtener configuración de precios
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    let pricing = await prisma.classPricing.findUnique({
      where: { clubId: session.clubId }
    })
    
    // Si no existe, crear con valores predeterminados
    if (!pricing) {
      pricing = await prisma.classPricing.create({
        data: {
          clubId: session.clubId,
          individualPrice: 50000, // $500 MXN
          groupPrice: 30000,      // $300 MXN
          clinicPrice: 20000,     // $200 MXN
          instructorPaymentType: 'HOURLY',
          instructorHourlyRate: 20000, // $200 MXN por hora
          instructorPercentage: 50,
          instructorFixedRate: 30000,
          enableBulkDiscount: false,
          bulkDiscountThreshold: 10,
          bulkDiscountPercentage: 10
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      pricing
    })
    
  } catch (error) {
    console.error('Error fetching class pricing:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración de precios' },
      { status: 500 }
    )
  }
}

// POST - Actualizar configuración de precios
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
    
    // Verificar si ya existe
    const existing = await prisma.classPricing.findUnique({
      where: { clubId: session.clubId }
    })
    
    let pricing
    
    if (existing) {
      // Actualizar existente
      pricing = await prisma.classPricing.update({
        where: { clubId: session.clubId },
        data: {
          individualPrice: body.individualPrice,
          groupPrice: body.groupPrice,
          clinicPrice: body.clinicPrice,
          instructorPaymentType: body.instructorPaymentType,
          instructorHourlyRate: body.instructorHourlyRate,
          instructorPercentage: body.instructorPercentage,
          instructorFixedRate: body.instructorFixedRate,
          enableBulkDiscount: body.enableBulkDiscount,
          bulkDiscountThreshold: body.bulkDiscountThreshold,
          bulkDiscountPercentage: body.bulkDiscountPercentage
        }
      })
    } else {
      // Crear nuevo
      pricing = await prisma.classPricing.create({
        data: {
          clubId: session.clubId,
          ...body
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      pricing,
      message: 'Configuración de precios actualizada exitosamente'
    })
    
  } catch (error) {
    console.error('Error updating class pricing:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar configuración de precios' },
      { status: 500 }
    )
  }
}