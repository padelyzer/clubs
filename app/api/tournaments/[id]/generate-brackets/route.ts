import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { BracketGenerator } from '@/lib/services/bracket-generator'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const generateBracketsSchema = z.object({
  categories: z.array(z.string()).optional(),
  seedingMethod: z.enum(['random', 'ranked', 'serpentine']).default('random'),
  bracketType: z.enum(['single_elimination', 'double_elimination']).default('single_elimination')
})

/**
 * GET - Verificar si se pueden generar brackets
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

    // Verificar si se pueden generar brackets
    const result = await BracketGenerator.canGenerateBrackets(tournamentId)

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Error checking bracket generation:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar estado de brackets' },
      { status: 500 }
    )
  }
}

/**
 * POST - Generar brackets
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

    // Validar datos de entrada
    const body = await req.json()
    const validatedData = generateBracketsSchema.parse(body)

    // Verificar si se pueden generar brackets
    const canGenerate = await BracketGenerator.canGenerateBrackets(tournamentId)
    if (!canGenerate.canGenerate) {
      return NextResponse.json(
        { success: false, error: canGenerate.message },
        { status: 400 }
      )
    }

    // Generar brackets
    const result = await BracketGenerator.generateBrackets({
      tournamentId,
      categories: validatedData.categories,
      seedingMethod: validatedData.seedingMethod,
      bracketType: validatedData.bracketType
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          details: result.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        rounds: result.rounds,
        matchesCreated: result.matchesCreated,
        categoriesProcessed: result.categoriesProcessed
      },
      warnings: result.errors
    })

  } catch (error) {
    console.error('Error generating brackets:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          details: error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error al generar brackets',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Eliminar brackets generados (útil para regenerar)
 */
export async function DELETE(
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

    // Verificar que no haya partidos completados
    const completedMatches = await prisma.tournamentMatch.count({
      where: {
        tournamentId,
        status: 'COMPLETED'
      }
    })

    if (completedMatches > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se pueden eliminar brackets con partidos completados'
        },
        { status: 400 }
      )
    }

    // Eliminar matches y rounds
    await prisma.tournamentMatch.deleteMany({
      where: { tournamentId }
    })

    await prisma.tournamentRound.deleteMany({
      where: { tournamentId }
    })

    // Cambiar estado del torneo a DRAFT
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        status: 'DRAFT',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Brackets eliminados exitosamente. Puedes regenerarlos ahora.'
    })

  } catch (error) {
    console.error('Error deleting brackets:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar brackets' },
      { status: 500 }
    )
  }
}
