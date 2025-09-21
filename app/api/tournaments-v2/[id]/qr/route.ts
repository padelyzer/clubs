import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// GET - Generar datos para QR de una cancha específica
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
    const { searchParams } = new URL(req.url)
    const courtNumber = searchParams.get('courtNumber')
    
    if (!courtNumber) {
      return NextResponse.json(
        { error: 'Número de cancha requerido' },
        { status: 400 }
      )
    }

    // Verificar que el torneo existe y pertenece al club
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        clubId: session.clubId
      }
    })

    if (!tournament) {
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }

    // Generar URL para el QR
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`
    const captureUrl = `${baseUrl}/capture/${tournamentId}/${courtNumber}`
    
    // Obtener información de la cancha
    const court = await prisma.court.findFirst({
      where: {
        clubId: session.clubId,
        order: parseInt(courtNumber)
      }
    })

    return NextResponse.json({
      success: true,
      qrData: {
        url: captureUrl,
        tournamentId,
        tournamentName: tournament.name,
        courtNumber,
        courtName: court?.name || `Cancha ${courtNumber}`,
        clubId: session.clubId
      }
    })

  } catch (error) {
    console.error('Error generating QR data:', error)
    return NextResponse.json(
      { error: 'Error al generar datos del QR' },
      { status: 500 }
    )
  }
}

// POST - Validar y procesar captura de resultado desde QR
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    
    const { id: tournamentId } = await params
    const body = await req.json()
    const { courtNumber, team1Score, team2Score, matchId } = body

    // Buscar el partido actual para esta cancha
    const now = new Date()
    const match = await prisma.tournamentMatch.findFirst({
      where: {
        id: matchId,
        tournamentId,
        courtNumber: String(courtNumber),
        status: { in: ['pending', 'SCHEDULED', 'in_progress', 'IN_PROGRESS'] }
      }
    })

    if (!match) {
      return NextResponse.json(
        { error: 'No hay partido activo para esta cancha en este momento' },
        { status: 404 }
      )
    }

    // Validar que el partido está en su horario (con 30 min de tolerancia antes y después)
    if (match.scheduledAt) {
      const scheduledTime = new Date(match.scheduledAt)
      const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime())
      const maxTimeDiff = 120 * 60 * 1000 // 120 minutos de ventana total
      
      if (timeDiff > maxTimeDiff) {
        return NextResponse.json(
          { error: 'Este partido no está en su horario programado' },
          { status: 400 }
        )
      }
    }

    // Determinar el ganador
    const winner = team1Score > team2Score ? match.team1Name : match.team2Name

    // Actualizar el resultado del partido
    const updatedMatch = await prisma.tournamentMatch.update({
      where: { id: match.id },
      data: {
        team1Score,
        team2Score,
        winner,
        status: 'completed',
        endTime: now
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Resultado registrado exitosamente',
      match: updatedMatch
    })

  } catch (error) {
    console.error('Error processing match result:', error)
    return NextResponse.json(
      { error: 'Error al procesar el resultado' },
      { status: 500 }
    )
  }
}