'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, X, Save, Users, Trophy } from 'lucide-react'

interface JornadaModalProps {
  isOpen: boolean
  onClose: () => void
  jornada?: any
  courts: any[]
  onSave: (jornadaData: any) => Promise<void>
  tournamentId: string
}

export function JornadaModal({
  isOpen,
  onClose,
  jornada,
  courts,
  onSave,
  tournamentId
}: JornadaModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    stage: 'group',
    stageLabel: 'Fase de Grupos',
    modality: 'masculine' as 'masculine' | 'feminine' | 'mixed',
    category: '',
    division: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    courts: [] as string[],
    courtNames: [] as string[],
    maxMatchesPerCourt: 4,
    maxTeamsPerGroup: 4
  })
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (jornada) {
      setFormData({
        name: jornada.name,
        stage: jornada.stage,
        stageLabel: jornada.stageLabel,
        modality: jornada.modality || 'masculine',
        category: jornada.category || '',
        division: jornada.division || '',
        description: jornada.description || '',
        date: jornada.date,
        startTime: jornada.startTime,
        endTime: jornada.endTime,
        courts: jornada.courts,
        courtNames: jornada.courtNames || [],
        maxMatchesPerCourt: jornada.maxMatchesPerCourt || 4,
        maxTeamsPerGroup: jornada.maxTeamsPerGroup || 4
      })
    } else {
      setFormData({
        name: '',
        stage: 'group',
        stageLabel: 'Fase de Grupos',
        modality: 'masculine',
        category: '',
        division: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        courts: [],
        courtNames: [],
        maxMatchesPerCourt: 4,
        maxTeamsPerGroup: 4
      })
    }
  }, [jornada])

  if (!isOpen) return null

  const stageOptions = [
    { value: 'group', label: 'Fase de Grupos' },
    { value: 'quarters', label: 'Cuartos de Final' },
    { value: 'semis', label: 'Semifinales' },
    { value: 'final', label: 'Final' }
  ]

  const handleStageChange = (stage: string) => {
    const stageOption = stageOptions.find(s => s.value === stage)
    setFormData({
      ...formData,
      stage,
      stageLabel: stageOption?.label || ''
    })
  }

  const handleCourtToggle = (court: any) => {
    const isSelected = formData.courts.includes(court.id)
    let newCourts, newCourtNames
    
    if (isSelected) {
      newCourts = formData.courts.filter(c => c !== court.id)
      newCourtNames = formData.courtNames.filter(n => n !== court.name)
    } else {
      newCourts = [...formData.courts, court.id]
      newCourtNames = [...formData.courtNames, court.name]
    }
    
    setFormData({ 
      ...formData, 
      courts: newCourts,
      courtNames: newCourtNames
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving jornada:', error)
      alert('Error al guardar la jornada')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        margin: '20px'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '24px' 
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: 600, 
            color: '#182A01',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Calendar size={28} color="#10B981" />
            {jornada ? 'Editar Jornada' : 'Nueva Jornada'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              color: '#6B7280',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name and Stage */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Nombre de la Jornada
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Jornada 1"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
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
                Etapa del Torneo
              </label>
              <select
                value={formData.stage}
                onChange={(e) => handleStageChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                {stageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Modality and Category (for group stage) */}
          {formData.stage === 'group' && (
            <div style={{ marginBottom: '20px' }}>
              {/* Modality Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Modalidad
                  </label>
                  <select
                    value={formData.modality}
                    onChange={(e) => {
                      const modality = e.target.value as 'masculine' | 'feminine' | 'mixed'
                      setFormData({ 
                        ...formData, 
                        modality,
                        category: '' // Reset category when changing modality
                      })
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white'
                    }}
                  >
                    <option value="masculine">Masculino</option>
                    <option value="feminine">Femenino</option>
                    <option value="mixed">Mixto</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white'
                    }}
                  >
                    <option value="">Seleccionar</option>
                    {formData.modality === 'mixed' ? (
                      <>
                        <option value="A">Categoría A</option>
                        <option value="B">Categoría B</option>
                        <option value="C">Categoría C</option>
                        <option value="D">Categoría D</option>
                      </>
                    ) : (
                      <>
                        <option value="Open">Open</option>
                        <option value="Primera">Primera Fuerza</option>
                        <option value="Segunda">Segunda Fuerza</option>
                        <option value="Tercera">Tercera Fuerza</option>
                        <option value="Cuarta">Cuarta Fuerza</option>
                        <option value="Quinta">Quinta Fuerza</option>
                        <option value="Sexta">Sexta Fuerza</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Grupo/División
                  </label>
                  <input
                    type="text"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    placeholder="Ej: Grupo A"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Teams per group */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Equipos por grupo
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="8"
                    value={formData.maxTeamsPerGroup}
                    onChange={(e) => setFormData({ ...formData, maxTeamsPerGroup: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              Descripción (opcional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ej: Grupo A"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Date and Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Fecha
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
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
                Hora Inicio
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
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
                Hora Fin
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Courts Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '12px'
            }}>
              Canchas Disponibles
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '12px'
            }}>
              {courts.map((court) => (
                <label
                  key={court.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    border: formData.courts.includes(court.id)
                      ? '2px solid #10B981'
                      : '2px solid #E5E7EB',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: formData.courts.includes(court.id)
                      ? 'rgba(16, 185, 129, 0.05)'
                      : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.courts.includes(court.id)}
                    onChange={() => handleCourtToggle(court)}
                    style={{ margin: 0 }}
                  />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: formData.courts.includes(court.id) ? 600 : 400,
                    color: formData.courts.includes(court.id) ? '#10B981' : '#374151'
                  }}>
                    {court.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Max Matches per Court */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              Máximo de partidos por cancha
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.maxMatchesPerCourt}
              onChange={(e) => setFormData({ ...formData, maxMatchesPerCourt: parseInt(e.target.value) })}
              style={{
                width: '100px',
                padding: '12px',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                color: '#6B7280',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isProcessing || formData.courts.length === 0}
              style={{
                padding: '12px 24px',
                background: formData.courts.length === 0 
                  ? '#E5E7EB'
                  : 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                color: formData.courts.length === 0 ? '#9CA3AF' : '#182A01',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: formData.courts.length === 0 ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Save size={18} />
              {isProcessing ? 'Guardando...' : (jornada ? 'Actualizar' : 'Crear Jornada')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}