import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    
    const { id: tournamentId } = await params
    const { searchParams } = new URL(req.url)
    const courtNumber = searchParams.get('courtNumber')
    
    if (!courtNumber) {
      return NextResponse.json(
        { error: 'Número de cancha requerido' },
        { status: 400 }
      )
    }

    // Buscar el partido actual o próximo para esta cancha
    const now = new Date()
    
    // Primero buscar partido en progreso
    let match = await prisma.tournamentMatch.findFirst({
      where: {
        tournamentId,
        courtNumber: String(courtNumber),
        status: { in: ['in_progress', 'IN_PROGRESS'] }
      }
    })
    
    // Si no hay partido en progreso, buscar el próximo partido programado
    if (!match) {
      match = await prisma.tournamentMatch.findFirst({
        where: {
          tournamentId,
          courtNumber: String(courtNumber),
          status: { in: ['pending', 'SCHEDULED'] },
          scheduledAt: {
            gte: new Date(now.getTime() - 30 * 60 * 1000), // 30 min antes
            lte: new Date(now.getTime() + 90 * 60 * 1000)  // 90 min después
          }
        },
        orderBy: {
          scheduledAt: 'asc'
        }
      })
    }

    if (!match) {
      return NextResponse.json({
        success: false,
        match: null,
        message: 'No hay partido activo en esta cancha'
      })
    }

    return NextResponse.json({
      success: true,
      match: {
        id: match.id,
        team1Name: match.team1Name,
        team2Name: match.team2Name,
        scheduledAt: match.scheduledAt,
        round: match.round,
        courtNumber: match.courtNumber,
        status: match.status
      }
    })

  } catch (error) {
    console.error('Error fetching current match:', error)
    return NextResponse.json(
      { error: 'Error al obtener partido actual' },
      { status: 500 }
    )
  }
}