import { NextRequest, NextResponse } from 'next/server'
import { createConnectAccount, createAccountLink } from '@/lib/config/stripe'
import { prisma } from '@/lib/config/prisma'
import { requireStaffAuth } from '@/lib/auth/actions'

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffAuth()

    const club = await prisma.club.findUnique({
      where: { id: session.clubId },
      select: { 
        id: true, 
        email: true, 
        name: true,
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

    // Check if club already has a Stripe account
    if (club.stripeAccountId && club.stripeOnboardingCompleted) {
      return NextResponse.json(
        { error: 'El club ya tiene una cuenta de Stripe configurada' },
        { status: 400 }
      )
    }

    let accountId = club.stripeAccountId

    // Create Stripe Connect account if doesn't exist
    if (!accountId) {
      console.log('Creating new Stripe Connect account for club:', club.id)
      
      const accountResult = await createConnectAccount(club.email)
      
      if (!accountResult.success) {
        console.error('Error creating Stripe account:', accountResult.error)
        return NextResponse.json(
          { error: 'Error creando cuenta de Stripe: ' + accountResult.error.message },
          { status: 500 }
        )
      }

      accountId = accountResult.data.id

      // Save account ID to database
      await prisma.club.update({
        where: { id: club.id },
        data: { stripeAccountId: accountId }
      })

      console.log('Stripe account created:', accountId)
    }

    // Create account link for onboarding
    const refreshUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/stripe?refresh=true`
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/stripe?success=true`

    const accountLinkResult = await createAccountLink(accountId!, refreshUrl, returnUrl)
    
    if (!accountLinkResult.success) {
      return NextResponse.json(
        { error: accountLinkResult.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      accountId,
      onboardingUrl: accountLinkResult.data.url,
    })

  } catch (error) {
    console.error('Error creating Stripe Connect account:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}