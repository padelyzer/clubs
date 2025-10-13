import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/modules/shared/auth'
import { ResponseBuilder } from '@/lib/modules/shared/response'
import { TournamentRoundAdvancement } from '@/lib/tournaments/round-advancement'

// POST: Advance tournament to next round
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await AuthService.requireClubStaff()
    const paramData = await params
    const { id } = paramData
    const body = await req.json()
    const { roundName } = body

    if (!roundName) {
      return ResponseBuilder.error('Round name is required', 400)
    }

    // SEGURIDAD: Verificar que el torneo pertenece al club del usuario
    const { prisma } = await import('@/lib/config/prisma')
    const tournament = await prisma.tournament.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!tournament) {
      return ResponseBuilder.error('Torneo no encontrado o no pertenece a tu club', 404)
    }

    const advancement = new TournamentRoundAdvancement(id)
    const result = await advancement.checkAndAdvanceRound(roundName)

    if (!result.success) {
      return ResponseBuilder.error(result.message, 400)
    }

    return ResponseBuilder.success(result, result.message)
    
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return ResponseBuilder.serverError(error)
  }
}

// GET: Check round advancement status
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await AuthService.requireClubStaff()
    const paramData = await params
    const { id } = paramData

    // SEGURIDAD: Verificar que el torneo pertenece al club del usuario
    const { prisma } = await import('@/lib/config/prisma')
    const tournament = await prisma.tournament.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!tournament) {
      return ResponseBuilder.error('Torneo no encontrado o no pertenece a tu club', 404)
    }

    // Get tournament rounds and their completion status
    const advancement = new TournamentRoundAdvancement(id)

    // This is a simple status check - could be expanded
    return ResponseBuilder.success({
      message: 'Round advancement status checked',
      tournamentId: id
    })
    
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return ResponseBuilder.serverError(error)
  }
}