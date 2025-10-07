import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  try {
    const paramData = await params
    
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

    const { id: tournamentId, matchId } = paramData
    const { scheduledAt, courtId, status } = await req.json()

    // Verificar que el partido pertenece al torneo
    const match = await prisma.tournamentMatch.findFirst({
      where: {
        id: matchId,
        tournamentId: tournamentId
      }
    })

    if (!match) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 })
    }

    // Actualizar el partido con la nueva programación
    const updatedMatch = await prisma.tournamentMatch.update({
      where: { id: matchId },
      data: {
        scheduledAt: new Date(scheduledAt),
        courtId: courtId,
        status: status || 'SCHEDULED'
      }
    })

    return NextResponse.json({ 
      success: true, 
      match: updatedMatch 
    })

  } catch (error) {
    console.error('Error scheduling match:', error)
    return NextResponse.json(
      { error: 'Error al programar el partido' },
      { status: 500 }
    )
  }
}