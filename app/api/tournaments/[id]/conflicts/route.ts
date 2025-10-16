import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

/**
 * GET - Obtener partidos con conflictos de resultados
 */
export async function GET(
  req: NextRequest,
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

    const paramData = await params
    const { id: tournamentId } = paramData

    // Verificar que el torneo pertenece al club del usuario
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        clubId: session.clubId
      }
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado o no pertenece a tu club' },
        { status: 404 }
      )
    }

    // Obtener partidos con múltiples sumisiones de resultados (conflictos potenciales)
    const matchesWithMultipleResults = await prisma.tournamentMatch.findMany({
      where: {
        tournamentId,
        ResultSubmissions: {
          some: {}
        }
      },
      include: {
        ResultSubmissions: {
          orderBy: {
            submittedAt: 'desc'
          }
        }
      }
    })

    // Filtrar solo los que tienen conflictos (más de 1 sumisión o resultados no confirmados)
    const conflicts = matchesWithMultipleResults.filter(match => {
      const submissions = match.ResultSubmissions

      // Si hay más de una sumisión
      if (submissions.length > 1) {
        return true
      }

      // Si hay una sumisión pero no está confirmada y el partido está marcado con conflicto
      if (submissions.length === 1 && !submissions[0].confirmed && !match.resultsConfirmed) {
        return true
      }

      return false
    })

    // Clasificar conflictos por tipo
    const conflictsWithTypes = conflicts.map(match => {
      const submissions = match.ResultSubmissions

      // Verificar si hay resultados diferentes
      const uniqueWinners = new Set(submissions.map(s => s.winner))
      const hasConflictingResults = uniqueWinners.size > 1

      return {
        ...match,
        conflictType: hasConflictingResults ? 'different_results' : 'pending_confirmation',
        submissionsCount: submissions.length,
        uniqueResultsCount: uniqueWinners.size
      }
    })

    return NextResponse.json({
      success: true,
      conflicts: conflictsWithTypes,
      totalConflicts: conflictsWithTypes.length
    })

  } catch (error) {
    console.error('Error fetching conflicts:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener conflictos' },
      { status: 500 }
    )
  }
}

/**
 * POST - Resolver un conflicto aceptando un resultado específico
 */
export async function POST(
  req: NextRequest,
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

    const paramData = await params
    const { id: tournamentId } = paramData

    const body = await req.json()
    const { matchId, acceptedSubmissionId, resolution } = body

    if (!matchId || !acceptedSubmissionId) {
      return NextResponse.json(
        { success: false, error: 'matchId y acceptedSubmissionId son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el partido pertenece al torneo
    const match = await prisma.tournamentMatch.findFirst({
      where: {
        id: matchId,
        tournamentId,
        Tournament: {
          clubId: session.clubId
        }
      },
      include: {
        ResultSubmissions: true
      }
    })

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que la sumisión aceptada existe
    const acceptedSubmission = match.ResultSubmissions.find(s => s.id === acceptedSubmissionId)
    if (!acceptedSubmission) {
      return NextResponse.json(
        { success: false, error: 'Sumisión de resultado no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar el partido con el resultado aceptado
    await prisma.tournamentMatch.update({
      where: { id: matchId },
      data: {
        team1Score: acceptedSubmission.team1TotalSets,
        team2Score: acceptedSubmission.team2TotalSets,
        winner: acceptedSubmission.winner,
        status: 'COMPLETED',
        conflictResolved: true,
        resultsConfirmed: true,
        updatedAt: new Date()
      }
    })

    // Marcar la sumisión aceptada como confirmada
    await prisma.tournamentMatchResult.update({
      where: { id: acceptedSubmissionId },
      data: {
        confirmed: true,
        confirmedAt: new Date(),
        confirmedBy: session.userId
      }
    })

    // Marcar las otras sumisiones como no confirmadas
    const otherSubmissions = match.ResultSubmissions.filter(s => s.id !== acceptedSubmissionId)
    for (const submission of otherSubmissions) {
      await prisma.tournamentMatchResult.update({
        where: { id: submission.id },
        data: {
          confirmed: false,
          conflictStatus: 'rejected',
          conflictNotes: resolution || 'Resultado alternativo seleccionado por el administrador'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Conflicto resuelto exitosamente',
      match: {
        id: match.id,
        winner: acceptedSubmission.winner,
        team1Score: acceptedSubmission.team1TotalSets,
        team2Score: acceptedSubmission.team2TotalSets
      }
    })

  } catch (error) {
    console.error('Error resolving conflict:', error)
    return NextResponse.json(
      { success: false, error: 'Error al resolver conflicto' },
      { status: 500 }
    )
  }
}
