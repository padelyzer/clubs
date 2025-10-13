'use client'

import { useState } from 'react'
import { 
  Settings, 
  DollarSign, 
  Shield, 
  Bell, 
  Zap, 
  Sliders,
  Globe,
  Lock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  MessageSquare
} from 'lucide-react'

interface SystemSettings {
  general: {
    platformName: string
    supportEmail: string
    defaultTimezone: string
    defaultLanguage: string
    maintenanceMode: boolean
    allowClubRegistration: boolean
    requireClubApproval: boolean
  }
  financial: {
    defaultCommissionRate: number
    minCommissionRate: number
    maxCommissionRate: number
    payoutFrequency: string
    minPayoutAmount: number
    currency: string
  }
  features: {
    enableWhatsAppNotifications: boolean
    enableEmailNotifications: boolean
    enableSplitPayments: boolean
    enableWidgetBookings: boolean
    enableMobileApp: boolean
    enableAnalytics: boolean
    enableAdvancedReporting: boolean
  }
  limits: {
    maxCourtsPerClub: number
    maxUsersPerClub: number
    maxBookingsPerDay: number
    maxBookingDaysInAdvance: number
    maxCancellationHours: number
  }
  notifications: {
    bookingConfirmation: boolean
    paymentReminders: boolean
    cancellationNotices: boolean
    promotionalMessages: boolean
    systemUpdates: boolean
  }
  security: {
    requireTwoFactor: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
    requirePasswordComplexity: boolean
    allowedIpWhitelist: string[]
  }
  integrations: {
    stripe: {
      enabled: boolean
      webhookUrl: string
      testMode: boolean
    }
    whatsapp: {
      enabled: boolean
      provider: string
      businessNumber: string
    }
    analytics: {
      enabled: boolean
      provider: string
    }
  }
}

interface SettingsManagementProps {
  settings: SystemSettings
}

export default function SettingsManagement({ settings }: SettingsManagementProps) {
  const [activeTab, setActiveTab] = useState('general')
  const [formData, setFormData] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'financial', name: 'Financiero', icon: DollarSign },
    { id: 'features', name: 'Funcionalidades', icon: Zap },
    { id: 'limits', name: 'Límites', icon: Sliders },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'integrations', name: 'Integraciones', icon: Settings }
  ]

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof SystemSettings],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof SystemSettings],
        [subsection]: {
          ...(prev[section as keyof SystemSettings] as any)[subsection],
          [field]: value
        }
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setHasChanges(false)
        alert('Configuración guardada exitosamente')
      } else {
        alert('Error al guardar configuración')
      }
    } catch (error) {
      alert('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setFormData(settings)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800">Tienes cambios sin guardar</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="btn btn-ghost btn-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Descartar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-warning btn-sm"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Configuración General</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Plataforma
                  </label>
                  <input
                    type="text"
                    value={formData.general.platformName}
                    onChange={(e) => handleInputChange('general', 'platformName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de Soporte
                  </label>
                  <input
                    type="email"
                    value={formData.general.supportEmail}
                    onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona Horaria
                  </label>
                  <select
                    value={formData.general.defaultTimezone}
                    onChange={(e) => handleInputChange('general', 'defaultTimezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="America/Mexico_City">Ciudad de México</option>
                    <option value="America/Cancun">Cancún</option>
                    <option value="America/Tijuana">Tijuana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma
                  </label>
                  <select
                    value={formData.general.defaultLanguage}
                    onChange={(e) => handleInputChange('general', 'defaultLanguage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Configuraciones de Registro</h4>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.general.allowClubRegistration}
                    onChange={(e) => handleInputChange('general', 'allowClubRegistration', e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <div>
                    <span className="font-medium">Permitir Registro de Clubes</span>
                    <div className="text-sm text-gray-500">Los clubes pueden registrarse automáticamente</div>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.general.requireClubApproval}
                    onChange={(e) => handleInputChange('general', 'requireClubApproval', e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <div>
                    <span className="font-medium">Requiere Aprobación de Clubes</span>
                    <div className="text-sm text-gray-500">Los clubes deben ser aprobados manualmente</div>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.general.maintenanceMode}
                    onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                    className="rounded text-red-600"
                  />
                  <div>
                    <span className="font-medium text-red-600">Modo Mantenimiento</span>
                    <div className="text-sm text-gray-500">La plataforma estará en mantenimiento</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Configuración Financiera</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comisión por Defecto (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={formData.financial.minCommissionRate}
                    max={formData.financial.maxCommissionRate}
                    value={formData.financial.defaultCommissionRate}
                    onChange={(e) => handleInputChange('financial', 'defaultCommissionRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frecuencia de Pagos
                  </label>
                  <select
                    value={formData.financial.payoutFrequency}
                    onChange={(e) => handleInputChange('financial', 'payoutFrequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto Mínimo de Pago (MXN)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.financial.minPayoutAmount}
                    onChange={(e) => handleInputChange('financial', 'minPayoutAmount', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda
                  </label>
                  <select
                    value={formData.financial.currency}
                    onChange={(e) => handleInputChange('financial', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="MXN">Peso Mexicano (MXN)</option>
                    <option value="USD">Dólar Americano (USD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comisión Mínima (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.financial.minCommissionRate}
                    onChange={(e) => handleInputChange('financial', 'minCommissionRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comisión Máxima (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.financial.maxCommissionRate}
                    onChange={(e) => handleInputChange('financial', 'maxCommissionRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Funcionalidades</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(formData.features).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    enableWhatsAppNotifications: 'Notificaciones WhatsApp',
                    enableEmailNotifications: 'Notificaciones Email',
                    enableSplitPayments: 'Pagos Divididos',
                    enableWidgetBookings: 'Widget de Reservas',
                    enableMobileApp: 'Aplicación Móvil',
                    enableAnalytics: 'Analytics',
                    enableAdvancedReporting: 'Reportes Avanzados'
                  }
                  
                  return (
                    <label key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleInputChange('features', key, e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="font-medium">{labels[key]}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'limits' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Límites del Sistema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo Canchas por Club
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.limits.maxCourtsPerClub}
                    onChange={(e) => handleInputChange('limits', 'maxCourtsPerClub', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo Usuarios por Club
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.limits.maxUsersPerClub}
                    onChange={(e) => handleInputChange('limits', 'maxUsersPerClub', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo Reservas por Día
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.limits.maxBookingsPerDay}
                    onChange={(e) => handleInputChange('limits', 'maxBookingsPerDay', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días de Anticipación para Reservas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.limits.maxBookingDaysInAdvance}
                    onChange={(e) => handleInputChange('limits', 'maxBookingDaysInAdvance', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horas Límite para Cancelación
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.limits.maxCancellationHours}
                    onChange={(e) => handleInputChange('limits', 'maxCancellationHours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Configuración de Notificaciones</h3>
              
              <div className="space-y-4">
                {Object.entries(formData.notifications).map(([key, value]) => {
                  const labels: Record<string, { title: string; description: string }> = {
                    bookingConfirmation: { 
                      title: 'Confirmación de Reservas',
                      description: 'Enviar confirmación automática cuando se realiza una reserva'
                    },
                    paymentReminders: { 
                      title: 'Recordatorios de Pago',
                      description: 'Recordar a los usuarios sobre pagos pendientes'
                    },
                    cancellationNotices: { 
                      title: 'Avisos de Cancelación',
                      description: 'Notificar cancelaciones de reservas'
                    },
                    promotionalMessages: { 
                      title: 'Mensajes Promocionales',
                      description: 'Permitir envío de promociones y ofertas'
                    },
                    systemUpdates: { 
                      title: 'Actualizaciones del Sistema',
                      description: 'Notificar sobre mantenimientos y nuevas funciones'
                    }
                  }
                  
                  const label = labels[key]
                  
                  return (
                    <label key={key} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                        className="rounded text-blue-600 mt-1"
                      />
                      <div>
                        <span className="font-medium block">{label.title}</span>
                        <span className="text-sm text-gray-500">{label.description}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">Configuración de Seguridad</span>
                </div>
                <p className="text-sm text-red-700">
                  Los cambios en la configuración de seguridad afectarán a todos los usuarios del sistema.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de Sesión (horas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={formData.security.sessionTimeout}
                    onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo Intentos de Login
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={formData.security.maxLoginAttempts}
                    onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitud Mínima de Contraseña
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="20"
                    value={formData.security.passwordMinLength}
                    onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.security.requireTwoFactor}
                    onChange={(e) => handleInputChange('security', 'requireTwoFactor', e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <div>
                    <span className="font-medium">Requiere Autenticación de Dos Factores</span>
                    <div className="text-sm text-gray-500">Obligatorio para todos los usuarios</div>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.security.requirePasswordComplexity}
                    onChange={(e) => handleInputChange('security', 'requirePasswordComplexity', e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <div>
                    <span className="font-medium">Requiere Complejidad de Contraseña</span>
                    <div className="text-sm text-gray-500">Mayúsculas, minúsculas, números y símbolos</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Integraciones</h3>
              
              {/* Stripe */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Stripe</h4>
                    <p className="text-sm text-gray-500">Procesamiento de pagos</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.integrations.stripe.enabled}
                      onChange={(e) => handleNestedInputChange('integrations', 'stripe', 'enabled', e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="font-medium">Habilitado</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.integrations.stripe.testMode}
                      onChange={(e) => handleNestedInputChange('integrations', 'stripe', 'testMode', e.target.checked)}
                      className="rounded text-yellow-600"
                    />
                    <span className="font-medium">Modo de Pruebas</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL del Webhook
                    </label>
                    <input
                      type="url"
                      value={formData.integrations.stripe.webhookUrl}
                      onChange={(e) => handleNestedInputChange('integrations', 'stripe', 'webhookUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">WhatsApp</h4>
                    <p className="text-sm text-gray-500">Notificaciones por WhatsApp</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.integrations.whatsapp.enabled}
                      onChange={(e) => handleNestedInputChange('integrations', 'whatsapp', 'enabled', e.target.checked)}
                      className="rounded text-green-600"
                    />
                    <span className="font-medium">Habilitado</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Negocio
                    </label>
                    <input
                      type="tel"
                      value={formData.integrations.whatsapp.businessNumber}
                      onChange={(e) => handleNestedInputChange('integrations', 'whatsapp', 'businessNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proveedor
                    </label>
                    <select
                      value={formData.integrations.whatsapp.provider}
                      onChange={(e) => handleNestedInputChange('integrations', 'whatsapp', 'provider', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="twilio">Twilio</option>
                      <option value="whatsapp-business">WhatsApp Business API</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button Fixed */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600" />
            <span className="text-sm">Tienes cambios sin guardar</span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary btn-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}