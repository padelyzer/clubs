'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Save, 
  X, 
  AlertCircle,
  Building2,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  Circle,
  Minus,
  Plus
} from 'lucide-react'

interface Module {
  id: string
  code: string
  name: string
  description: string | null
  basePrice: number
  isActive: boolean
}

interface PackageModule {
  moduleId: string
  module?: Module
  isIncluded: boolean
  isOptional: boolean
  priceOverride: number | null
}

interface SaasPackage {
  id: string
  name: string
  displayName: string
  description: string | null
  basePrice: number
  currency: string
  isActive: boolean
  isDefault: boolean
  maxCourts: number | null
  maxUsers: number | null
  maxBookingsMonth: number | null
  sortOrder: number
  modules: PackageModule[]
}

interface Props {
  package: SaasPackage | null
  onClose: () => void
  onSave: () => void
}

export default function PackageFormModal({ package: editingPackage, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    basePrice: 0,
    currency: 'MXN',
    isActive: true,
    isDefault: false,
    maxCourts: null as number | null,
    maxUsers: null as number | null,
    maxBookingsMonth: null as number | null,
    sortOrder: 0,
    modules: [] as PackageModule[]
  })
  
  const [availableModules, setAvailableModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAvailableModules()
    
    if (editingPackage) {
      // Modo edición - no establecer módulos aquí, se manejan en fetchAvailableModules
      setFormData({
        name: editingPackage.name,
        displayName: editingPackage.displayName,
        description: editingPackage.description || '',
        basePrice: editingPackage.basePrice / 100, // Convertir de centavos a pesos
        currency: editingPackage.currency,
        isActive: editingPackage.isActive ?? true,
        isDefault: editingPackage.isDefault ?? false,
        maxCourts: editingPackage.maxCourts,
        maxUsers: editingPackage.maxUsers,
        maxBookingsMonth: editingPackage.maxBookingsMonth,
        sortOrder: editingPackage.sortOrder || 0,
        modules: [] // Se establecerán en fetchAvailableModules
      })
    }
  }, [editingPackage])

  const fetchAvailableModules = async () => {
    try {
      const response = await fetch('/api/admin/modules')
      const data = await response.json()
      
      if (data.success) {
        setAvailableModules(data.modules)
        
        // Inicializar o actualizar módulos
        if (!editingPackage) {
          // Si es nuevo paquete, inicializar todos los módulos
          setFormData(prev => ({
            ...prev,
            modules: data.modules.map((m: Module) => ({
              moduleId: m.id,
              isIncluded: false,
              isOptional: false,
              priceOverride: null as number | null
            }))
          }))
        } else {
          // Si estamos editando, combinar módulos existentes con todos los disponibles
          const existingModulesMap = new Map(
            editingPackage.modules.map(m => [m.moduleId, m])
          )
          
          setFormData(prev => ({
            ...prev,
            modules: data.modules.map((m: Module) => {
              const existing = existingModulesMap.get(m.id)
              return {
                moduleId: m.id,
                isIncluded: existing?.isIncluded || false,
                isOptional: existing?.isOptional || false,
                priceOverride: existing?.priceOverride || null
              }
            })
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching modules:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      // Validaciones
      if (!formData.name || !formData.displayName) {
        setError('El nombre es requerido')
        setSaving(false)
        return
      }

      if (formData.basePrice < 0) {
        setError('El precio base debe ser mayor o igual a 0')
        setSaving(false)
        return
      }

      const url = editingPackage 
        ? `/api/admin/packages/${editingPackage.id}`
        : '/api/admin/packages'
      
      const method = editingPackage ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          basePrice: Math.round(formData.basePrice * 100) // Convertir a centavos
        })
      })

      const data = await response.json()
      
      if (data.success) {
        onSave()
      } else {
        setError(data.error || 'Error al guardar el paquete')
      }
    } catch (error) {
      console.error('Error saving package:', error)
      setError('Error al guardar el paquete')
    } finally {
      setSaving(false)
    }
  }

  const updateModuleStatus = (moduleId: string, field: 'isIncluded' | 'isOptional', value: boolean) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m.moduleId === moduleId) {
          const updated = { ...m, [field]: value }
          // Si se marca como incluido, no puede ser opcional
          if (field === 'isIncluded' && value) {
            updated.isOptional = false
            updated.priceOverride = null
          }
          // Si se marca como opcional, no puede estar incluido
          if (field === 'isOptional' && value) {
            updated.isIncluded = false
          }
          return updated
        }
        return m
      })
    }))
  }

  const updateModulePrice = (moduleId: string, price: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.moduleId === moduleId 
          ? { ...m, priceOverride: price ? Math.round(parseFloat(price) * 100) : null }
          : m
      )
    }))
  }

  const getModule = (moduleId: string) => {
    return availableModules.find(m => m.id === moduleId)
  }

  const generateSlug = (displayName: string) => {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '1280px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                {editingPackage ? 'Editar Paquete' : 'Crear Nuevo Paquete'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Información básica */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Información Básica
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre para mostrar *
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        displayName: e.target.value,
                        name: generateSlug(e.target.value)
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Identificador (slug) *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    pattern="[a-z0-9-]+"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Solo letras minúsculas, números y guiones</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio mensual base *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="number"
                      value={formData.basePrice || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        basePrice: parseFloat(e.target.value) || 0
                      })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ paddingLeft: '36px' }}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orden de visualización
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder || 0}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      sortOrder: e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Descripción del paquete..."
                />
              </div>

              <div className="mt-4 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Paquete activo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault ?? false}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Paquete por defecto</span>
                </label>
              </div>
            </div>

            {/* Límites */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Límites del Paquete
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building2 className="inline w-4 h-4 mr-1" />
                    Máximo de canchas
                  </label>
                  <input
                    type="number"
                    value={formData.maxCourts || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      maxCourts: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ilimitado"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="inline w-4 h-4 mr-1" />
                    Máximo de usuarios
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsers || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      maxUsers: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ilimitado"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Máximo reservas/mes
                  </label>
                  <input
                    type="number"
                    value={formData.maxBookingsMonth || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      maxBookingsMonth: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ilimitado"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Módulos */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Módulos del Paquete
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Instrucciones:</strong> Haz clic en los íconos para configurar cada módulo:
                </p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1">
                  <li>• <strong>Círculo verde (✓)</strong>: Módulo incluido en el precio base</li>
                  <li>• <strong>Círculo amarillo (+)</strong>: Módulo opcional con precio adicional</li>
                  <li>• <strong>Círculo gris (-)</strong>: Módulo no disponible</li>
                </ul>
              </div>
              <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase">
                        Módulo
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-purple-700 uppercase">
                        ✓ Incluido
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-purple-700 uppercase">
                        + Opcional
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-purple-700 uppercase">
                        💰 Precio Opcional (MXN)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.modules.map((moduleConfig) => {
                      const module = getModule(moduleConfig.moduleId)
                      if (!module) return null
                      
                      return (
                        <tr key={module.id} style={{ transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{module.name}</div>
                              <div className="text-sm text-gray-500">Código: {module.code}</div>
                              {module.description && (
                                <div className="text-xs text-gray-400 mt-1">{module.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => updateModuleStatus(module.id, 'isIncluded', !moduleConfig.isIncluded)}
                              style={{
                                padding: '12px',
                                borderRadius: '8px',
                                transition: 'all 0.3s',
                                transform: 'scale(1)',
                                backgroundColor: moduleConfig.isIncluded ? '#10b981' : '#e5e7eb',
                                color: moduleConfig.isIncluded ? 'white' : '#6b7280',
                                boxShadow: moduleConfig.isIncluded ? '0 4px 6px rgba(16, 185, 129, 0.3)' : 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)'
                                e.currentTarget.style.backgroundColor = moduleConfig.isIncluded ? '#059669' : '#d1d5db'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'
                                e.currentTarget.style.backgroundColor = moduleConfig.isIncluded ? '#10b981' : '#e5e7eb'
                              }}
                              title={moduleConfig.isIncluded ? 'Módulo incluido - Click para quitar' : 'Click para incluir módulo'}
                            >
                              {moduleConfig.isIncluded ? (
                                <CheckCircle className="w-6 h-6" style={{ display: 'block' }} />
                              ) : (
                                <Circle className="w-6 h-6" style={{ display: 'block' }} />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => updateModuleStatus(module.id, 'isOptional', !moduleConfig.isOptional)}
                              disabled={moduleConfig.isIncluded}
                              style={{
                                padding: '12px',
                                borderRadius: '8px',
                                transition: 'all 0.3s',
                                transform: 'scale(1)',
                                backgroundColor: moduleConfig.isOptional ? '#eab308' : '#e5e7eb',
                                color: moduleConfig.isOptional ? 'white' : '#6b7280',
                                boxShadow: moduleConfig.isOptional ? '0 4px 6px rgba(234, 179, 8, 0.3)' : 'none',
                                border: 'none',
                                cursor: moduleConfig.isIncluded ? 'not-allowed' : 'pointer',
                                opacity: moduleConfig.isIncluded ? 0.3 : 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                if (!moduleConfig.isIncluded) {
                                  e.currentTarget.style.transform = 'scale(1.1)'
                                  e.currentTarget.style.backgroundColor = moduleConfig.isOptional ? '#ca8a04' : '#d1d5db'
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!moduleConfig.isIncluded) {
                                  e.currentTarget.style.transform = 'scale(1)'
                                  e.currentTarget.style.backgroundColor = moduleConfig.isOptional ? '#eab308' : '#e5e7eb'
                                }
                              }}
                              title={moduleConfig.isIncluded ? 'No disponible cuando está incluido' : (moduleConfig.isOptional ? 'Módulo opcional - Click para quitar' : 'Click para hacer opcional')}
                            >
                              {moduleConfig.isOptional ? (
                                <Plus className="w-6 h-6" style={{ display: 'block' }} />
                              ) : (
                                <Minus className="w-6 h-6" style={{ display: 'block' }} />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={moduleConfig.priceOverride ? moduleConfig.priceOverride / 100 : ''}
                              onChange={(e) => updateModulePrice(module.id, e.target.value)}
                              disabled={!moduleConfig.isOptional || moduleConfig.isIncluded}
                              className={`w-full px-3 py-1.5 border rounded-lg text-sm ${
                                !moduleConfig.isOptional || moduleConfig.isIncluded
                                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                  : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500'
                              }`}
                              placeholder="Precio base"
                              min="0"
                              step="0.01"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>• <strong>Incluido</strong>: El módulo viene incluido en el precio base del paquete</p>
                <p>• <strong>Opcional</strong>: El módulo puede ser contratado adicionalmente con precio extra</p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              style={{ backgroundColor: '#9333ea', color: 'white' }}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingPackage ? 'Guardar Cambios' : 'Crear Paquete'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}