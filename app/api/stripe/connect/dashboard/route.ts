import { NextRequest, NextResponse } from 'next/server'
import { createDashboardLink } from '@/lib/config/stripe'
import { prisma } from '@/lib/config/prisma'
import { requireStaffAuth } from '@/lib/auth/actions'

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffAuth()

    const club = await prisma.club.findUnique({
      where: { id: session.clubId },
      select: { 
        id: true,
        stripeAccountId: true,
        stripeOnboardingCompleted: true
      }
    })

    if (!club) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      )
    }

    if (!club.stripeAccountId || !club.stripeOnboardingCompleted) {
      return NextResponse.json(
        { error: 'La cuenta de Stripe no está configurada completamente' },
        { status: 400 }
      )
    }

    // Create dashboard login link
    const dashboardLinkResult = await createDashboardLink(club.stripeAccountId)
    
    if (!dashboardLinkResult.success) {
      return NextResponse.json(
        { error: dashboardLinkResult.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      dashboardUrl: dashboardLinkResult.data.url,
    })

  } catch (error) {
    console.error('Error creating Stripe dashboard link:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}