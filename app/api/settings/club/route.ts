import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

// Validation schema for club settings
const clubSettingsSchema = z.object({
  slotDuration: z.number().min(30).max(240).default(90),
  bufferTime: z.number().min(0).max(60).default(15),
  advanceBookingDays: z.number().min(1).max(365).default(30),
  allowSameDayBooking: z.boolean().default(true),
  currency: z.enum(['MXN', 'USD']).default('MXN'),
  taxIncluded: z.boolean().default(true),
  taxRate: z.number().min(0).max(50).default(16), // 16% IVA in Mexico
  cancellationFee: z.number().min(0).max(100).default(0),
  noShowFee: z.number().min(0).max(100).default(50),
  timezone: z.string().default('America/Mexico_City')
})

// GET - Retrieve club settings
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    // Get or create club settings
    let settings = await prisma.clubSettings.findUnique({
      where: { clubId: session.clubId }
    })

    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.clubSettings.create({
        data: {
          id: `club_settings_${session.clubId}_${Date.now()}`,
          clubId: session.clubId,
          currency: 'MXN',
          slotDuration: 90,
          bufferTime: 15,
          advanceBookingDays: 30,
          allowSameDayBooking: true,
          taxIncluded: true,
          taxRate: 16,
          cancellationFee: 0,
          noShowFee: 50,
          timezone: 'America/Mexico_City',
          updatedAt: new Date()
        }
      })
    }

    // Also get club basic info
    const club = await prisma.club.findUnique({
      where: { id: session.clubId },
      select: {
        name: true,
        slug: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        website: true,
        description: true,
        logo: true,
        active: true,
        status: true
      }
    })

    return NextResponse.json({
      success: true,
      club,
      settings
    })

  } catch (error) {
    console.error('Error fetching club settings:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración del club' },
      { status: 500 }
    )
  }
}

// PUT - Update club settings
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    
    // Separate club info from settings
    const { 
      name, email, phone, address, city, state, postalCode, 
      country, website, description, logo,
      ...settingsData 
    } = body

    // Update club info if provided
    if (name || email || phone || address) {
      await prisma.club.update({
        where: { id: session.clubId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(address && { address }),
          ...(city && { city }),
          ...(state && { state }),
          ...(postalCode && { postalCode }),
          ...(country && { country }),
          ...(website && { website }),
          ...(description && { description }),
          ...(logo && { logo })
        }
      })
    }

    // Validate and update settings if provided
    if (Object.keys(settingsData).length > 0) {
      const validatedSettings = clubSettingsSchema.partial().parse(settingsData)
      
      // Check if settings exist
      const existingSettings = await prisma.clubSettings.findUnique({
        where: { clubId: session.clubId }
      })

      let settings
      if (existingSettings) {
        // Update existing settings
        settings = await prisma.clubSettings.update({
          where: { clubId: session.clubId },
          data: validatedSettings
        })
      } else {
        // Create new settings with defaults
        const defaultSettings = {
          currency: 'MXN',
          slotDuration: 90,
          bufferTime: 15,
          advanceBookingDays: 30,
          allowSameDayBooking: true,
          taxIncluded: true,
          taxRate: 16,
          cancellationFee: 0,
          noShowFee: 50,
          timezone: 'America/Mexico_City'
        }
        settings = await prisma.clubSettings.create({
          data: {
            id: `club_settings_${session.clubId}_${Date.now()}`,
            clubId: session.clubId,
            ...defaultSettings,
            ...validatedSettings
          }
        })
      }
    }

    // Return updated data
    const updatedClub = await prisma.club.findUnique({
      where: { id: session.clubId },
      include: { ClubSettings: true }
    })

    return NextResponse.json({
      success: true,
      club: updatedClub,
      message: 'Configuración actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error updating club settings:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}