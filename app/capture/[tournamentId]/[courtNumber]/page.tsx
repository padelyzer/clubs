'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const colors = {
  primary: {
    600: '#16A34A',
    700: '#15803D'
  },
  accent: {
    300: '#A4DF4E',
    600: '#84CC16'
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#6B7280',
    tertiary: '#9CA3AF'
  },
  border: {
    light: '#E5E7EB'
  },
  success: '#10B981',
  error: '#EF4444'
}

interface Match {
  id: string
  team1Name: string
  team2Name: string
  scheduledAt: string
  round: string
  courtNumber: string
}

export default function CaptureResultPage() {
  const params = useParams()
  const tournamentId = params.tournamentId as string
  const courtNumber = params.courtNumber as string
  
  const [loading, setLoading] = useState(true)
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null)
  const [team1Score, setTeam1Score] = useState<string>('')
  const [team2Score, setTeam2Score] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Cargar el partido actual para esta cancha
  useEffect(() => {
    fetchCurrentMatch()
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchCurrentMatch, 30000)
    return () => clearInterval(interval)
  }, [tournamentId, courtNumber])
  
  const fetchCurrentMatch = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tournaments-v2/${tournamentId}/current-match?courtNumber=${courtNumber}`)
      const data = await response.json()
      
      if (data.match) {
        setCurrentMatch(data.match)
        setError(null)
      } else {
        setError('No hay partido activo en esta cancha en este momento')
      }
    } catch (err) {
      setError('Error al cargar el partido')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!team1Score || !team2Score) {
      setError('Por favor ingresa ambos puntajes')
      return
    }
    
    if (!currentMatch) {
      setError('No hay partido activo')
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/tournaments-v2/${tournamentId}/qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtNumber,
          matchId: currentMatch.id,
          team1Score: parseInt(team1Score),
          team2Score: parseInt(team2Score)
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          // Limpiar y recargar
          setSuccess(false)
          setTeam1Score('')
          setTeam2Score('')
          fetchCurrentMatch()
        }, 3000)
      } else {
        setError(data.error || 'Error al guardar el resultado')
      }
    } catch (err) {
      setError('Error al enviar el resultado')
    } finally {
      setSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(0,0,0,0.1)',
            borderTopColor: colors.accent[600],
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: colors.text.secondary }}>Cargando partido...</p>
        </div>
      </div>
    )
  }
  
  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: `linear-gradient(135deg, ${colors.success}, ${colors.accent[300]})`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: colors.text.primary,
            marginBottom: '8px'
          }}>
            ¡Resultado Guardado!
          </h2>
          <p style={{
            color: colors.text.secondary,
            fontSize: '14px'
          }}>
            El resultado se ha registrado exitosamente
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        paddingTop: '40px'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '12px 24px',
            display: 'inline-block',
            marginBottom: '16px'
          }}>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'white',
              margin: 0
            }}>
              CANCHA {courtNumber}
            </h1>
          </div>
        </div>
        
        {/* Card principal */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          {error && !currentMatch ? (
            <div style={{
              textAlign: 'center',
              padding: '32px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(239,68,68,0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.error} strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <p style={{
                color: colors.text.secondary,
                fontSize: '16px',
                marginBottom: '8px'
              }}>
                {error}
              </p>
              <button
                onClick={fetchCurrentMatch}
                style={{
                  marginTop: '16px',
                  padding: '10px 24px',
                  background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Reintentar
              </button>
            </div>
          ) : currentMatch ? (
            <>
              {/* Información del partido */}
              <div style={{
                textAlign: 'center',
                marginBottom: '32px'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: colors.text.tertiary,
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {currentMatch.round}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: colors.text.secondary
                }}>
                  {currentMatch.scheduledAt ? 
                    new Date(currentMatch.scheduledAt).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Horario no definido'}
                </p>
              </div>
              
              {/* Formulario de captura */}
              <form onSubmit={handleSubmit}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}>
                  {/* Equipo 1 */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      color: colors.text.secondary,
                      marginBottom: '8px',
                      fontWeight: 500
                    }}>
                      {currentMatch.team1Name}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={team1Score}
                      onChange={(e) => setTeam1Score(e.target.value)}
                      placeholder="Puntaje"
                      style={{
                        width: '100%',
                        padding: '16px',
                        fontSize: '24px',
                        fontWeight: 600,
                        textAlign: 'center',
                        border: `2px solid ${colors.border.light}`,
                        borderRadius: '12px',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.accent[600]
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border.light
                      }}
                    />
                  </div>
                  
                  {/* VS Divider */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      flex: 1,
                      height: '1px',
                      background: colors.border.light
                    }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.text.tertiary,
                      letterSpacing: '1px'
                    }}>
                      VS
                    </span>
                    <div style={{
                      flex: 1,
                      height: '1px',
                      background: colors.border.light
                    }} />
                  </div>
                  
                  {/* Equipo 2 */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      color: colors.text.secondary,
                      marginBottom: '8px',
                      fontWeight: 500
                    }}>
                      {currentMatch.team2Name}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={team2Score}
                      onChange={(e) => setTeam2Score(e.target.value)}
                      placeholder="Puntaje"
                      style={{
                        width: '100%',
                        padding: '16px',
                        fontSize: '24px',
                        fontWeight: 600,
                        textAlign: 'center',
                        border: `2px solid ${colors.border.light}`,
                        borderRadius: '12px',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.accent[600]
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border.light
                      }}
                    />
                  </div>
                </div>
                
                {error && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(239,68,68,0.1)',
                    borderRadius: '8px',
                    color: colors.error,
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    {error}
                  </div>
                )}
                
                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={submitting || !team1Score || !team2Score}
                  style={{
                    width: '100%',
                    marginTop: '32px',
                    padding: '16px',
                    background: submitting || !team1Score || !team2Score ? 
                      colors.text.tertiary : 
                      `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: submitting || !team1Score || !team2Score ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {submitting ? 'Guardando...' : 'Guardar Resultado'}
                </button>
              </form>
            </>
          ) : null}
        </div>
        
        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '12px'
        }}>
          Padelyzer Tournament System
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}