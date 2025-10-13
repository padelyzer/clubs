'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Trophy, Users, Send, Check, X } from 'lucide-react'

interface Match {
  id: string
  team1Name?: string
  team2Name?: string
  team1Player1?: string
  team1Player2?: string
  team2Player1?: string
  team2Player2?: string
  courtNumber?: string
  startTime?: string
  status?: string
}

export default function MatchResultPage() {
  const params = useParams()
  const { tournamentId, matchId } = params as { tournamentId: string, matchId: string }
  
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  // Form state
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | null>(null)
  const [sets, setSets] = useState([
    { team1: '', team2: '' },
    { team1: '', team2: '' },
    { team1: '', team2: '' }
  ])
  const [winner, setWinner] = useState<'team1' | 'team2' | null>(null)
  const [submitterName, setSubmitterName] = useState('')
  
  useEffect(() => {
    loadMatch()
  }, [matchId])

  const loadMatch = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}`)
      const data = await response.json()
      
      if (data.success) {
        setMatch(data.match)
      }
    } catch (error) {
      console.error('Error loading match:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateWinner = () => {
    let team1Sets = 0
    let team2Sets = 0
    
    sets.forEach(set => {
      if (set.team1 && set.team2) {
        if (parseInt(set.team1) > parseInt(set.team2)) {
          team1Sets++
        } else if (parseInt(set.team2) > parseInt(set.team1)) {
          team2Sets++
        }
      }
    })
    
    if (team1Sets > team2Sets) {
      setWinner('team1')
    } else if (team2Sets > team1Sets) {
      setWinner('team2')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTeam || !winner) {
      alert('Por favor selecciona tu equipo y completa el resultado')
      return
    }
    
    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submittedBy: selectedTeam,
          team1Sets: sets.map(s => parseInt(s.team1) || 0),
          team2Sets: sets.map(s => parseInt(s.team2) || 0),
          winner
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSubmitted(true)
      } else {
        alert(data.error || 'Error al enviar resultado')
      }
    } catch (error) {
      console.error('Error submitting result:', error)
      alert('Error al enviar resultado')
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
        background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)'
      }}>
        <div>Cargando partido...</div>
      </div>
    )
  }

  if (!match) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)'
      }}>
        <div>Partido no encontrado</div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Check size={40} color="white" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
            ¡Resultado Enviado!
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
            El resultado ha sido registrado. Esperando confirmación del equipo contrario.
          </p>
          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
            Ganador registrado: <strong>{winner === 'team1' ? match.team1Name : match.team2Name}</strong>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '16px 16px 0 0',
          padding: '24px',
          borderBottom: '2px solid #E5E7EB'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
            Captura de Resultado
          </h1>
          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#92400E' }}>
                {match.team1Name || 'Equipo 1'}
              </div>
              <div style={{ fontSize: '14px', color: '#B45309', margin: '8px 0' }}>
                VS
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#92400E' }}>
                {match.team2Name || 'Equipo 2'}
              </div>
            </div>
            {match.courtNumber && (
              <div style={{ textAlign: 'center', fontSize: '13px', color: '#92400E' }}>
                📍 Cancha {match.courtNumber} • 🕐 {match.startTime}
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: 'white',
          borderRadius: '0 0 16px 16px',
          padding: '24px'
        }}>
          {/* Team Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
              1. Selecciona tu equipo
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setSelectedTeam('team1')}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: selectedTeam === 'team1' ? '2px solid #10B981' : '2px solid #E5E7EB',
                  background: selectedTeam === 'team1' ? '#DCFCE7' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Users size={20} style={{ margin: '0 auto 8px', color: selectedTeam === 'team1' ? '#10B981' : '#6B7280' }} />
                <div style={{ fontSize: '14px', fontWeight: 600, color: selectedTeam === 'team1' ? '#059669' : '#374151' }}>
                  {match.team1Name || 'Equipo 1'}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTeam('team2')}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: selectedTeam === 'team2' ? '2px solid #10B981' : '2px solid #E5E7EB',
                  background: selectedTeam === 'team2' ? '#DCFCE7' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Users size={20} style={{ margin: '0 auto 8px', color: selectedTeam === 'team2' ? '#10B981' : '#6B7280' }} />
                <div style={{ fontSize: '14px', fontWeight: 600, color: selectedTeam === 'team2' ? '#059669' : '#374151' }}>
                  {match.team2Name || 'Equipo 2'}
                </div>
              </button>
            </div>
          </div>

          {/* Score */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
              2. Resultado del partido
            </label>
            <div style={{ gap: '12px' }}>
              {sets.map((set, index) => (
                <div key={index} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#6B7280', width: '60px' }}>
                      Set {index + 1}:
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="7"
                      placeholder="0"
                      value={set.team1}
                      onChange={(e) => {
                        const newSets = [...sets]
                        newSets[index].team1 = e.target.value
                        setSets(newSets)
                        calculateWinner()
                      }}
                      style={{
                        width: '60px',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #E5E7EB',
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: 600
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>-</span>
                    <input
                      type="number"
                      min="0"
                      max="7"
                      placeholder="0"
                      value={set.team2}
                      onChange={(e) => {
                        const newSets = [...sets]
                        newSets[index].team2 = e.target.value
                        setSets(newSets)
                        calculateWinner()
                      }}
                      style={{
                        width: '60px',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #E5E7EB',
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: 600
                      }}
                    />
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#9CA3AF',
                      flex: 1,
                      textAlign: 'right'
                    }}>
                      {match.team1Name?.split(' ')[0]} vs {match.team2Name?.split(' ')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {winner && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <Trophy size={20} style={{ margin: '0 auto 8px', color: '#059669' }} />
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#059669' }}>
                  Ganador: {winner === 'team1' ? match.team1Name : match.team2Name}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedTeam || !submitterName || !winner || submitting}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '8px',
              border: 'none',
              background: !selectedTeam || !submitterName || !winner
                ? '#E5E7EB'
                : 'linear-gradient(135deg, #10B981, #059669)',
              color: !selectedTeam || !submitterName || !winner ? '#9CA3AF' : 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: !selectedTeam || !submitterName || !winner ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Send size={18} />
            {submitting ? 'Enviando...' : 'Enviar Resultado'}
          </button>
        </form>
      </div>
    </div>
  )
}