import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

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
    const { date, startTime, duration } = body

    if (!date || !startTime || !duration) {
      return NextResponse.json(
        { success: false, error: 'Se requieren fecha, hora de inicio y duración' },
        { status: 400 }
      )
    }

    // Parse date
    const bookingDate = new Date(date)
    const dayOfWeek = bookingDate.getDay()
    
    // Get applicable pricing - prioritize day-specific rules
    const pricing = await prisma.pricing.findFirst({
      where: {
        clubId: session.clubId,
        OR: [
          { dayOfWeek },        // Day-specific pricing (higher priority)
          { dayOfWeek: null }   // Default pricing (fallback)
        ],
        startTime: { lte: startTime },
        endTime: { gt: startTime }
      },
      orderBy: [
        { dayOfWeek: 'desc' }, // Prefer day-specific over default (non-null first)
        { price: 'desc' },     // If multiple rules match, prefer higher price
        { createdAt: 'desc' }
      ]
    })

    if (!pricing) {
      // Get club slug from session or database
      const club = await prisma.club.findUnique({
        where: { id: session.clubId },
        select: { slug: true }
      })
      
      const configurationUrl = club ? `/c/${club.slug}/dashboard/settings/club` : '/dashboard/settings/club'
      
      return NextResponse.json(
        { 
          success: false, 
          error: `No hay configuración de precios para el horario ${startTime}. Debe configurar los precios antes de crear reservas.`,
          requiresConfiguration: true,
          configurationUrl
        },
        { status: 400 }
      )
    }

    const basePrice = pricing.price // En centavos
    const hours = duration / 60
    const totalPriceCents = Math.round(basePrice * hours)
    const totalPriceMXN = totalPriceCents / 100

    return NextResponse.json({
      success: true,
      pricing: {
        basePriceCents: basePrice,
        basePriceMXN: basePrice / 100,
        duration,
        hours,
        totalPriceCents,
        totalPriceMXN,
        startTime,
        endTime: pricing.endTime,
        dayOfWeek: pricing.dayOfWeek
      }
    })

  } catch (error) {
    console.error('Error calculating price:', error)
    return NextResponse.json(
      { success: false, error: 'Error al calcular el precio' },
      { status: 500 }
    )
  }
}