import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

// GET /api/tournaments/[id]/rounds - Get all rounds for a tournament
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params
    
    const rounds = await prisma.tournamentRound.findMany({
      where: { tournamentId },
      include: {
        TournamentRoundCourt: true
      },
      orderBy: { createdAt: 'asc' }
    })
    
    return NextResponse.json(rounds)
  } catch (error) {
    console.error('Error fetching tournament rounds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament rounds' },
      { status: 500 }
    )
  }
}

// POST /api/tournaments/[id]/rounds - Create a new round
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params
    const body = await request.json()
    
    const round = await prisma.tournamentRound.create({
      data: {
        id: `round_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tournamentId,
        name: body.name,
        stage: body.stage,
        stageLabel: body.stageLabel,
        modality: body.modality || '',
        category: body.category,
        division: body.division,
        status: body.status || 'pending',
        matchesCount: body.matchesCount || 0,
        completedMatches: body.completedMatches || 0,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        notes: body.notes,
        updatedAt: new Date(),
        TournamentRoundCourt: {
          create: body.courts?.map((court: any, index: number) => ({
            id: `roundcourt_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            courtId: court.id,
            courtName: court.name,
            order: index
          }))
        }
      },
      include: {
        TournamentRoundCourt: true
      }
    })
    
    return NextResponse.json(round)
  } catch (error) {
    console.error('Error creating tournament round:', error)
    return NextResponse.json(
      { error: 'Failed to create tournament round' },
      { status: 500 }
    )
  }
}