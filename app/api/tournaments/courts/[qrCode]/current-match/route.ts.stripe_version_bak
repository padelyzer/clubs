import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

// GET: Obtener el partido actual de una cancha basado en el QR code
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  try {
    const paramData = await params
    
    const { qrCode } = paramData

    // Buscar la cancha por QR code
    const courtQR = await prisma.courtQRCode.findUnique({
      where: { qrCode },
      include: {
        Court: true,
        Club: true
      }
    })

    if (!courtQR || !courtQR.isActive) {
      return NextResponse.json(
        { error: 'Código QR no válido' },
        { status: 404 }
      )
    }

    // Buscar el partido actual o próximo en esta cancha
    const now = new Date()
    const timeWindow = new Date(now.getTime() + 30 * 60000) // 30 minutos de ventana

    const match = await prisma.tournamentMatch.findFirst({
      where: {
        courtId: courtQR.courtId,
        OR: [
          { status: 'IN_PROGRESS' },
          {
            AND: [
              { status: 'SCHEDULED' },
              { scheduledAt: { lte: timeWindow } },
              { scheduledAt: { gte: new Date(now.getTime() - 120 * 60000) } } // 2 horas atrás
            ]
          }
        ]
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    return NextResponse.json({
      court: {
        id: courtQR.courtId,
        name: courtQR.Court.name,
        number: courtQR.courtNumber,
        club: courtQR.Club.name
      },
      match: match ? {
        id: match.id,
        round: match.round,
        team1Name: match.team1Name,
        team2Name: match.team2Name,
        team1Player1: match.team1Player1,
        team1Player2: match.team1Player2,
        team2Player1: match.team2Player1,
        team2Player2: match.team2Player2,
        scheduledAt: match.scheduledAt,
        courtNumber: match.courtNumber,
        status: match.status
      } : null
    })
  } catch (error) {
    console.error('Error fetching current match:', error)
    return NextResponse.json(
      { error: 'Error al obtener partido actual' },
      { status: 500 }
    )
  }
}