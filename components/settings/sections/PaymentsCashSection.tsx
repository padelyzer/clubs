'use client'

import React, { useState, useEffect } from 'react'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { 
  Banknote, Save, Loader2, CheckCircle, AlertCircle
} from 'lucide-react'

interface CashSettings {
  acceptCash: boolean
}

interface SaveMessage {
  type: 'success' | 'error'
  text: string
}

export const PaymentsCashSection: React.FC = () => {
  const [cashSettings, setCashSettings] = useState<CashSettings>({
    acceptCash: false
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null)

  // Load settings on component mount
  useEffect(() => {
    fetchCashSettings()
  }, [])

  // Clear save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage])

  const fetchCashSettings = async () => {
    try {
      const response = await fetch('/api/settings/payments')
      const data = await response.json()
      
      if (data.success && data.data?.settings) {
        setCashSettings({
          acceptCash: data.data.settings.acceptCash ?? false
        })
      }
    } catch (error) {
      console.error('Error fetching cash settings:', error)
      setSaveMessage({ type: 'error', text: 'Error al cargar configuración de efectivo' })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = <K extends keyof CashSettings>(
    key: K, 
    value: CashSettings[K]
  ) => {
    setCashSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveCashSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: cashSettings
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setHasChanges(false)
        setSaveMessage({ type: 'success', text: 'Configuración de efectivo guardada exitosamente' })
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al guardar configuración' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error al guardar configuración de efectivo' })
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
    <div>
      {/* Clean header matching other sections */}

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

      {/* General Settings */}
      <CardModern variant="glass" style={{ marginBottom: '20px' }}>
        <CardModernHeader>
          <CardModernTitle style={{ display: 'flex', alignItems: 'center' }}>
            <Banknote size={18} style={{ marginRight: '8px', color: '#A4DF4E' }} />
            Configuración de Pagos en Efectivo
          </CardModernTitle>
        </CardModernHeader>
        <CardModernContent>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 0'
          }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '500', color: '#182A01', marginBottom: '4px' }}>
                Aceptar Pagos en Efectivo
              </div>
              <div style={{ fontSize: '13px', color: '#829F65' }}>
                Permite que los clientes paguen sus reservas en efectivo
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('acceptCash', !cashSettings.acceptCash)}
              style={{
                width: '51px',
                height: '31px',
                borderRadius: '16px',
                border: 'none',
                background: cashSettings.acceptCash 
                  ? 'linear-gradient(135deg, #A4DF4E, #66E7AA)' 
                  : '#E5E5EA',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: '2px'
              }}
            >
              <div style={{
                width: '27px',
                height: '27px',
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transform: cashSettings.acceptCash ? 'translateX(20px)' : 'translateX(0)',
                transition: 'transform 0.3s ease'
              }} />
            </button>
          </div>
        </CardModernContent>
      </CardModern>

      {/* Information Card */}
      {cashSettings.acceptCash && (
        <CardModern variant="glass" style={{ marginBottom: '20px' }}>
          <CardModernHeader>
            <CardModernTitle style={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle size={18} style={{ marginRight: '8px', color: '#A4DF4E' }} />
              Información
            </CardModernTitle>
          </CardModernHeader>
          <CardModernContent>
            <div style={{
              padding: '20px',
              backgroundColor: 'rgba(164, 223, 78, 0.05)',
              borderRadius: '10px',
              fontSize: '14px',
              lineHeight: '1.8',
              border: '1px solid rgba(164, 223, 78, 0.1)'
            }}>
              <div style={{ color: '#182A01', marginBottom: '12px' }}>
                <strong>✅ Pagos en efectivo habilitados</strong>
              </div>
              <div style={{ color: '#516640' }}>
                Los clientes podrán seleccionar "Pago en efectivo" como método de pago al realizar una reserva. 
                El pago deberá ser recolectado en persona en las instalaciones del club.
              </div>
            </div>
          </CardModernContent>
        </CardModern>
      )}

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
          onClick={saveCashSettings}
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