'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { colors } from '@/lib/design-system/colors'
import {
  Trophy,
  Calendar,
  Users,
  DollarSign,
  ArrowLeft,
  Save,
  X
} from 'lucide-react'

export default function CreateTournamentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'SINGLE_ELIMINATION',
    categories: ['M_OPEN'], // Default category
    registrationStart: '',
    registrationEnd: '',
    startDate: '',
    endDate: '',
    maxPlayers: 16,
    registrationFee: 0,
    prizePool: 0,
    matchDuration: 90,
    sets: 3,
    games: 6,
    tiebreak: true,
    rules: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Convert datetime-local to ISO format with timezone
      const formatDateTime = (dateStr: string) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toISOString()
      }

      const requestData = {
        ...formData,
        registrationStart: formatDateTime(formData.registrationStart),
        registrationEnd: formatDateTime(formData.registrationEnd),
        startDate: formatDateTime(formData.startDate),
        endDate: formData.endDate ? formatDateTime(formData.endDate) : undefined
      }

      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (response.ok) {
        // The API returns an array of tournaments (one per category)
        if (data.tournaments && data.tournaments.length > 0) {
          router.push(`/dashboard/tournaments-v2/${data.tournaments[0].id}`)
        } else {
          router.push('/dashboard/tournaments-v2')
        }
      } else {
        console.error('Error response:', data)
        alert(data.error || 'Error al crear el torneo')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear el torneo')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${colors.border.subtle}`,
    fontSize: '14px',
    transition: 'all 0.2s',
    background: 'white'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: colors.text.primary
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background.secondary,
      padding: '32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: '8px',
            borderRadius: '8px',
            border: 'none',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.background.tertiary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
          }}
        >
          <ArrowLeft size={20} color={colors.text.primary} />
        </button>

        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: colors.text.primary,
            letterSpacing: '-0.03em'
          }}>
            Crear Nuevo Torneo
          </h1>
          <p style={{
            fontSize: '14px',
            color: colors.text.secondary,
            marginTop: '4px'
          }}>
            Configura los detalles del torneo
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {/* Información Básica */}
          <CardModern variant="glass">
            <CardModernHeader>
              <CardModernTitle icon={<Trophy size={18} />}>
                Información Básica
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Nombre del Torneo</label>
                  <input
                    type="text"
                    required
                    style={inputStyle}
                    placeholder="Ej: Torneo de Verano 2024"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Descripción</label>
                  <textarea
                    style={{...inputStyle, minHeight: '100px', resize: 'vertical'}}
                    placeholder="Describe el torneo..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Tipo de Torneo</label>
                  <select
                    style={inputStyle}
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="SINGLE_ELIMINATION">Eliminación Simple</option>
                    <option value="DOUBLE_ELIMINATION">Eliminación Doble</option>
                    <option value="ROUND_ROBIN">Todos contra Todos</option>
                    <option value="GROUP_STAGE">Fase de Grupos</option>
                    <option value="SWISS">Sistema Suizo</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Categoría</label>
                  <select
                    style={inputStyle}
                    value={formData.categories[0]}
                    onChange={(e) => setFormData({...formData, categories: [e.target.value]})}
                  >
                    <option value="M_OPEN">Open Masculino</option>
                    <option value="M_1F">1ra Fuerza Masculino</option>
                    <option value="M_2F">2da Fuerza Masculino</option>
                    <option value="M_3F">3ra Fuerza Masculino</option>
                    <option value="M_4F">4ta Fuerza Masculino</option>
                    <option value="F_OPEN">Open Femenino</option>
                    <option value="F_1F">1ra Fuerza Femenino</option>
                    <option value="F_2F">2da Fuerza Femenino</option>
                    <option value="MX_OPEN">Mixto Open</option>
                    <option value="MX_A">Mixto A</option>
                    <option value="MX_B">Mixto B</option>
                  </select>
                </div>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Fechas */}
          <CardModern variant="glass">
            <CardModernHeader>
              <CardModernTitle icon={<Calendar size={18} />}>
                Fechas del Torneo
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Inicio de Inscripciones</label>
                  <input
                    type="datetime-local"
                    required
                    style={inputStyle}
                    value={formData.registrationStart}
                    onChange={(e) => setFormData({...formData, registrationStart: e.target.value})}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Cierre de Inscripciones</label>
                  <input
                    type="datetime-local"
                    required
                    style={inputStyle}
                    value={formData.registrationEnd}
                    onChange={(e) => setFormData({...formData, registrationEnd: e.target.value})}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Fecha de Inicio del Torneo</label>
                  <input
                    type="datetime-local"
                    required
                    style={inputStyle}
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Fecha de Fin del Torneo (opcional)</label>
                  <input
                    type="datetime-local"
                    style={inputStyle}
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Jugadores y Precios */}
          <CardModern variant="glass">
            <CardModernHeader>
              <CardModernTitle icon={<Users size={18} />}>
                Jugadores y Precios
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Máximo de Jugadores</label>
                  <input
                    type="number"
                    required
                    min="4"
                    max="128"
                    style={inputStyle}
                    value={formData.maxPlayers}
                    onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Costo de Inscripción (MXN)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    style={inputStyle}
                    value={formData.registrationFee}
                    onChange={(e) => setFormData({...formData, registrationFee: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Premio Total (MXN)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    style={inputStyle}
                    value={formData.prizePool}
                    onChange={(e) => setFormData({...formData, prizePool: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Configuración del Partido */}
          <CardModern variant="glass">
            <CardModernHeader>
              <CardModernTitle icon={<Trophy size={18} />}>
                Configuración del Partido
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Duración del Partido (minutos)</label>
                  <input
                    type="number"
                    min="30"
                    max="180"
                    style={inputStyle}
                    value={formData.matchDuration}
                    onChange={(e) => setFormData({...formData, matchDuration: parseInt(e.target.value) || 90})}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Número de Sets</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    style={inputStyle}
                    value={formData.sets}
                    onChange={(e) => setFormData({...formData, sets: parseInt(e.target.value) || 3})}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Juegos por Set</label>
                  <input
                    type="number"
                    min="4"
                    max="9"
                    style={inputStyle}
                    value={formData.games}
                    onChange={(e) => setFormData({...formData, games: parseInt(e.target.value) || 6})}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="tiebreak"
                    checked={formData.tiebreak}
                    onChange={(e) => setFormData({...formData, tiebreak: e.target.checked})}
                    style={{ width: 'auto' }}
                  />
                  <label htmlFor="tiebreak" style={{ ...labelStyle, marginBottom: 0 }}>
                    Usar Tie-break
                  </label>
                </div>
              </div>
            </CardModernContent>
          </CardModern>
        </div>

        {/* Botones de Acción */}
        <div style={{
          marginTop: '32px',
          display: 'flex',
          gap: '16px',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: `1px solid ${colors.border.subtle}`,
              background: 'white',
              color: colors.text.primary,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <X size={18} />
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: loading
                ? colors.neutral[300]
                : `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
              color: 'white',
              border: 'none',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Save size={18} />
            {loading ? 'Creando...' : 'Crear Torneo'}
          </button>
        </div>
      </form>
    </div>
  )
}