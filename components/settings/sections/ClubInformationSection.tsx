'use client'

import React, { useState, useEffect } from 'react'
import { InputModern } from '@/components/design-system/InputModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { 
  Building, Phone, Mail, Globe, MapPin, 
  Save, Loader2, CheckCircle, AlertCircle,
  Clock, Calendar, DollarSign, Percent, AlertTriangle
} from 'lucide-react'

interface ClubInfo {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  website: string
  description: string
  // Configuración operativa
  slotDuration: number
  bufferTime: number
  advanceBookingDays: number
  allowSameDayBooking: boolean
  currency: string
  taxIncluded: boolean
  taxRate: number
  cancellationFee: number
  noShowFee: number
  timezone: string
}

interface SaveMessage {
  type: 'success' | 'error'
  text: string
}

export const ClubInformationSection: React.FC = () => {
  const [clubSettings, setClubSettings] = useState<ClubInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'México',
    website: '',
    description: '',
    slotDuration: 90,
    bufferTime: 15,
    advanceBookingDays: 30,
    allowSameDayBooking: true,
    currency: 'MXN',
    taxIncluded: true,
    taxRate: 16,
    cancellationFee: 0,
    noShowFee: 50,
    timezone: 'America/Mexico_City'
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null)

  // Fetch club settings on component mount
  useEffect(() => {
    fetchClubSettings()
  }, [])

  // Clear save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage])

  const fetchClubSettings = async () => {
    try {
      const response = await fetch('/api/settings/club')
      const data = await response.json()
      
      if (data.success) {
        setClubSettings({
          name: data.club?.name || '',
          email: data.club?.email || '',
          phone: data.club?.phone || '',
          address: data.club?.address || '',
          city: data.club?.city || '',
          state: data.club?.state || '',
          postalCode: data.club?.postalCode || '',
          country: data.club?.country || 'México',
          website: data.club?.website || '',
          description: data.club?.description || '',
          slotDuration: data.settings?.slotDuration || 90,
          bufferTime: data.settings?.bufferTime || 15,
          advanceBookingDays: data.settings?.advanceBookingDays || 30,
          allowSameDayBooking: data.settings?.allowSameDayBooking ?? true,
          currency: data.settings?.currency || 'MXN',
          taxIncluded: data.settings?.taxIncluded ?? true,
          taxRate: data.settings?.taxRate || 16,
          cancellationFee: data.settings?.cancellationFee || 0,
          noShowFee: data.settings?.noShowFee || 50,
          timezone: data.settings?.timezone || 'America/Mexico_City'
        })
      }
    } catch (error) {
      console.error('Error fetching club settings:', error)
      setSaveMessage({ type: 'error', text: 'Error al cargar configuración del club' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ClubInfo, value: string) => {
    let parsedValue: any = value
    
    // Convert string values to appropriate types for numeric fields
    if (['slotDuration', 'bufferTime', 'advanceBookingDays', 'taxRate', 'cancellationFee', 'noShowFee'].includes(field)) {
      parsedValue = value === '' ? 0 : Number(value)
    }
    
    // Convert string to boolean for boolean fields
    if (['allowSameDayBooking', 'taxIncluded'].includes(field)) {
      parsedValue = value === 'true'
    }
    
    setClubSettings(prev => ({ ...prev, [field]: parsedValue }))
    setHasChanges(true)
  }

  const saveClubSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/club', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clubSettings)
      })
      
      const data = await response.json()
      if (data.success) {
        setHasChanges(false)
        setSaveMessage({ type: 'success', text: 'Configuración guardada exitosamente' })
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al guardar configuración' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error al guardar configuración' })
    } finally {
      setSaving(false)
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      {/* Header - Clean style matching other pages */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#182A01',
          margin: '0 0 6px 0',
          letterSpacing: '-0.02em'
        }}>
          Configuración del Club
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#516640',
          fontWeight: 400,
          margin: 0
        }}>
          Gestiona la información básica y configuración operativa de tu club
        </p>
      </div>

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
            <CheckCircle size={18} style={{ marginRight: '10px', flexShrink: 0 }} /> :
            <AlertCircle size={18} style={{ marginRight: '10px', flexShrink: 0 }} />
          }
          <span style={{ fontWeight: '500' }}>{saveMessage.text}</span>
        </div>
      )}

      {/* Basic Information & Contact */}
      <CardModern variant="glass" style={{ marginBottom: '20px' }}>
        <CardModernHeader>
          <CardModernTitle>
            <Building size={18} style={{ marginRight: '8px', color: '#A4DF4E' }} />
            Información General
          </CardModernTitle>
        </CardModernHeader>
        <CardModernContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Nombre del club - Campo completo */}
            <InputModern
              label="Nombre del Club"
              value={clubSettings.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              placeholder="Ej: Club Pádel México"
            />
            
            {/* Email y Teléfono - 2 campos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <InputModern
                label="Correo Electrónico"
                value={clubSettings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contacto@tuclub.com"
                type="email"
                icon={<Mail size={16} />}
              />
              <InputModern
                label="Teléfono"
                value={clubSettings.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+52 55 1234 5678"
                icon={<Phone size={16} />}
              />
            </div>

            {/* Sitio Web - Campo completo */}
            <InputModern
              label="Sitio Web"
              value={clubSettings.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://tuclub.com"
              icon={<Globe size={16} />}
            />

            {/* Descripción - Campo completo */}
            <div>
              <label style={{ 
                fontSize: '13px', 
                fontWeight: 500, 
                color: '#516640',
                marginBottom: '8px',
                display: 'block'
              }}>
                Descripción
              </label>
              <textarea
                value={clubSettings.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Breve descripción del club"
                rows={2}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#182A01',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(164, 223, 78, 0.15)',
                  borderRadius: '16px',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '60px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '2px solid #A4DF4E'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(164, 223, 78, 0.1), 0 8px 24px rgba(0, 0, 0, 0.05)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '2px solid rgba(164, 223, 78, 0.15)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)'
                }}
              />
            </div>
          </div>
        </CardModernContent>
      </CardModern>

      {/* Location */}
      <CardModern variant="glass" style={{ marginBottom: '20px' }}>
        <CardModernHeader>
          <CardModernTitle>
            <MapPin size={18} style={{ marginRight: '8px', color: '#A4DF4E' }} />
            Ubicación
          </CardModernTitle>
        </CardModernHeader>
        <CardModernContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Dirección - Campo completo */}
            <InputModern
              label="Dirección"
              value={clubSettings.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Calle y número"
              icon={<MapPin size={16} />}
            />
            
            {/* Ciudad, Estado, CP - 3 campos */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '16px' }}>
              <InputModern
                label="Ciudad"
                value={clubSettings.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Ciudad de México"
              />
              <InputModern
                label="Estado"
                value={clubSettings.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="CDMX"
              />
              <InputModern
                label="C.P."
                value={clubSettings.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="12345"
              />
            </div>
            
            {/* País - Campo individual para claridad */}
            <InputModern
              label="País"
              value={clubSettings.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="México"
            />
          </div>
        </CardModernContent>
      </CardModern>

      {/* Operational Configuration */}
      <CardModern variant="glass" style={{ marginBottom: '20px' }}>
        <CardModernHeader>
          <CardModernTitle>
            <Clock size={18} style={{ marginRight: '8px', color: '#A4DF4E' }} />
            Configuración Operativa
          </CardModernTitle>
        </CardModernHeader>
        <CardModernContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Time Settings */}
            <div style={{ 
              padding: '12px',
              background: 'rgba(164, 223, 78, 0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(164, 223, 78, 0.1)'
            }}>
              <h4 style={{ 
                fontSize: '13px', 
                fontWeight: 600, 
                color: '#182A01',
                marginTop: 0,
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Calendar size={16} />
                Configuración de Horarios
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <InputModern
                  label="Duración Slot (min)"
                  type="number"
                  value={clubSettings.slotDuration}
                  onChange={(e) => handleInputChange('slotDuration', e.target.value)}
                  placeholder="90"
                  min="30"
                  max="240"
                />
                <InputModern
                  label="Buffer (min)"
                  type="number"
                  value={clubSettings.bufferTime}
                  onChange={(e) => handleInputChange('bufferTime', e.target.value)}
                  placeholder="15"
                  min="0"
                  max="60"
                />
                <InputModern
                  label="Anticipación (días)"
                  type="number"
                  value={clubSettings.advanceBookingDays}
                  onChange={(e) => handleInputChange('advanceBookingDays', e.target.value)}
                  placeholder="30"
                  min="1"
                  max="365"
                />
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: clubSettings.allowSameDayBooking ? 'rgba(164, 223, 78, 0.08)' : 'rgba(255, 59, 48, 0.05)',
                  borderRadius: '12px',
                  border: `1px solid ${clubSettings.allowSameDayBooking ? 'rgba(164, 223, 78, 0.2)' : 'rgba(255, 59, 48, 0.1)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleInputChange('allowSameDayBooking', (!clubSettings.allowSameDayBooking).toString())}>
                  <input
                    type="checkbox"
                    checked={clubSettings.allowSameDayBooking}
                    onChange={(e) => handleInputChange('allowSameDayBooking', e.target.checked.toString())}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ 
                    fontSize: '14px',
                    color: '#182A01'
                  }}>
                    Permitir reservas del mismo día
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: clubSettings.allowSameDayBooking ? '#5a7d2a' : '#C62828',
                    padding: '4px 12px',
                    background: clubSettings.allowSameDayBooking ? 'rgba(164, 223, 78, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                    borderRadius: '8px'
                  }}>
                    {clubSettings.allowSameDayBooking ? 'Activado' : 'Desactivado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Settings */}
            <div style={{ 
              padding: '12px',
              background: 'rgba(102, 231, 170, 0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(102, 231, 170, 0.1)'
            }}>
              <h4 style={{ 
                fontSize: '13px', 
                fontWeight: 600, 
                color: '#182A01',
                marginTop: 0,
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <DollarSign size={16} />
                Configuración Financiera
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ 
                    fontSize: '13px', 
                    fontWeight: 500, 
                    color: '#516640',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Moneda
                  </label>
                  <select
                    value={clubSettings.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
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
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="USD">USD - Dólar Estadounidense</option>
                  </select>
                </div>
                <InputModern
                  label="Impuesto (%)"
                  type="number"
                  value={clubSettings.taxRate}
                  onChange={(e) => handleInputChange('taxRate', e.target.value)}
                  placeholder="16"
                  min="0"
                  max="50"
                  icon={<Percent size={16} />}
                />
                <div>
                  <label style={{ 
                    fontSize: '13px', 
                    fontWeight: 500, 
                    color: '#516640',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Zona Horaria
                  </label>
                  <select
                    value={clubSettings.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
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
                    <option value="America/Mexico_City">Ciudad de México</option>
                    <option value="America/Cancun">Cancún</option>
                    <option value="America/Monterrey">Monterrey</option>
                    <option value="America/Tijuana">Tijuana</option>
                    <option value="America/Hermosillo">Hermosillo</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: clubSettings.taxIncluded ? 'rgba(164, 223, 78, 0.05)' : 'rgba(255, 149, 0, 0.05)',
                  borderRadius: '12px',
                  border: `1px solid ${clubSettings.taxIncluded ? 'rgba(164, 223, 78, 0.2)' : 'rgba(255, 149, 0, 0.2)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleInputChange('taxIncluded', (!clubSettings.taxIncluded).toString())}>
                  <input
                    type="checkbox"
                    checked={clubSettings.taxIncluded}
                    onChange={(e) => handleInputChange('taxIncluded', e.target.checked.toString())}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#182A01' }}>
                    Impuesto Incluido en los Precios
                  </span>
                </div>
              </div>
            </div>

            {/* Fees Configuration */}
            <div style={{ 
              padding: '12px',
              background: 'rgba(255, 149, 0, 0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 149, 0, 0.1)'
            }}>
              <h4 style={{ 
                fontSize: '13px', 
                fontWeight: 600, 
                color: '#182A01',
                marginTop: 0,
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={16} />
                Configuración de Penalizaciones
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <InputModern
                  label="Tarifa de Cancelación (%)"
                  type="number"
                  value={clubSettings.cancellationFee}
                  onChange={(e) => handleInputChange('cancellationFee', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                />
                <InputModern
                  label="Tarifa por No Show (%)"
                  type="number"
                  value={clubSettings.noShowFee}
                  onChange={(e) => handleInputChange('noShowFee', e.target.value)}
                  placeholder="50"
                  min="0"
                  max="100"
                />
              </div>
            </div>

          </div>
        </CardModernContent>
      </CardModern>

      {/* Save Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid rgba(164, 223, 78, 0.1)'
      }}>
        <ButtonModern
          onClick={saveClubSettings}
          disabled={!hasChanges || saving}
          loading={saving}
          variant="primary"
          size="lg"
          icon={<Save size={18} />}
        >
          Guardar Cambios
        </ButtonModern>
      </div>
    </div>
  )
}