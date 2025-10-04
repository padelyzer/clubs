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
  AlertCircle
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

export default function TournamentsV2ListPage() {
  const router = useRouter()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Errores descriptivos basados en el status code
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
      padding: '32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 700,
            color: colors.text.primary,
            letterSpacing: '-0.03em',
            marginBottom: '8px'
          }}>
            Gestión de Torneos
          </h1>
          <p style={{ 
            fontSize: '14px',
            color: colors.text.secondary
          }}>
            Sistema avanzado de gestión con nueva interfaz mejorada
          </p>
        </div>

        <button
          onClick={() => router.push('./tournaments/create')}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
            color: 'white',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <Plus size={18} />
          Nuevo Torneo
        </button>
      </div>

      {/* Tournaments Grid */}
      {tournaments.length === 0 ? (
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
              No hay torneos disponibles
            </h3>
            <p style={{ 
              fontSize: '14px',
              color: colors.text.secondary
            }}>
              Crea tu primer torneo para comenzar
            </p>
          </div>
        </CardModern>
      ) : (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {tournaments.map((tournament) => {
            const statusStyle = getStatusBadge(tournament.status)
            return (
              <CardModern 
                key={tournament.id} 
                variant="glass" 
                padding="lg"
                interactive
                onClick={() => router.push(`./tournaments/${tournament.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Trophy size={24} color="white" />
                      </div>
                      <div>
                        <h3 style={{ 
                          fontSize: '18px',
                          fontWeight: 600,
                          color: colors.text.primary,
                          marginBottom: '2px'
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
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    {statusStyle.label}
                  </div>
                </div>

                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  paddingTop: '16px',
                  borderTop: `1px solid ${colors.border.light}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} style={{ color: colors.text.tertiary }} />
                    <div>
                      <p style={{ 
                        fontSize: '11px',
                        color: colors.text.tertiary,
                        marginBottom: '2px'
                      }}>
                        Fecha inicio
                      </p>
                      <p style={{ 
                        fontSize: '13px',
                        color: colors.text.primary,
                        fontWeight: 500
                      }}>
                        {new Date(tournament.startDate).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
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
                        marginBottom: '2px'
                      }}>
                        Equipos
                      </p>
                      <p style={{ 
                        fontSize: '13px',
                        color: colors.text.primary,
                        fontWeight: 500
                      }}>
                        {tournament._count?.TournamentRegistration || 0} / {tournament.maxPlayers}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: `1px solid ${colors.border.light}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`./tournaments/${tournament.id}`)
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
                      color: 'white',
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
                    Gestionar
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