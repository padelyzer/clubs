import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

interface PlayerStats {
  id: string
  name: string
  tournamentId: string
  matchesPlayed: number
  matchesWon: number
  matchesLost: number
  setsWon: number
  setsLost: number
  gamesWon: number
  gamesLost: number
  points: number
  winPercentage: number
  previousRank?: number
  currentRank: number
  rankChange: 'up' | 'down' | 'same' | 'new'
  performance: {
    lastFiveMatches: ('W' | 'L')[]
    streak: { type: 'W' | 'L', count: number } | null
    bestWin?: string
    worstLoss?: string
  }
}

export async function GET(
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
    if (!session?.clubId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id: tournamentId } = await params

    // Get all matches for the tournament
    const matches = await prisma.tournamentMatch.findMany({
      where: {
        tournamentId,
        status: 'COMPLETED'
      },
      orderBy: {
        completedAt: 'asc'
      }
    })

    // Get all registrations to get player names
    const registrations = await prisma.tournamentRegistration.findMany({
      where: {
        tournamentId,
        confirmed: true
      }
    })

    // Build player stats map
    const playerStatsMap: Record<string, PlayerStats> = {}

    // Initialize players from registrations
    registrations.forEach(reg => {
      const players = [reg.player1Name, reg.player2Name]
      players.forEach(name => {
        if (name && !playerStatsMap[name]) {
          playerStatsMap[name] = {
            id: `${reg.id}-${name}`,
            name,
            tournamentId,
            matchesPlayed: 0,
            matchesWon: 0,
            matchesLost: 0,
            setsWon: 0,
            setsLost: 0,
            gamesWon: 0,
            gamesLost: 0,
            points: 0,
            winPercentage: 0,
            currentRank: 0,
            rankChange: 'new',
            performance: {
              lastFiveMatches: [],
              streak: null,
              bestWin: undefined,
              worstLoss: undefined
            }
          }
        }
      })
    })

    // Process matches to calculate stats
    matches.forEach(match => {
      if (!match.winner || !match.score) return

      const players = [match.player1Name, match.player2Name].filter(Boolean) as string[]
      const winner = match.winner
      const loser = players.find(p => p !== winner)

      if (!winner || !loser) return

      // Initialize if not exists
      if (!playerStatsMap[winner]) {
        playerStatsMap[winner] = createEmptyPlayerStats(winner, tournamentId)
      }
      if (!playerStatsMap[loser]) {
        playerStatsMap[loser] = createEmptyPlayerStats(loser, tournamentId)
      }

      // Update match counts
      playerStatsMap[winner].matchesPlayed++
      playerStatsMap[winner].matchesWon++
      playerStatsMap[loser].matchesPlayed++
      playerStatsMap[loser].matchesLost++

      // Parse and update score
      try {
        const score = JSON.parse(match.score as string)
        if (Array.isArray(score)) {
          score.forEach((set: any) => {
            const p1Games = parseInt(set.player1Score) || 0
            const p2Games = parseInt(set.player2Score) || 0
            
            if (match.player1Name === winner) {
              playerStatsMap[winner].gamesWon += p1Games
              playerStatsMap[winner].gamesLost += p2Games
              playerStatsMap[loser].gamesWon += p2Games
              playerStatsMap[loser].gamesLost += p1Games
              
              if (p1Games > p2Games) {
                playerStatsMap[winner].setsWon++
                playerStatsMap[loser].setsLost++
              } else {
                playerStatsMap[winner].setsLost++
                playerStatsMap[loser].setsWon++
              }
            } else {
              playerStatsMap[winner].gamesWon += p2Games
              playerStatsMap[winner].gamesLost += p1Games
              playerStatsMap[loser].gamesWon += p1Games
              playerStatsMap[loser].gamesLost += p2Games
              
              if (p2Games > p1Games) {
                playerStatsMap[winner].setsWon++
                playerStatsMap[loser].setsLost++
              } else {
                playerStatsMap[winner].setsLost++
                playerStatsMap[loser].setsWon++
              }
            }
          })
        }
      } catch (error) {
        console.error('Error parsing score:', error)
      }

      // Update performance tracking
      updatePerformance(playerStatsMap[winner], 'W', loser)
      updatePerformance(playerStatsMap[loser], 'L', winner)

      // Calculate points (3 for win, 1 for played, bonus for sets)
      playerStatsMap[winner].points += 3
      playerStatsMap[loser].points += 1
    })

    // Calculate win percentages and rankings
    const rankings = Object.values(playerStatsMap)
      .map(player => {
        if (player.matchesPlayed > 0) {
          player.winPercentage = (player.matchesWon / player.matchesPlayed) * 100
        }
        return player
      })
      .sort((a, b) => {
        // Sort by points first
        if (b.points !== a.points) return b.points - a.points
        // Then by win percentage
        if (b.winPercentage !== a.winPercentage) return b.winPercentage - a.winPercentage
        // Then by sets difference
        const aSetsDiff = a.setsWon - a.setsLost
        const bSetsDiff = b.setsWon - b.setsLost
        if (bSetsDiff !== aSetsDiff) return bSetsDiff - aSetsDiff
        // Finally by games difference
        const aGamesDiff = a.gamesWon - a.gamesLost
        const bGamesDiff = b.gamesWon - b.gamesLost
        return bGamesDiff - aGamesDiff
      })

    // Assign current rankings
    rankings.forEach((player, index) => {
      player.currentRank = index + 1
    })

    return NextResponse.json({
      success: true,
      rankings
    })

  } catch (error) {
    console.error('Error fetching rankings:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener rankings' },
      { status: 500 }
    )
  }
}

function createEmptyPlayerStats(name: string, tournamentId: string): PlayerStats {
  return {
    id: `player-${name}`,
    name,
    tournamentId,
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    setsWon: 0,
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    points: 0,
    winPercentage: 0,
    currentRank: 0,
    rankChange: 'new',
    performance: {
      lastFiveMatches: [],
      streak: null,
      bestWin: undefined,
      worstLoss: undefined
    }
  }
}

function updatePerformance(
  player: PlayerStats, 
  result: 'W' | 'L', 
  opponent: string
) {
  // Add to last five matches
  player.performance.lastFiveMatches.unshift(result)
  if (player.performance.lastFiveMatches.length > 5) {
    player.performance.lastFiveMatches.pop()
  }

  // Update streak
  if (!player.performance.streak) {
    player.performance.streak = { type: result, count: 1 }
  } else if (player.performance.streak.type === result) {
    player.performance.streak.count++
  } else {
    player.performance.streak = { type: result, count: 1 }
  }

  // Track best win / worst loss
  if (result === 'W' && !player.performance.bestWin) {
    player.performance.bestWin = opponent
  }
  if (result === 'L' && !player.performance.worstLoss) {
    player.performance.worstLoss = opponent
  }
}