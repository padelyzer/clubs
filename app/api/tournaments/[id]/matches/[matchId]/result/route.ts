import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const resultSchema = z.object({
  submittedBy: z.enum(['team1', 'team2']),
  team1Sets: z.array(z.number()),
  team2Sets: z.array(z.number()),
  winner: z.enum(['team1', 'team2'])
})

// Helper to compare results
function resultsMatch(result1: any, result2: any): boolean {
  if (result1.winner !== result2.winner) return false
  
  const sets1 = result1.team1Sets as number[]
  const sets2 = result1.team2Sets as number[]
  const otherSets1 = result2.team1Sets as number[]
  const otherSets2 = result2.team2Sets as number[]
  
  if (sets1.length !== otherSets1.length) return false
  
  for (let i = 0; i < sets1.length; i++) {
    if (sets1[i] !== otherSets1[i] || sets2[i] !== otherSets2[i]) {
      return false
    }
  }
  
  return true
}

// POST - Submit match result
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, matchId: string }> }
) {
  try {
    const { id: tournamentId, matchId } = await params
    const body = await request.json()
    
    const validatedData = resultSchema.parse(body)
    
    // Check if match exists
    const match = await prisma.tournamentMatch.findFirst({
      where: {
        id: matchId,
        tournamentId
      }
    })
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }
    
    // Count existing submissions from this team
    const teamSubmissions = await prisma.matchResultSubmission.count({
      where: {
        matchId,
        submittedBy: validatedData.submittedBy
      }
    })
    
    // Maximum 2 submissions per team
    if (teamSubmissions >= 2) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Se alcanzó el límite de capturas para este equipo (máximo 2)' 
        },
        { status: 400 }
      )
    }
    
    // Create the submission
    const submission = await prisma.matchResultSubmission.create({
      data: {
        matchId,
        submittedBy: validatedData.submittedBy,
        submissionNumber: teamSubmissions + 1,
        team1Sets: validatedData.team1Sets,
        team2Sets: validatedData.team2Sets,
        winner: validatedData.winner,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent')
      }
    })
    
    // Get all submissions for this match
    const allSubmissions = await prisma.matchResultSubmission.findMany({
      where: { matchId }
    })
    
    // Check if we have at least 4 submissions (2 per team)
    const team1Submissions = allSubmissions.filter(s => s.submittedBy === 'team1')
    const team2Submissions = allSubmissions.filter(s => s.submittedBy === 'team2')
    
    if (team1Submissions.length >= 2 && team2Submissions.length >= 2) {
      // Check if all 4 submissions match
      let allMatch = true
      let hasDiscrepancy = false
      const referenceResult = team1Submissions[0]
      
      // Check all submissions against the reference
      for (const sub of allSubmissions) {
        if (!resultsMatch(referenceResult, sub)) {
          allMatch = false
          hasDiscrepancy = true
          break
        }
      }
      
      // Update match based on validation
      if (allMatch) {
        // All 4 submissions match - update match with verified result
        await prisma.tournamentMatch.update({
          where: { id: matchId },
          data: {
            status: 'COMPLETED',
            winnerId: referenceResult.winner === 'team1' ? match.player1Id : match.player2Id,
            winnerName: referenceResult.winner === 'team1' ? match.team1Name : match.team2Name,
            player1Score: referenceResult.team1Sets,
            player2Score: referenceResult.team2Sets,
            resultVerified: true,
            hasDiscrepancy: false,
            resultCapturedBy: 'player',
            completedAt: new Date()
          }
        })
        
        // Mark all submissions as verified
        await prisma.matchResultSubmission.updateMany({
          where: { matchId },
          data: { verified: true }
        })
        
        return NextResponse.json({
          success: true,
          message: 'Resultado verificado y confirmado (todas las capturas coinciden)',
          verified: true,
          submission
        })
      } else {
        // There's a discrepancy - flag for review
        await prisma.tournamentMatch.update({
          where: { id: matchId },
          data: {
            hasDiscrepancy: true,
            resultVerified: false,
            disputeRaised: true,
            disputeNotes: 'Discrepancia detectada en las capturas de resultados'
          }
        })
        
        // Mark submissions with discrepancy
        await prisma.matchResultSubmission.updateMany({
          where: { matchId },
          data: { hasDiscrepancy: true }
        })
        
        return NextResponse.json({
          success: true,
          warning: 'Resultado registrado pero hay discrepancias. El organizador debe revisar.',
          hasDiscrepancy: true,
          submission
        })
      }
    }
    
    // Not enough submissions yet
    const remainingTeam1 = 2 - team1Submissions.length
    const remainingTeam2 = 2 - team2Submissions.length
    
    return NextResponse.json({
      success: true,
      message: `Resultado registrado. Faltan ${remainingTeam1} capturas del Equipo 1 y ${remainingTeam2} del Equipo 2`,
      submission,
      pendingVerification: true,
      submissionsCount: {
        team1: team1Submissions.length,
        team2: team2Submissions.length,
        total: allSubmissions.length,
        required: 4
      }
    })
    
  } catch (error) {
    console.error('Error submitting result:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al guardar el resultado' },
      { status: 500 }
    )
  }
}

// GET - Get match result submissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, matchId: string }> }
) {
  try {
    const { matchId } = await params
    
    const submissions = await prisma.matchResultSubmission.findMany({
      where: { matchId },
      orderBy: { submittedAt: 'asc' }
    })
    
    const team1Submissions = submissions.filter(s => s.submittedBy === 'team1')
    const team2Submissions = submissions.filter(s => s.submittedBy === 'team2')
    
    return NextResponse.json({
      success: true,
      submissions,
      summary: {
        team1Count: team1Submissions.length,
        team2Count: team2Submissions.length,
        totalCount: submissions.length,
        requiredCount: 4,
        hasDiscrepancy: submissions.some(s => s.hasDiscrepancy),
        allVerified: submissions.length === 4 && submissions.every(s => s.verified)
      }
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener las capturas' },
      { status: 500 }
    )
  }
}