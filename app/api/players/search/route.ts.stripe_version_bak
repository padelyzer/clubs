import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// GET - Search player by phone
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    
    const phone = searchParams.get('phone')
    
    // DEBUG: Log session info
    console.log('🔍 Player search DEBUG:')
    console.log('   Session clubId:', session.clubId)
    console.log('   Phone search:', phone)
    
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Teléfono es requerido' },
        { status: 400 }
      )
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = phone.replace(/\D/g, '')
    
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Teléfono debe tener al menos 10 dígitos' },
        { status: 400 }
      )
    }

    // Search for player with this phone number
    console.log('   Searching with:')
    console.log('     clubId:', session.clubId)
    console.log('     cleanPhone:', cleanPhone)
    
    // Try exact match first (both with cleaned and original format)
    let player = await prisma.player.findFirst({
      where: {
        clubId: session.clubId,
        OR: [
          { phone: cleanPhone },
          { phone: phone }, // Try with original format (may have dashes)
        ],
        active: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        memberNumber: true
      }
    })
    
    // If not found with exact match, try with contains (for different formats)
    if (!player) {
      console.log('   Exact match failed, trying contains...')
      player = await prisma.player.findFirst({
        where: {
          clubId: session.clubId,
          phone: {
            contains: cleanPhone
          },
          active: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          memberNumber: true
        }
      })
    }
    
    console.log('   Player found:', player ? `${player.name} (${player.phone})` : 'None')

    if (player) {
      return NextResponse.json({
        success: true,
        player: {
          id: player.id,
          name: player.name,
          email: player.email || '',
          phone: player.phone,
          memberNumber: player.memberNumber
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Cliente no encontrado'
      })
    }

  } catch (error) {
    console.error('Error searching player:', error)
    return NextResponse.json(
      { success: false, error: 'Error al buscar cliente' },
      { status: 500 }
    )
  }
}