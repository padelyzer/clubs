import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const blockCourtsSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  courtIds: z.array(z.string().cuid())
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { id: tournamentId } = await params
    const body = await request.json()
    
    const validatedData = blockCourtsSchema.parse(body)
    
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
    
    // Verify courts belong to club
    const courts = await prisma.court.findMany({
      where: {
        id: { in: validatedData.courtIds },
        clubId: session.clubId
      }
    })
    
    if (courts.length !== validatedData.courtIds.length) {
      return NextResponse.json(
        { success: false, error: 'Una o más canchas no pertenecen al club' },
        { status: 400 }
      )
    }
    
    // Create blocking entries for each court
    const startDate = new Date(validatedData.startDate)
    const endDate = new Date(validatedData.endDate)
    const blockings = []
    
    // Generate blocking entries for each day and court
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      for (const courtId of validatedData.courtIds) {
        // Create all-day blocking (9 AM to 10 PM)
        blockings.push({
          clubId: session.clubId,
          courtId,
          date: new Date(date),
          startTime: '09:00',
          endTime: '22:00',
          reason: `Bloqueado para torneo: ${tournament.name}`,
          type: 'TOURNAMENT' as const,
          tournamentId
        })
      }
    }
    
    // Create blocking entries
    await prisma.courtBlocking.createMany({
      data: blockings
    })
    
    return NextResponse.json({
      success: true,
      blocked: blockings.length,
      message: `${courts.length} canchas bloqueadas del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}`
    })

  } catch (error) {
    console.error('Error blocking courts:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al bloquear canchas' },
      { status: 500 }
    )
  }
}