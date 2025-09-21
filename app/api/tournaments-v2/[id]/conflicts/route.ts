import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { AuthService } from '@/lib/modules/shared/auth'
import { ResponseBuilder } from '@/lib/modules/shared/response'

// GET: Obtener conflictos del torneo
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await AuthService.requireAuth()
    const { id } = await params

    // Para SUPER_ADMIN, permitir acceso a cualquier torneo
    const whereClause = session.role === 'SUPER_ADMIN' 
      ? { id }
      : { id, clubId: session.clubId }

    // Verificar que el torneo existe
    const tournament = await prisma.tournament.findUnique({
      where: whereClause
    })

    if (!tournament) {
      return ResponseBuilder.notFound('Torneo no encontrado')
    }

    // Obtener todos los partidos con conflictos pendientes
    const matchesWithConflicts = await prisma.tournamentMatch.findMany({
      where: {
        tournamentId: id,
        resultSubmissions: {
          some: {
            conflictStatus: 'pending'
          }
        }
      },
      include: {
        resultSubmissions: {
          where: {
            conflictStatus: 'pending'
          },
          orderBy: {
            submittedAt: 'desc'
          }
        }
      }
    })

    // Formatear los conflictos
    const conflicts = matchesWithConflicts.map(match => {
      const results = match.resultSubmissions || []
      const team1Result = results.find((r: any) => r.submittedBy === 'team1')
      const team2Result = results.find((r: any) => r.submittedBy === 'team2')

      return {
        matchId: match.id,
        team1Name: match.team1Name,
        team2Name: match.team2Name,
        courtNumber: match.courtNumber,
        scheduledAt: match.scheduledAt,
        team1Result: team1Result ? {
          sets: team1Result.team1Sets,
          totalSets: team1Result.team1TotalSets,
          winner: team1Result.winner,
          submittedAt: team1Result.submittedAt
        } : null,
        team2Result: team2Result ? {
          sets: team2Result.team2Sets,
          totalSets: team2Result.team2TotalSets,
          winner: team2Result.winner,
          submittedAt: team2Result.submittedAt
        } : null,
        conflictedAt: team1Result?.submittedAt || team2Result?.submittedAt
      }
    })

    // También obtener partidos pendientes de confirmación (solo un equipo reportó)
    const pendingResults = await prisma.tournamentMatch.findMany({
      where: {
        tournamentId: id,
        status: 'IN_PROGRESS',
        resultSubmissions: {
          some: {
            confirmed: false,
            conflictStatus: null
          }
        }
      },
      include: {
        resultSubmissions: {
          where: {
            confirmed: false
          }
        },
        Court: true
      }
    })

    // Filtrar para obtener solo los que tienen exactamente 1 resultado
    const pendingConfirmation = pendingResults.filter(match => 
      match.resultSubmissions.length === 1
    ).map(match => {
      const result = match.resultSubmissions[0]
      return {
        matchId: match.id,
        team1Name: match.team1Name,
        team2Name: match.team2Name,
        courtNumber: match.courtNumber,
        scheduledAt: match.scheduledAt,
        reportedBy: result.submittedBy,
        submittedAt: result.submittedAt,
        waitingTime: Date.now() - new Date(result.submittedAt).getTime()
      }
    })

    return ResponseBuilder.success({
      conflicts,
      pendingConfirmation,
      conflictsCount: conflicts.length,
      pendingCount: pendingConfirmation.length
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return ResponseBuilder.serverError(error)
  }
}