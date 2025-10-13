'use client'

import React from 'react'
import { Trophy, User, Clock, MapPin } from 'lucide-react'

interface Match {
  id: string
  round: string
  matchNumber: number
  player1Name?: string
  player2Name?: string
  player1Score?: string
  player2Score?: string
  winner?: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
  court?: { name: string }
  scheduledAt?: string
}

interface BracketVisualizationProps {
  matches: Match[]
  tournamentType: 'ELIMINATION' | 'ROUND_ROBIN' | 'SWISS'
  onMatchClick?: (match: Match) => void
}

export function BracketVisualization({ 
  matches, 
  tournamentType,
  onMatchClick 
}: BracketVisualizationProps) {
  if (tournamentType === 'ROUND_ROBIN') {
    return <RoundRobinView matches={matches} onMatchClick={onMatchClick} />
  }
  
  return <EliminationBracketView matches={matches} onMatchClick={onMatchClick} />
}

function EliminationBracketView({ matches, onMatchClick }: { matches: Match[], onMatchClick?: (match: Match) => void }) {
  // Group matches by round
  const rounds = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = []
    }
    acc[match.round].push(match)
    return acc
  }, {} as Record<string, Match[]>)
  
  // Sort rounds
  const roundOrder = ['Ronda 1', 'Ronda 2', 'Ronda 3', 'Ronda 4', 'Cuartos de Final', 'Semifinal', 'Final']
  const sortedRounds = Object.keys(rounds).sort((a, b) => {
    const aIndex = roundOrder.indexOf(a)
    const bIndex = roundOrder.indexOf(b)
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })
  
  return (
    <div style={{
      display: 'flex',
      gap: '40px',
      overflowX: 'auto',
      padding: '32px',
      background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
      borderRadius: '16px',
      minHeight: '600px'
    }}>
      {sortedRounds.map((round, roundIndex) => (
        <div key={round} style={{
          minWidth: '280px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          justifyContent: 'center'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              {round}
            </h3>
            {round === 'Final' && (
              <Trophy size={20} style={{ margin: '0 auto', color: '#F59E0B' }} />
            )}
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${Math.pow(2, roundIndex) * 20}px`,
            justifyContent: 'center',
            flex: 1
          }}>
            {rounds[round].map((match) => (
              <BracketMatch
                key={match.id}
                match={match}
                onClick={() => onMatchClick?.(match)}
                isFinal={round === 'Final'}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function BracketMatch({ 
  match, 
  onClick,
  isFinal 
}: { 
  match: Match
  onClick: () => void
  isFinal?: boolean 
}) {
  const getStatusColor = () => {
    switch (match.status) {
      case 'COMPLETED': return '#10B981'
      case 'IN_PROGRESS': return '#F59E0B'
      default: return '#6B7280'
    }
  }
  
  const getPlayerStyle = (isWinner: boolean) => ({
    padding: '12px 16px',
    background: isWinner ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)' : 'white',
    borderLeft: `3px solid ${isWinner ? '#F59E0B' : '#E5E7EB'}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: isWinner ? 600 : 400,
    color: isWinner ? '#92400E' : '#374151',
    transition: 'all 0.2s ease'
  })
  
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: isFinal ? '0 4px 20px rgba(0, 0, 0, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
        border: isFinal ? '2px solid #F59E0B' : '1px solid #E5E7EB',
        transition: 'all 0.3s ease',
        transform: isFinal ? 'scale(1.05)' : 'scale(1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = isFinal ? 'scale(1.08)' : 'scale(1.02)'
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = isFinal ? 'scale(1.05)' : 'scale(1)'
        e.currentTarget.style.boxShadow = isFinal ? '0 4px 20px rgba(0, 0, 0, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Match Header */}
      <div style={{
        padding: '8px 16px',
        background: '#F9FAFB',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          fontSize: '11px',
          color: '#6B7280',
          fontWeight: 600
        }}>
          Partido #{match.matchNumber}
        </span>
        <span style={{
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '4px',
          background: getStatusColor(),
          color: 'white',
          fontWeight: 600
        }}>
          {match.status === 'COMPLETED' ? 'Finalizado' : 
           match.status === 'IN_PROGRESS' ? 'En Juego' : 'Programado'}
        </span>
      </div>
      
      {/* Players */}
      <div>
        <div style={getPlayerStyle(match.winner === match.player1Name)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={14} />
            {match.player1Name || 'Por determinar'}
          </span>
          {match.player1Score && (
            <span style={{ fontWeight: 700 }}>{match.player1Score}</span>
          )}
        </div>
        
        <div style={{
          height: '1px',
          background: '#E5E7EB'
        }} />
        
        <div style={getPlayerStyle(match.winner === match.player2Name)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={14} />
            {match.player2Name || 'Por determinar'}
          </span>
          {match.player2Score && (
            <span style={{ fontWeight: 700 }}>{match.player2Score}</span>
          )}
        </div>
      </div>
      
      {/* Match Info */}
      {(match.court || match.scheduledAt) && (
        <div style={{
          padding: '8px 16px',
          background: '#F9FAFB',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          gap: '12px',
          fontSize: '11px',
          color: '#6B7280'
        }}>
          {match.court && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} />
              {match.court.name}
            </span>
          )}
          {match.scheduledAt && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              {new Date(match.scheduledAt).toLocaleTimeString('es', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function RoundRobinView({ matches, onMatchClick }: { matches: Match[], onMatchClick?: (match: Match) => void }) {
  // Calculate standings from matches
  const standings = calculateStandings(matches)
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
      {/* Standings Table */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Trophy size={20} />
          Tabla de Posiciones
        </h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Pos</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Jugador</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>PJ</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>PG</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>PP</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((player, index) => (
              <tr key={player.name} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                  <span style={{
                    display: 'inline-block',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: index === 0 ? '#F59E0B' : index === 1 ? '#9CA3AF' : index === 2 ? '#A78BFA' : '#E5E7EB',
                    color: index < 3 ? 'white' : '#6B7280',
                    textAlign: 'center',
                    lineHeight: '24px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    {index + 1}
                  </span>
                </td>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>{player.name}</td>
                <td style={{ padding: '12px 8px', textAlign: 'center' }}>{player.played}</td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#10B981', fontWeight: 600 }}>{player.won}</td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#EF4444' }}>{player.lost}</td>
                <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, fontSize: '16px' }}>{player.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Matches List */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          marginBottom: '20px'
        }}>
          Todos los Partidos
        </h3>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          {matches.map((match) => (
            <div
              key={match.id}
              onClick={() => onMatchClick?.(match)}
              style={{
                padding: '16px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: match.status === 'COMPLETED' ? '#F9FAFB' : 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    {match.player1Name} vs {match.player2Name}
                  </div>
                  {match.status === 'COMPLETED' && match.winner && (
                    <div style={{ fontSize: '12px', color: '#10B981' }}>
                      Ganador: {match.winner}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {match.status === 'COMPLETED' && (
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>
                      {match.player1Score} - {match.player2Score}
                    </div>
                  )}
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: match.status === 'COMPLETED' ? '#10B981' : 
                               match.status === 'IN_PROGRESS' ? '#F59E0B' : '#6B7280',
                    color: 'white'
                  }}>
                    {match.status === 'COMPLETED' ? 'Finalizado' : 
                     match.status === 'IN_PROGRESS' ? 'En Juego' : 'Programado'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function calculateStandings(matches: Match[]) {
  const playerStats: Record<string, { name: string, played: number, won: number, lost: number, points: number }> = {}
  
  matches.forEach(match => {
    if (match.player1Name && !playerStats[match.player1Name]) {
      playerStats[match.player1Name] = { name: match.player1Name, played: 0, won: 0, lost: 0, points: 0 }
    }
    if (match.player2Name && !playerStats[match.player2Name]) {
      playerStats[match.player2Name] = { name: match.player2Name, played: 0, won: 0, lost: 0, points: 0 }
    }
    
    if (match.status === 'COMPLETED' && match.winner) {
      const loser = match.winner === match.player1Name ? match.player2Name : match.player1Name
      
      if (match.winner && playerStats[match.winner]) {
        playerStats[match.winner].played++
        playerStats[match.winner].won++
        playerStats[match.winner].points += 3
      }
      
      if (loser && playerStats[loser]) {
        playerStats[loser].played++
        playerStats[loser].lost++
      }
    }
  })
  
  return Object.values(playerStats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.won !== a.won) return b.won - a.won
    return a.lost - b.lost
  })
}

export default BracketVisualization