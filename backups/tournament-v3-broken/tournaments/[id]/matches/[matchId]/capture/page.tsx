'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CardModern } from '@/components/design-system/CardModern'
import { colors } from '@/lib/design-system/colors'
import { 
  ArrowLeft,
  Save,
  Trophy,
  Users,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface MatchData {
  id: string
  tournamentId: string
  courtNumber: number
  scheduledTime: string
  status: 'pending' | 'in_progress' | 'completed'
  team1: {
    id: string
    name: string
    players: Array<{
      id: string
      name: string
    }>
  }
  team2: {
    id: string
    name: string
    players: Array<{
      id: string
      name: string
    }>
  }
  category: string
  group?: string
  sets: Array<{
    id: string
    number: number
    team1Score: number
    team2Score: number
    status: 'pending' | 'in_progress' | 'completed'
  }>
  maxSets: number
  gamesPerSet: number
  hasTiebreak: boolean
}

interface Tournament {
  id: string
  name: string
  status: string
}

export default function MatchCapturePage() {
  const router = useRouter()
  const params = useParams()
  const tournamentId = params.id as string
  const matchId = params.matchId as string
  
  const [match, setMatch] = useState<MatchData | null>(null)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sets, setSets] = useState<Array<{ team1: number; team2: number }>>([])
  const [winner, setWinner] = useState<'team1' | 'team2' | null>(null)
  const [currentSet, setCurrentSet] = useState(0)

  useEffect(() => {
    fetchMatchData()
  }, [matchId])

  const fetchMatchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar los datos del partido')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Error al procesar los datos')
      }
      
      setMatch(data.match)
      setTournament(data.tournament)
      
      // Inicializar sets basado en la configuración del torneo
      const initialSets = Array(data.match.maxSets).fill(null).map(() => ({ team1: 0, team2: 0 }))
      setSets(initialSets)
      
      setError(null)
      
    } catch (err) {
      console.error('Error fetching match data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const updateSetScore = (setIndex: number, team: 'team1' | 'team2', score: number) => {
    const newSets = [...sets]
    newSets[setIndex] = {
      ...newSets[setIndex],
      [team]: Math.max(0, Math.min(score, 99)) // Limitar entre 0 y 99
    }
    setSets(newSets)
    
    // Auto-detectar ganador si hay suficientes sets completados
    autoDetectWinner(newSets)
  }

  const autoDetectWinner = (currentSets: typeof sets) => {
    if (!match) return
    
    const setsNeeded = Math.ceil(match.maxSets / 2)
    let team1Wins = 0
    let team2Wins = 0
    
    currentSets.forEach(set => {
      if (set.team1 > 0 || set.team2 > 0) {
        if (set.team1 > set.team2) team1Wins++
        else if (set.team2 > set.team1) team2Wins++
      }
    })
    
    if (team1Wins >= setsNeeded) {
      setWinner('team1')
    } else if (team2Wins >= setsNeeded) {
      setWinner('team2')
    } else {
      setWinner(null)
    }
  }

  const canSetWinner = (setIndex: number) => {
    const set = sets[setIndex]
    if (!set) return false
    
    const maxGames = match?.gamesPerSet || 6
    const hasTiebreak = match?.hasTiebreak || false
    
    // Verificar si es un set válido
    if (hasTiebreak) {
      // Con tiebreak, gana el primero en llegar a 6 o 7
      return (set.team1 >= 6 || set.team2 >= 6) && Math.abs(set.team1 - set.team2) >= 2
    } else {
      // Sin tiebreak, gana el primero en llegar a maxGames
      return (set.team1 >= maxGames || set.team2 >= maxGames) && Math.abs(set.team1 - set.team2) >= 2
    }
  }

  const saveResult = async () => {
    if (!match || !winner) {
      setError('Por favor selecciona un ganador del partido')
      return
    }
    
    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sets: sets,
          winner: winner,
          status: 'completed'
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error al guardar el resultado')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Error al procesar la respuesta')
      }
      
      // Redirigir a la vista del día después de guardar
      router.push(`/dashboard/tournaments/${tournamentId}/today`)
      
    } catch (err) {
      console.error('Error saving result:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar el resultado')
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
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
              Cargando partido...
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

  if (error && !match) {
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
              onClick={fetchMatchData}
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

  if (!match) return null

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
        gap: '16px'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: '10px',
            borderRadius: '10px',
            background: colors.neutral[100],
            color: colors.text.secondary,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 700,
            color: colors.text.primary,
            marginBottom: '4px'
          }}>
            🎯 Capturar Resultado
          </h1>
          <p style={{ 
            fontSize: '14px',
            color: colors.text.secondary
          }}>
            {tournament?.name} • Cancha {match.courtNumber}
          </p>
        </div>
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Información del Partido */}
        <CardModern variant="glass" padding="lg">
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
              {match.courtNumber}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontSize: '18px',
                fontWeight: 600,
                color: colors.text.primary,
                margin: 0
              }}>
                Cancha {match.courtNumber}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} style={{ color: colors.text.tertiary }} />
                  <span style={{ 
                    fontSize: '13px',
                    color: colors.text.secondary
                  }}>
                    {formatTime(match.scheduledTime)}
                  </span>
                </div>
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
              </div>
            </div>
          </div>

          {/* Equipos */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '20px',
            alignItems: 'center',
            padding: '20px',
            background: colors.neutral[50],
            borderRadius: '12px'
          }}>
            {/* Equipo 1 */}
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ 
                fontSize: '16px',
                fontWeight: 600,
                color: colors.text.primary,
                margin: '0 0 8px 0'
              }}>
                {match.team1.name}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {match.team1.players.map((player, index) => (
                  <p key={index} style={{ 
                    fontSize: '13px',
                    color: colors.text.secondary,
                    margin: 0
                  }}>
                    {player.name}
                  </p>
                ))}
              </div>
            </div>
            
            {/* VS */}
            <div style={{ 
              padding: '12px 16px',
              background: colors.neutral[200],
              borderRadius: '20px',
              fontSize: '16px',
              fontWeight: 700,
              color: colors.text.primary
            }}>
              VS
            </div>
            
            {/* Equipo 2 */}
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ 
                fontSize: '16px',
                fontWeight: 600,
                color: colors.text.primary,
                margin: '0 0 8px 0'
              }}>
                {match.team2.name}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {match.team2.players.map((player, index) => (
                  <p key={index} style={{ 
                    fontSize: '13px',
                    color: colors.text.secondary,
                    margin: 0
                  }}>
                    {player.name}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </CardModern>

        {/* Captura de Sets */}
        <CardModern variant="glass" padding="lg">
          <h3 style={{ 
            fontSize: '18px',
            fontWeight: 600,
            color: colors.text.primary,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Trophy size={20} />
            Resultados por Set
          </h3>

          <div style={{ 
            display: 'grid',
            gap: '16px'
          }}>
            {sets.map((set, setIndex) => (
              <div
                key={setIndex}
                style={{
                  padding: '20px',
                  background: canSetWinner(setIndex) ? colors.accent[50] : colors.neutral[50],
                  borderRadius: '12px',
                  border: `2px solid ${canSetWinner(setIndex) ? colors.accent[200] : colors.neutral[200]}`
                }}
              >
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ 
                    fontSize: '16px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    margin: 0
                  }}>
                    Set {setIndex + 1}
                  </h4>
                  {canSetWinner(setIndex) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} style={{ color: colors.accent[600] }} />
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: colors.accent[700]
                      }}>
                        Set válido
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  gap: '20px',
                  alignItems: 'center'
                }}>
                  {/* Equipo 1 Score */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => updateSetScore(setIndex, 'team1', set.team1 - 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: colors.neutral[200],
                          color: colors.text.secondary,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 600
                        }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      <input
                        type="number"
                        value={set.team1}
                        onChange={(e) => updateSetScore(setIndex, 'team1', parseInt(e.target.value) || 0)}
                        style={{
                          width: '60px',
                          height: '40px',
                          textAlign: 'center',
                          fontSize: '20px',
                          fontWeight: 700,
                          color: colors.text.primary,
                          border: `2px solid ${colors.border.default}`,
                          borderRadius: '8px',
                          background: 'white'
                        }}
                        min="0"
                        max="99"
                      />
                      
                      <button
                        onClick={() => updateSetScore(setIndex, 'team1', set.team1 + 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: colors.primary[600],
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 600
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                    <p style={{ 
                      fontSize: '13px',
                      color: colors.text.secondary,
                      margin: '8px 0 0 0'
                    }}>
                      {match.team1.name}
                    </p>
                  </div>

                  {/* Separador */}
                  <div style={{ 
                    fontSize: '24px',
                    fontWeight: 700,
                    color: colors.text.tertiary
                  }}>
                    -
                  </div>

                  {/* Equipo 2 Score */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => updateSetScore(setIndex, 'team2', set.team2 - 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: colors.neutral[200],
                          color: colors.text.secondary,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 600
                        }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      <input
                        type="number"
                        value={set.team2}
                        onChange={(e) => updateSetScore(setIndex, 'team2', parseInt(e.target.value) || 0)}
                        style={{
                          width: '60px',
                          height: '40px',
                          textAlign: 'center',
                          fontSize: '20px',
                          fontWeight: 700,
                          color: colors.text.primary,
                          border: `2px solid ${colors.border.default}`,
                          borderRadius: '8px',
                          background: 'white'
                        }}
                        min="0"
                        max="99"
                      />
                      
                      <button
                        onClick={() => updateSetScore(setIndex, 'team2', set.team2 + 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: colors.primary[600],
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 600
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                    <p style={{ 
                      fontSize: '13px',
                      color: colors.text.secondary,
                      margin: '8px 0 0 0'
                    }}>
                      {match.team2.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reglas */}
          <div style={{ 
            marginTop: '20px',
            padding: '16px',
            background: colors.neutral[100],
            borderRadius: '8px',
            fontSize: '12px',
            color: colors.text.secondary,
            lineHeight: 1.4
          }}>
            <strong>Reglas:</strong> {match.hasTiebreak ? 'Gana el primero en llegar a 6 o 7 juegos con diferencia de 2.' : `Gana el primero en llegar a ${match.gamesPerSet} juegos.`}
          </div>
        </CardModern>

        {/* Error Message */}
        {error && (
          <CardModern variant="glass" padding="md">
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: colors.danger[50],
              borderRadius: '8px',
              border: `1px solid ${colors.danger[200]}`
            }}>
              <AlertCircle size={20} style={{ color: colors.danger[600] }} />
              <p style={{ 
                fontSize: '14px',
                color: colors.danger[700],
                margin: 0
              }}>
                {error}
              </p>
            </div>
          </CardModern>
        )}

        {/* Botones de Acción */}
        <CardModern variant="glass" padding="lg">
          <div style={{ 
            display: 'flex',
            gap: '16px',
            justifyContent: 'space-between'
          }}>
            <button
              onClick={() => router.back()}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                background: colors.neutral[200],
                color: colors.text.secondary,
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <ArrowLeft size={16} />
              Cancelar
            </button>
            
            <button
              onClick={saveResult}
              disabled={!winner || saving}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                background: winner
                  ? `linear-gradient(135deg, ${colors.accent[600]}, ${colors.accent[500]})`
                  : colors.neutral[300],
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: winner ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                opacity: winner ? 1 : 0.6
              }}
            >
              {saving ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Save size={16} />
              )}
              {saving ? 'Guardando...' : 'Guardar Resultado'}
            </button>
          </div>
        </CardModern>
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

