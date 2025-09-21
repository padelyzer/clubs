'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { ArrowLeft, Save, Trophy, Calendar, DollarSign, Users, Settings } from 'lucide-react'

interface TournamentEditorProps {
  tournamentId: string
}

interface Tournament {
  id: string
  name: string
  description: string
  type: string
  startDate: string
  endDate: string
  registrationEnd: string
  registrationFee: number
  maxPlayers: number
  status: string
  currency: string
}

export function TournamentEditor({ tournamentId }: TournamentEditorProps) {
  const router = useRouter()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tournamentId) {
      loadTournament()
    }
  }, [tournamentId])

  const loadTournament = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`)
      const data = await response.json()
      
      if (data.success) {
        setTournament(data.tournament)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al cargar torneo')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!tournament) return

    setSaving(true)
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tournament)
      })

      const data = await response.json()
      
      if (data.success) {
        router.push(`/dashboard/tournaments/${tournamentId}`)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al guardar torneo')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof Tournament, value: any) => {
    if (!tournament) return
    setTournament({ ...tournament, [field]: value })
  }

  if (loading) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '400px',
          fontSize: '16px',
          color: '#6B7280'
        }}>
          Cargando torneo...
        </div>
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '400px',
          fontSize: '16px',
          color: '#EF4444'
        }}>
          {error || 'Torneo no encontrado'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
            Volver
          </button>
          
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 700, 
              color: '#182A01',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Editar Torneo
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #66E7AA 0%, #A4DF4E 100%)',
              color: '#182A01',
              fontSize: '14px',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(102, 231, 170, 0.15)'
            }}
          >
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: '32px'
      }}>
        {/* Basic Information */}
        <CardModern>
          <CardModernHeader>
            <CardModernTitle>
              <Trophy size={20} />
              Información Básica
            </CardModernTitle>
          </CardModernHeader>
          <CardModernContent>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Nombre del Torneo
                </label>
                <InputModern
                  type="text"
                  value={tournament.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Ej: Torneo Verano 2024"
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Descripción
                </label>
                <textarea
                  value={tournament.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe el torneo..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Tipo de Torneo
                </label>
                <select
                  value={tournament.type}
                  onChange={(e) => updateField('type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                >
                  <option value="ELIMINATION">Eliminación</option>
                  <option value="ROUND_ROBIN">Round Robin</option>
                  <option value="SWISS">Sistema Suizo</option>
                </select>
              </div>
            </div>
          </CardModernContent>
        </CardModern>

        {/* Dates and Registration */}
        <CardModern>
          <CardModernHeader>
            <CardModernTitle>
              <Calendar size={20} />
              Fechas y Registro
            </CardModernTitle>
          </CardModernHeader>
          <CardModernContent>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Fecha de Inicio
                </label>
                <InputModern
                  type="date"
                  value={tournament.startDate?.split('T')[0]}
                  onChange={(e) => updateField('startDate', e.target.value)}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Fecha de Fin
                </label>
                <InputModern
                  type="date"
                  value={tournament.endDate?.split('T')[0]}
                  onChange={(e) => updateField('endDate', e.target.value)}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Fin de Inscripciones
                </label>
                <InputModern
                  type="date"
                  value={tournament.registrationEnd?.split('T')[0]}
                  onChange={(e) => updateField('registrationEnd', e.target.value)}
                />
              </div>
            </div>
          </CardModernContent>
        </CardModern>

        {/* Players and Fees */}
        <CardModern>
          <CardModernHeader>
            <CardModernTitle>
              <Users size={20} />
              Jugadores y Cupos
            </CardModernTitle>
          </CardModernHeader>
          <CardModernContent>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Máximo de Jugadores
                </label>
                <InputModern
                  type="number"
                  value={tournament.maxPlayers}
                  onChange={(e) => updateField('maxPlayers', parseInt(e.target.value))}
                  min="2"
                  max="128"
                />
              </div>
            </div>
          </CardModernContent>
        </CardModern>

        {/* Fees */}
        <CardModern>
          <CardModernHeader>
            <CardModernTitle>
              <DollarSign size={20} />
              Costos
            </CardModernTitle>
          </CardModernHeader>
          <CardModernContent>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Cuota de Inscripción (centavos)
                </label>
                <InputModern
                  type="number"
                  value={tournament.registrationFee}
                  onChange={(e) => updateField('registrationFee', parseInt(e.target.value))}
                  min="0"
                />
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
                  ${(tournament.registrationFee / 100).toFixed(2)} {tournament.currency}
                </p>
              </div>
            </div>
          </CardModernContent>
        </CardModern>
      </div>
    </div>
  )
}