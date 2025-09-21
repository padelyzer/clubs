'use client'

import React, { useState, useEffect } from 'react'
import { InputModern } from '@/components/design-system/InputModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { 
  CreditCard, Save, Loader2, CheckCircle, AlertCircle
} from 'lucide-react'

interface TerminalSettings {
  terminalEnabled: boolean
  terminalId: string
}

interface SaveMessage {
  type: 'success' | 'error'
  text: string
}

export const PaymentsTerminalSection: React.FC = () => {
  const [terminalSettings, setTerminalSettings] = useState<TerminalSettings>({
    terminalEnabled: false,
    terminalId: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null)

  // Load settings on component mount
  useEffect(() => {
    fetchTerminalSettings()
  }, [])

  // Clear save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage])

  const fetchTerminalSettings = async () => {
    try {
      const response = await fetch('/api/settings/payments')
      const data = await response.json()
      
      if (data.success && data.data?.settings) {
        setTerminalSettings({
          terminalEnabled: data.data.settings.terminalEnabled ?? false,
          terminalId: data.data.settings.terminalId ?? ''
        })
      }
    } catch (error) {
      console.error('Error fetching terminal settings:', error)
      setSaveMessage({ type: 'error', text: 'Error al cargar configuración de terminal' })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = <K extends keyof TerminalSettings>(
    key: K, 
    value: TerminalSettings[K]
  ) => {
    setTerminalSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveTerminalSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: terminalSettings
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setHasChanges(false)
        setSaveMessage({ type: 'success', text: 'Configuración de terminal guardada exitosamente' })
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al guardar configuración' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error al guardar configuración de terminal' })
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
            <CreditCard size={18} style={{ marginRight: '8px', color: '#A4DF4E' }} />
            Configuración de Terminal de Pago
          </CardModernTitle>
        </CardModernHeader>
        <CardModernContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0'
            }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '500', color: '#182A01', marginBottom: '4px' }}>
                  Habilitar Terminal de Pago
                </div>
                <div style={{ fontSize: '13px', color: '#829F65' }}>
                  Permite cobros con tarjeta de crédito y débito
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('terminalEnabled', !terminalSettings.terminalEnabled)}
                style={{
                  width: '51px',
                  height: '31px',
                  borderRadius: '16px',
                  border: 'none',
                  background: terminalSettings.terminalEnabled 
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
                  transform: terminalSettings.terminalEnabled ? 'translateX(20px)' : 'translateX(0)',
                  transition: 'transform 0.3s ease'
                }} />
              </button>
            </div>

            {terminalSettings.terminalEnabled && (
              <div>
                <InputModern
                  label="ID de Terminal"
                  value={terminalSettings.terminalId}
                  onChange={(e) => handleSettingChange('terminalId', e.target.value)}
                  placeholder="Ej: TERM001"
                  icon={<CreditCard size={16} />}
                  iconPosition="left"
                />
                <div style={{
                  fontSize: '13px',
                  color: '#829F65',
                  marginTop: '8px'
                }}>
                  Ingresa el identificador único de tu terminal de pago
                </div>
              </div>
            )}
          </div>
        </CardModernContent>
      </CardModern>

      {/* Information Card */}
      {terminalSettings.terminalEnabled && terminalSettings.terminalId && (
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
                <strong>✅ Terminal configurado</strong>
              </div>
              <div style={{ color: '#516640', marginBottom: '8px' }}>
                <strong>ID de Terminal:</strong> {terminalSettings.terminalId}
              </div>
              <div style={{ color: '#516640' }}>
                Los clientes podrán pagar con tarjeta de crédito o débito utilizando la terminal física en las instalaciones del club.
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
          onClick={saveTerminalSettings}
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