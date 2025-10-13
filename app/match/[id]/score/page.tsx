'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { 
  Trophy, Users, Clock, MapPin, Check, X, AlertCircle,
  Plus, Minus, ChevronLeft, Award
} from 'lucide-react'

type Match = {
  id: string
  round: string
  scheduledAt?: Date
  startTime?: string
  endTime?: string
  status: string
  player1Id?: string
  player1Name?: string
  player2Id?: string
  player2Name?: string
  player1Score: number[]
  player2Score: number[]
  winnerId?: string
  winnerName?: string
  canEdit: boolean
  court?: {
    name: string
  }
  Court?: {
    name: string
  }
  Tournament: {
    name: string
    Club: {
      name: string
    }
  }
}

export default function MatchScorePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const matchId = params?.id as string
  const fromQr = searchParams?.get('qr') === 'true'

  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Score state
  const [player1Score, setPlayer1Score] = useState<number[]>([])
  const [player2Score, setPlayer2Score] = useState<number[]>([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchMatch()
  }, [matchId])

  const fetchMatch = async () => {
    try {
      const response = await fetch(`/api/match/${matchId}/score${fromQr ? '?qr=true' : ''}`)
      const data = await response.json()

      if (data.success) {
        setMatch(data.match)
        setPlayer1Score(data.match.player1Score || [0])
        setPlayer2Score(data.match.player2Score || [0])
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al cargar el partido')
    } finally {
      setLoading(false)
    }
  }

  const addSet = () => {
    setPlayer1Score([...player1Score, 0])
    setPlayer2Score([...player2Score, 0])
  }

  const removeSet = (index: number) => {
    if (player1Score.length > 1) {
      setPlayer1Score(player1Score.filter((_, i) => i !== index))
      setPlayer2Score(player2Score.filter((_, i) => i !== index))
    }
  }

  const updateScore = (player: 1 | 2, setIndex: number, value: number) => {
    if (player === 1) {
      const newScore = [...player1Score]
      newScore[setIndex] = Math.max(0, value)
      setPlayer1Score(newScore)
    } else {
      const newScore = [...player2Score]
      newScore[setIndex] = Math.max(0, value)
      setPlayer2Score(newScore)
    }
  }

  const calculateWinner = () => {
    const player1Sets = player1Score.filter((score, index) => score > player2Score[index]).length
    const player2Sets = player2Score.filter((score, index) => score > player1Score[index]).length
    
    if (player1Sets > player2Sets) {
      return { winnerId: match?.player1Id, winnerName: match?.player1Name }
    } else if (player2Sets > player1Sets) {
      return { winnerId: match?.player2Id, winnerName: match?.player2Name }
    }
    return { winnerId: undefined, winnerName: undefined }
  }

  const submitResult = async () => {
    if (!match) return

    setSubmitting(true)
    setError(null)

    try {
      const winner = calculateWinner()
      
      const response = await fetch(`/api/match/${matchId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          player1Score,
          player2Score,
          winnerId: winner.winnerId,
          capturedBy: fromQr ? 'player' : 'admin',
          notes
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        setMatch(data.match)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al enviar resultado')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fffe 0%, #f0f9f4 100%)'
      }}>
        <div style={{
          padding: '40px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #A4DF4E',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }} />
          <p style={{ color: '#516640', fontSize: '16px' }}>Cargando partido...</p>
        </div>
      </div>
    )
  }

  if (error && !match) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fffe 0%, #f0f9f4 100%)',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '400px',
          padding: '40px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#fee2e2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <X size={30} color="#dc2626" />
          </div>
          <h2 style={{ color: '#182A01', marginBottom: '16px' }}>Error</h2>
          <p style={{ color: '#516640', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={() => router.back()}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
              border: 'none',
              borderRadius: '12px',
              color: '#182A01',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fffe 0%, #f0f9f4 100%)',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          padding: '40px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <Check size={40} color="#182A01" />
          </div>
          <h2 style={{ 
            color: '#182A01', 
            fontSize: '24px', 
            fontWeight: 700,
            marginBottom: '16px' 
          }}>
            ¡Resultado Enviado!
          </h2>
          <p style={{ 
            color: '#516640', 
            marginBottom: '32px',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            {success}
          </p>
          
          {match && (
            <div style={{
              background: 'rgba(164, 223, 78, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <h3 style={{ color: '#182A01', marginBottom: '12px', fontSize: '18px' }}>
                Resultado Final
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>{match.player1Name}</span>
                <span style={{ fontWeight: 600 }}>
                  {player1Score.join(' - ')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{match.player2Name}</span>
                <span style={{ fontWeight: 600 }}>
                  {player2Score.join(' - ')}
                </span>
              </div>
              {match.winnerName && (
                <div style={{
                  marginTop: '16px',
                  padding: '8px 12px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Award size={16} color="#182A01" />
                  <span style={{ color: '#182A01', fontWeight: 600 }}>
                    Ganador: {match.winnerName}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fffe 0%, #f0f9f4 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          {fromQr && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))',
              border: '2px solid rgba(164, 223, 78, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Trophy size={20} color="#A4DF4E" />
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: '#182A01' }}>
                  Captura desde cancha
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#516640' }}>
                  Registra el resultado directamente desde la cancha
                </p>
              </div>
            </div>
          )}

          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#182A01',
            marginBottom: '8px'
          }}>
            {match?.Tournament.name}
          </h1>
          <p style={{ color: '#516640', marginBottom: '24px' }}>
            {match?.Tournament.Club.name}
          </p>

          {/* Match Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={16} color="#A4DF4E" />
              <span style={{ fontSize: '14px', color: '#516640' }}>
                {match?.round}
              </span>
            </div>
            
            {match?.court && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#66E7AA" />
                <span style={{ fontSize: '14px', color: '#516640' }}>
                  {match.court.name}
                </span>
              </div>
            )}
            
            {match?.startTime && match?.endTime && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#A4DF4E" />
                <span style={{ fontSize: '14px', color: '#516640' }}>
                  {match.startTime} - {match.endTime}
                </span>
              </div>
            )}
          </div>

          {/* Players */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div style={{
              padding: '20px',
              background: 'rgba(164, 223, 78, 0.05)',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                <Users size={24} color="#182A01" />
              </div>
              <h3 style={{ 
                color: '#182A01', 
                fontSize: '18px', 
                fontWeight: 600,
                margin: 0
              }}>
                {match?.player1Name || 'Por definir'}
              </h3>
            </div>

            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#516640'
            }}>
              VS
            </div>

            <div style={{
              padding: '20px',
              background: 'rgba(164, 223, 78, 0.05)',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                <Users size={24} color="#182A01" />
              </div>
              <h3 style={{ 
                color: '#182A01', 
                fontSize: '18px', 
                fontWeight: 600,
                margin: 0
              }}>
                {match?.player2Name || 'Por definir'}
              </h3>
            </div>
          </div>
        </div>

        {/* Score Input */}
        {match?.canEdit ? (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              color: '#182A01',
              fontSize: '24px',
              fontWeight: 600,
              marginBottom: '24px'
            }}>
              Registrar Resultado
            </h2>

            {error && (
              <div style={{
                background: '#fee2e2',
                border: '2px solid #fecaca',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertCircle size={20} color="#dc2626" />
                <span style={{ color: '#dc2626' }}>{error}</span>
              </div>
            )}

            {/* Sets */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h3 style={{ color: '#182A01', fontSize: '18px', margin: 0 }}>
                  Puntuación por Set
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={addSet}
                    style={{
                      padding: '8px',
                      background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#182A01',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={16} />
                  </button>
                  {player1Score.length > 1 && (
                    <button
                      onClick={() => removeSet(player1Score.length - 1)}
                      style={{
                        padding: '8px',
                        background: '#fee2e2',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#dc2626',
                        cursor: 'pointer'
                      }}
                    >
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {player1Score.map((_, setIndex) => (
                  <div key={setIndex} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: 'rgba(164, 223, 78, 0.05)',
                    borderRadius: '12px'
                  }}>
                    {/* Player 1 Score */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01', minWidth: '120px' }}>
                        {match?.player1Name}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={player1Score[setIndex]}
                        onChange={(e) => updateScore(1, setIndex, parseInt(e.target.value) || 0)}
                        style={{
                          width: '80px',
                          padding: '8px 12px',
                          border: '2px solid rgba(164, 223, 78, 0.2)',
                          borderRadius: '8px',
                          fontSize: '16px',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Set Label */}
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#516640',
                      padding: '4px 8px',
                      background: 'rgba(164, 223, 78, 0.2)',
                      borderRadius: '6px'
                    }}>
                      Set {setIndex + 1}
                    </span>

                    {/* Player 2 Score */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
                      <input
                        type="number"
                        min="0"
                        value={player2Score[setIndex]}
                        onChange={(e) => updateScore(2, setIndex, parseInt(e.target.value) || 0)}
                        style={{
                          width: '80px',
                          padding: '8px 12px',
                          border: '2px solid rgba(164, 223, 78, 0.2)',
                          borderRadius: '8px',
                          fontSize: '16px',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01', minWidth: '120px', textAlign: 'right' }}>
                        {match?.player2Name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Winner Preview */}
            {(() => {
              const winner = calculateWinner()
              return winner.winnerName && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))',
                  border: '2px solid rgba(164, 223, 78, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Award size={20} color="#A4DF4E" />
                  <span style={{ fontWeight: 600, color: '#182A01' }}>
                    Ganador: {winner.winnerName}
                  </span>
                </div>
              )
            })()}

            {/* Notes */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: 600,
                color: '#182A01',
                marginBottom: '8px'
              }}>
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añade cualquier comentario sobre el partido..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  border: '2px solid rgba(164, 223, 78, 0.2)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={submitResult}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '16px',
                background: submitting 
                  ? '#9CA3AF' 
                  : 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                border: 'none',
                borderRadius: '12px',
                color: '#182A01',
                fontSize: '16px',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {submitting ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #182A01',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Enviando...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Enviar Resultado
                </>
              )}
            </button>
          </div>
        ) : (
          /* Match Already Completed */
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'rgba(164, 223, 78, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <Award size={30} color="#A4DF4E" />
            </div>
            <h2 style={{ color: '#182A01', marginBottom: '16px' }}>
              Partido Completado
            </h2>
            <p style={{ color: '#516640', marginBottom: '24px' }}>
              Este partido ya ha sido finalizado
            </p>
            
            {/* Final Score */}
            <div style={{
              background: 'rgba(164, 223, 78, 0.1)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{ color: '#182A01', marginBottom: '16px' }}>Resultado Final</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>{match?.player1Name}</span>
                <span style={{ fontWeight: 600 }}>
                  {(match?.player1Score || []).join(' - ')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontWeight: 600 }}>{match?.player2Name}</span>
                <span style={{ fontWeight: 600 }}>
                  {(match?.player2Score || []).join(' - ')}
                </span>
              </div>
              {match?.winnerName && (
                <div style={{
                  padding: '8px 12px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <Award size={16} color="#182A01" />
                  <span style={{ color: '#182A01', fontWeight: 600 }}>
                    Ganador: {match.winnerName}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}