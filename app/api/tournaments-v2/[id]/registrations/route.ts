import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: tournamentId } = await params

    // Obtener registros de equipos del torneo
    const registrations = await prisma.tournamentRegistration.findMany({
      where: { 
        tournamentId,
        confirmed: true 
      },
      select: {
        id: true,
        teamName: true,
        player1Name: true,
        player2Name: true,
        category: true,
        modality: true,
        teamLevel: true,
        paymentStatus: true,
        checkedIn: true
      }
    })

    return NextResponse.json({
      registrations
    })

  } catch (error) {
    console.error('Error fetching tournament registrations:', error)
    return NextResponse.json(
      { error: 'Error al obtener inscripciones del torneo' },
      { status: 500 }
    )
  }
}