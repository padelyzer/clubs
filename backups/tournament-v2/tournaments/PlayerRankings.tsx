'use client'

import React, { useEffect, useState } from 'react'
import { Trophy, TrendingUp, TrendingDown, Minus, Star, Medal, Award } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

interface PlayerRankingsProps {
  tournamentId: string
  tournamentType: 'ELIMINATION' | 'ROUND_ROBIN' | 'SWISS'
  onPlayerSelect?: (playerId: string) => void
}

export function PlayerRankings({ 
  tournamentId, 
  tournamentType,
  onPlayerSelect 
}: PlayerRankingsProps) {
  const [rankings, setRankings] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStat, setSelectedStat] = useState<'points' | 'wins' | 'winRate'>('points')

  useEffect(() => {
    fetchRankings()
  }, [tournamentId])

  const fetchRankings = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/rankings`)
      if (response.ok) {
        const data = await response.json()
        setRankings(data.rankings)
      }
    } catch (error) {
      console.error('Error fetching rankings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankChangeIcon = (player: PlayerStats) => {
    if (!player.previousRank) return <Star className="h-3 w-3 text-blue-500" />
    
    const change = player.previousRank - player.currentRank
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600">
          <TrendingUp className="h-3 w-3" />
          <span className="text-xs ml-1">+{change}</span>
        </div>
      )
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600">
          <TrendingDown className="h-3 w-3" />
          <span className="text-xs ml-1">{change}</span>
        </div>
      )
    }
    return <Minus className="h-3 w-3 text-gray-400" />
  }

  const getStreakBadge = (streak: PlayerStats['performance']['streak']) => {
    if (!streak) return null
    
    const color = streak.type === 'W' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    return (
      <Badge className={`${color} text-xs`}>
        {streak.count}{streak.type}
      </Badge>
    )
  }

  const sortedRankings = [...rankings].sort((a, b) => {
    switch (selectedStat) {
      case 'wins':
        return b.matchesWon - a.matchesWon
      case 'winRate':
        return b.winPercentage - a.winPercentage
      default:
        return b.points - a.points
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Selector */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setSelectedStat('points')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedStat === 'points'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Puntos
        </button>
        <button
          onClick={() => setSelectedStat('wins')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedStat === 'wins'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Victorias
        </button>
        <button
          onClick={() => setSelectedStat('winRate')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedStat === 'winRate'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          % Victorias
        </button>
      </div>

      {/* Rankings Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Ranking
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Jugador
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  PJ
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  PG
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  PP
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Sets
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  % Vic
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Pts
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Racha
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Últimos 5
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedRankings.map((player, index) => {
                const displayRank = index + 1
                const isTop3 = displayRank <= 3
                
                return (
                  <tr 
                    key={player.id}
                    onClick={() => onPlayerSelect?.(player.id)}
                    className={`
                      hover:bg-gray-50 cursor-pointer transition-colors
                      ${isTop3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent' : ''}
                    `}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRankIcon(displayRank)}
                        {getRankChangeIcon(player)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {player.name}
                          </div>
                          {player.performance.bestWin && (
                            <div className="text-xs text-gray-500">
                              Mejor victoria: {player.performance.bestWin}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                      {player.matchesPlayed}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-green-600 font-semibold">
                      {player.matchesWon}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-red-600">
                      {player.matchesLost}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                      {player.setsWon}-{player.setsLost}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <div 
                          className={`
                            text-sm font-semibold px-2 py-1 rounded
                            ${player.winPercentage >= 75 ? 'bg-green-100 text-green-800' :
                              player.winPercentage >= 50 ? 'bg-blue-100 text-blue-800' :
                              player.winPercentage >= 25 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'}
                          `}
                        >
                          {player.winPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-lg font-bold text-gray-900">
                        {player.points}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {getStreakBadge(player.performance.streak)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-1">
                        {player.performance.lastFiveMatches.map((result, i) => (
                          <span
                            key={i}
                            className={`
                              inline-block w-6 h-6 rounded text-xs font-bold
                              flex items-center justify-center
                              ${result === 'W' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'}
                            `}
                          >
                            {result}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Statistics Summary */}
      {tournamentType === 'ROUND_ROBIN' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Líder</p>
                <p className="text-xl font-bold">{sortedRankings[0]?.name || '-'}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Más Victorias</p>
                <p className="text-xl font-bold">
                  {Math.max(...rankings.map(r => r.matchesWon))} wins
                </p>
              </div>
              <Star className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mejor %</p>
                <p className="text-xl font-bold">
                  {Math.max(...rankings.map(r => r.winPercentage)).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Partidos</p>
                <p className="text-xl font-bold">
                  {rankings.reduce((acc, r) => acc + r.matchesPlayed, 0) / 2}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}