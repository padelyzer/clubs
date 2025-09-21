import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

// GET - Get single match details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, matchId: string }> }
) {
  try {
    const { id: tournamentId, matchId } = await params
    
    const match = await prisma.tournamentMatch.findFirst({
      where: {
        id: matchId,
        tournamentId
      },
      include: {
        court: true,
        roundRelation: true
      }
    })
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      match
    })
    
  } catch (error) {
    console.error('Error fetching match:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener partido' },
      { status: 500 }
    )
  }
}