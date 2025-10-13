import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// PATCH - Update check-in status for a registration
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, registrationId: string }> }
) {
  try {
    // SEGURIDAD: Requerir autenticación
    const session = await requireAuthAPI()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    if (!session?.clubId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const paramData = await params
    const { id, registrationId } = paramData
    const { checkedIn } = await request.json()

    // SEGURIDAD: Verificar que el torneo pertenece al club del usuario
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: id,
        clubId: session.clubId
      }
    })
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    // Actualizar el estado de check-in
    const updatedRegistration = await prisma.tournamentRegistration.update({
      where: { 
        id: registrationId,
        tournamentId: id
      },
      data: {
        checkedIn: checkedIn,
        checkedInAt: checkedIn ? new Date() : null
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedRegistration,
      message: checkedIn ? 'Check-in exitoso' : 'Check-in revertido'
    })
    
  } catch (error: any) {
    console.error('Error updating check-in status:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar check-in',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET - Get check-in status for a registration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, registrationId: string }> }
) {
  try {
    // SEGURIDAD: Requerir autenticación
    const session = await requireAuthAPI()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    if (!session?.clubId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const paramData = await params
    const { id, registrationId } = paramData

    // SEGURIDAD: Verificar que el torneo pertenece al club del usuario
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: id,
        clubId: session.clubId
      }
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado o no pertenece a tu club' },
        { status: 404 }
      )
    }

    const registration = await prisma.tournamentRegistration.findUnique({
      where: {
        id: registrationId,
        tournamentId: id
      },
      select: {
        id: true,
        teamName: true,
        checkedIn: true,
        checkedInAt: true,
        player1Name: true,
        player2Name: true,
        category: true,
        modality: true,
        paymentStatus: true
      }
    })
    
    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: registration
    })
    
  } catch (error: any) {
    console.error('Error fetching check-in status:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener estado de check-in',
        details: error.message 
      },
      { status: 500 }
    )
  }
}