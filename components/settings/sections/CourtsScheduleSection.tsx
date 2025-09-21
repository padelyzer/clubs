'use client'

import React, { useState, useEffect } from 'react'
import { InputModern } from '@/components/design-system/InputModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { 
  Clock, Save, Loader2, CheckCircle, AlertCircle 
} from 'lucide-react'

interface Schedule {
  id?: string
  dayOfWeek: number
  dayName?: string
  openTime: string
  closeTime: string
}

interface SaveMessage {
  type: 'success' | 'error'
  text: string
}

export const CourtsScheduleSection: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null)

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  // Fetch schedules on component mount
  useEffect(() => {
    fetchSchedules()
  }, [])

  // Clear save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage])

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/settings/schedule')
      const data = await response.json()
      
      if (data.success) {
        setSchedules(data.schedules || [])
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al cargar horarios' })
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
      setSaveMessage({ type: 'error', text: 'Error al cargar horarios' })
    } finally {
      setLoading(false)
    }
  }

  const handleTimeChange = (dayOfWeek: number, field: 'openTime' | 'closeTime', value: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.dayOfWeek === dayOfWeek 
        ? { ...schedule, [field]: value }
        : schedule
    ))
    setHasChanges(true)
  }

  const saveSchedules = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: schedules.map(({ id, dayName, ...schedule }) => schedule) })
      })
      
      const data = await response.json()
      if (data.success) {
        setHasChanges(false)
        setSaveMessage({ type: 'success', text: 'Horarios guardados exitosamente' })
        fetchSchedules() // Refresh data
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al guardar horarios' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error al guardar horarios' })
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (time: string) => {
    // Convert 24h format to display format
    const [hours, minutes] = time.split(':')
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <Loader2 size={24} className="animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Save Message */}

      {saveMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          background: saveMessage.type === 'success' 
            ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.1))'
            : 'linear-gradient(135deg, rgba(255, 59, 48, 0.1), rgba(255, 149, 0, 0.1))',
          border: `1px solid ${saveMessage.type === 'success' ? 'rgba(164, 223, 78, 0.3)' : 'rgba(255, 59, 48, 0.3)'}`,
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '14px',
          color: saveMessage.type === 'success' ? '#516640' : '#C62828'
        }}>
          {saveMessage.type === 'success' ? 
            <CheckCircle size={16} style={{ marginRight: '8px' }} /> :
            <AlertCircle size={16} style={{ marginRight: '8px' }} />
          }
          <span style={{ fontWeight: '500' }}>{saveMessage.text}</span>
        </div>
      )}

      {/* Weekly Schedule */}
      <CardModern variant="glass" style={{ marginBottom: '20px' }}>
        <CardModernHeader>
          <CardModernTitle style={{ display: 'flex', alignItems: 'center' }}>
            <Clock size={18} style={{ marginRight: '8px', color: '#A4DF4E' }} />
            Horario Semanal
          </CardModernTitle>
        </CardModernHeader>
        <CardModernContent>
          {/* Quick Set Options - Moved to top */}
          <div style={{
            marginBottom: '20px',
            padding: '16px',
            background: 'rgba(164, 223, 78, 0.05)',
            borderRadius: '10px',
            border: '1px solid rgba(164, 223, 78, 0.1)'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#182A01',
              margin: '0 0 12px 0'
            }}>
              Configuración Rápida
            </h4>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <ButtonModern
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSchedules(prev => prev.map(s => ({
                    ...s,
                    openTime: '07:00',
                    closeTime: '21:00'
                  })))
                  setHasChanges(true)
                }}
              >
                7:00 - 21:00 (Todos)
              </ButtonModern>
              <ButtonModern
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSchedules(prev => prev.map(s => ({
                    ...s,
                    openTime: '06:00',
                    closeTime: '22:00'
                  })))
                  setHasChanges(true)
                }}
              >
                6:00 - 22:00 (Todos)
              </ButtonModern>
              <ButtonModern
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSchedules(prev => prev.map(s => ({
                    ...s,
                    openTime: s.dayOfWeek === 0 ? '08:00' : '07:00', // Sunday later
                    closeTime: s.dayOfWeek === 5 || s.dayOfWeek === 6 ? '22:00' : '21:00' // Fri/Sat later
                  })))
                  setHasChanges(true)
                }}
              >
                Horario Estándar
              </ButtonModern>
            </div>
          </div>

          {/* Schedule Days */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {schedules.map((schedule, index) => (
            <div key={schedule.dayOfWeek || index}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 2fr',
                gap: '16px',
                alignItems: 'center',
                padding: '16px 0'
              }}>
                {/* Day Name */}
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1d1d1f'
                }}>
                  {schedule.dayName || daysOfWeek[schedule.dayOfWeek]}
                </div>

                {/* Opening Time */}
                <div>
                  <InputModern
                    label="Hora de Apertura"
                    type="time"
                    value={schedule.openTime}
                    onChange={(e) => handleTimeChange(schedule.dayOfWeek, 'openTime', e.target.value)}
                  />
                </div>

                {/* Closing Time */}
                <div>
                  <InputModern
                    label="Hora de Cierre"
                    type="time"
                    value={schedule.closeTime}
                    onChange={(e) => handleTimeChange(schedule.dayOfWeek, 'closeTime', e.target.value)}
                  />
                </div>
              </div>

              {index < schedules.length - 1 && (
                <div style={{
                  height: '1px',
                  backgroundColor: 'rgba(164, 223, 78, 0.1)',
                  margin: '0'
                }} />
              )}
            </div>
          ))}
          </div>
        </CardModernContent>
      </CardModern>

      {/* Save Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '24px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(164, 223, 78, 0.1)'
      }}>
        <ButtonModern
          variant="primary"
          size="lg"
          onClick={saveSchedules}
          disabled={!hasChanges || saving}
          loading={saving}
          icon={<Save size={18} />}
        >
          Guardar Cambios
        </ButtonModern>
      </div>
    </div>
  )
}