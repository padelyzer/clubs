'use client'

import React, { useState } from 'react'
import { X, Trophy, Users, ChevronRight, Calendar, MapPin, Clock } from 'lucide-react'

interface BracketMatch {
  id: string
  round: string
  team1: {
    name: string
    score?: number
    winner?: boolean
  }
  team2: {
    name: string
    score?: number
    winner?: boolean
  }
  date?: string
  court?: any
  courtName?: string
  scheduledAt?: string
  startTime?: string
  endTime?: string
  status: 'pending' | 'in_progress' | 'completed'
}

interface TournamentBracketModalProps {
  isOpen: boolean
  onClose: () => void
  tournament: any
  matches?: BracketMatch[]
  jornadas?: any[]
}

export function TournamentBracketModal({
  isOpen,
  onClose,
  tournament,
  matches = [],
  jornadas = []
}: TournamentBracketModalProps) {
  const [selectedView, setSelectedView] = useState<'bracket' | 'groups'>('bracket')
  const [selectedModality, setSelectedModality] = useState<'all' | 'masculine' | 'feminine' | 'mixed'>('all')

  if (!isOpen || !tournament) return null

  // Generar estructura de bracket con datos reales
  const generateBracketStructure = () => {
    const rounds = {
      'Grupos': [],
      'Octavos': [],
      'Cuartos': [],
      'Semifinal': [],
      'Final': []
    }

    // Usar matches reales si existen
    console.log('First match data:', matches[0]) // Debug log
    const realMatches: BracketMatch[] = matches.map(match => {
      const bracketMatch = {
        id: match.id,
        round: match.round || 'Grupos',
        team1: {
          name: match.team1?.teamName || 'Por definir',
          score: match.team1Score,
          winner: match.winner === match.team1?.teamName
        },
        team2: {
          name: match.team2?.teamName || 'Por definir',
          score: match.team2Score,
          winner: match.winner === match.team2?.teamName
        },
        date: match.matchDate,
        court: match.court,
        courtName: match.court?.name,
        scheduledAt: match.scheduledAt || match.matchDate,
        startTime: match.startTime,
        endTime: match.endTime,
        status: match.status === 'completed' ? 'completed' : 
                match.status === 'in_progress' ? 'in_progress' : 'pending'
      }
      console.log('Bracket match:', { 
        id: bracketMatch.id, 
        startTime: bracketMatch.startTime,
        courtName: bracketMatch.courtName 
      })
      return bracketMatch
    })

    // Si no hay partidos reales, usar algunos de ejemplo
    if (realMatches.length === 0) {
      const mockMatches: BracketMatch[] = [
        { id: '1', round: 'Grupos', team1: { name: 'Esperando equipos' }, team2: { name: 'Esperando equipos' }, status: 'pending' },
      ]
      mockMatches.forEach(match => {
        if (rounds[match.round]) {
          rounds[match.round].push(match)
        }
      })
    } else {
      // Organizar partidos reales por rondas
      realMatches.forEach(match => {
        // Mapear nombres de rondas
        let roundName = match.round
        if (roundName.includes('Grupo')) {
          roundName = 'Grupos'
        }
        
        if (rounds[roundName]) {
          rounds[roundName].push(match)
        } else {
          // Si es una ronda de grupos, agregarla a Grupos
          if (!rounds['Grupos']) rounds['Grupos'] = []
          rounds['Grupos'].push(match)
        }
      })
    }

    return rounds
  }

  const bracketStructure = generateBracketStructure()

  // Filtrar jornadas por modalidad
  const filteredJornadas = selectedModality === 'all' 
    ? jornadas 
    : jornadas.filter(j => j.modality === selectedModality)

  const getMatchStyle = (match: BracketMatch, isTeam1: boolean) => {
    const team = isTeam1 ? match.team1 : match.team2
    const baseStyle = {
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      transition: 'all 0.2s',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }

    if (match.status === 'completed') {
      if (team.winner) {
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: 'white',
          fontWeight: 600
        }
      } else {
        return {
          ...baseStyle,
          background: '#F3F4F6',
          color: '#9CA3AF',
          textDecoration: 'line-through'
        }
      }
    } else if (match.status === 'in_progress') {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
        color: '#92400E',
        border: '2px solid #F59E0B'
      }
    } else {
      return {
        ...baseStyle,
        background: '#F9FAFB',
        color: '#6B7280',
        border: '1px solid #E5E7EB'
      }
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '95%',
        maxWidth: '1400px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        margin: '20px'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '2px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Trophy size={28} color="#10B981" />
            <div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#182A01',
                margin: 0
              }}>
                Cuadro del Torneo
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                marginTop: '4px'
              }}>
                {tournament.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              color: '#6B7280',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* View Selector */}
        <div style={{
          display: 'flex',
          gap: '24px',
          padding: '16px 32px',
          borderBottom: '2px solid #E5E7EB',
          background: '#F9FAFB'
        }}>
          <button
            onClick={() => setSelectedView('bracket')}
            style={{
              padding: '8px 16px',
              background: selectedView === 'bracket' 
                ? 'linear-gradient(135deg, #A4DF4E, #66E7AA)' 
                : 'white',
              color: selectedView === 'bracket' ? '#182A01' : '#6B7280',
              border: selectedView === 'bracket' ? 'none' : '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cuadro Eliminatorio
          </button>
          <button
            onClick={() => setSelectedView('groups')}
            style={{
              padding: '8px 16px',
              background: selectedView === 'groups' 
                ? 'linear-gradient(135deg, #A4DF4E, #66E7AA)' 
                : 'white',
              color: selectedView === 'groups' ? '#182A01' : '#6B7280',
              border: selectedView === 'groups' ? 'none' : '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Fase de Grupos
          </button>

          {/* Modality Filter */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            {['all', 'masculine', 'feminine', 'mixed'].map(modality => (
              <button
                key={modality}
                onClick={() => setSelectedModality(modality as any)}
                style={{
                  padding: '6px 12px',
                  background: selectedModality === modality ? '#182A01' : 'white',
                  color: selectedModality === modality ? 'white' : '#6B7280',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {modality === 'all' && 'Todos'}
                {modality === 'masculine' && '🏆 Masculino'}
                {modality === 'feminine' && '👑 Femenino'}
                {modality === 'mixed' && '🤝 Mixto'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '32px',
          overflow: 'auto',
          background: '#F9FAFB'
        }}>
          {selectedView === 'bracket' ? (
            <div style={{
              display: 'flex',
              gap: '40px',
              justifyContent: 'center',
              minWidth: '1200px',
              padding: '20px'
            }}>
              {Object.entries(bracketStructure).map(([round, matches], roundIndex) => (
                <div key={round} style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#182A01',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    {round}
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: roundIndex === 0 ? '16px' : `${32 * Math.pow(2, roundIndex)}px`,
                    justifyContent: 'center',
                    height: '600px'
                  }}>
                    {matches.map((match: BracketMatch) => (
                      <div
                        key={match.id}
                        style={{
                          background: 'white',
                          borderRadius: '12px',
                          padding: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          minWidth: '200px',
                          position: 'relative'
                        }}
                      >
                        {/* Match header with court and time */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '6px',
                          padding: '4px 8px',
                          background: '#F9FAFB',
                          borderRadius: '6px'
                        }}>
                          <span style={{
                            fontSize: '10px',
                            color: '#10B981',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            📍 {match.courtName || match.court?.name || 'Por asignar'}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            color: '#6B7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            🕐 {match.startTime || 'Por definir'}
                          </span>
                        </div>
                        
                        <div style={getMatchStyle(match, true)}>
                          <span>{match.team1.name}</span>
                          {match.team1.score !== undefined && (
                            <span style={{ fontWeight: 700 }}>{match.team1.score}</span>
                          )}
                        </div>
                        <div style={{
                          height: '1px',
                          background: '#E5E7EB',
                          margin: '4px 0'
                        }} />
                        <div style={getMatchStyle(match, false)}>
                          <span>{match.team2.name}</span>
                          {match.team2.score !== undefined && (
                            <span style={{ fontWeight: 700 }}>{match.team2.score}</span>
                          )}
                        </div>
                        
                        {/* Match date if available */}
                        {match.scheduledAt && (
                          <div style={{
                            marginTop: '6px',
                            padding: '4px',
                            background: '#FEF3C7',
                            borderRadius: '4px',
                            textAlign: 'center'
                          }}>
                            <span style={{
                              fontSize: '10px',
                              color: '#92400E',
                              fontWeight: 500
                            }}>
                              {new Date(match.scheduledAt).toLocaleDateString('es-MX', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          </div>
                        )}

                        {/* Connection Line */}
                        {roundIndex < Object.keys(bracketStructure).length - 1 && (
                          <div style={{
                            position: 'absolute',
                            right: '-40px',
                            top: '50%',
                            width: '40px',
                            height: '1px',
                            background: '#E5E7EB'
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Groups View
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {filteredJornadas.filter(j => j.stage === 'group').map(jornada => (
                <div
                  key={jornada.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#182A01',
                    marginBottom: '12px'
                  }}>
                    {jornada.modality === 'masculine' && '🏆'}
                    {jornada.modality === 'feminine' && '👑'}
                    {jornada.modality === 'mixed' && '🤝'}
                    {' '}{jornada.category} - {jornada.division}
                  </h4>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Calendar size={14} color="#6B7280" />
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>
                        {new Date(jornada.date).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Clock size={14} color="#6B7280" />
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>
                        {jornada.startTime} - {jornada.endTime}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} color="#6B7280" />
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>
                        {jornada.courtNames?.join(', ') || 'Canchas por asignar'}
                      </span>
                    </div>
                  </div>

                  {/* Group Standings Table */}
                  <div style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <table style={{ width: '100%', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                          <th style={{ padding: '8px', textAlign: 'left', color: '#6B7280' }}>Equipo</th>
                          <th style={{ padding: '8px', textAlign: 'center', color: '#6B7280' }}>PJ</th>
                          <th style={{ padding: '8px', textAlign: 'center', color: '#6B7280' }}>PG</th>
                          <th style={{ padding: '8px', textAlign: 'center', color: '#6B7280' }}>PP</th>
                          <th style={{ padding: '8px', textAlign: 'center', color: '#6B7280' }}>Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderTop: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '8px', fontWeight: 500 }}>Equipo A</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>3</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#10B981' }}>3</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#EF4444' }}>0</td>
                          <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>9</td>
                        </tr>
                        <tr style={{ borderTop: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '8px', fontWeight: 500 }}>Equipo B</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>3</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#10B981' }}>2</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#EF4444' }}>1</td>
                          <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>6</td>
                        </tr>
                        <tr style={{ borderTop: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '8px', fontWeight: 500 }}>Equipo C</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>3</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#10B981' }}>1</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#EF4444' }}>2</td>
                          <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>3</td>
                        </tr>
                        <tr style={{ borderTop: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '8px', fontWeight: 500 }}>Equipo D</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>3</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#10B981' }}>0</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#EF4444' }}>3</td>
                          <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>0</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    background: jornada.status === 'completed' 
                      ? 'linear-gradient(135deg, #10B981, #059669)'
                      : jornada.status === 'in_progress'
                      ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                      : '#E5E7EB',
                    borderRadius: '6px',
                    textAlign: 'center',
                    color: jornada.status === 'pending' ? '#6B7280' : 'white',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {jornada.status === 'completed' && 'Fase Completada'}
                    {jornada.status === 'in_progress' && 'En Progreso'}
                    {jornada.status === 'pending' && 'Por Jugar'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}