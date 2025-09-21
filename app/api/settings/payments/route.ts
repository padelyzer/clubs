import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { settingsService } from '@/lib/services/settings-service'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await checkRateLimit('settings-get', 'auth')
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Authentication
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const clubId = session.clubId

    // Get payment settings
    const settings = await settingsService.getClubSettings(clubId)
    const paymentProviders = await settingsService.getPaymentProviders(clubId)

    return NextResponse.json({
      success: true,
      data: {
        settings,
        paymentProviders
      }
    })

  } catch (error) {
    console.error('Error getting payment settings:', error)
    return NextResponse.json(
      { error: 'Failed to get payment settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await checkRateLimit('settings-update', 'auth')
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Authentication
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const clubId = session.clubId

    // Parse request body
    const body = await request.json()
    const { settings, paymentProviders } = body

    // Update settings
    const settingsUpdated = settings ? 
      await settingsService.updateClubSettings(clubId, settings) : true
    
    // Convert paymentProviders object to array format if needed
    let providersUpdated = true
    if (paymentProviders) {
      const providersArray = []
      if (paymentProviders.stripe) {
        providersArray.push({
          providerId: 'stripe',
          name: 'Stripe',
          enabled: paymentProviders.stripe.enabled,
          config: {
            publicKey: paymentProviders.stripe.publicKey,
            secretKey: paymentProviders.stripe.secretKey
          },
          fees: { percentage: 2.9, fixed: 30 }
        })
      }
      providersUpdated = await settingsService.updatePaymentProviders(clubId, providersArray)
    }

    if (!settingsUpdated || !providersUpdated) {
      return NextResponse.json(
        { error: 'Failed to update payment settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Payment settings updated successfully'
    })

  } catch (error) {
    console.error('Error updating payment settings:', error)
    return NextResponse.json(
      { error: 'Failed to update payment settings' },
      { status: 500 }
    )
  }
}