'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CardModern, CardModernHeader, CardModernTitle, CardModernDescription, CardModernContent } from '@/components/design-system/CardModern'
import { colors } from '@/lib/design-system/colors'
import { 
  Trophy, 
  Users, 
  Calendar,
  ChevronRight,
  Plus,
  Loader2,
  AlertCircle,
  Clock,
  Target,
  BarChart3,
  Filter
} from 'lucide-react'

interface Tournament {
  id: string
  name: string
  description?: string
  status: string
  startDate: string
  endDate: string
  maxPlayers: number
  _count: {
    TournamentRegistration: number
  }
}

export default function TournamentsV3ListPage() {
  const router = useRouter()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clubSlug, setClubSlug] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all')

  useEffect(() => {
    fetchTournaments()
    fetchClubSlug()
  }, [])

  const fetchClubSlug = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const sessionData = await response.json()
        if (sessionData.clubId) {
          const clubResponse = await fetch(`/api/club/settings`)
          if (clubResponse.ok) {
            const clubData = await clubResponse.json()
            setClubSlug(clubData.club?.slug || 'club-demo-padelyzer')
          }
        }
      }
    } catch (error) {
      console.error('Error fetching club slug:', error)
      setClubSlug('club-demo-padelyzer')
    }
  }

  const fetchTournaments = async () => {
    try {
      // Detectar modo desarrollo de múltiples formas
      let isDevMode = false
      
      if (typeof window !== 'undefined') {
        // Verificar URL parameter
        const urlParams = new URLSearchParams(window.location.search)
        isDevMode = urlParams.get('dev') === 'true'
        
        // Verificar localStorage
        if (!isDevMode) {
          isDevMode = localStorage.getItem('dev-mode') === 'true'
        }
        
        // Verificar cookie
        if (!isDevMode) {
          isDevMode = document.cookie.includes('auth-session=mock-session-token')
        }
      }
      
      const apiUrl = isDevMode ? '/api/tournaments/dev-bypass' : '/api/tournaments'
      
      console.log('🔍 Modo desarrollo:', isDevMode, 'URL:', apiUrl)
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 401) {
          throw new Error(errorData.details || 'Sesión expirada. Por favor inicia sesión nuevamente.')
        } else if (response.status === 402) {
          throw new Error(errorData.error || 'El módulo de torneos no está disponible en tu plan actual.')
        } else if (response.status === 400) {
          throw new Error(errorData.details || 'Configuración de club inválida.')
        } else if (response.status === 500) {
          throw new Error(errorData.details || 'Error del servidor. Intenta de nuevo en unos momentos.')
        } else {
          throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
        }
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.details || data.error || 'Error al procesar la respuesta del servidor')
      }
      
      setTournaments(data.tournaments || [])
      setError(null)
      
    } catch (err) {
      console.error('Error fetching tournaments:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar torneos')
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
    return styles[status] || styles.draft
  }

  const filteredTournaments = tournaments.filter(tournament => {
    if (activeFilter === 'all') return true
    return tournament.status === activeFilter
  })

  const getQuickActions = (tournament: Tournament) => {
    const actions = []
    
    if (tournament.status === 'active') {
      actions.push({
        icon: Clock,
        label: 'Ver Partidos de Hoy',
        action: () => router.push(`/dashboard/tournaments/${tournament.id}?view=today`)
      })
      actions.push({
        icon: Target,
        label: 'Capturar Resultados',
        action: () => router.push(`/dashboard/tournaments/${tournament.id}?view=capture`)
      })
    }
    
    actions.push({
      icon: BarChart3,
      label: 'Ver Tablas',
      action: () => router.push(`/dashboard/tournaments/${tournament.id}?view=standings`)
    })
    
    return actions
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
              Cargando torneos...
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
              onClick={fetchTournaments}
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
      {/* Header Mejorado */}
      <div style={{ 
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 700,
            color: colors.text.primary,
            letterSpacing: '-0.03em',
            marginBottom: '4px'
          }}>
            🏆 Gestión de Torneos
          </h1>
          <p style={{ 
            fontSize: '14px',
            color: colors.text.secondary
          }}>
            Sistema optimizado para operadores - Máximo 3 clicks para cualquier acción
          </p>
        </div>

        <button
          onClick={() => router.push('/dashboard/tournaments/create')}
          style={{
            padding: '12px 20px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
            color: 'white',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <Plus size={18} />
          Nuevo Torneo
        </button>
      </div>

      {/* Filtros Rápidos */}
      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'all', label: 'Todos', icon: Filter },
          { key: 'active', label: 'Activos', icon: Clock },
          { key: 'upcoming', label: 'Próximos', icon: Calendar },
          { key: 'completed', label: 'Finalizados', icon: Trophy }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: activeFilter === key 
                ? `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`
                : colors.neutral[100],
              color: activeFilter === key ? 'white' : colors.text.secondary,
              border: 'none',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tournaments Grid Mejorado */}
      {filteredTournaments.length === 0 ? (
        <CardModern variant="glass" padding="xl">
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Trophy 
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
              {activeFilter === 'all' ? 'No hay torneos disponibles' : `No hay torneos ${activeFilter === 'active' ? 'activos' : activeFilter === 'upcoming' ? 'próximos' : 'finalizados'}`}
            </h3>
            <p style={{ 
              fontSize: '14px',
              color: colors.text.secondary,
              marginBottom: '24px'
            }}>
              {activeFilter === 'all' ? 'Crea tu primer torneo para comenzar' : 'Cambia el filtro para ver otros torneos'}
            </p>
            {activeFilter === 'all' && (
              <button
                onClick={() => router.push('/dashboard/tournaments/create')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto',
                  transition: 'all 0.2s'
                }}
              >
                <Plus size={18} />
                Crear Primer Torneo
              </button>
            )}
          </div>
        </CardModern>
      ) : (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {filteredTournaments.map((tournament) => {
            const statusStyle = getStatusBadge(tournament.status)
            const quickActions = getQuickActions(tournament)
            
            return (
              <CardModern 
                key={tournament.id} 
                variant="glass" 
                padding="lg"
                interactive
                style={{ cursor: 'pointer' }}
              >
                {/* Header del Torneo */}
                <div style={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '20px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Trophy size={24} color="white" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '18px',
                          fontWeight: 600,
                          color: colors.text.primary,
                          marginBottom: '4px',
                          lineHeight: 1.3
                        }}>
                          {tournament.name}
                        </h3>
                        {tournament.description && (
                          <p style={{ 
                            fontSize: '13px',
                            color: colors.text.secondary,
                            lineHeight: 1.4
                          }}>
                            {tournament.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    ...statusStyle,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {statusStyle.label}
                  </div>
                </div>

                {/* Estadísticas Rápidas */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  padding: '16px',
                  background: colors.neutral[50],
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} style={{ color: colors.text.tertiary }} />
                    <div>
                      <p style={{ 
                        fontSize: '11px',
                        color: colors.text.tertiary,
                        marginBottom: '2px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Inicio
                      </p>
                      <p style={{ 
                        fontSize: '13px',
                        color: colors.text.primary,
                        fontWeight: 600
                      }}>
                        {new Date(tournament.startDate).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} style={{ color: colors.text.tertiary }} />
                    <div>
                      <p style={{ 
                        fontSize: '11px',
                        color: colors.text.tertiary,
                        marginBottom: '2px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Equipos
                      </p>
                      <p style={{ 
                        fontSize: '13px',
                        color: colors.text.primary,
                        fontWeight: 600
                      }}>
                        {tournament._count?.TournamentRegistration || 0}/{tournament.maxPlayers}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones Rápidas */}
                {quickActions.length > 0 && (
                  <div style={{ 
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '16px'
                  }}>
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation()
                          action.action()
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: colors.primary[50],
                          color: colors.primary[700],
                          border: `1px solid ${colors.primary[200]}`,
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                          flex: '1',
                          minWidth: '120px',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.primary[100]
                          e.currentTarget.style.borderColor = colors.primary[300]
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = colors.primary[50]
                          e.currentTarget.style.borderColor = colors.primary[200]
                        }}
                      >
                        <action.icon size={14} />
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Acción Principal */}
                <div style={{ 
                  paddingTop: '16px',
                  borderTop: `1px solid ${colors.border.light}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const targetSlug = clubSlug || 'club-demo-padelyzer'
                      router.push(`/c/${targetSlug}/dashboard/tournaments/${tournament.id}`)
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
                      color: 'white',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      flex: '1',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    Gestionar Torneo
                    <ChevronRight size={16} />
                  </button>
                </div>
              </CardModern>
            )
          })}
        </div>
      )}
    </div>
  )
}