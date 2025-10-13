import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const scoreSchema = z.object({
  player1Score: z.array(z.number().int().min(0)).min(1),
  player2Score: z.array(z.number().int().min(0)).min(1),
  winnerId: z.string().optional(),
  capturedBy: z.string().default('player'), // 'player' or 'admin'
  notes: z.string().optional()
})

// Get match details for result capture
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id: matchId } = paramData
    const { searchParams } = new URL(request.url)
    const fromQr = searchParams.get('qr') === 'true'

    // Get match details
    const match = await prisma.tournamentMatch.findFirst({
      where: {
        id: matchId
      },
      include: {
        Tournament: {
          select: {
            name: true,
            clubId: true,
            Club: {
              select: {
                name: true
              }
            }
          }
        },
        Court: {
          select: {
            name: true
          }
        }
      }
    })

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    // If accessed via QR, check if QR is still valid
    if (fromQr) {
      if (!match.qrValidUntil || new Date() > match.qrValidUntil) {
        return NextResponse.json(
          { success: false, error: 'El código QR ha expirado' },
          { status: 400 }
        )
      }
    }

    // Check if match can accept results
    if (match.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        match: {
          ...match,
          team1Score: match.team1Score,
          team2Score: match.team2Score,
          canEdit: false,
          message: 'Este partido ya ha sido completado'
        }
      })
    }

    if (match.status !== 'SCHEDULED' && match.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { success: false, error: 'Este partido no está disponible para captura de resultados' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      match: {
        ...match,
        team1Score: match.team1Score,
        team2Score: match.team2Score,
        canEdit: true
      }
    })

  } catch (error) {
    console.error('Error getting match details:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener detalles del partido' },
      { status: 500 }
    )
  }
}

// Submit match results
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id: matchId } = paramData
    const body = await request.json()
    
    const validatedData = scoreSchema.parse(body)
    const { player1Score, player2Score, winnerId, capturedBy, notes } = validatedData

    // Get match details
    const match = await prisma.tournamentMatch.findFirst({
      where: {
        id: matchId
      }
    })

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    // Check if match can accept results
    if (match.status !== 'SCHEDULED' && match.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { success: false, error: 'Este partido no puede recibir resultados' },
        { status: 400 }
      )
    }

    // Validate scores length match
    if (player1Score.length !== player2Score.length) {
      return NextResponse.json(
        { success: false, error: 'Los sets de ambos jugadores deben tener la misma cantidad' },
        { status: 400 }
      )
    }

    // Determine winner based on scores if not provided
    let finalWinnerId = winnerId
    if (!finalWinnerId) {
      const player1Sets = player1Score.filter((score, index) => score > player2Score[index]).length
      const player2Sets = player2Score.filter((score, index) => score > player1Score[index]).length
      
      if (player1Sets > player2Sets) {
        finalWinnerId = match.player1Id
      } else if (player2Sets > player1Sets) {
        finalWinnerId = match.player2Id
      }
    }

    // Update match with results
    const updatedMatch = await prisma.tournamentMatch.update({
      where: { id: matchId },
      data: {
        team1Score: player1Score.reduce((a, b) => a + b, 0),
        team2Score: player2Score.reduce((a, b) => a + b, 0),
        team1Sets: player1Score,
        team2Sets: player2Score,
        winner: finalWinnerId === match.player1Id ? match.player1Name : match.player2Name,
        status: 'COMPLETED',
        actualEndTime: new Date(),
        resultsConfirmed: capturedBy === 'admin', // Admin captures are auto-verified
        notes: notes || match.notes
      },
      include: {
        Tournament: true,
        Court: true
      }
    })

    return NextResponse.json({
      success: true,
      match: updatedMatch,
      message: capturedBy === 'player' 
        ? 'Resultado enviado correctamente. Será verificado por el organizador.'
        : 'Resultado registrado exitosamente.'
    })

  } catch (error) {
    console.error('Error submitting match result:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos de resultado inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al registrar resultado' },
      { status: 500 }
    )
  }
}

// Update/verify match results (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id: matchId } = paramData
    const body = await request.json()
    const { verified, dispute, disputeNotes } = body

    // Get match
    const match = await prisma.tournamentMatch.findFirst({
      where: { id: matchId }
    })

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    // Update verification status
    const updatedMatch = await prisma.tournamentMatch.update({
      where: { id: matchId },
      data: {
        resultsConfirmed: verified,
        conflictResolved: !dispute,
        notes: disputeNotes || match.notes
      }
    })

    return NextResponse.json({
      success: true,
      match: updatedMatch,
      message: verified ? 'Resultado verificado' : 'Resultado marcado como no verificado'
    })

  } catch (error) {
    console.error('Error updating match verification:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar verificación' },
      { status: 500 }
    )
  }
}