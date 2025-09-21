import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getSession } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const createMatchSchema = z.object({
  roundId: z.string().optional(),
  round: z.union([z.string(), z.number()]).transform(val => String(val)),
  matchNumber: z.union([z.number(), z.string()]).transform(val => {
    const num = typeof val === 'string' ? parseInt(val, 10) : val
    return isNaN(num) ? 1 : num
  }).optional().default(1),
  // Team fields
  team1Name: z.string().optional(),
  team1Player1: z.string().optional(),
  team1Player2: z.string().optional(),
  team2Name: z.string().optional(),
  team2Player1: z.string().optional(),
  team2Player2: z.string().optional(),
  // Legacy player fields
  player1Id: z.string().optional(),
  player1Name: z.string().optional(),
  player2Id: z.string().optional(),
  player2Name: z.string().optional(),
  courtId: z.string().optional(),
  scheduledAt: z.string().optional(), // Relajado para aceptar cualquier formato de fecha
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FORFEIT']).optional()
})

const updateMatchSchema = z.object({
  round: z.string().optional(),
  matchNumber: z.number().int().positive().optional(),
  player1Id: z.string().optional(),
  player1Name: z.string().optional(),
  player2Id: z.string().optional(),
  player2Name: z.string().optional(),
  courtId: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FORFEIT']).optional(),
  winnerId: z.string().optional(),
  winnerName: z.string().optional(),
  player1Score: z.array(z.object({
    set: z.number(),
    games: z.number()
  })).optional(),
  player2Score: z.array(z.object({
    set: z.number(),
    games: z.number()
  })).optional(),
  duration: z.number().int().positive().optional(),
  notes: z.string().optional()
})

// GET - Get tournament matches
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    
    const session = await requireAuth()
    const { id: tournamentId } = await params
    
    if (!tournamentId) {
      return NextResponse.json({
        success: true,
        matches: [],
        message: 'No tournament ID provided'
      })
    }
    
    const { searchParams } = new URL(request.url)
    const round = searchParams.get('round')
    const status = searchParams.get('status')
    
    // Verify tournament belongs to club
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        clubId: session.clubId
      }
    })
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    const where: any = { tournamentId }
    
    if (round) {
      where.round = round
    }
    
    if (status) {
      where.status = status
    }
    
    try {
      const matches = await prisma.tournamentMatch.findMany({
        where,
        orderBy: [
          { round: 'asc' },
          { matchNumber: 'asc' }
        ]
      })

      return NextResponse.json({
        success: true,
        matches: matches || [],
        count: matches?.length || 0
      })
    } catch (dbError) {
      console.error('Database error fetching matches:', dbError)
      // Return empty array instead of failing
      return NextResponse.json({
        success: true,
        matches: [],
        message: 'No matches found'
      })
    }

  } catch (error) {
    console.error('Error fetching tournament matches:', error)
    // Return empty array with success true to avoid breaking the UI
    return NextResponse.json({
      success: true,
      matches: [],
      error: 'Error al obtener partidos'
    })
  }
}

// POST - Create tournament match
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    
    const session = await requireAuth()
    const { id: tournamentId } = await params
    const body = await request.json()
    
    console.log('Creating match with data:', JSON.stringify(body, null, 2))
    
    const validatedData = createMatchSchema.parse(body)
    
    // Verify tournament exists and belongs to club
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        clubId: session.clubId
      }
    })
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    // Verify players exist if provided
    if (validatedData.player1Id) {
      const player1 = await prisma.player.findFirst({
        where: {
          id: validatedData.player1Id,
          clubId: session.clubId
        }
      })
      
      if (!player1) {
        return NextResponse.json(
          { success: false, error: 'Jugador 1 no encontrado' },
          { status: 404 }
        )
      }
    }
    
    if (validatedData.player2Id) {
      const player2 = await prisma.player.findFirst({
        where: {
          id: validatedData.player2Id,
          clubId: session.clubId
        }
      })
      
      if (!player2) {
        return NextResponse.json(
          { success: false, error: 'Jugador 2 no encontrado' },
          { status: 404 }
        )
      }
    }
    
    // Verify court exists if provided
    if (validatedData.courtId) {
      const court = await prisma.court.findFirst({
        where: {
          id: validatedData.courtId,
          clubId: session.clubId
        }
      })
      
      if (!court) {
        return NextResponse.json(
          { success: false, error: 'Cancha no encontrada' },
          { status: 404 }
        )
      }
    }
    
    const processedData: any = { 
      id: `match_${Date.now()}_${validatedData.matchNumber}_${Math.random().toString(36).substr(2, 9)}`,
      tournamentId,
      round: validatedData.round,
      matchNumber: validatedData.matchNumber,
      status: validatedData.status || 'SCHEDULED',
      updatedAt: new Date()
    }
    
    // Manejar los nombres de los equipos/jugadores
    if (validatedData.team1Name) processedData.team1Name = validatedData.team1Name
    if (validatedData.team1Player1) processedData.team1Player1 = validatedData.team1Player1
    if (validatedData.team1Player2) processedData.team1Player2 = validatedData.team1Player2
    if (validatedData.team2Name) processedData.team2Name = validatedData.team2Name
    if (validatedData.team2Player1) processedData.team2Player1 = validatedData.team2Player1
    if (validatedData.team2Player2) processedData.team2Player2 = validatedData.team2Player2
    
    // Manejar roundId si se proporciona
    if (validatedData.roundId) processedData.roundId = validatedData.roundId
    
    // Manejar IDs de jugadores si se proporcionan
    if (validatedData.player1Id) processedData.player1Id = validatedData.player1Id
    if (validatedData.player2Id) processedData.player2Id = validatedData.player2Id
    if (validatedData.player1Name) processedData.player1Name = validatedData.player1Name
    if (validatedData.player2Name) processedData.player2Name = validatedData.player2Name
    
    // Manejar cancha
    if (validatedData.courtId) processedData.courtId = validatedData.courtId
    
    // Manejar fechas y tiempos
    if (validatedData.scheduledAt) {
      processedData.scheduledAt = new Date(validatedData.scheduledAt)
    }
    if (validatedData.startTime) processedData.startTime = validatedData.startTime
    if (validatedData.endTime) processedData.endTime = validatedData.endTime
    
    const match = await prisma.tournamentMatch.create({
      data: processedData
    })

    return NextResponse.json({
      success: true,
      match
    })

  } catch (error) {
    console.error('Error creating tournament match:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al crear partido' },
      { status: 500 }
    )
  }
}

// PUT - Update tournament match
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    
    const session = await requireAuth()
    const { id: tournamentId } = await params
    const body = await request.json()
    const { matchId, ...updateData } = body
    
    const validatedData = updateMatchSchema.parse(updateData)
    
    // Verify tournament belongs to club
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        clubId: session.clubId
      }
    })
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    // Verify match exists
    const existingMatch = await prisma.tournamentMatch.findFirst({
      where: {
        id: matchId,
        tournamentId
      }
    })
    
    if (!existingMatch) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }
    
    const processedData: any = { ...validatedData }
    
    if (validatedData.scheduledAt) {
      processedData.scheduledAt = new Date(validatedData.scheduledAt)
    }
    
    // If match is completed, set completion time
    if (validatedData.status === 'COMPLETED' && existingMatch.status !== 'COMPLETED') {
      processedData.completedAt = new Date()
    }
    
    const match = await prisma.tournamentMatch.update({
      where: { id: matchId },
      data: processedData
    })

    return NextResponse.json({
      success: true,
      match
    })

  } catch (error) {
    console.error('Error updating tournament match:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al actualizar partido' },
      { status: 500 }
    )
  }
}

// DELETE - Delete tournament match
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    
    const session = await requireAuth()
    const { id: tournamentId } = await params
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')
    
    if (!matchId) {
      return NextResponse.json(
        { success: false, error: 'ID de partido requerido' },
        { status: 400 }
      )
    }
    
    // Verify tournament belongs to club
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        clubId: session.clubId
      }
    })
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    // Verify match exists
    const match = await prisma.tournamentMatch.findFirst({
      where: {
        id: matchId,
        tournamentId
      }
    })
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }
    
    // Can only delete if match is not completed
    if (match.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar un partido completado' },
        { status: 400 }
      )
    }
    
    await prisma.tournamentMatch.delete({
      where: { id: matchId }
    })

    return NextResponse.json({
      success: true,
      message: 'Partido eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting tournament match:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar partido' },
      { status: 500 }
    )
  }
}