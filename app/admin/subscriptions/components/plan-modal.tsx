'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  Save, 
  DollarSign, 
  Users, 
  Building2, 
  Calendar, 
  Target, 
  Percent,
  Plus,
  Minus,
  Crown,
  Zap
} from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  displayName: string
  description: string | null
  price: number
  currency: string
  interval: string
  features: any
  maxClubs: number | null
  maxUsers: number | null
  maxCourts: number | null
  maxBookings: number | null
  commissionRate: number
  isActive: boolean
  sortOrder: number
}

interface PlanModalProps {
  plan?: SubscriptionPlan | null
  onClose: () => void
  onSave: () => void
}

export default function PlanModal({ plan, onClose, onSave }: PlanModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    price: 0,
    currency: 'MXN',
    interval: 'month',
    maxClubs: null as number | null,
    maxUsers: null as number | null,
    maxCourts: null as number | null,
    maxBookings: null as number | null,
    commissionRate: 250,
    isActive: true,
    sortOrder: 0,
    features: {
      dashboard: true,
      bookingManagement: true,
      customerSupport: false,
      analytics: false,
      multiLocation: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      advancedReports: false,
      whiteLabel: false
    }
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description || '',
        price: plan.price,
        currency: plan.currency,
        interval: plan.interval,
        maxClubs: plan.maxClubs,
        maxUsers: plan.maxUsers,
        maxCourts: plan.maxCourts,
        maxBookings: plan.maxBookings,
        commissionRate: plan.commissionRate,
        isActive: plan.isActive,
        sortOrder: plan.sortOrder,
        features: plan.features || {
          dashboard: true,
          bookingManagement: true,
          customerSupport: false,
          analytics: false,
          multiLocation: false,
          customBranding: false,
          apiAccess: false,
          prioritySupport: false,
          advancedReports: false,
          whiteLabel: false
        }
      })
    }
  }, [plan])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre interno es requerido'
    }
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'El nombre de display es requerido'
    }
    if (formData.price < 0) {
      newErrors.price = 'El precio debe ser mayor o igual a 0'
    }
    if (formData.commissionRate < 0 || formData.commissionRate > 10000) {
      newErrors.commissionRate = 'La comisión debe estar entre 0% y 100%'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    
    try {
      const url = plan 
        ? `/api/admin/subscription-plans/${plan.id}` 
        : '/api/admin/subscription-plans'
      
      const response = await fetch(url, {
        method: plan ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Error al guardar el plan')
      }

      onSave()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar el plan')
    } finally {
      setSaving(false)
    }
  }

  const featureLabels = {
    dashboard: 'Panel de Control',
    bookingManagement: 'Gestión de Reservas',
    customerSupport: 'Soporte al Cliente',
    analytics: 'Analíticas Básicas',
    multiLocation: 'Multi-ubicación',
    customBranding: 'Branding Personalizado',
    apiAccess: 'Acceso API',
    prioritySupport: 'Soporte Prioritario',
    advancedReports: 'Reportes Avanzados',
    whiteLabel: 'White Label'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
              <Crown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {plan ? 'Editar Plan' : 'Crear Nuevo Plan'}
              </h2>
              <p className="text-sm text-gray-600">
                {plan ? 'Modifica los detalles del plan de suscripción' : 'Crea un nuevo plan de suscripción'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Interno *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="ej: basico, profesional, empresarial"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Display *
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.displayName ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="ej: Plan Básico, Plan Profesional"
                  />
                  {errors.displayName && <p className="text-red-600 text-sm mt-1">{errors.displayName}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción del plan..."
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Precios y Comisiones
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (en centavos) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.price ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="ej: 99900 = $999.00 MXN"
                  />
                  {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                  <p className="text-sm text-gray-600 mt-1">
                    Equivale a: ${(formData.price / 100).toFixed(2)} {formData.currency}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="MXN">Peso Mexicano (MXN)</option>
                    <option value="USD">Dólar Americano (USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intervalo
                  </label>
                  <select
                    value={formData.interval}
                    onChange={(e) => handleInputChange('interval', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="month">Mensual</option>
                    <option value="year">Anual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comisión (en puntos básicos) *
                  </label>
                  <input
                    type="number"
                    value={formData.commissionRate}
                    onChange={(e) => handleInputChange('commissionRate', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.commissionRate ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="ej: 250 = 2.5%"
                  />
                  {errors.commissionRate && <p className="text-red-600 text-sm mt-1">{errors.commissionRate}</p>}
                  <p className="text-sm text-gray-600 mt-1">
                    Equivale a: {(formData.commissionRate / 100).toFixed(2)}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orden de Display
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Limits */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Límites del Plan
              </h3>
              <p className="text-sm text-gray-600 mb-4">Deja en blanco para ilimitado</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Clubs Máximos
                  </label>
                  <input
                    type="number"
                    value={formData.maxClubs || ''}
                    onChange={(e) => handleInputChange('maxClubs', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ilimitado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Usuarios por Club
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsers || ''}
                    onChange={(e) => handleInputChange('maxUsers', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ilimitado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Canchas por Club
                  </label>
                  <input
                    type="number"
                    value={formData.maxCourts || ''}
                    onChange={(e) => handleInputChange('maxCourts', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ilimitado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Reservas Mensuales
                  </label>
                  <input
                    type="number"
                    value={formData.maxBookings || ''}
                    onChange={(e) => handleInputChange('maxBookings', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ilimitado"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Características del Plan
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(featureLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <button
                      type="button"
                      onClick={() => handleFeatureToggle(key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        formData.features[key] ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          formData.features[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Plan</h3>
              
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div>
                  <span className="text-sm font-medium text-gray-700">Plan Activo</span>
                  <p className="text-xs text-gray-500">Los usuarios podrán suscribirse a este plan</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('isActive', !formData.isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    formData.isActive ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {plan ? 'Actualizar Plan' : 'Crear Plan'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}