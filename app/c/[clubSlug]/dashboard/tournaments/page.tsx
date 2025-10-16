'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  const params = useParams()
  const clubSlug = params.clubSlug as string

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
        background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
        border: '1px solid #10B981',
        color: '#065F46',
        label: 'Activo'
      },
      upcoming: {
        background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
        border: '1px solid #0EA5E9',
        color: '#0C4A6E',
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
                color: '#10B981',
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
            Gestión de Torneos V2
          </h1>
          <p style={{ 
            fontSize: '14px',
            color: colors.text.secondary
          }}>
            Sistema avanzado de gestión con nueva interfaz mejorada
          </p>
        </div>

        <button
          onClick={() => router.push(`/c/${clubSlug}/dashboard/tournaments/create`)}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.2)'
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
              >
                {/* Header with Status Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flex: 1,
                    minWidth: 0
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Trophy size={20} color="white" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: colors.text.primary,
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {tournament.name}
                      </h3>
                    </div>
                  </div>

                  <div style={{
                    ...statusStyle,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 500,
                    flexShrink: 0,
                    marginLeft: '12px'
                  }}>
                    {statusStyle.label}
                  </div>
                </div>

                {/* Description */}
                {tournament.description && (
                  <p style={{
                    fontSize: '13px',
                    color: colors.text.secondary,
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {tournament.description}
                  </p>
                )}

                {/* Stats Section */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  padding: '12px',
                  background: colors.neutral[50],
                  borderRadius: '10px',
                  border: `1px solid ${colors.border.light}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Calendar size={16} style={{ color: colors.primary[600] }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: '11px',
                        color: colors.text.tertiary,
                        marginBottom: '2px',
                        fontWeight: 500
                      }}>
                        Fecha inicio
                      </p>
                      <p style={{
                        fontSize: '13px',
                        color: colors.text.primary,
                        fontWeight: 600
                      }}>
                        {new Date(tournament.startDate).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Users size={16} style={{ color: colors.primary[600] }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: '11px',
                        color: colors.text.tertiary,
                        marginBottom: '2px',
                        fontWeight: 500
                      }}>
                        Equipos
                      </p>
                      <p style={{
                        fontSize: '13px',
                        color: colors.text.primary,
                        fontWeight: 600
                      }}>
                        {tournament._count?.TournamentRegistration || 0} / {tournament.maxPlayers}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: `1px solid ${colors.border.light}`
                }}>
                  <button
                    onClick={() => {
                      const targetSlug = clubSlug || 'club-demo-padelyzer'
                      router.push(`/c/${targetSlug}/dashboard/tournaments/${tournament.id}`)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: 'white',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.15)'
                    }}
                  >
                    Gestionar Torneo
                    <ChevronRight size={18} />
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