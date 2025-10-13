'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CardModern } from '@/components/design-system/CardModern'
import { TournamentNavigation } from '@/components/tournaments/TournamentNavigation'
import { colors } from '@/lib/design-system/colors'
import { 
  Trophy, 
  Users, 
  Calendar,
  Clock,
  Target,
  BarChart3,
  Loader2,
  AlertCircle,
  PlayCircle,
  CheckCircle,
  ChevronRight
} from 'lucide-react'

interface Tournament {
  id: string
  name: string
  description?: string
  status: string
  type: string
  startDate: string
  endDate: string
  maxPlayers: number
  _count: {
    TournamentRegistration: number
    TournamentMatch: number
  }
  todayMatches: Array<{
    id: string
    courtNumber: number
    scheduledTime: string
    status: 'pending' | 'in_progress' | 'completed'
    team1: { name: string }
    team2: { name: string }
    category: string
  }>
  recentResults: Array<{
    id: string
    team1: { name: string }
    team2: { name: string }
    winner: 'team1' | 'team2'
    completedAt: string
  }>
}

export default function TournamentOverviewPage() {
  const router = useRouter()
  const params = useParams()
  const tournamentId = params.id as string
  
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTournamentData()
  }, [tournamentId])

  const fetchTournamentData = async () => {
    try {
      setLoading(true)

      // Detectar modo desarrollo
      const isDevMode = typeof window !== 'undefined' && (
        window.location.search.includes('dev=true') ||
        localStorage.getItem('dev-mode') === 'true' ||
        document.cookie.includes('auth-session=mock-session-token')
      )

      const apiUrl = isDevMode
        ? `/api/tournaments/dev/${tournamentId}`
        : `/api/tournaments/${tournamentId}`

      console.log('🔍 Fetching tournament:', apiUrl, 'Dev mode:', isDevMode)

      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error('Error al cargar los datos del torneo')
      }
      
      const data = await response.json()

      console.log('📊 Data received from API:', JSON.stringify(data, null, 2))

      if (!data.success) {
        throw new Error(data.error || 'Error al procesar los datos')
      }

      console.log('✅ Tournament object:', data.tournament)
      setTournament(data.tournament)
      setError(null)
      
    } catch (err) {
      console.error('Error fetching tournament data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { background: string; border: string; color: string; label: string }> = {
      active: {
        background: `linear-gradient(135deg, ${colors.accent[600]}20, ${colors.accent[300]}20)`,
        border: `1px solid ${colors.accent[600]}40`,
        color: colors.accent[700],
        label: 'Activo'
      },
      upcoming: {
        background: `linear-gradient(135deg, ${colors.primary[600]}20, ${colors.primary[400]}20)`,
        border: `1px solid ${colors.primary[600]}40`,
        color: colors.primary[700],
        label: 'Próximo'
      },
      completed: {
        background: `linear-gradient(135deg, ${colors.neutral[400]}20, ${colors.neutral[300]}20)`,
        border: `1px solid ${colors.neutral[400]}40`,
        color: colors.neutral[600],
        label: 'Finalizado'
      },
      draft: {
        background: `linear-gradient(135deg, ${colors.warning[600]}20, ${colors.warning[400]}20)`,
        border: `1px solid ${colors.warning[600]}40`,
        color: colors.warning[700],
        label: 'Borrador'
      }
    }
    return styles[status] || styles.draft
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} style={{ color: colors.accent[600] }} />
      case 'in_progress':
        return <PlayCircle size={16} style={{ color: colors.accent[600] }} />
      default:
        return <Clock size={16} style={{ color: colors.text.tertiary }} />
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

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
              Cargando torneo...
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

  if (!tournament) return null

  const statusStyle = getStatusBadge(tournament.status)
  const pendingMatches = tournament.todayMatches.filter(m => m.status === 'pending').length
  const inProgressMatches = tournament.todayMatches.filter(m => m.status === 'in_progress').length
  const completedMatches = tournament.todayMatches.filter(m => m.status === 'completed').length

  return (
    <div style={{ 
      minHeight: '100vh',
      background: colors.background.secondary,
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '24px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trophy size={28} color="white" />
            </div>
            
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: 700,
                color: colors.text.primary,
                marginBottom: '4px',
                lineHeight: 1.2
              }}>
                {tournament.name}
              </h1>
              {tournament.description && (
                <p style={{ 
                  fontSize: '14px',
                  color: colors.text.secondary,
                  margin: 0,
                  lineHeight: 1.4
                }}>
                  {tournament.description}
                </p>
              )}
            </div>
            
            <div style={{
              ...statusStyle,
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {statusStyle.label}
            </div>
          </div>
          
          <div style={{ 
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} style={{ color: colors.text.tertiary }} />
              <span style={{ 
                fontSize: '14px',
                color: colors.text.secondary
              }}>
                {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ color: colors.text.tertiary }} />
              <span style={{ 
                fontSize: '14px',
                color: colors.text.secondary
              }}>
                {tournament._count.TournamentRegistration} / {tournament.maxPlayers} equipos
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={16} style={{ color: colors.text.tertiary }} />
              <span style={{ 
                fontSize: '14px',
                color: colors.text.secondary
              }}>
                {tournament.type.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Navegación */}
        <TournamentNavigation 
          tournamentId={tournamentId}
          activeView="overview"
          tournamentName={tournament.name}
        />

        {/* Contenido Principal */}
        <div style={{ 
          display: 'grid',
          gap: '24px'
        }}>
          {/* Estadísticas Rápidas */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <CardModern variant="glass" padding="lg">
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
                  <Calendar size={20} color="white" />
                </div>
                <div>
                  <p style={{ 
                    fontSize: '24px',
                    fontWeight: 700,
                    color: colors.text.primary,
                    margin: 0
                  }}>
                    {tournament.todayMatches.length}
                  </p>
                  <p style={{ 
                    fontSize: '12px',
                    color: colors.text.secondary,
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Partidos Hoy
                  </p>
                </div>
              </div>
            </CardModern>

            <CardModern variant="glass" padding="lg">
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
                    {inProgressMatches}
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

            <CardModern variant="glass" padding="lg">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${colors.accent[600]}, ${colors.accent[400]})`,
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
                    {completedMatches}
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

            <CardModern variant="glass" padding="lg">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${colors.warning[600]}, ${colors.warning[400]})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={20} color="white" />
                </div>
                <div>
                  <p style={{ 
                    fontSize: '24px',
                    fontWeight: 700,
                    color: colors.text.primary,
                    margin: 0
                  }}>
                    {pendingMatches}
                  </p>
                  <p style={{ 
                    fontSize: '12px',
                    color: colors.text.secondary,
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Pendientes
                  </p>
                </div>
              </div>
            </CardModern>
          </div>

          {/* Acciones Principales */}
          <CardModern variant="glass" padding="lg">
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 600,
              color: colors.text.primary,
              marginBottom: '16px'
            }}>
              ⚡ Acciones Principales
            </h3>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              <button
                onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/today`)}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <Calendar size={20} />
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>
                    Ver Partidos de Hoy
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                    {tournament.todayMatches.length} partidos programados
                  </p>
                </div>
                <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
              </button>
              
              <button
                onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/capture`)}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${colors.accent[600]}, ${colors.accent[500]})`,
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <Target size={20} />
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>
                    Capturar Resultados
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                    Registrar resultados rápidamente
                  </p>
                </div>
                <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
              </button>
              
              <button
                onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/standings`)}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${colors.accent[600]}, ${colors.primary[400]})`,
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <BarChart3 size={20} />
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>
                    Ver Tablas
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                    Clasificaciones actualizadas
                  </p>
                </div>
                <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
              </button>
            </div>
          </CardModern>

          {/* Partidos de Hoy */}
          {tournament.todayMatches.length > 0 && (
            <CardModern variant="glass" padding="lg">
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '18px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  margin: 0
                }}>
                  📅 Partidos de Hoy
                </h3>
                <button
                  onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/today`)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: colors.primary[100],
                    color: colors.primary[700],
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Ver Todos
                </button>
              </div>
              
              <div style={{ 
                display: 'grid',
                gap: '12px'
              }}>
                {tournament.todayMatches.slice(0, 5).map((match) => (
                  <div
                    key={match.id}
                    style={{
                      padding: '16px',
                      background: colors.neutral[50],
                      borderRadius: '10px',
                      border: `1px solid ${colors.border.light}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/matches/${match.id}/capture`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.primary[50]
                      e.currentTarget.style.borderColor = colors.primary[200]
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.neutral[50]
                      e.currentTarget.style.borderColor = colors.border.light
                    }}
                  >
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} style={{ color: colors.text.tertiary }} />
                        <span style={{ 
                          fontSize: '13px',
                          fontWeight: 500,
                          color: colors.text.primary
                        }}>
                          {formatTime(match.scheduledTime)}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: colors.primary[100],
                          color: colors.primary[700],
                          fontSize: '10px',
                          fontWeight: 500
                        }}>
                          C{match.courtNumber}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {getStatusIcon(match.status)}
                        <span style={{ 
                          fontSize: '11px',
                          fontWeight: 500,
                          color: colors.text.secondary
                        }}>
                          {match.status === 'completed' ? 'Finalizado' : 
                           match.status === 'in_progress' ? 'En Juego' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          fontSize: '14px',
                          fontWeight: 500,
                          color: colors.text.primary,
                          margin: '0 0 2px 0'
                        }}>
                          {match.team1.name} vs {match.team2.name}
                        </p>
                        <p style={{ 
                          fontSize: '12px',
                          color: colors.text.secondary,
                          margin: 0
                        }}>
                          {match.category}
                        </p>
                      </div>
                      
                      {match.status === 'pending' && (
                        <Target size={16} style={{ color: colors.primary[600] }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardModern>
          )}

          {/* Resultados Recientes */}
          {tournament.recentResults.length > 0 && (
            <CardModern variant="glass" padding="lg">
              <h3 style={{ 
                fontSize: '18px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '16px'
              }}>
                🏆 Resultados Recientes
              </h3>
              
              <div style={{ 
                display: 'grid',
                gap: '12px'
              }}>
                {tournament.recentResults?.slice(0, 5).map((result: any) => {
                  if (!result?.team1 || !result?.team2) return null
                  return (
                  <div
                    key={result.id}
                    style={{
                      padding: '16px',
                      background: colors.accent[50],
                      borderRadius: '10px',
                      border: `1px solid ${colors.accent[200]}`
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={14} style={{ color: colors.accent[600] }} />
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: colors.accent[700]
                        }}>
                          Finalizado
                        </span>
                      </div>

                      <span style={{
                        fontSize: '11px',
                        color: colors.text.secondary
                      }}>
                        {new Date(result.completedAt).toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: colors.text.primary,
                          margin: 0
                        }}>
                          {result.team1?.name || 'TBD'} vs {result.team2?.name || 'TBD'}
                        </p>
                      </div>
                      
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: colors.accent[100],
                        color: colors.accent[700],
                        fontSize: '11px',
                        fontWeight: 600
                      }}>
                        🏆 {result.winner === 'team1' ? result.team1?.name : result.team2?.name}
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            </CardModern>
          )}
        </div>
      </div>
    </div>
  )
}