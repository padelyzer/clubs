import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const updateTournamentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(['ELIMINATION', 'ROUND_ROBIN', 'SWISS']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  registrationEnd: z.string().optional(),
  maxPlayers: z.number().min(2).max(128).optional(),
  registrationFee: z.number().min(0).optional(),
  currency: z.string().optional(),
  status: z.enum(['DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED']).optional()
})

// GET - Get tournament by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params
    
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        Club: true,
        _count: {
          select: {
            TournamentRegistration: {
              where: { confirmed: true }
            }
          }
        }
      }
    })
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      tournament
    })
    
  } catch (error) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cargar torneo' },
      { status: 500 }
    )
  }
}

// PUT - Update tournament
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params
    const body = await request.json()
    
    const validatedData = updateTournamentSchema.parse(body)
    
    // Get current tournament to check status
    const currentTournament = await prisma.tournament.findUnique({
      where: { id: tournamentId }
    })
    
    if (!currentTournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    // Prevent certain changes if tournament is not in draft
    if (currentTournament.status !== 'DRAFT' && validatedData.type) {
      return NextResponse.json(
        { success: false, error: 'No se puede cambiar el tipo de torneo una vez publicado' },
        { status: 400 }
      )
    }
    
    // Convert date strings to Date objects if provided
    const updateData: any = { ...validatedData }
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate)
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate)
    }
    if (validatedData.registrationEnd) {
      updateData.registrationEnd = new Date(validatedData.registrationEnd)
    }
    
    const updatedTournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: updateData,
      include: {
        club: {
          include: {
            settings: true
          }
        },
        _count: {
          select: {
            registrations: {
              where: { confirmed: true }
            }
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      tournament: updatedTournament,
      message: 'Torneo actualizado exitosamente'
    })
    
  } catch (error) {
    console.error('Error updating tournament:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al actualizar torneo' },
      { status: 500 }
    )
  }
}

// DELETE - Delete tournament (only if in draft and no registrations)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params
    
    // Get tournament with registration count
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        _count: {
          select: {
            TournamentRegistration: true
          }
        }
      }
    })
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    // Only allow deletion if tournament is in draft and has no registrations
    if (tournament.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: 'Solo se pueden eliminar torneos en borrador' },
        { status: 400 }
      )
    }
    
    if (tournament._count.TournamentRegistration > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar un torneo con inscripciones' },
        { status: 400 }
      )
    }
    
    await prisma.tournament.delete({
      where: { id: tournamentId }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Torneo eliminado exitosamente'
    })
    
  } catch (error) {
    console.error('Error deleting tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar torneo' },
      { status: 500 }
    )
  }
}