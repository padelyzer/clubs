import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'
import { AuthService } from '@/lib/modules/shared/auth'
import { ResponseBuilder } from '@/lib/modules/shared/response'
import { CurrencyService } from '@/lib/modules/shared/currency'
import { createTournamentSchema, updateTournamentSchema } from '@/lib/modules/tournaments/validation'
import { generateTournamentSchedule, type TournamentFormat } from '@/lib/tournaments/match-generator'
import { createTournamentCourtBlocks, removeTournamentCourtBlocks } from '@/lib/tournaments/court-blocker'

// GET - Retrieve tournaments
export async function GET(request: NextRequest) {
  try {
    const session = await AuthService.requireClubStaff()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const upcoming = searchParams.get('upcoming') === 'true'
    
    const where: any = {
      clubId: session.clubId
    }
    
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.type = type
    }
    
    if (upcoming) {
      where.startDate = {
        gte: new Date()
      }
    }
    
    const tournaments = await prisma.tournament.findMany({
      where,
      include: {
        TournamentRegistration: true,
        TournamentMatch: true,
        _count: {
          select: {
            TournamentRegistration: true,
            TournamentMatch: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    })

    // Transform for frontend
    const formattedTournaments = tournaments.map(tournament => ({
      ...tournament,
      registrationFee: tournament.registrationFee, // Already in cents
      prizePool: tournament.prizePool, // Already in cents
      registeredPlayers: tournament._count.TournamentRegistration,
      totalMatches: tournament._count.TournamentMatch,
      completedMatches: tournament.TournamentMatch.filter(m => m.status === 'COMPLETED').length
    }))

    return ResponseBuilder.success({ tournaments: formattedTournaments })

  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return ResponseBuilder.serverError(error)
  }
}

// POST - Create tournament with categories as mini-tournaments
export async function POST(request: NextRequest) {
  try {
    const session = await AuthService.requireClubStaff()
    const body = await request.json()
    
    const validatedData = createTournamentSchema.parse(body)
    const { categories, ...tournamentData } = validatedData
    
    // Convert fee and prize to cents
    const registrationFeeCents = CurrencyService.toCents(tournamentData.registrationFee)
    const prizePoolCents = CurrencyService.toCents(tournamentData.prizePool)
    
    // Create multiple tournaments - one for each category
    const tournaments = []
    
    for (const category of categories) {
      const tournament = await prisma.tournament.create({
        data: {
          clubId: session.clubId,
          ...tournamentData,
          name: `${tournamentData.name} - ${getCategoryDisplayName(category)}`,
          category: category, // Store the category ID
          registrationFee: registrationFeeCents,
          prizePool: Math.floor(prizePoolCents / categories.length), // Distribute prize pool across categories
          registrationStart: new Date(tournamentData.registrationStart),
          registrationEnd: new Date(tournamentData.registrationEnd),
          startDate: new Date(tournamentData.startDate),
          endDate: tournamentData.endDate ? new Date(tournamentData.endDate) : null,
          createdBy: session.userId
        }
      })

      // Generate tournament matches and schedule courts
      try {
        await generateTournamentSchedule(
          tournament.id,
          tournament.type as TournamentFormat,
          tournament.maxPlayers,
          tournament.startDate,
          tournament.endDate,
          tournament.matchDuration,
          session.clubId
        )
        
        console.log(`✅ Generated matches for tournament: ${tournament.name}`)

        // Create court blocks to prevent regular bookings during tournament
        await createTournamentCourtBlocks(tournament.id, session.clubId)
        console.log(`✅ Created court blocks for tournament: ${tournament.name}`)
        
      } catch (error) {
        console.error(`❌ Error generating matches/blocks for tournament ${tournament.id}:`, error)
        // Continue creating other tournaments even if one fails
      }

      // Refresh tournament with match count
      const tournamentWithMatches = await prisma.tournament.findUnique({
        where: { id: tournament.id },
        include: {
          _count: {
            select: {
              TournamentRegistration: true,
              TournamentMatch: true
            }
          }
        }
      })
      
      tournaments.push({
        ...tournamentWithMatches!,
        registeredPlayers: tournamentWithMatches!._count.TournamentRegistration,
        totalMatches: tournamentWithMatches!._count.TournamentMatch,
        completedMatches: 0
      })
    }

    return ResponseBuilder.success(
      { tournaments },
      `Se crearon ${tournaments.length} torneos (uno por categoría)`
    )

  } catch (error) {
    console.error('Error creating tournaments:', error)
    
    if (error instanceof z.ZodError) {
      return ResponseBuilder.validationError(error)
    }
    if (error instanceof Response) {
      return error
    }
    return ResponseBuilder.serverError(error)
  }
}

// Helper function to get category display name
function getCategoryDisplayName(categoryId: string): string {
  const categoryNames: Record<string, string> = {
    'M_OPEN': 'Open Masculino',
    'M_1F': '1ra Fuerza Masculino',
    'M_2F': '2da Fuerza Masculino',
    'M_3F': '3ra Fuerza Masculino',
    'M_4F': '4ta Fuerza Masculino',
    'M_5F': '5ta Fuerza Masculino',
    'M_6F': '6ta Fuerza Masculino',
    'F_OPEN': 'Open Femenino',
    'F_1F': '1ra Fuerza Femenino',
    'F_2F': '2da Fuerza Femenino',
    'F_3F': '3ra Fuerza Femenino',
    'F_4F': '4ta Fuerza Femenino',
    'F_5F': '5ta Fuerza Femenino',
    'F_6F': '6ta Fuerza Femenino',
    'MX_A': 'Mixto A',
    'MX_B': 'Mixto B',
    'MX_C': 'Mixto C',
    'MX_OPEN': 'Mixto Open'
  }
  
  return categoryNames[categoryId] || categoryId
}

// PUT - Update tournament
export async function PUT(request: NextRequest) {
  try {
    const session = await AuthService.requireClubStaff()
    const body = await request.json()
    
    const validatedData = updateTournamentSchema.parse(body)
    const { id, ...updateData } = validatedData
    
    // Check if tournament exists and belongs to club
    const existingTournament = await prisma.tournament.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })
    
    if (!existingTournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    // Convert dates and fees if provided
    const processedData: any = { ...updateData }
    
    if (updateData.registrationStart) {
      processedData.registrationStart = new Date(updateData.registrationStart)
    }
    if (updateData.registrationEnd) {
      processedData.registrationEnd = new Date(updateData.registrationEnd)
    }
    if (updateData.startDate) {
      processedData.startDate = new Date(updateData.startDate)
    }
    if (updateData.endDate) {
      processedData.endDate = new Date(updateData.endDate)
    }
    if (updateData.registrationFee !== undefined) {
      processedData.registrationFee = updateData.registrationFee * 100
    }
    if (updateData.prizePool !== undefined) {
      processedData.prizePool = updateData.prizePool * 100
    }
    
    const tournament = await prisma.tournament.update({
      where: { id },
      data: processedData,
      include: {
        TournamentRegistration: {
          include: {
            Player_TournamentRegistration_player1IdToPlayer: true,
            Player_TournamentRegistration_player2IdToPlayer: true
          }
        },
        TournamentMatch: {
          include: {
            Court: true,
            Player_TournamentMatch_player1IdToPlayer: true,
            Player_TournamentMatch_player2IdToPlayer: true,
            Player_TournamentMatch_winnerIdToPlayer: true
          }
        },
        _count: {
          select: {
            TournamentRegistration: true,
            TournamentMatch: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      tournament: {
        ...tournament,
        registeredPlayers: tournament._count.TournamentRegistration,
        totalMatches: tournament._count.TournamentMatch,
        completedMatches: tournament.TournamentMatch.filter(m => m.status === 'COMPLETED').length
      }
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

// DELETE - Delete tournament
export async function DELETE(request: NextRequest) {
  try {
    const session = await AuthService.requireClubStaff()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de torneo requerido' },
        { status: 400 }
      )
    }
    
    // Check if tournament exists and belongs to club
    const tournament = await prisma.tournament.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    // Can only delete if tournament is not started
    if (['IN_PROGRESS', 'COMPLETED'].includes(tournament.status)) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar un torneo en progreso o completado' },
        { status: 400 }
      )
    }
    
    // Remove court blocks before deleting tournament
    await removeTournamentCourtBlocks(id)
    
    await prisma.tournament.delete({
      where: { id }
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