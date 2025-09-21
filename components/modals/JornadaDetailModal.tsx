'use client'

import React, { useState } from 'react'
import { Calendar, Clock, MapPin, X, Plus, Edit2, Trash2, Users, Trophy, ChevronRight } from 'lucide-react'

interface JornadaDetailModalProps {
  isOpen: boolean
  onClose: () => void
  jornada: any
  matches: any[]
  registrations: any[]
  onAddMatch: () => void
  onEditMatch: (match: any) => void
  onDeleteMatch: (matchId: string) => void
  onUpdateMatchStatus: (matchId: string, status: string) => void
}

export function JornadaDetailModal({
  isOpen,
  onClose,
  jornada,
  matches,
  registrations,
  onAddMatch,
  onEditMatch,
  onDeleteMatch,
  onUpdateMatchStatus
}: JornadaDetailModalProps) {
  const [selectedTab, setSelectedTab] = useState<'teams' | 'matches' | 'schedule'>('teams')

  if (!isOpen || !jornada) return null

  // Filtrar partidos de esta jornada
  const jornadaMatches = matches ? matches.filter(m => m.jornadaId === jornada.id) : []
  
  // Debug filtering
  if (matches && matches.length > 0) {
    console.log('JornadaDetailModal - Debug:', {
      jornadaId: jornada.id,
      jornadaName: jornada.name,
      totalMatches: matches.length,
      filteredMatches: jornadaMatches.length,
      filteredMatchDetails: jornadaMatches.map(m => ({
        id: m.id,
        team1: m.team1,
        team2: m.team2
      })),
      firstMatch: {
        id: matches[0].id,
        jornadaId: matches[0].jornadaId,
        roundId: matches[0].roundId,
        team1: matches[0].team1,
        team2: matches[0].team2
      },
      allJornadaIds: [...new Set(matches.map(m => m.jornadaId))]
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'linear-gradient(135deg, #10B981, #059669)', color: 'white' }
      case 'in_progress':
        return { bg: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white' }
      default:
        return { bg: 'linear-gradient(135deg, #6B7280, #4B5563)', color: 'white' }
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
        width: '90%',
        maxWidth: '1200px',
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
          <div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#182A01',
              margin: 0,
              marginBottom: '8px'
            }}>
              {jornada.name} - {jornada.stageLabel}
            </h3>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280' }}>
                <Calendar size={16} />
                <span style={{ fontSize: '14px' }}>
                  {new Date(jornada.date).toLocaleDateString('es-MX', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280' }}>
                <Clock size={16} />
                <span style={{ fontSize: '14px' }}>{jornada.startTime} - {jornada.endTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280' }}>
                <MapPin size={16} />
                <span style={{ fontSize: '14px' }}>
                  {jornada.courtNames && jornada.courtNames.length > 0 
                    ? jornada.courtNames.join(', ')
                    : `${jornada.courts.length} canchas asignadas`
                  }
                </span>
              </div>
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

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '24px',
          padding: '0 32px',
          borderBottom: '2px solid #E5E7EB',
          background: '#F9FAFB'
        }}>
          <button
            onClick={() => setSelectedTab('teams')}
            style={{
              padding: '16px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: selectedTab === 'teams' ? '3px solid #10B981' : 'none',
              fontSize: '14px',
              fontWeight: 600,
              color: selectedTab === 'teams' ? '#10B981' : '#6B7280',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Equipos/Parejas
          </button>
          <button
            onClick={() => setSelectedTab('matches')}
            style={{
              padding: '16px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: selectedTab === 'matches' ? '3px solid #10B981' : 'none',
              fontSize: '14px',
              fontWeight: 600,
              color: selectedTab === 'matches' ? '#10B981' : '#6B7280',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Partidos ({jornadaMatches.length})
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '32px',
          overflow: 'auto'
        }}>
          {selectedTab === 'teams' && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#182A01'
                }}>
                  Parejas Participantes en {jornada.division}
                </h4>
                <div style={{
                  fontSize: '13px',
                  color: '#6B7280',
                  marginTop: '4px'
                }}>
                  Cada pareja está formada por 2 jugadores que compiten juntos
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#182A01'
                  }}>
                    {/* Contar equipos únicos de los partidos */}
                    {(() => {
                      const teams = new Set()
                      jornadaMatches.forEach(m => {
                        if (m.team1?.teamName) teams.add(m.team1.teamName)
                        if (m.team2?.teamName) teams.add(m.team2.teamName)
                      })
                      return teams.size
                    })()} Parejas
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6B7280'
                  }}>
                    ({(() => {
                      const teams = new Set()
                      jornadaMatches.forEach(m => {
                        if (m.team1?.teamName) teams.add(m.team1.teamName)
                        if (m.team2?.teamName) teams.add(m.team2.teamName)
                      })
                      return teams.size * 2
                    })()} jugadores en total)
                  </div>
                </div>
              </div>

              {/* Lista de equipos */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '16px'
              }}>
                {/* Extraer equipos únicos de los partidos */}
                {(() => {
                  const teamsMap = new Map()
                  jornadaMatches.forEach(m => {
                    if (m.team1?.teamName && !teamsMap.has(m.team1.teamName)) {
                      teamsMap.set(m.team1.teamName, m.team1)
                    }
                    if (m.team2?.teamName && !teamsMap.has(m.team2.teamName)) {
                      teamsMap.set(m.team2.teamName, m.team2)
                    }
                  })
                  
                  // Log para debug
                  console.log('Teams in jornada:', {
                    jornadaName: jornada.name,
                    totalMatches: jornadaMatches.length,
                    teams: Array.from(teamsMap.keys())
                  })
                  
                  return Array.from(teamsMap.values()).map((team, index) => (
                    <div
                      key={team.teamName}
                      style={{
                        background: 'white',
                        border: '2px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#10B981'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E5E7EB'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#182A01'
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div>
                          <div style={{
                            fontSize: '11px',
                            color: '#10B981',
                            fontWeight: 600,
                            marginBottom: '2px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Pareja #{index + 1}
                          </div>
                          <h5 style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#182A01',
                            marginBottom: '4px'
                          }}>
                            {team.teamName}
                          </h5>
                          <div style={{
                            fontSize: '13px',
                            color: '#6B7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Users size={12} />
                            <span style={{ fontStyle: 'italic' }}>
                              Jugadores: {team.player1Name || 'Jugador 1'}
                              {' y '}
                              {team.player2Name || 'Jugador 2'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          color: '#6B7280'
                        }}>
                          Partidos
                        </span>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#182A01'
                        }}>
                          {jornadaMatches.filter(m => 
                            m.team1?.teamName === team.teamName || 
                            m.team2?.teamName === team.teamName
                          ).length}
                        </span>
                      </div>
                    </div>
                  ))
                })()}
              </div>

              {/* Si no hay equipos */}
              {jornadaMatches.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6B7280'
                }}>
                  <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#182A01' }}>
                    No hay equipos registrados
                  </h3>
                  <p style={{ fontSize: '14px', marginBottom: '24px' }}>
                    Agrega partidos para registrar equipos en esta jornada
                  </p>
                  <button
                    onClick={onAddMatch}
                    style={{
                      background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                      color: '#182A01',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus size={18} />
                    Agregar Primer Partido
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'matches' && (
            <div>
              {/* Add Match Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '24px'
              }}>
                <button
                  onClick={onAddMatch}
                  style={{
                    background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                    color: '#182A01',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={18} />
                  Agregar Partido
                </button>
              </div>

              {/* Matches List */}
              {jornadaMatches.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gap: '16px'
                }}>
                  {jornadaMatches.map((match) => (
                    <div
                      key={match.id}
                      style={{
                        background: 'white',
                        border: '2px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '20px',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr auto',
                        gap: '20px',
                        alignItems: 'center'
                      }}
                    >
                      {/* Team 1 */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#182A01' }}>
                          {match.team1?.teamName || 'Por definir'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                          {match.team1?.player1Name}
                          {match.team1?.player2Name && ` & ${match.team1.player2Name}`}
                        </div>
                      </div>

                      {/* VS / Score */}
                      <div style={{
                        padding: '12px 24px',
                        background: '#F9FAFB',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        {match.score ? (
                          <div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: '#182A01' }}>
                              {match.score}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                              FINAL
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                              VS
                            </div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                              {match.court?.name || `Cancha ${match.courtNumber || 'TBD'}`}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Team 2 */}
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#182A01' }}>
                          {match.team2?.teamName || 'Por definir'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                          {match.team2?.player1Name}
                          {match.team2?.player2Name && ` & ${match.team2.player2Name}`}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          ...getStatusColor(match.status),
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: getStatusColor(match.status).bg
                        }}>
                          {match.status === 'completed' ? 'Completado' 
                            : match.status === 'in_progress' ? 'En curso'
                            : 'Pendiente'}
                        </span>
                        
                        <button
                          onClick={() => onEditMatch(match)}
                          style={{
                            background: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={16} color="#6B7280" />
                        </button>
                        
                        <button
                          onClick={() => {
                            if (confirm('¿Eliminar este partido?')) {
                              onDeleteMatch(match.id)
                            }
                          }}
                          style={{
                            background: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6B7280'
                }}>
                  <Trophy size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#182A01' }}>
                    No hay partidos programados
                  </h3>
                  <p style={{ fontSize: '14px', marginBottom: '24px' }}>
                    Agrega partidos para esta jornada
                  </p>
                  <button
                    onClick={onAddMatch}
                    style={{
                      background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                      color: '#182A01',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 auto'
                    }}
                  >
                    <Plus size={18} />
                    Agregar Primer Partido
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}