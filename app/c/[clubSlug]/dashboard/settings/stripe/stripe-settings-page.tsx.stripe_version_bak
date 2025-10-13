'use client'

import React, { useState, useEffect } from 'react'
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { CardModern, CardModernHeader, CardModernTitle, CardModernDescription, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { Check, AlertCircle, CreditCard, Key, Shield, Eye, EyeOff, Save, Link, Settings } from 'lucide-react'
import { StripeOnboarding } from './stripe-onboarding'
import { StripeSettings } from './stripe-settings'

interface Club {
  id: string
  name: string
  email: string
  stripeAccountId: string | null
  stripeOnboardingCompleted: boolean
  stripeChargesEnabled: boolean
  stripePayoutsEnabled: boolean
  stripeDetailsSubmitted: boolean
  stripeRequirements: string | null
  stripeCommissionRate: number
}

interface StripeConfig {
  enabled: boolean
  hasConfig: boolean
  publicKey: string
  secretKey: string
  environment?: string
}

interface StripeSettingsPageProps {
  club: Club
  searchParams: { success?: string; error?: string; pending?: string; refresh?: string; tab?: string }
  userRole: string
}

export function StripeSettingsPage({ club, searchParams, userRole }: StripeSettingsPageProps) {
  const [activeTab, setActiveTab] = useState(searchParams.tab || 'connect')
  const [config, setConfig] = useState<StripeConfig>({
    enabled: false,
    hasConfig: false,
    publicKey: '',
    secretKey: ''
  })
  const [formData, setFormData] = useState({
    publicKey: '',
    secretKey: '',
    enabled: true
  })
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (activeTab === 'api-keys') {
      fetchStripeConfig()
    } else {
      setIsLoading(false)
    }
  }, [activeTab])

  const fetchStripeConfig = async () => {
    try {
      const response = await fetch('/api/settings/stripe')
      const data = await response.json()
      
      if (data.success) {
        setConfig(data.data)
        setFormData({
          publicKey: data.data.publicKey || '',
          secretKey: '', // No mostrar la clave secreta completa
          enabled: data.data.enabled
        })
      }
    } catch (error) {
      console.error('Error fetching Stripe config:', error)
      setMessage({ type: 'error', text: 'Error al cargar la configuración' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.publicKey || !formData.secretKey) {
      setMessage({ type: 'error', text: 'Ambas claves son requeridas' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        await fetchStripeConfig() // Recargar configuración
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar' })
      }
    } catch (error) {
      console.error('Error saving Stripe config:', error)
      setMessage({ type: 'error', text: 'Error al guardar la configuración' })
    } finally {
      setIsSaving(false)
    }
  }

  const getEnvironmentBadge = (publicKey: string) => {
    if (!publicKey) return null
    
    const isTest = publicKey.startsWith('pk_test_')
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 600,
        background: isTest ? 'rgba(251, 191, 36, 0.1)' : 'rgba(164, 223, 78, 0.1)',
        color: isTest ? '#92400e' : '#516640'
      }}>
        <Shield size={12} />
        {isTest ? 'Pruebas' : 'Producción'}
      </div>
    )
  }

  const hasStripeConnect = club.stripeAccountId && club.stripeOnboardingCompleted

  return (
    <CleanDashboardLayout
      clubName={club.name}
      userName="Administrador del Club"
      userRole={userRole}
    >
      <div style={{ padding: '32px', maxWidth: '1000px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#182A01',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em'
          }}>
            Configuración de Stripe
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#516640',
            fontWeight: 400,
            margin: 0
          }}>
            Configura tu integración con Stripe para procesar pagos
          </p>
        </div>

        {/* Status Messages */}
        {searchParams.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  ¡Configuración completada!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Tu cuenta de Stripe Connect está configurada correctamente. Ya puedes recibir pagos en línea.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {searchParams.pending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Configuración pendiente
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Tu cuenta de Stripe necesita información adicional para completar la configuración.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {searchParams.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error en la configuración
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Hubo un problema configurando tu cuenta de Stripe. Por favor intenta nuevamente.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('connect')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'connect'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Link className="inline mr-2" size={16} />
              Stripe Connect
            </button>
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'api-keys'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Key className="inline mr-2" size={16} />
              Claves API (Avanzado)
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'connect' && (
          <div>
            {!hasStripeConnect ? (
              <StripeOnboarding club={club} />
            ) : (
              <StripeSettings club={club} />
            )}
          </div>
        )}

        {activeTab === 'api-keys' && (
          <div>
            {isLoading ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <div>Cargando configuración...</div>
              </div>
            ) : (
              <>
                {/* Status Card */}
                <CardModern variant="glass" style={{ marginBottom: '24px' }}>
                  <CardModernContent>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: config.hasConfig 
                          ? 'linear-gradient(135deg, #A4DF4E, #66E7AA)'
                          : 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {config.hasConfig ? (
                          <Check size={24} color="#182A01" />
                        ) : (
                          <AlertCircle size={24} color="#6B7280" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: 600,
                          color: '#182A01',
                          marginBottom: '4px'
                        }}>
                          {config.hasConfig ? 'Claves API Configuradas' : 'Sin Claves API'}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#516640'
                        }}>
                          {config.hasConfig 
                            ? 'El club tiene configuradas claves API personalizadas'
                            : 'Configure claves API si necesita funcionalidades avanzadas'
                          }
                        </div>
                      </div>
                      {config.hasConfig && getEnvironmentBadge(config.publicKey)}
                    </div>
                  </CardModernContent>
                </CardModern>

                {/* Configuration Form */}
                <CardModern variant="glass">
                  <CardModernHeader>
                    <CardModernTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CreditCard size={20} />
                      Claves de API Personalizadas
                    </CardModernTitle>
                    <CardModernDescription>
                      Solo para usuarios avanzados. La mayoría de clubes deben usar Stripe Connect.
                    </CardModernDescription>
                  </CardModernHeader>
                  <CardModernContent>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '24px'
                    }}>
                      {/* Warning */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800">
                              ⚠️ Funcionalidad Avanzada
                            </h3>
                            <div className="mt-2 text-sm text-amber-700">
                              <p>Las claves API personalizadas son para casos especiales. La mayoría de clubes deben usar <strong>Stripe Connect</strong> que es más seguro y fácil de configurar.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Public Key */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#182A01',
                          marginBottom: '8px'
                        }}>
                          <Key size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          Clave Pública (Publishable Key)
                        </label>
                        <InputModern
                          type="text"
                          placeholder="pk_test_... o pk_live_..."
                          value={formData.publicKey}
                          onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
                          style={{ fontFamily: 'monospace', fontSize: '13px' }}
                        />
                        {formData.publicKey && getEnvironmentBadge(formData.publicKey)}
                      </div>

                      {/* Secret Key */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#182A01',
                          marginBottom: '8px'
                        }}>
                          <Shield size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          Clave Secreta (Secret Key)
                        </label>
                        <div style={{ position: 'relative' }}>
                          <InputModern
                            type={showSecretKey ? 'text' : 'password'}
                            placeholder={config.hasConfig ? 'Dejar vacío para mantener actual' : 'sk_test_... o sk_live_...'}
                            value={formData.secretKey}
                            onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                            style={{ 
                              fontFamily: 'monospace', 
                              fontSize: '13px',
                              paddingRight: '40px'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecretKey(!showSecretKey)}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#516640'
                            }}
                          >
                            {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Message */}
                      {message && (
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          background: message.type === 'success' 
                            ? 'rgba(164, 223, 78, 0.1)' 
                            : 'rgba(239, 68, 68, 0.1)',
                          border: `1px solid ${message.type === 'success' 
                            ? 'rgba(164, 223, 78, 0.2)' 
                            : 'rgba(239, 68, 68, 0.2)'}`,
                          color: message.type === 'success' ? '#516640' : '#DC2626',
                          fontSize: '14px'
                        }}>
                          {message.text}
                        </div>
                      )}

                      {/* Save Button */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(164, 223, 78, 0.1)'
                      }}>
                        <ButtonModern
                          variant="primary"
                          onClick={handleSave}
                          disabled={isSaving || !formData.publicKey || !formData.secretKey}
                          icon={<Save size={16} />}
                        >
                          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                        </ButtonModern>
                      </div>
                    </div>
                  </CardModernContent>
                </CardModern>

                {/* Info Card */}
                <CardModern variant="info" style={{ marginTop: '24px' }}>
                  <CardModernContent>
                    <div style={{ padding: '16px' }}>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#182A01',
                        marginBottom: '8px'
                      }}>
                        Información Importante
                      </h4>
                      <ul style={{
                        fontSize: '13px',
                        color: '#516640',
                        margin: 0,
                        paddingLeft: '16px'
                      }}>
                        <li>Las claves de prueba (test) comienzan con <code>pk_test_</code> y <code>sk_test_</code></li>
                        <li>Las claves de producción (live) comienzan con <code>pk_live_</code> y <code>sk_live_</code></li>
                        <li>Estas claves son específicas para este club y no se comparten con otros</li>
                        <li>Mantenga las claves secretas seguras y no las comparta</li>
                        <li><strong>Recomendado:</strong> Use Stripe Connect en lugar de claves API personalizadas</li>
                      </ul>
                    </div>
                  </CardModernContent>
                </CardModern>
              </>
            )}
          </div>
        )}
      </div>
    </CleanDashboardLayout>
  )
}