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

    // Get widget settings
    const widgetSettings = await settingsService.getWidgetSettings(clubId)

    return NextResponse.json({
      success: true,
      data: {
        widgetSettings
      }
    })

  } catch (error) {
    console.error('Error getting widget settings:', error)
    return NextResponse.json(
      { error: 'Failed to get widget settings' },
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
    const { widgetSettings } = body

    // Update settings
    const settingsUpdated = widgetSettings ? 
      await settingsService.updateWidgetSettings(clubId, widgetSettings) : true

    if (!settingsUpdated) {
      return NextResponse.json(
        { error: 'Failed to update widget settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Widget settings updated successfully'
    })

  } catch (error) {
    console.error('Error updating widget settings:', error)
    return NextResponse.json(
      { error: 'Failed to update widget settings' },
      { status: 500 }
    )
  }
}