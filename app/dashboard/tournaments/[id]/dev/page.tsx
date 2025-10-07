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
}

export default function TournamentOverviewDevPage() {
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
      
      // Simular datos del torneo para desarrollo
      const mockTournament: Tournament = {
        id: tournamentId,
        name: 'Torneo Demo Activo',
        description: 'Torneo de demostración para probar la interfaz v3',
        status: 'ACTIVE',
        type: 'SINGLE_ELIMINATION',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        maxPlayers: 16,
        _count: {
          TournamentRegistration: 8,
          TournamentMatch: 12
        }
      }
      
      setTournament(mockTournament)
      setError(null)
      
    } catch (err) {
      console.error('Error fetching tournament data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
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
    return styles[status.toLowerCase()] || styles.draft
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
                    {tournament._count.TournamentMatch}
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
                    {Math.floor(tournament._count.TournamentMatch / 2)}
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
                    {Math.floor(tournament._count.TournamentMatch / 3)}
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
                    {tournament._count.TournamentMatch} partidos programados
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
            </div>
          </CardModern>

          {/* Mensaje de Desarrollo */}
          <CardModern variant="glass" padding="lg">
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: colors.primary[50],
              borderRadius: '12px',
              border: `1px solid ${colors.primary[200]}`
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: colors.primary[600],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                🚀
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ 
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.primary[700],
                  margin: '0 0 4px 0'
                }}>
                  Modo Desarrollo Activo
                </h4>
                <p style={{ 
                  fontSize: '14px',
                  color: colors.primary[600],
                  margin: 0,
                  lineHeight: 1.4
                }}>
                  Esta es la vista general del torneo en la interfaz v3. Las funcionalidades avanzadas como vista del día y captura de resultados requieren APIs adicionales.
                </p>
              </div>
            </div>
          </CardModern>
        </div>
      </div>
    </div>
  )
}
