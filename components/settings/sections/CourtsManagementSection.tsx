'use client'

import React, { useState, useEffect } from 'react'
import { InputModern } from '@/components/design-system/InputModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { AppleModal } from '@/components/design-system/AppleModal'
import { EmptyState } from '@/components/design-system/EmptyState'
import { 
  Zap, Plus, Edit, Trash2, Home, Sun,
  Loader2, CheckCircle, AlertCircle 
} from 'lucide-react'

interface Court {
  id?: string
  name: string
  indoor: boolean
  active: boolean
  order?: number
  stats?: {
    totalBookings: number
    activeBookings: number
  }
}

interface SaveMessage {
  type: 'success' | 'error'
  text: string
}

// Simple Toggle Component for the modal
const Toggle = ({ 
  enabled, 
  onChange, 
  label, 
  description 
}: { 
  enabled: boolean
  onChange: (value: boolean) => void
  label: string
  description?: string 
}) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0'
  }}>
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: '15px',
        color: '#1C1C1E',
        fontWeight: 500,
        marginBottom: description ? '4px' : 0
      }}>
        {label}
      </div>
      {description && (
        <div style={{
          fontSize: '13px',
          color: '#6E6E73'
        }}>
          {description}
        </div>
      )}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      style={{
        width: '51px',
        height: '31px',
        borderRadius: '31px',
        backgroundColor: enabled ? '#A4DF4E' : '#E5E5EA',
        border: 'none',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        padding: '2px'
      }}
    >
      <div style={{
        width: '27px',
        height: '27px',
        borderRadius: '27px',
        backgroundColor: 'white',
        position: 'absolute',
        top: '2px',
        left: enabled ? '22px' : '2px',
        transition: 'left 0.3s ease',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
      }} />
    </button>
  </div>
)

export const CourtsManagementSection: React.FC = () => {
  // Add pulse animation styles
  React.useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes pulse {
        0% {
          box-shadow: 0 0 8px rgba(52, 199, 89, 0.6), 0 0 16px rgba(52, 199, 89, 0.3);
        }
        50% {
          box-shadow: 0 0 12px rgba(52, 199, 89, 0.8), 0 0 24px rgba(52, 199, 89, 0.4);
        }
        100% {
          box-shadow: 0 0 8px rgba(52, 199, 89, 0.6), 0 0 16px rgba(52, 199, 89, 0.3);
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null)
  const [courtLimitReached, setCourtLimitReached] = useState(false)
  const [planLimit, setPlanLimit] = useState<number | null>(null)
  const [planName, setPlanName] = useState<string>('')

  // Court Modal State
  const [isAddingCourt, setIsAddingCourt] = useState(false)
  const [isEditingCourt, setIsEditingCourt] = useState<string | null>(null)
  const [courtForm, setCourtForm] = useState<Court>({
    name: '',
    indoor: false,
    active: true
  })

  // Fetch courts on component mount
  useEffect(() => {
    fetchCourts()
    checkCourtLimit()
  }, [])

  // Clear save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage])

  const fetchCourts = async () => {
    try {
      const response = await fetch('/api/settings/courts')
      const data = await response.json()
      
      if (data.success) {
        setCourts(data.courts || [])
        // Check limit after fetching courts
        checkCourtLimit(data.courts?.filter((c: Court) => c.active).length || 0)
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al cargar canchas' })
      }
    } catch (error) {
      console.error('Error fetching courts:', error)
      setSaveMessage({ type: 'error', text: 'Error al cargar canchas' })
    } finally {
      setLoading(false)
    }
  }

  const checkCourtLimit = async (currentCount?: number) => {
    try {
      // Get club package info to check limits
      const response = await fetch('/api/club/package-info')
      if (response.ok) {
        const data = await response.json()
        if (data.package?.maxCourts) {
          setPlanLimit(data.package.maxCourts)
          setPlanName(data.package.displayName || data.package.name)
          const activeCount = currentCount !== undefined ? currentCount : courts.filter(c => c.active).length
          setCourtLimitReached(activeCount >= data.package.maxCourts)
        }
      }
    } catch (error) {
      console.error('Error checking court limit:', error)
    }
  }

  const handleCreateCourt = async () => {
    try {
      const response = await fetch('/api/settings/courts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courtForm)
      })
      const data = await response.json()
      if (data.success) {
        setIsAddingCourt(false)
        setCourtForm({ name: '', indoor: false, active: true })
        fetchCourts()
        setSaveMessage({ type: 'success', text: 'Cancha creada exitosamente' })
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al crear cancha' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error al crear cancha' })
    }
  }

  const handleUpdateCourt = async (id: string) => {
    try {
      const response = await fetch('/api/settings/courts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...courtForm })
      })

      const data = await response.json()
      if (data.success) {
        setIsEditingCourt(null)
        setCourtForm({ name: '', indoor: false, active: true })
        fetchCourts()
        setSaveMessage({ type: 'success', text: 'Cancha actualizada exitosamente' })
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al actualizar cancha' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error al actualizar cancha' })
    }
  }

  const handleDeleteCourt = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cancha?')) return

    try {
      const response = await fetch(`/api/settings/courts?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        fetchCourts()
        setSaveMessage({ type: 'success', text: 'Cancha eliminada exitosamente' })
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al eliminar cancha' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error al eliminar cancha' })
    }
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
      {/* Clean Header with Action Button */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#182A01',
            margin: 0
          }}>
            Canchas Disponibles
          </h2>
          <p style={{
            fontSize: '13px',
            color: '#516640',
            margin: '4px 0 0 0'
          }}>
            {courts.length} {courts.length === 1 ? 'cancha' : 'canchas'} configuradas
          </p>
        </div>
        
        <ButtonModern
          onClick={() => {
            if (courtLimitReached) {
              setSaveMessage({ 
                type: 'error', 
                text: `Has alcanzado el límite de ${planLimit} canchas para tu plan ${planName}. Para agregar más canchas, actualiza tu plan.` 
              })
            } else {
              setIsAddingCourt(true)
            }
          }}
          variant={courtLimitReached ? "secondary" : "primary"}
          size="sm"
          icon={courtLimitReached ? <AlertCircle size={16} /> : <Plus size={16} />}
          disabled={courtLimitReached}
          style={courtLimitReached ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
        >
          {courtLimitReached ? 'Límite Alcanzado' : 'Nueva Cancha'}
        </ButtonModern>
      </div>

      {/* Court Limit Warning */}
      {courtLimitReached && planLimit && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(255, 149, 0, 0.1) 0%, rgba(255, 204, 0, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          color: '#FF6D00',
          borderRadius: '16px',
          marginBottom: '24px',
          fontSize: '14px',
          letterSpacing: '-0.24px',
          border: '1px solid rgba(255, 149, 0, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
        }}>
          <AlertCircle size={18} style={{ marginRight: '10px', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              Límite de canchas alcanzado
            </div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>
              Tu plan {planName} permite hasta {planLimit} canchas activas. Para agregar más canchas, actualiza tu plan o desactiva alguna cancha existente.
            </div>
          </div>
        </div>
      )}

      {/* Save Message */}
      {saveMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          background: saveMessage.type === 'success' 
            ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.1) 0%, rgba(147, 206, 61, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(255, 149, 0, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          color: saveMessage.type === 'success' ? '#5a7d2a' : '#C62828',
          borderRadius: '16px',
          marginBottom: '24px',
          fontSize: '15px',
          letterSpacing: '-0.24px',
          border: `1px solid ${saveMessage.type === 'success' ? 'rgba(164, 223, 78, 0.2)' : 'rgba(255, 59, 48, 0.2)'}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
        }}>
          {saveMessage.type === 'success' ? 
            <CheckCircle size={18} style={{ marginRight: '10px' }} /> :
            <AlertCircle size={18} style={{ marginRight: '10px' }} />
          }
          <span style={{ fontWeight: '500' }}>{saveMessage.text}</span>
        </div>
      )}

      {/* Courts Grid */}
      {courts.length === 0 ? (
        <CardModern variant="glass">
          <CardModernContent>
            <EmptyState
              title="No hay canchas configuradas"
              description="Agrega tu primera cancha para comenzar a recibir reservas"
              actionText="Agregar Cancha"
              onAction={() => setIsAddingCourt(true)}
            />
          </CardModernContent>
        </CardModern>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {courts.map((court, index) => (
              <CardModern
                key={court.id || index}
                variant="glass"
                interactive={court.active}
                padding="md"
                style={{
                  opacity: court.active ? 1 : 0.7,
                  position: 'relative'
                }}
              >
                {/* Status indicator */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: court.active ? '#A4DF4E' : '#FF9500',
                  boxShadow: court.active 
                    ? '0 0 8px rgba(164, 223, 78, 0.6)'
                    : '0 0 8px rgba(255, 149, 0, 0.6)'
                }} />

                {/* Icon badge */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: court.indoor 
                    ? 'linear-gradient(135deg, #5E5CE6 0%, #007AFF 100%)'
                    : 'linear-gradient(145deg, #A4DF4E, #93ce3d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  boxShadow: court.indoor
                    ? '0 3px 8px rgba(0, 122, 255, 0.2)'
                    : '0 3px 8px rgba(164, 223, 78, 0.2)'
                }}>
                  {court.indoor ? (
                    <Home size={18} color="white" strokeWidth={1.5} />
                  ) : (
                    <Sun size={18} color="white" strokeWidth={1.5} />
                  )}
                </div>

                {/* Court header */}
                <div style={{
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1C1C1E',
                    margin: '0 0 8px 0',
                    letterSpacing: '-0.3px'
                  }}>
                    {court.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      color: '#6E6E73',
                      letterSpacing: '-0.1px'
                    }}>
                      {court.indoor ? 'Cancha Interior' : 'Cancha Exterior'}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      background: court.active 
                        ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.15) 0%, rgba(147, 206, 61, 0.15) 100%)'
                        : 'rgba(255, 149, 0, 0.12)',
                      color: court.active ? '#5a7d2a' : '#FF6D00',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      border: court.active ? '1px solid rgba(164, 223, 78, 0.2)' : '1px solid rgba(255, 149, 0, 0.2)'
                    }}>
                      {court.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                {court.stats && (
                  <div style={{
                    background: 'rgba(164, 223, 78, 0.05)',
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '16px',
                    border: '1px solid rgba(164, 223, 78, 0.1)'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#1C1C1E',
                          marginBottom: '4px'
                        }}>
                          {court.stats.totalBookings}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6E6E73',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Reservas Totales
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#5a7d2a',
                          marginBottom: '4px'
                        }}>
                          {court.stats.activeBookings}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6E6E73',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Activas
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  paddingTop: '16px',
                  marginTop: '16px',
                  borderTop: '1px solid rgba(164, 223, 78, 0.1)'
                }}>
                  <ButtonModern
                    onClick={() => {
                      setCourtForm(court)
                      setIsEditingCourt(court.id!)
                    }}
                    variant="secondary"
                    size="sm"
                    fullWidth
                    icon={<Edit size={14} />}
                  >
                    Editar
                  </ButtonModern>
                  <ButtonModern
                    onClick={() => handleDeleteCourt(court.id!)}
                    variant="ghost"
                    size="sm"
                    fullWidth
                    icon={<Trash2 size={14} />}
                    style={{ color: '#FF3B30' }}
                  >
                    Eliminar
                  </ButtonModern>
                </div>
              </CardModern>
            ))}
          </div>
        </>
      )}

      {/* Court Modal */}
      <AppleModal
        isOpen={isAddingCourt || !!isEditingCourt}
        onClose={() => {
          setIsAddingCourt(false)
          setIsEditingCourt(null)
          setCourtForm({ name: '', indoor: false, active: true })
        }}
        title={isEditingCourt ? 'Editar Cancha' : 'Nueva Cancha'}
        subtitle="Configura los detalles de la cancha"
        size="small"
        footer={
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <ButtonModern
              variant="secondary"
              onClick={() => {
                setIsAddingCourt(false)
                setIsEditingCourt(null)
                setCourtForm({ name: '', indoor: false, active: true })
              }}
            >
              Cancelar
            </ButtonModern>
            <ButtonModern
              variant="primary"
              onClick={() => isEditingCourt ? handleUpdateCourt(isEditingCourt) : handleCreateCourt()}
            >
              {isEditingCourt ? 'Actualizar' : 'Crear'}
            </ButtonModern>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <InputModern
            label="Nombre de la Cancha"
            value={courtForm.name}
            onChange={(e) => setCourtForm({...courtForm, name: e.target.value})}
            required
            placeholder="Ej: Cancha 1"
          />
          
          <Toggle
            enabled={courtForm.indoor}
            onChange={(enabled) => setCourtForm({...courtForm, indoor: enabled})}
            label="Cancha Interior"
            description="Marca si la cancha está techada"
          />
          
          <Toggle
            enabled={courtForm.active}
            onChange={(enabled) => setCourtForm({...courtForm, active: enabled})}
            label="Cancha Activa"
            description="Las canchas inactivas no aparecen en las reservas"
          />
        </div>
      </AppleModal>
    </div>
  )
}