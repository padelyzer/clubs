import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { AuthService } from '@/lib/modules/shared/auth'
import { ResponseBuilder } from '@/lib/modules/shared/response'
import { triggerRoundAdvancementCheck } from '@/lib/tournaments/round-advancement'

// POST: Resolver conflicto de resultados
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await AuthService.requireClubStaff()
    const paramData = await params
    const { id } = paramData
    const body = await req.json()
    const { matchId, result } = body

    // SEGURIDAD: Verificar que el torneo pertenece al club del usuario
    const tournament = await prisma.tournament.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!tournament) {
      return ResponseBuilder.error('Torneo no encontrado o no pertenece a tu club', 404)
    }

    // result debe tener:
    // - team1Sets, team2Sets (arrays de sets)
    // - team1TotalSets, team2TotalSets
    // - winner ('team1' o 'team2')

    // Verificar que el partido existe y pertenece al torneo
    const match = await prisma.tournamentMatch.findFirst({
      where: {
        id: matchId,
        tournamentId: id
      }
    })

    if (!match) {
      return ResponseBuilder.notFound('Partido no encontrado')
    }

    // Marcar los resultados conflictivos como resueltos
    await prisma.tournamentMatchResult.updateMany({
      where: {
        matchId,
        conflictStatus: 'pending'
      },
      data: {
        conflictStatus: 'resolved',
        conflictNotes: 'Resuelto por el organizador',
        updatedAt: new Date()
      }
    })

    // Actualizar el partido con los resultados finales
    await prisma.tournamentMatch.update({
      where: { id: matchId },
      data: {
        team1Sets: result.team1Sets,
        team2Sets: result.team2Sets,
        team1Score: result.team1TotalSets,
        team2Score: result.team2TotalSets,
        winner: result.winner === 'team1' ? match.team1Name : match.team2Name,
        status: 'COMPLETED',
        actualEndTime: new Date(),
        resultsConfirmed: true
      }
    })

    // Crear un registro de resultado confirmado por el organizador
    await prisma.tournamentMatchResult.create({
      data: {
        id: `${matchId}-organizer-${Date.now()}`,
        matchId,
        submittedBy: 'organizer',
        team1Sets: result.team1Sets,
        team2Sets: result.team2Sets,
        team1TotalSets: result.team1TotalSets,
        team2TotalSets: result.team2TotalSets,
        winner: result.winner,
        confirmed: true,
        confirmedAt: new Date(),
        confirmedBy: 'organizer',
        submittedAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Trigger automatic round advancement check
    const advancementResult = await triggerRoundAdvancementCheck(matchId)

    return ResponseBuilder.success({
      matchId,
      advancement: advancementResult
    }, 'Conflicto resuelto exitosamente')
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return ResponseBuilder.serverError(error)
  }
}