import { prisma } from '@/lib/config/prisma'

export interface RoundAdvancementResult {
  success: boolean
  message: string
  advancedPlayers?: string[]
  nextRoundCreated?: boolean
  tournamentCompleted?: boolean
}

export class TournamentRoundAdvancement {
  private tournamentId: string

  constructor(tournamentId: string) {
    this.tournamentId = tournamentId
  }

  /**
   * Check if a round is completed and advance if necessary
   */
  async checkAndAdvanceRound(roundName: string): Promise<RoundAdvancementResult> {
    try {
      // Get all matches in this round
      const roundMatches = await prisma.tournamentMatch.findMany({
        where: {
          tournamentId: this.tournamentId,
          round: roundName,
          status: { in: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] }
        },
        orderBy: { matchNumber: 'asc' }
      })

      if (roundMatches.length === 0) {
        return {
          success: false,
          message: 'No matches found for this round'
        }
      }

      // Check if all matches in the round are completed
      const completedMatches = roundMatches.filter(match => 
        match.status === 'COMPLETED' && match.resultsConfirmed
      )

      if (completedMatches.length !== roundMatches.length) {
        return {
          success: true,
          message: `Round ${roundName} is still in progress (${completedMatches.length}/${roundMatches.length} matches completed)`
        }
      }

      // All matches completed, advance to next round
      return await this.advanceToNextRound(roundName, completedMatches)
      
    } catch (error) {
      console.error('Error in checkAndAdvanceRound:', error)
      return {
        success: false,
        message: 'Error checking round advancement'
      }
    }
  }

  /**
   * Advance winners to next round
   */
  private async advanceToNextRound(currentRound: string, completedMatches: any[]): Promise<RoundAdvancementResult> {
    try {
      // Get tournament info
      const tournament = await prisma.tournament.findUnique({
        where: { id: this.tournamentId },
        select: { type: true, name: true }
      })

      if (!tournament) {
        return {
          success: false,
          message: 'Tournament not found'
        }
      }

      // Handle different tournament formats
      switch (tournament.type) {
        case 'SINGLE_ELIMINATION':
          return await this.advanceSingleElimination(currentRound, completedMatches)
        case 'DOUBLE_ELIMINATION':
          return await this.advanceDoubleElimination(currentRound, completedMatches)
        case 'ROUND_ROBIN':
          return await this.checkRoundRobinCompletion(currentRound)
        default:
          return {
            success: false,
            message: `Automatic advancement not supported for format: ${tournament.type}`
          }
      }
    } catch (error) {
      console.error('Error advancing to next round:', error)
      return {
        success: false,
        message: 'Error advancing to next round'
      }
    }
  }

  /**
   * Handle single elimination advancement
   */
  private async advanceSingleElimination(currentRound: string, completedMatches: any[]): Promise<RoundAdvancementResult> {
    const winners = completedMatches.map(match => {
      if (match.winner === match.team1Name) {
        return {
          name: match.team1Name,
          player1: match.team1Player1,
          player2: match.team1Player2
        }
      } else {
        return {
          name: match.team2Name,
          player1: match.team2Player1,
          player2: match.team2Player2
        }
      }
    })

    // Check if this is the final
    if (winners.length === 1) {
      // Tournament completed!
      await prisma.tournament.update({
        where: { id: this.tournamentId },
        data: { 
          status: 'COMPLETED',
          updatedAt: new Date()
        }
      })

      return {
        success: true,
        message: `Tournament completed! Winner: ${winners[0].name}`,
        tournamentCompleted: true,
        advancedPlayers: [winners[0].name]
      }
    }

    // Create next round matches
    const nextRoundName = this.getNextRoundName(currentRound)
    const nextRoundMatches = Math.ceil(winners.length / 2)

    // Get available courts
    const courts = await prisma.court.findMany({
      where: { 
        clubId: { not: null },
        active: true 
      },
      take: 5 // Limit to prevent overwhelming
    })

    if (courts.length === 0) {
      return {
        success: false,
        message: 'No courts available for next round'
      }
    }

    // Create matches for next round
    const nextRoundStartTime = new Date()
    nextRoundStartTime.setHours(nextRoundStartTime.getHours() + 1) // Start next round in 1 hour

    for (let i = 0; i < nextRoundMatches; i++) {
      const team1 = winners[i * 2]
      const team2 = winners[i * 2 + 1] || null // Handle odd number of teams

      const court = courts[i % courts.length]
      const matchStartTime = new Date(nextRoundStartTime.getTime() + (i * 90 * 60000)) // 90 min between matches

      await prisma.tournamentMatch.create({
        data: {
          id: `match_${Date.now()}_${i + 1}_${Math.random().toString(36).substr(2, 9)}`,
          tournamentId: this.tournamentId,
          round: nextRoundName,
          matchNumber: i + 1,
          team1Name: team1?.name || 'BYE',
          team1Player1: team1?.player1,
          team1Player2: team1?.player2,
          team2Name: team2?.name || 'BYE',
          team2Player1: team2?.player1,
          team2Player2: team2?.player2,
          courtId: court.id,
          courtNumber: court.name,
          scheduledAt: matchStartTime,
          startTime: this.formatTime(matchStartTime),
          endTime: this.formatTime(new Date(matchStartTime.getTime() + 90 * 60000)),
          status: team2 ? 'SCHEDULED' : 'COMPLETED', // Auto-complete BYE matches
          winner: team2 ? null : team1?.name,
          resultsConfirmed: team2 ? false : true
        }
      })
    }

    return {
      success: true,
      message: `Advanced to ${nextRoundName} with ${winners.length} players`,
      nextRoundCreated: true,
      advancedPlayers: winners.map(w => w.name)
    }
  }

  /**
   * Handle double elimination advancement (simplified)
   */
  private async advanceDoubleElimination(currentRound: string, completedMatches: any[]): Promise<RoundAdvancementResult> {
    // This is a simplified implementation
    // Full double elimination requires tracking winners and losers brackets
    return {
      success: false,
      message: 'Double elimination advancement requires manual intervention'
    }
  }

  /**
   * Check if round robin is completed
   */
  private async checkRoundRobinCompletion(currentRound: string): Promise<RoundAdvancementResult> {
    // Get all matches in tournament
    const allMatches = await prisma.tournamentMatch.findMany({
      where: { tournamentId: this.tournamentId },
      select: { status: true, resultsConfirmed: true }
    })

    const completedMatches = allMatches.filter(match => 
      match.status === 'COMPLETED' && match.resultsConfirmed
    )

    if (completedMatches.length === allMatches.length) {
      await prisma.tournament.update({
        where: { id: this.tournamentId },
        data: { 
          status: 'COMPLETED',
          updatedAt: new Date()
        }
      })

      return {
        success: true,
        message: 'Round Robin tournament completed!',
        tournamentCompleted: true
      }
    }

    return {
      success: true,
      message: `Round Robin in progress (${completedMatches.length}/${allMatches.length} matches completed)`
    }
  }

  /**
   * Get next round name based on current round
   */
  private getNextRoundName(currentRound: string): string {
    const roundMap: { [key: string]: string } = {
      'Round of 64': 'Round of 32',
      'Round of 32': 'Round of 16',
      'Round of 16': 'Cuartos de Final',
      'Cuartos de Final': 'Semifinal',
      'Semifinal': 'Final',
      'Final': 'Completed'
    }

    return roundMap[currentRound] || `Next Round after ${currentRound}`
  }

  /**
   * Format time to HH:MM string
   */
  private formatTime(date: Date): string {
    return date.toTimeString().substr(0, 5)
  }
}

/**
 * Trigger round advancement check when a match is completed
 */
export async function triggerRoundAdvancementCheck(matchId: string): Promise<RoundAdvancementResult> {
  try {
    // Get match details
    const match = await prisma.tournamentMatch.findUnique({
      where: { id: matchId },
      select: {
        tournamentId: true,
        round: true,
        status: true,
        resultsConfirmed: true
      }
    })

    if (!match || match.status !== 'COMPLETED' || !match.resultsConfirmed) {
      return {
        success: true,
        message: 'Match not ready for round advancement check'
      }
    }

    const advancement = new TournamentRoundAdvancement(match.tournamentId)
    return await advancement.checkAndAdvanceRound(match.round)
    
  } catch (error) {
    console.error('Error in triggerRoundAdvancementCheck:', error)
    return {
      success: false,
      message: 'Error triggering round advancement check'
    }
  }
}