import { NextRequest, NextResponse } from 'next/server'
import { recordOptOut, updateUserPreferences, isValidWhatsAppNumber } from '@/lib/whatsapp/opt-in-system'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, messageType, preferences } = body

    // Validate required fields
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Número de teléfono es requerido' },
        { status: 400 }
      )
    }

    // Validate phone number format
    if (!isValidWhatsAppNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Formato de número de teléfono inválido' },
        { status: 400 }
      )
    }

    // Update user preferences
    const success = await updateUserPreferences(phoneNumber, preferences)

    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar preferencias' },
        { status: 500 }
      )
    }

    // If all preferences are disabled, record as full opt-out
    const allDisabled = preferences && Object.values(preferences).every(value => value === false)
    
    if (allDisabled) {
      await recordOptOut(phoneNumber, 'User disabled all notification preferences')
    }

    return NextResponse.json({
      success: true,
      message: 'Preferencias actualizadas exitosamente',
      phoneNumber,
      preferences
    })

  } catch (error: any) {
    console.error('Opt-out API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}

// Get current preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phoneNumber = searchParams.get('phoneNumber')

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Número de teléfono es requerido' },
        { status: 400 }
      )
    }

    // TODO: Implement getUserPreferences from opt-in-system
    // For now, return default preferences
    const preferences = {
      bookingConfirmations: true,
      paymentReminders: true,
      bookingReminders: true,
      promotionalMessages: false,
      generalUpdates: false
    }

    return NextResponse.json({
      success: true,
      phoneNumber,
      preferences
    })

  } catch (error: any) {
    console.error('Get preferences API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}