import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

// GET /api/tournaments/[id]/rounds/[roundId] - Get a specific round
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, roundId: string }> }
) {
  try {
    const { roundId } = await params
    
    const round = await prisma.tournamentRound.findUnique({
      where: { id: roundId },
      include: {
        courts: true,
        matches: {
          include: {
            court: true
          }
        }
      }
    })
    
    if (!round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(round)
  } catch (error) {
    console.error('Error fetching tournament round:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament round' },
      { status: 500 }
    )
  }
}

// PUT /api/tournaments/[id]/rounds/[roundId] - Update a round
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, roundId: string }> }
) {
  try {
    const { roundId } = await params
    const body = await request.json()
    
    // Update round
    const round = await prisma.tournamentRound.update({
      where: { id: roundId },
      data: {
        name: body.name,
        stage: body.stage,
        stageLabel: body.stageLabel,
        modality: body.modality,
        category: body.category,
        division: body.division,
        status: body.status,
        matchesCount: body.matchesCount,
        completedMatches: body.completedMatches,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        notes: body.notes,
      },
      include: {
        courts: true,
        matches: true
      }
    })
    
    // Update courts if provided
    if (body.courts) {
      // Delete existing courts
      await prisma.tournamentRoundCourt.deleteMany({
        where: { roundId }
      })
      
      // Create new courts
      await prisma.tournamentRoundCourt.createMany({
        data: body.courts.map((court: any, index: number) => ({
          roundId,
          courtId: court.id,
          courtName: court.name,
          order: index
        }))
      })
    }
    
    return NextResponse.json(round)
  } catch (error) {
    console.error('Error updating tournament round:', error)
    return NextResponse.json(
      { error: 'Failed to update tournament round' },
      { status: 500 }
    )
  }
}

// DELETE /api/tournaments/[id]/rounds/[roundId] - Delete a round
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, roundId: string }> }
) {
  try {
    const { roundId } = await params
    
    await prisma.tournamentRound.delete({
      where: { id: roundId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tournament round:', error)
    return NextResponse.json(
      { error: 'Failed to delete tournament round' },
      { status: 500 }
    )
  }
}