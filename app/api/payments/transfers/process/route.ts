import { NextRequest, NextResponse } from 'next/server'
import { processPendingTransfers } from '@/lib/payments/commission-system'
import { prisma } from '@/lib/config/prisma'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Get user and club information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { Club: true }
    })

    if (!user || !user.club) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      )
    }

    if (user.role !== 'CLUB_OWNER') {
      return NextResponse.json(
        { error: 'Solo el propietario del club puede procesar transferencias' },
        { status: 403 }
      )
    }

    const club = user.club

    if (!club.stripeAccountId || !club.stripeOnboardingCompleted) {
      return NextResponse.json(
        { error: 'La cuenta de Stripe no está configurada completamente' },
        { status: 400 }
      )
    }

    const result = await processPendingTransfers(club.id)

    return NextResponse.json({
      success: true,
      message: `Se procesaron ${result.successful} de ${result.processed} transferencias`,
      ...result,
    })

  } catch (error) {
    console.error('Error processing transfers:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}