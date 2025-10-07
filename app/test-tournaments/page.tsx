'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

export default function TestTournamentsPage() {
  const router = useRouter()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tournaments/dev-bypass')
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Error al procesar los datos')
      }
      
      setTournaments(data.tournaments || [])
      setError(null)
      
    } catch (err) {
      console.error('Error fetching tournaments:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#374151', fontSize: '16px' }}>
            Cargando torneos...
          </p>
        </div>
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
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: '#dc2626',
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            ❌
          </div>
          <p style={{ color: '#374151', fontSize: '16px', marginBottom: '16px' }}>
            {error}
          </p>
          <button 
            onClick={fetchTournaments}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f9fafb',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ 
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ← Volver al Inicio
            </button>
          </div>
          
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 700,
            color: '#111827',
            marginBottom: '8px'
          }}>
            🏆 Test de Torneos v3
          </h1>
          <p style={{ 
            fontSize: '16px',
            color: '#6b7280'
          }}>
            API funcionando correctamente - {tournaments.length} torneos encontrados
          </p>
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              onClick={() => router.push(`/dashboard/tournaments/${tournament.id}/dev`)}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px 0 rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px'
                }}>
                  🏆
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#111827',
                    margin: '0 0 4px 0'
                  }}>
                    {tournament.name}
                  </h3>
                  {tournament.description && (
                    <p style={{ 
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {tournament.description}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <p style={{ 
                    fontSize: '12px',
                    color: '#9ca3af',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase'
                  }}>
                    Estado
                  </p>
                  <p style={{ 
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#111827',
                    margin: 0
                  }}>
                    {tournament.status}
                  </p>
                </div>
                
                <div>
                  <p style={{ 
                    fontSize: '12px',
                    color: '#9ca3af',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase'
                  }}>
                    Equipos
                  </p>
                  <p style={{ 
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#111827',
                    margin: 0
                  }}>
                    {tournament._count?.TournamentRegistration || 0}/{tournament.maxPlayers}
                  </p>
                </div>
              </div>

              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div>
                  <p style={{ 
                    fontSize: '12px',
                    color: '#9ca3af',
                    margin: '0 0 4px 0'
                  }}>
                    Inicio
                  </p>
                  <p style={{ 
                    fontSize: '13px',
                    color: '#111827',
                    margin: 0
                  }}>
                    {new Date(tournament.startDate).toLocaleDateString('es-MX')}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/dashboard/tournaments/${tournament.id}/dev`)
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Gestionar
                </button>
              </div>
            </div>
          ))}
        </div>

        {tournaments.length === 0 && (
          <div style={{ 
            textAlign: 'center',
            padding: '48px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ 
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              🏆
            </div>
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '8px'
            }}>
              No hay torneos disponibles
            </h3>
            <p style={{ 
              fontSize: '14px',
              color: '#6b7280'
            }}>
              La API está funcionando pero no hay torneos en la base de datos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
