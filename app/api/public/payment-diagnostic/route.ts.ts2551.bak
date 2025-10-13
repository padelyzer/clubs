import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId required' }, { status: 400 })
    }

    // 1. Find booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { Club: true }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // 2. Find payment provider
    const paymentProvider = await prisma.paymentProvider.findFirst({
      where: {
        clubId: booking.clubId,
        providerId: 'stripe',
        enabled: true
      }
    })

    // 3. Check Stripe config
    const stripeConfig = paymentProvider?.config as any

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        playerName: booking.playerName,
        price: booking.price,
        clubId: booking.clubId,
        clubName: booking.Club?.name
      },
      paymentProvider: {
        found: !!paymentProvider,
        enabled: paymentProvider?.enabled,
        hasConfig: !!paymentProvider?.config
      },
      stripeKeys: {
        hasPublicKey: !!stripeConfig?.publicKey,
        publicKeyPrefix: stripeConfig?.publicKey?.substring(0, 10),
        hasSecretKey: !!stripeConfig?.secretKey,
        secretKeyPrefix: stripeConfig?.secretKey?.substring(0, 10)
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasGlobalPublicKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}