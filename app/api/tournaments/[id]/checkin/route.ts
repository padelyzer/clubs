import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const checkInSchema = z.object({
  registrationId: z.string().cuid()
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
    
    const validatedData = checkInSchema.parse(body)
    
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
    
    // Get registration
    const registration = await prisma.tournamentRegistration.findFirst({
      where: {
        id: validatedData.registrationId,
        tournamentId
      }
    })
    
    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }
    
    if (registration.checkedIn) {
      return NextResponse.json(
        { success: false, error: 'El jugador ya hizo check-in' },
        { status: 400 }
      )
    }
    
    if (!registration.confirmed) {
      return NextResponse.json(
        { success: false, error: 'La inscripción debe estar confirmada antes del check-in' },
        { status: 400 }
      )
    }
    
    // Update registration with check-in
    const updatedRegistration = await prisma.tournamentRegistration.update({
      where: { id: validatedData.registrationId },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: session.userId
      },
      include: {
        player1: true,
        player2: true
      }
    })
    
    // Create activity log
    await prisma.activityLog.create({
      data: {
        clubId: session.clubId,
        userId: session.userId,
        action: 'tournament.checkin',
        entityType: 'tournamentRegistration',
        entityId: validatedData.registrationId,
        metadata: {
          tournamentId,
          tournamentName: tournament.name,
          playerName: updatedRegistration.player1Name,
          checkedInAt: updatedRegistration.checkedInAt
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      message: `Check-in exitoso para ${updatedRegistration.player1Name}`
    })

  } catch (error) {
    console.error('Error processing check-in:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al procesar check-in' },
      { status: 500 }
    )
  }
}