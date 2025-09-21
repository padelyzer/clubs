import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function POST(
  request: NextRequest,
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
    const { id: tournamentId } = await params
    
    // Verify tournament belongs to club
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        clubId: session.clubId
      }
    })
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }
    
    // Get unscheduled matches
    const unscheduledMatches = await prisma.tournamentMatch.findMany({
      where: {
        tournamentId,
        courtId: null,
        status: 'SCHEDULED'
      },
      orderBy: [
        { round: 'asc' },
        { matchNumber: 'asc' }
      ]
    })
    
    if (unscheduledMatches.length === 0) {
      return NextResponse.json({
        success: true,
        assigned: 0,
        message: 'No hay partidos sin cancha asignada'
      })
    }
    
    // Get available courts
    const courts = await prisma.court.findMany({
      where: {
        clubId: session.clubId,
        active: true
      },
      orderBy: { order: 'asc' }
    })
    
    if (courts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay canchas disponibles' },
        { status: 400 }
      )
    }
    
    // Auto-assign courts in round-robin fashion
    let courtIndex = 0
    const assignments = []
    
    for (const match of unscheduledMatches) {
      const court = courts[courtIndex % courts.length]
      
      // Calculate scheduled time based on match number and round
      const baseDate = new Date(tournament.startDate)
      const roundNumber = parseInt(match.round.replace(/\D/g, '')) || 1
      const matchesPerDay = 8 // Assuming 8 matches per day
      const dayOffset = Math.floor((roundNumber - 1) * unscheduledMatches.length / matchesPerDay)
      const timeSlot = match.matchNumber % matchesPerDay
      
      const scheduledDate = new Date(baseDate)
      scheduledDate.setDate(scheduledDate.getDate() + dayOffset)
      scheduledDate.setHours(9 + timeSlot, 0, 0, 0) // Starting at 9 AM
      
      assignments.push({
        matchId: match.id,
        courtId: court.id,
        scheduledAt: scheduledDate
      })
      
      courtIndex++
    }
    
    // Update matches with court assignments
    for (const assignment of assignments) {
      await prisma.tournamentMatch.update({
        where: { id: assignment.matchId },
        data: {
          courtId: assignment.courtId,
          scheduledAt: assignment.scheduledAt
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      assigned: assignments.length,
      message: `${assignments.length} partidos asignados a canchas exitosamente`
    })

  } catch (error) {
    console.error('Error auto-assigning courts:', error)
    return NextResponse.json(
      { success: false, error: 'Error al asignar canchas automáticamente' },
      { status: 500 }
    )
  }
}