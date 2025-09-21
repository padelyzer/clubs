import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const createRegistrationSchema = z.object({
  player1Id: z.string().cuid(),
  player1Name: z.string().min(1),
  player1Email: z.string().email().optional(),
  player1Phone: z.string().min(1),
  player2Id: z.string().cuid().optional(),
  player2Name: z.string().min(1).optional(),
  player2Email: z.string().email().optional(),
  player2Phone: z.string().optional()
})

const updateRegistrationSchema = z.object({
  confirmed: z.boolean().optional(),
  checkedIn: z.boolean().optional(),
  paymentStatus: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']).optional()
})

// GET - Get tournament registrations
export async function GET(
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
    
    const registrations = await prisma.tournamentRegistration.findMany({
      where: { tournamentId },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({
      success: true,
      registrations
    })

  } catch (error) {
    console.error('Error fetching tournament registrations:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener registraciones' },
      { status: 500 }
    )
  }
}

// POST - Create tournament registration
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
    
    const validatedData = createRegistrationSchema.parse(body)
    
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
    
    // Check registration period
    const now = new Date()
    if (now < tournament.registrationStart) {
      return NextResponse.json(
        { success: false, error: 'Las registraciones aún no han comenzado' },
        { status: 400 }
      )
    }
    
    if (now > tournament.registrationEnd) {
      return NextResponse.json(
        { success: false, error: 'El período de registración ha terminado' },
        { status: 400 }
      )
    }
    
    // Check if tournament is full
    const currentRegistrations = await prisma.tournamentRegistration.count({
      where: { tournamentId }
    })
    
    if (currentRegistrations >= tournament.maxPlayers) {
      return NextResponse.json(
        { success: false, error: 'El torneo está lleno' },
        { status: 400 }
      )
    }
    
    // Check if player is already registered
    const existingRegistration = await prisma.tournamentRegistration.findFirst({
      where: {
        tournamentId,
        OR: [
          { player1Id: validatedData.player1Id },
          { player2Id: validatedData.player1Id },
          ...(validatedData.player2Id ? [
            { player1Id: validatedData.player2Id },
            { player2Id: validatedData.player2Id }
          ] : [])
        ]
      }
    })
    
    if (existingRegistration) {
      return NextResponse.json(
        { success: false, error: 'Uno o ambos jugadores ya están registrados' },
        { status: 400 }
      )
    }
    
    // Note: En esta versión simplificada no verificamos players ya que el modelo no existe
    // Los IDs de jugadores se guardan como están
    
    const registration = await prisma.tournamentRegistration.create({
      data: {
        tournamentId,
        ...validatedData,
        paymentStatus: tournament.registrationFee > 0 ? 'pending' : 'completed',
        paidAmount: tournament.registrationFee > 0 ? 0 : tournament.registrationFee
      }
    })

    return NextResponse.json({
      success: true,
      registration
    })

  } catch (error) {
    console.error('Error creating tournament registration:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al crear registración' },
      { status: 500 }
    )
  }
}

// PUT - Update tournament registration
export async function PUT(
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
    const { registrationId, ...updateData } = body
    
    const validatedData = updateRegistrationSchema.parse(updateData)
    
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
    
    // Verify registration exists
    const existingRegistration = await prisma.tournamentRegistration.findFirst({
      where: {
        id: registrationId,
        tournamentId
      }
    })
    
    if (!existingRegistration) {
      return NextResponse.json(
        { success: false, error: 'Registración no encontrada' },
        { status: 404 }
      )
    }
    
    const registration = await prisma.tournamentRegistration.update({
      where: { id: registrationId },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      registration
    })

  } catch (error) {
    console.error('Error updating tournament registration:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al actualizar registración' },
      { status: 500 }
    )
  }
}

// DELETE - Delete tournament registration
export async function DELETE(
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
    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get('registrationId')
    
    if (!registrationId) {
      return NextResponse.json(
        { success: false, error: 'ID de registración requerido' },
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
    
    // Verify registration exists
    const registration = await prisma.tournamentRegistration.findFirst({
      where: {
        id: registrationId,
        tournamentId
      }
    })
    
    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registración no encontrada' },
        { status: 404 }
      )
    }
    
    // Can only delete if tournament hasn't started
    if (['IN_PROGRESS', 'COMPLETED'].includes(tournament.status)) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar registración de torneo en progreso' },
        { status: 400 }
      )
    }
    
    await prisma.tournamentRegistration.delete({
      where: { id: registrationId }
    })

    return NextResponse.json({
      success: true,
      message: 'Registración eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting tournament registration:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar registración' },
      { status: 500 }
    )
  }
}