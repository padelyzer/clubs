import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// GET - Get single player details (SIMPLIFIED VERSION)  
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[GET Player Details] Starting...')
    
    const paramData = await params
    const { id } = paramData
    
    console.log('[GET Player Details] Player ID:', id)
    
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    console.log('[GET Player Details] Auth OK, clubId:', session.clubId)
    
    const playerId = id

    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        clubId: session.clubId
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        clubId: true,
        memberNumber: true,
        level: true,
        gender: true,
        active: true,
        birthDate: true,
        notes: true,
        createdAt: true,
        totalBookings: true,
        totalSpent: true,
        lastBookingAt: true
        // Explicitly exclude totalClasses and other potentially missing columns
      }
    })

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Jugador no encontrado' },
        { status: 404 }
      )
    }

    console.log('[GET Player Details] Player found:', player.name)
    
    // Use cached statistics from player record (simplified)
    console.log('[GET Player Details] Using cached stats...')
    const bookingsCount = player.totalBookings || 0
    const totalSpent = player.totalSpent || 0
    const lastBooking = player.lastBookingAt ? {
      date: player.lastBookingAt,
      court: { name: 'Cancha' } // Simplified
    } : null
    
    console.log('[GET Player Details] Stats:', { bookingsCount, totalSpent, lastBooking })

    // Skip stats update for now (simplified)
    console.log('[GET Player Details] Returning player data...')
    
    return NextResponse.json({
      success: true,
      player: {
        ...player,
        statistics: {
          totalBookings: bookingsCount,
          totalSpent: totalSpent,
          lastBooking: lastBooking ? {
            date: lastBooking.date,
            court: lastBooking.court.name
          } : null
        }
      }
    })

  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener jugador' },
      { status: 500 }
    )
  }
}