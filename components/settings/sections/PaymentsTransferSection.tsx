'use client'

import React, { useState, useEffect } from 'react'
import { InputModern } from '@/components/design-system/InputModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { 
  ArrowRightLeft, Save, Loader2, CheckCircle, AlertCircle,
  Building, CreditCard, Hash, User, Copy
} from 'lucide-react'

interface TransferSettings {
  transferEnabled: boolean
  bankName: string
  accountNumber: string
  clabe: string
  accountHolder: string
}

interface SaveMessage {
  type: 'success' | 'error'
  text: string
}

export const PaymentsTransferSection: React.FC = () => {
  const [transferSettings, setTransferSettings] = useState<TransferSettings>({
    transferEnabled: false,
    bankName: '',
    accountNumber: '',
    clabe: '',
    accountHolder: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  // Load settings on component mount
  useEffect(() => {
    fetchTransferSettings()
  }, [])

  // Clear save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage])

  const fetchTransferSettings = async () => {
    try {
      const response = await fetch('/api/settings/payments')
      const data = await response.json()
      
      if (data.success && data.data?.settings) {
        setTransferSettings({
          transferEnabled: data.data.settings.transferEnabled ?? false,
          bankName: data.data.settings.bankName ?? '',
          accountNumber: data.data.settings.accountNumber ?? '',
          clabe: data.data.settings.clabe ?? '',
          accountHolder: data.data.settings.accountHolder ?? ''
        })
      }
    } catch (error) {
      console.error('Error fetching transfer settings:', error)
      setSaveMessage({ type: 'error', text: 'Error al cargar configuración de transferencias' })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = <K extends keyof TransferSettings>(
    key: K, 
    value: TransferSettings[K]
  ) => {
    setTransferSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveTransferSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: transferSettings
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setHasChanges(false)
        setSaveMessage({ type: 'success', text: 'Configuración de transferencias guardada exitosamente' })
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al guardar configuración' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error al guardar configuración de transferencias' })
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const validateCLABE = (clabe: string) => {
    // Basic CLABE validation (18 digits)
    return /^\d{18}$/.test(clabe)
  }

  const formatAccountNumber = (accountNumber: string) => {
    // Format account number with spaces for better readability
    return accountNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
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
            <ArrowRightLeft size={18} style={{ marginRight: '8px', color: '#A4DF4E' }} />
            Configuración de Transferencias Bancarias
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
                Habilitar Transferencias Bancarias
              </div>
              <div style={{ fontSize: '13px', color: '#829F65' }}>
                Permite que los clientes paguen por transferencia bancaria
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('transferEnabled', !transferSettings.transferEnabled)}
              style={{
                width: '51px',
                height: '31px',
                borderRadius: '16px',
                border: 'none',
                background: transferSettings.transferEnabled 
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
                transform: transferSettings.transferEnabled ? 'translateX(20px)' : 'translateX(0)',
                transition: 'transform 0.3s ease'
              }} />
            </button>
          </div>
        </CardModernContent>
      </CardModern>

      {transferSettings.transferEnabled && (
        <>
          {/* Bank Information */}
          <CardModern variant="glass" style={{ marginBottom: '20px' }}>
            <CardModernHeader>
              <CardModernTitle style={{ display: 'flex', alignItems: 'center' }}>
                <Building size={18} style={{ marginRight: '8px', color: '#A4DF4E' }} />
                Información Bancaria
              </CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <InputModern
                  label="Nombre del Banco"
                  value={transferSettings.bankName}
                  onChange={(e) => handleSettingChange('bankName', e.target.value)}
                  placeholder="Ej: BBVA México"
                  required
                  icon={<Building size={16} />}
                  iconPosition="left"
                />

                <InputModern
                  label="Titular de la Cuenta"
                  value={transferSettings.accountHolder}
                  onChange={(e) => handleSettingChange('accountHolder', e.target.value)}
                  placeholder="Nombre completo o razón social"
                  required
                  icon={<User size={16} />}
                  iconPosition="left"
                />

                <InputModern
                  label="Número de Cuenta"
                  value={transferSettings.accountNumber}
                  onChange={(e) => handleSettingChange('accountNumber', e.target.value)}
                  placeholder="1234567890123456"
                  icon={<CreditCard size={16} />}
                  iconPosition="left"
                />

                <div>
                  <InputModern
                    label="CLABE Interbancaria"
                    value={transferSettings.clabe}
                    onChange={(e) => handleSettingChange('clabe', e.target.value)}
                    placeholder="012345678901234567"
                    maxLength={18}
                    icon={<Hash size={16} />}
                    iconPosition="left"
                  />
                  {transferSettings.clabe && (
                    <div style={{
                      fontSize: '13px',
                      color: validateCLABE(transferSettings.clabe) ? '#516640' : '#C62828',
                      marginTop: '4px'
                    }}>
                      {validateCLABE(transferSettings.clabe) ? '✅ CLABE válida' : '❌ CLABE debe tener 18 dígitos'}
                    </div>
                  )}
                </div>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Bank Details Summary */}
          <CardModern variant="glass" style={{ marginBottom: '20px' }}>
            <CardModernHeader>
              <CardModernTitle style={{ display: 'flex', alignItems: 'center' }}>
                <Copy size={18} style={{ marginRight: '8px', color: '#A4DF4E' }} />
                Información para Clientes
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
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '16px'
                }}>
                  <strong style={{ fontSize: '16px' }}>Datos Bancarios</strong>
                  <ButtonModern
                    size="sm"
                    variant="secondary"
                    onClick={() => copyToClipboard(
                      `Banco: ${transferSettings.bankName}\nTitular: ${transferSettings.accountHolder}\nCuenta: ${transferSettings.accountNumber}\nCLABE: ${transferSettings.clabe}`,
                      'datos'
                    )}
                    icon={<Copy size={14} />}
                  >
                    {copied === 'datos' ? 'Copiado!' : 'Copiar'}
                  </ButtonModern>
                </div>
                
                {transferSettings.bankName && (
                  <div style={{ marginBottom: '8px', color: '#516640' }}>
                    <strong>Banco:</strong> {transferSettings.bankName}
                  </div>
                )}
                
                {transferSettings.accountHolder && (
                  <div style={{ marginBottom: '8px', color: '#516640' }}>
                    <strong>Titular:</strong> {transferSettings.accountHolder}
                  </div>
                )}
                
                {transferSettings.accountNumber && (
                  <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#516640' }}>
                    <span><strong>Cuenta:</strong> {formatAccountNumber(transferSettings.accountNumber)}</span>
                    <button
                      onClick={() => copyToClipboard(transferSettings.accountNumber, 'cuenta')}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        color: '#A4DF4E'
                      }}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                )}
                
                {transferSettings.clabe && (
                  <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#516640' }}>
                    <span><strong>CLABE:</strong> {transferSettings.clabe}</span>
                    <button
                      onClick={() => copyToClipboard(transferSettings.clabe, 'clabe')}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        color: '#A4DF4E'
                      }}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                )}
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
          onClick={saveTransferSettings}
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