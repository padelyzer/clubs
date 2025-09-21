'use client'

import React, { useState, useEffect } from 'react'
import { InputModern } from '@/components/design-system/InputModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { 
  Zap, Save, Loader2, CheckCircle, AlertCircle,
  Key, Shield, Eye, EyeOff
} from 'lucide-react'

interface StripeSettings {
  enabled: boolean
  publicKey: string
  secretKey: string
}

interface SaveMessage {
  type: 'success' | 'error'
  text: string
}

export const PaymentsStripeSection: React.FC = () => {
  const [stripeSettings, setStripeSettings] = useState<StripeSettings>({
    enabled: false,
    publicKey: '',
    secretKey: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null)
  const [showSecretKey, setShowSecretKey] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    fetchStripeSettings()
  }, [])

  // Clear save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage])

  const fetchStripeSettings = async () => {
    try {
      const response = await fetch('/api/settings/payments')
      const data = await response.json()
      
      if (data.success && data.data?.paymentProviders) {
        const stripeProvider = data.data.paymentProviders.find((p: any) => p.providerId === 'stripe')
        if (stripeProvider) {
          setStripeSettings({
            enabled: stripeProvider.enabled ?? false,
            publicKey: stripeProvider.config?.publicKey ?? '',
            secretKey: stripeProvider.config?.secretKey ?? ''
          })
        }
      }
    } catch (error) {
      console.error('Error fetching Stripe settings:', error)
      setSaveMessage({ type: 'error', text: 'Error al cargar configuración de Stripe' })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = <K extends keyof StripeSettings>(
    key: K, 
    value: StripeSettings[K]
  ) => {
    setStripeSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveStripeSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentProviders: {
            stripe: {
              enabled: stripeSettings.enabled,
              publicKey: stripeSettings.publicKey,
              secretKey: stripeSettings.secretKey
            }
          }
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setHasChanges(false)
        setSaveMessage({ type: 'success', text: 'Configuración de Stripe guardada exitosamente' })
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al guardar configuración' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error al guardar configuración de Stripe' })
    } finally {
      setSaving(false)
    }
  }

  const maskSecretKey = (key: string) => {
    if (!key || key.length < 8) return key
    return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`
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
            <Zap size={18} style={{ marginRight: '8px', color: '#A4DF4E' }} />
            Configuración de Stripe
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
                Habilitar Stripe
              </div>
              <div style={{ fontSize: '13px', color: '#829F65' }}>
                Procesa pagos en línea con tarjetas de crédito y débito
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('enabled', !stripeSettings.enabled)}
              style={{
                width: '51px',
                height: '31px',
                borderRadius: '16px',
                border: 'none',
                background: stripeSettings.enabled 
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
                transform: stripeSettings.enabled ? 'translateX(20px)' : 'translateX(0)',
                transition: 'transform 0.3s ease'
              }} />
            </button>
          </div>
        </CardModernContent>
      </CardModern>

      {stripeSettings.enabled && (
        <>
          {/* API Keys */}
          <CardModern variant="glass" style={{ marginBottom: '20px' }}>
            <CardModernHeader>
              <CardModernTitle style={{ display: 'flex', alignItems: 'center' }}>
                <Key size={18} style={{ marginRight: '8px', color: '#A4DF4E' }} />
                Claves de API
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '8px'
                }}>
                  <ButtonModern
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    icon={showSecretKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  >
                    {showSecretKey ? 'Ocultar' : 'Mostrar'} Clave Secreta
                  </ButtonModern>
                </div>

                <InputModern
                  label="Clave Pública"
                  value={stripeSettings.publicKey}
                  onChange={(e) => handleSettingChange('publicKey', e.target.value)}
                  placeholder="pk_test_... o pk_live_..."
                  icon={<Key size={16} />}
                  iconPosition="left"
                />

                <InputModern
                  label="Clave Secreta"
                  type={showSecretKey ? "text" : "password"}
                  value={stripeSettings.secretKey}
                  onChange={(e) => handleSettingChange('secretKey', e.target.value)}
                  placeholder="sk_test_... o sk_live_..."
                  icon={<Shield size={16} />}
                  iconPosition="left"
                />

                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(164, 223, 78, 0.05)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: '#516640',
                  border: '1px solid rgba(164, 223, 78, 0.1)'
                }}>
                  <strong>Nota:</strong> Puedes encontrar tus claves de API en tu{' '}
                  <a 
                    href="https://dashboard.stripe.com/apikeys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#A4DF4E', textDecoration: 'none' }}
                  >
                    Dashboard de Stripe
                  </a>
                  . Usa claves de prueba (test) para desarrollo y claves de producción (live) para cobros reales.
                </div>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Information Card */}
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
                  <strong>✅ Stripe configurado</strong>
                </div>
                <div style={{ color: '#516640', marginBottom: '8px' }}>
                  <strong>Modo:</strong> {stripeSettings.publicKey.includes('test') ? 'Prueba' : 'Producción'}
                </div>
                <div style={{ color: '#516640', marginBottom: '8px' }}>
                  <strong>Clave pública:</strong> {stripeSettings.publicKey ? 
                    `${stripeSettings.publicKey.substring(0, 7)}...` : 
                    'No configurada'
                  }
                </div>
                <div style={{ color: '#516640' }}>
                  Los clientes podrán pagar en línea con tarjetas de crédito y débito de forma segura a través de Stripe.
                </div>
              </div>
            </CardModernContent>
          </CardModern>
        </>
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
          onClick={saveStripeSettings}
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