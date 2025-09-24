import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    
    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'bookingId is required' },
        { status: 400 }
      )
    }

    // Primero intentar como booking regular
    let booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { Club: true }
    })

    let clubId = booking?.clubId

    // Si no se encuentra, intentar como bookingGroup
    if (!booking) {
      const bookingGroup = await prisma.bookingGroup.findUnique({
        where: { id: bookingId },
        include: { Club: true }
      })
      
      if (bookingGroup) {
        clubId = bookingGroup.clubId
      }
    }

    if (!clubId) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Buscar configuración de Stripe del club
    const stripeProvider = await prisma.paymentProvider.findFirst({
      where: {
        clubId: clubId,
        providerId: 'stripe',
        enabled: true
      }
    })

    if (!stripeProvider || !stripeProvider.config) {
      // Retornar llave pública por defecto si no hay configuración
      return NextResponse.json({
        success: true,
        publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51IeqH4HZxVJhPIzs1kLkQzYWFRRLGzMrDKQqFYDWZ8eXKoGHXaQYKlePQCwpqDe3Bq5JQwGmVpVGYbNdBOgO00V000pZQOtRJ',
        hasClubConfig: false
      })
    }

    const config = stripeProvider.config as any
    if (!config.publicKey) {
      return NextResponse.json({
        success: true,
        publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51IeqH4HZxVJhPIzs1kLkQzYWFRRLGzMrDKQqFYDWZ8eXKoGHXaQYKlePQCwpqDe3Bq5JQwGmVpVGYbNdBOgO00V000pZQOtRJ',
        hasClubConfig: false
      })
    }

    return NextResponse.json({
      success: true,
      publicKey: config.publicKey,
      hasClubConfig: true
    })

  } catch (error) {
    console.error('Error fetching Stripe config:', error)
    // En caso de error, retornar llave por defecto
    return NextResponse.json({
      success: true,
      publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51IeqH4HZxVJhPIzs1kLkQzYWFRRLGzMrDKQqFYDWZ8eXKoGHXaQYKlePQCwpqDe3Bq5JQwGmVpVGYbNdBOgO00V000pZQOtRJ',
      hasClubConfig: false
    })
  }
}