'use client'

import React, { useState, useEffect } from 'react'
import { InputModern } from '@/components/design-system/InputModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { AppleModal } from '@/components/design-system/AppleModal'
import { 
  DollarSign, Plus, Edit2, Trash2, Clock, Calendar,
  Save, Loader2, CheckCircle, AlertCircle 
} from 'lucide-react'

interface PricingRule {
  id?: string
  dayOfWeek: number | null
  dayName?: string
  startTime: string
  endTime: string
  price: number
  formattedPrice?: string
}

interface SaveMessage {
  type: 'success' | 'error'
  text: string
}

export const CourtsPricingSection: React.FC = () => {
  const [pricing, setPricing] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null)

  // Pricing Modal State
  const [isAddingPrice, setIsAddingPrice] = useState(false)
  const [isEditingPrice, setIsEditingPrice] = useState<string | null>(null)
  const [priceForm, setPriceForm] = useState<PricingRule>({
    dayOfWeek: null,
    startTime: '07:00',
    endTime: '22:00',
    price: 30000 // 300 MXN in cents
  })

  const daysOfWeek = [
    { value: null, label: 'Todos los días' },
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' }
  ]

  // Fetch pricing on component mount
  useEffect(() => {
    fetchPricing()
  }, [])

  // Clear save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage])

  const fetchPricing = async () => {
    try {
      const response = await fetch('/api/settings/pricing')
      const data = await response.json()
      
      if (data.success) {
        setPricing(data.pricing || [])
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al cargar precios' })
      }
    } catch (error) {
      console.error('Error fetching pricing:', error)
      setSaveMessage({ type: 'error', text: 'Error al cargar precios' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePrice = async () => {
    try {
      const url = isEditingPrice 
        ? `/api/settings/pricing?id=${isEditingPrice}`
        : '/api/settings/pricing'
      
      const response = await fetch(url, {
        method: isEditingPrice ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...priceForm,
          price: Math.round(priceForm.price) // Ensure integer cents
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setIsAddingPrice(false)
        setIsEditingPrice(null)
        setPriceForm({ dayOfWeek: null, startTime: '07:00', endTime: '22:00', price: 30000 })
        fetchPricing()
        setSaveMessage({ 
          type: 'success', 
          text: isEditingPrice ? 'Precio actualizado exitosamente' : 'Precio creado exitosamente' 
        })
      } else {
        setSaveMessage({ 
          type: 'error', 
          text: data.error || (isEditingPrice ? 'Error al actualizar precio' : 'Error al crear precio')
        })
      }
    } catch (error) {
      setSaveMessage({ 
        type: 'error', 
        text: isEditingPrice ? 'Error al actualizar precio' : 'Error al crear precio'
      })
    }
  }

  const handleEditPrice = (rule: PricingRule) => {
    setPriceForm({
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      price: rule.price
    })
    setIsEditingPrice(rule.id || null)
    setIsAddingPrice(true)
  }

  const handleDeletePrice = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta regla de precio?')) return

    try {
      const response = await fetch(`/api/settings/pricing?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        fetchPricing()
        setSaveMessage({ type: 'success', text: 'Precio eliminado exitosamente' })
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al eliminar precio' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error al eliminar precio' })
    }
  }

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)} MXN`
  }

  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`
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
      {/* Header with Action Button */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div />
        <ButtonModern
          onClick={() => setIsAddingPrice(true)}
          variant="primary"
          size="sm"
          icon={<Plus size={16} />}
        >
          Nuevo Precio
        </ButtonModern>
      </div>

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

      {/* Pricing Rules List */}
      <CardModern variant="glass" style={{ marginBottom: '20px' }}>
        <CardModernHeader>
          <CardModernTitle>
            <DollarSign size={18} style={{ marginRight: '8px', color: '#A4DF4E' }} />
            Reglas de Precios
          </CardModernTitle>
        </CardModernHeader>
        <CardModernContent>
        {pricing.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#829F65'
          }}>
            <DollarSign size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
              No hay reglas de precio configuradas
            </p>
            <p style={{ fontSize: '14px', color: '#829F65', marginBottom: '20px' }}>
              Agrega tu primera regla de precio para comenzar
            </p>
            <ButtonModern
              variant="primary"
              size="sm"
              onClick={() => setIsAddingPrice(true)}
              icon={<Plus size={16} />}
            >
              Agregar Precio
            </ButtonModern>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pricing.map((rule, index) => (
              <div 
                key={rule.id || index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  background: 'white',
                  borderRadius: '10px',
                  border: '1px solid rgba(164, 223, 78, 0.1)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    gap: '12px'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#182A01'
                    }}>
                      {formatPrice(rule.price)}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        background: 'rgba(164, 223, 78, 0.1)',
                        color: '#516640',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 500
                      }}>
                        <Calendar size={12} />
                        {rule.dayName || 'Todos los días'}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        background: 'rgba(102, 231, 170, 0.1)',
                        color: '#516640',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 500
                      }}>
                        <Clock size={12} />
                        {formatTimeRange(rule.startTime, rule.endTime)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '13px',
                    color: '#829F65'
                  }}>
                    Aplica por hora de reserva
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  <ButtonModern
                    variant="ghost"
                    size="sm"
                    icon={<Edit2 size={14} />}
                    onClick={() => handleEditPrice(rule)}
                    style={{ color: '#516640' }}
                  />
                  <ButtonModern
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={() => rule.id && handleDeletePrice(rule.id)}
                    style={{ color: '#C62828' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        </CardModernContent>
      </CardModern>

      {/* Price Modal */}
      <AppleModal
        isOpen={isAddingPrice}
        onClose={() => {
          setIsAddingPrice(false)
          setIsEditingPrice(null)
          setPriceForm({ dayOfWeek: null, startTime: '07:00', endTime: '22:00', price: 30000 })
        }}
        title={isEditingPrice ? 'Editar Precio' : 'Nuevo Precio'}
        subtitle="Configura una regla de precio para tus canchas"
        size="medium"
        footer={
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <ButtonModern
              variant="secondary"
              onClick={() => {
                setIsAddingPrice(false)
                setIsEditingPrice(null)
                setPriceForm({ dayOfWeek: null, startTime: '07:00', endTime: '22:00', price: 30000 })
              }}
            >
              Cancelar
            </ButtonModern>
            <ButtonModern
              variant="primary"
              onClick={() => handleCreatePrice()}
            >
              {isEditingPrice ? 'Actualizar' : 'Crear'}
            </ButtonModern>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ 
              fontSize: '13px', 
              fontWeight: 500, 
              color: '#516640',
              marginBottom: '8px',
              display: 'block'
            }}>
              Día de la Semana
            </label>
            <select
              value={priceForm.dayOfWeek === null ? 'null' : priceForm.dayOfWeek.toString()}
              onChange={(e) => setPriceForm({
                ...priceForm, 
                dayOfWeek: e.target.value === 'null' ? null : parseInt(e.target.value)
              })}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 16px',
                background: 'white',
                border: '1px solid rgba(164, 223, 78, 0.2)',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#182A01',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            >
              {daysOfWeek.map(day => (
                <option key={day.value} value={day.value === null ? 'null' : day.value.toString()}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <InputModern
              label="Hora de Inicio"
              type="time"
              value={priceForm.startTime}
              onChange={(e) => setPriceForm({...priceForm, startTime: e.target.value})}
            />
            <InputModern
              label="Hora de Fin"
              type="time"
              value={priceForm.endTime}
              onChange={(e) => setPriceForm({...priceForm, endTime: e.target.value})}
            />
          </div>

          <InputModern
            label="Precio por Hora (MXN)"
            type="number"
            step="1"
            min="0"
            value={Math.round(priceForm.price / 100).toString()}
            onChange={(e) => setPriceForm({
              ...priceForm, 
              price: parseInt(e.target.value || '0') * 100
            })}
            placeholder="300"
            icon={<DollarSign size={16} />}
            iconPosition="left"
          />

          <div style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#424245'
          }}>
            <strong>Vista previa:</strong> {formatPrice(priceForm.price)} por hora
            <br />
            <strong>Horario:</strong> {formatTimeRange(priceForm.startTime, priceForm.endTime)}
            <br />
            <strong>Días:</strong> {daysOfWeek.find(d => d.value === priceForm.dayOfWeek)?.label}
          </div>
        </div>
      </AppleModal>
    </div>
  )
}