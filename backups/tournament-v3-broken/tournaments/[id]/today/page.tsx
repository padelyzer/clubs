'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CardModern } from '@/components/design-system/CardModern'
import { colors } from '@/lib/design-system/colors'
import { 
  Clock, 
  Target,
  Trophy,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react'

interface TournamentMatch {
  id: string
  courtNumber: number
  scheduledTime: string
  status: 'pending' | 'in_progress' | 'completed'
  team1: {
    name: string
    players: string[]
  }
  team2: {
    name: string
    players: string[]
  }
  category: string
  group?: string
  sets?: Array<{
    team1: number
    team2: number
  }>
  winner?: 'team1' | 'team2'
}

interface Tournament {
  id: string
  name: string
  status: string
  matches: TournamentMatch[]
}

export default function TournamentTodayPage() {
  const router = useRouter()
  const params = useParams()
  const tournamentId = params.id as string
  
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterCourt, setFilterCourt] = useState<number | 'all'>('all')

  useEffect(() => {
    fetchTournamentData()
  }, [tournamentId, selectedDate])

  const fetchTournamentData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tournaments/${tournamentId}/matches?date=${selectedDate.toISOString().split('T')[0]}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar los partidos del día')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Error al procesar los datos')
      }
      
      setTournament(data.tournament)
      setError(null)
      
    } catch (err) {
      console.error('Error fetching tournament data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} style={{ color: colors.success[600] }} />
      case 'in_progress':
        return <PlayCircle size={20} style={{ color: colors.accent[600] }} />
      default:
        return <Clock size={20} style={{ color: colors.text.tertiary }} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success[50]
      case 'in_progress':
        return colors.accent[50]
      default:
        return colors.neutral[50]
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Finalizado'
      case 'in_progress':
        return 'En Juego'
      default:
        return 'Pendiente'
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
  }

  const filteredMatches = tournament?.matches.filter(match => {
    const categoryMatch = filterCategory === 'all' || match.category === filterCategory
    const courtMatch = filterCourt === 'all' || match.courtNumber === filterCourt
    return categoryMatch && courtMatch
  }) || []

  const matchesByCourt = filteredMatches.reduce((acc, match) => {
    if (!acc[match.courtNumber]) {
      acc[match.courtNumber] = []
    }
    acc[match.courtNumber].push(match)
    return acc
  }, {} as Record<number, TournamentMatch[]>)

  const uniqueCategories = [...new Set(tournament?.matches.map(m => m.category) || [])]
  const uniqueCourts = [...new Set(tournament?.matches.map(m => m.courtNumber) || [])].sort((a, b) => a - b)

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.background.secondary
      }}>
        <CardModern variant="glass" padding="lg">
          <div style={{ textAlign: 'center' }}>
            <Loader2 
              size={48} 
              style={{ 
                color: colors.primary[600],
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} 
            />
            <p style={{ color: colors.text.primary, fontSize: '16px', fontWeight: 500 }}>
              Cargando partidos del día...
            </p>
          </div>
        </CardModern>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.background.secondary
      }}>
        <CardModern variant="glass" padding="lg">
          <div style={{ textAlign: 'center' }}>
            <AlertCircle 
              size={48} 
              style={{ 
                color: colors.danger[600],
                margin: '0 auto 16px'
              }} 
            />
            <p style={{ color: colors.text.primary, fontSize: '16px', fontWeight: 500 }}>
              {error}
            </p>
            <button 
              onClick={fetchTournamentData}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: colors.primary[600],
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Reintentar
            </button>
          </div>
        </CardModern>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: colors.background.secondary,
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: colors.neutral[100],
              color: colors.text.secondary,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 700,
              color: colors.text.primary,
              marginBottom: '4px'
            }}>
              📅 Partidos del Día
            </h1>
            <p style={{ 
              fontSize: '14px',
              color: colors.text.secondary
            }}>
              {tournament?.name}
            </p>
          </div>
        </div>

        {/* Navegación de Fecha */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: colors.neutral[100],
          padding: '8px',
          borderRadius: '12px'
        }}>
          <button
            onClick={() => changeDate('prev')}
            style={{
              padding: '8px',
              borderRadius: '6px',
              background: 'transparent',
              color: colors.text.secondary,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronLeft size={16} />
          </button>
          
          <div style={{ 
            padding: '8px 16px',
            background: 'white',
            borderRadius: '8px',
            minWidth: '140px',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '14px',
              fontWeight: 600,
              color: colors.text.primary,
              margin: 0
            }}>
              {selectedDate.toLocaleDateString('es-MX', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </p>
          </div>
          
          <button
            onClick={() => changeDate('next')}
            style={{
              padding: '8px',
              borderRadius: '6px',
              background: 'transparent',
              color: colors.text.secondary,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Filtros Rápidos */}
      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Filtro por Categoría */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '13px',
            color: colors.text.secondary,
            fontWeight: 500
          }}>
            Categoría:
          </span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${colors.border.default}`,
              background: 'white',
              fontSize: '13px',
              color: colors.text.primary
            }}
          >
            <option value="all">Todas</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Cancha */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '13px',
            color: colors.text.secondary,
            fontWeight: 500
          }}>
            Cancha:
          </span>
          <select
            value={filterCourt}
            onChange={(e) => setFilterCourt(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${colors.border.default}`,
              background: 'white',
              fontSize: '13px',
              color: colors.text.primary
            }}
          >
            <option value="all">Todas</option>
            {uniqueCourts.map(court => (
              <option key={court} value={court}>Cancha {court}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumen del Día */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <CardModern variant="glass" padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trophy size={20} color="white" />
            </div>
            <div>
              <p style={{ 
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary,
                margin: 0
              }}>
                {filteredMatches.length}
              </p>
              <p style={{ 
                fontSize: '12px',
                color: colors.text.secondary,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Partidos
              </p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="glass" padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${colors.accent[600]}, ${colors.primary[300]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PlayCircle size={20} color="white" />
            </div>
            <div>
              <p style={{ 
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary,
                margin: 0
              }}>
                {filteredMatches.filter(m => m.status === 'in_progress').length}
              </p>
              <p style={{ 
                fontSize: '12px',
                color: colors.text.secondary,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                En Juego
              </p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="glass" padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${colors.success[600]}, ${colors.success[400]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={20} color="white" />
            </div>
            <div>
              <p style={{ 
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary,
                margin: 0
              }}>
                {filteredMatches.filter(m => m.status === 'completed').length}
              </p>
              <p style={{ 
                fontSize: '12px',
                color: colors.text.secondary,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Finalizados
              </p>
            </div>
          </div>
        </CardModern>
      </div>

      {/* Partidos por Cancha */}
      {Object.keys(matchesByCourt).length === 0 ? (
        <CardModern variant="glass" padding="xl">
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Calendar 
              size={64} 
              style={{ 
                color: colors.neutral[400],
                margin: '0 auto 24px'
              }} 
            />
            <h3 style={{ 
              fontSize: '20px',
              fontWeight: 600,
              color: colors.text.primary,
              marginBottom: '8px'
            }}>
              No hay partidos programados
            </h3>
            <p style={{ 
              fontSize: '14px',
              color: colors.text.secondary
            }}>
              No se encontraron partidos para la fecha seleccionada
            </p>
          </div>
        </CardModern>
      ) : (
        <div style={{ 
          display: 'grid',
          gap: '24px'
        }}>
          {Object.entries(matchesByCourt)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([courtNumber, matches]) => (
            <CardModern key={courtNumber} variant="glass" padding="lg">
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 700
                }}>
                  {courtNumber}
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '18px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    margin: 0
                  }}>
                    Cancha {courtNumber}
                  </h3>
                  <p style={{ 
                    fontSize: '13px',
                    color: colors.text.secondary,
                    margin: 0
                  }}>
                    {matches.length} partido{matches.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div style={{ 
                display: 'grid',
                gap: '16px'
              }}>
                {matches
                  .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
                  .map((match) => (
                  <div
                    key={match.id}
                    style={{
                      padding: '16px',
                      background: getStatusColor(match.status),
                      borderRadius: '12px',
                      border: `1px solid ${colors.border.light}`,
                      cursor: match.status === 'pending' ? 'pointer' : 'default',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => {
                      if (match.status === 'pending') {
                        router.push(`/dashboard/tournaments/${tournamentId}/matches/${match.id}/capture`)
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (match.status === 'pending') {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (match.status === 'pending') {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} style={{ color: colors.text.tertiary }} />
                        <span style={{ 
                          fontSize: '14px',
                          fontWeight: 600,
                          color: colors.text.primary
                        }}>
                          {formatTime(match.scheduledTime)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getStatusIcon(match.status)}
                        <span style={{ 
                          fontSize: '12px',
                          fontWeight: 500,
                          color: colors.text.secondary
                        }}>
                          {getStatusText(match.status)}
                        </span>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          fontSize: '15px',
                          fontWeight: 600,
                          color: colors.text.primary,
                          margin: 0
                        }}>
                          {match.team1.name}
                        </p>
                        <p style={{ 
                          fontSize: '12px',
                          color: colors.text.secondary,
                          margin: 0
                        }}>
                          {match.team1.players.join(' & ')}
                        </p>
                      </div>
                      
                      <div style={{ 
                        padding: '8px 16px',
                        background: colors.neutral[100],
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: colors.text.primary
                      }}>
                        VS
                      </div>
                      
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <p style={{ 
                          fontSize: '15px',
                          fontWeight: 600,
                          color: colors.text.primary,
                          margin: 0
                        }}>
                          {match.team2.name}
                        </p>
                        <p style={{ 
                          fontSize: '12px',
                          color: colors.text.secondary,
                          margin: 0
                        }}>
                          {match.team2.players.join(' & ')}
                        </p>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{
                        padding: '4px 8px',
                        background: colors.primary[100],
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: colors.primary[700]
                      }}>
                        {match.category}
                        {match.group && ` - ${match.group}`}
                      </div>
                      
                      {match.status === 'pending' && (
                        <button
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
                            color: 'white',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Target size={12} />
                          Capturar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardModern>
          ))}
        </div>
      )}
    </div>
  )
}

