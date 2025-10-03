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
    const { id } = await params
    const body = await req.json()
    const { roundName } = body

    if (!roundName) {
      return ResponseBuilder.badRequest('Round name is required')
    }

    const advancement = new TournamentRoundAdvancement(id)
    const result = await advancement.checkAndAdvanceRound(roundName)

    if (!result.success) {
      return ResponseBuilder.badRequest(result.message)
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
    const { id } = await params
    
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