'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Edit3, 
  Save, 
  X, 
  AlertCircle,
  Building2,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  Circle
} from 'lucide-react'

interface PackageModule {
  moduleId: string
  moduleCode: string
  moduleName: string
  isIncluded: boolean
  isOptional: boolean
  priceOverride: number | null
}

interface EditablePackage {
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
  modules: PackageModule[]
}

interface Props {
  packageId: string
  onClose: () => void
  onSave: () => void
}

export default function PackageEditModal({ packageId, onClose, onSave }: Props) {
  const [packageData, setPackageData] = useState<EditablePackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [availableModules, setAvailableModules] = useState<any[]>([])

  useEffect(() => {
    fetchPackageDetails()
    fetchAvailableModules()
  }, [packageId])

  const fetchPackageDetails = async () => {
    try {
      const response = await fetch(`/api/admin/packages/${packageId}`)
      const data = await response.json()
      
      if (data.success && data.package) {
        const pkg = data.package
        setPackageData({
          id: pkg.id,
          name: pkg.name,
          displayName: pkg.displayName,
          description: pkg.description,
          basePrice: pkg.basePrice,
          currency: pkg.currency,
          isActive: pkg.isActive,
          isDefault: pkg.isDefault,
          maxCourts: pkg.maxCourts,
          maxUsers: pkg.maxUsers,
          maxBookingsMonth: pkg.maxBookingsMonth,
          modules: pkg.modules.map((m: any) => ({
            moduleId: m.moduleId,
            moduleCode: m.module.code,
            moduleName: m.module.name,
            isIncluded: m.isIncluded,
            isOptional: m.isOptional,
            priceOverride: m.priceOverride
          }))
        })
      }
    } catch (error) {
      console.error('Error fetching package details:', error)
      setError('Error al cargar los detalles del paquete')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableModules = async () => {
    try {
      const response = await fetch('/api/admin/modules')
      const data = await response.json()
      
      if (data.success) {
        setAvailableModules(data.modules)
      }
    } catch (error) {
      console.error('Error fetching modules:', error)
    }
  }

  const handleSave = async () => {
    if (!packageData) return
    
    setSaving(true)
    setError('')
    
    try {
      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: packageData.displayName,
          description: packageData.description,
          basePrice: packageData.basePrice,
          maxCourts: packageData.maxCourts,
          maxUsers: packageData.maxUsers,
          maxBookingsMonth: packageData.maxBookingsMonth,
          isActive: packageData.isActive,
          modules: packageData.modules
        })
      })

      const data = await response.json()
      
      if (data.success) {
        onSave()
        onClose()
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

  const toggleModuleInclusion = (moduleId: string, field: 'isIncluded' | 'isOptional') => {
    if (!packageData) return
    
    setPackageData({
      ...packageData,
      modules: packageData.modules.map(m => 
        m.moduleId === moduleId 
          ? { ...m, [field]: !m[field] }
          : m
      )
    })
  }

  const updateModulePrice = (moduleId: string, price: string) => {
    if (!packageData) return
    
    setPackageData({
      ...packageData,
      modules: packageData.modules.map(m => 
        m.moduleId === moduleId 
          ? { ...m, priceOverride: price ? parseInt(price) * 100 : null }
          : m
      )
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  if (!packageData) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit3 className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                Editar Paquete: {packageData.name}
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
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Información básica */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Información Básica</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre para mostrar
                  </label>
                  <input
                    type="text"
                    value={packageData.displayName}
                    onChange={(e) => setPackageData({ ...packageData, displayName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio mensual (MXN)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={packageData.basePrice / 100}
                      onChange={(e) => setPackageData({ 
                        ...packageData, 
                        basePrice: parseInt(e.target.value) * 100 
                      })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={packageData.description || ''}
                  onChange={(e) => setPackageData({ ...packageData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Descripción del paquete..."
                />
              </div>

              <div className="mt-4 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={packageData.isActive}
                    onChange={(e) => setPackageData({ ...packageData, isActive: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Paquete activo</span>
                </label>
              </div>
            </div>

            {/* Límites */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Límites del Paquete</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building2 className="inline w-4 h-4 mr-1" />
                    Máximo de canchas
                  </label>
                  <input
                    type="number"
                    value={packageData.maxCourts || ''}
                    onChange={(e) => setPackageData({ 
                      ...packageData, 
                      maxCourts: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ilimitado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="inline w-4 h-4 mr-1" />
                    Máximo de usuarios
                  </label>
                  <input
                    type="number"
                    value={packageData.maxUsers || ''}
                    onChange={(e) => setPackageData({ 
                      ...packageData, 
                      maxUsers: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ilimitado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Máximo reservas/mes
                  </label>
                  <input
                    type="number"
                    value={packageData.maxBookingsMonth || ''}
                    onChange={(e) => setPackageData({ 
                      ...packageData, 
                      maxBookingsMonth: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ilimitado"
                  />
                </div>
              </div>
            </div>

            {/* Módulos */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Módulos del Paquete</h4>
              <div className="space-y-3">
                {packageData.modules.map((module) => (
                  <div
                    key={module.moduleId}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium text-gray-900">{module.moduleName}</div>
                          <div className="text-sm text-gray-500">Código: {module.moduleCode}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={module.isIncluded}
                            onChange={() => toggleModuleInclusion(module.moduleId, 'isIncluded')}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm">Incluido</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={module.isOptional}
                            onChange={() => toggleModuleInclusion(module.moduleId, 'isOptional')}
                            disabled={module.isIncluded}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50"
                          />
                          <span className="text-sm">Opcional</span>
                        </label>

                        {module.isOptional && !module.isIncluded && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Precio:</span>
                            <input
                              type="number"
                              value={module.priceOverride ? module.priceOverride / 100 : ''}
                              onChange={(e) => updateModulePrice(module.moduleId, e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="MXN"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}