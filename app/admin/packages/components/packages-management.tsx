'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Plus, 
  Edit3, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Circle, 
  Settings,
  Building2,
  Activity,
  Calendar,
  User
} from 'lucide-react'
import PackageEditModal from './package-edit-modal'

interface PackageModule {
  moduleCode: string
  moduleName: string
  moduleDescription: string | null
  isIncluded: boolean
  isOptional: boolean
  priceOverride: number | null
}

interface Package {
  id: string
  name: string
  displayName: string
  description: string | null
  basePrice: number
  currency: string
  isDefault: boolean
  limits: {
    maxCourts: number | null
    maxUsers: number | null
    maxBookingsMonth: number | null
  }
  modules: PackageModule[]
  clubsCount: number
}

export default function PackagesManagement() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/packages')
      const data = await response.json()
      
      if (data.success) {
        setPackages(data.packages)
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return `$${(price / 100).toFixed(2)} ${currency}`
  }

  const getModuleIcon = (moduleCode: string) => {
    const icons = {
      bookings: Calendar,
      customers: User,
      tournaments: Activity,
      classes: Settings,
      finance: DollarSign
    }
    return icons[moduleCode as keyof typeof icons] || Package
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con botón crear */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">Paquetes Disponibles</h2>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Crear Paquete
        </button>
      </div>

      {/* Grid de paquetes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
              pkg.isDefault 
                ? 'border-purple-300 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-200'
            }`}
            onClick={() => setSelectedPackage(pkg)}
          >
            {/* Header del paquete */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {pkg.displayName}
                    </h3>
                    {pkg.isDefault && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                        Por defecto
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {pkg.description || 'Sin descripción'}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {formatPrice(pkg.basePrice, pkg.currency)}
                  </div>
                  <div className="text-xs text-gray-500">por mes</div>
                </div>
              </div>
            </div>

            {/* Límites del paquete */}
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <Building2 className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <div className="text-xs text-gray-500">Canchas</div>
                  <div className="text-sm font-medium">
                    {pkg.limits.maxCourts || '∞'}
                  </div>
                </div>
                <div>
                  <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <div className="text-xs text-gray-500">Usuarios</div>
                  <div className="text-sm font-medium">
                    {pkg.limits.maxUsers || '∞'}
                  </div>
                </div>
                <div>
                  <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <div className="text-xs text-gray-500">Reservas/mes</div>
                  <div className="text-sm font-medium">
                    {pkg.limits.maxBookingsMonth || '∞'}
                  </div>
                </div>
              </div>
            </div>

            {/* Módulos */}
            <div className="p-4">
              <div className="text-xs font-medium text-gray-500 mb-3">
                MÓDULOS INCLUIDOS
              </div>
              <div className="space-y-2">
                {pkg.modules.filter(m => m.isIncluded).map((module) => {
                  const IconComponent = getModuleIcon(module.moduleCode)
                  return (
                    <div key={module.moduleCode} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <IconComponent className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{module.moduleName}</span>
                    </div>
                  )
                })}
                
                {pkg.modules.filter(m => m.isOptional && !m.isIncluded).map((module) => {
                  const IconComponent = getModuleIcon(module.moduleCode)
                  return (
                    <div key={module.moduleCode} className="flex items-center gap-2">
                      <Circle className="w-4 h-4 text-gray-400" />
                      <IconComponent className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{module.moduleName}</span>
                      <span className="text-xs text-gray-400">(opcional)</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer con estadísticas */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{pkg.clubsCount} clubes</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.location.href = '/admin/packages/crud'}
                    className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Editar paquete"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setSelectedPackage(pkg)}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Ver detalles →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalles del paquete */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedPackage.displayName}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {selectedPackage.description || 'Sin descripción'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPackage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información del paquete */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Precio mensual</label>
                  <div className="text-lg font-semibold">
                    {formatPrice(selectedPackage.basePrice, selectedPackage.currency)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Clubes asignados</label>
                  <div className="text-lg font-semibold">{selectedPackage.clubsCount}</div>
                </div>
              </div>

              {/* Límites */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Límites del paquete</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-500">Máx. canchas</div>
                    <div className="font-semibold">
                      {selectedPackage.limits.maxCourts || 'Ilimitado'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-500">Máx. usuarios</div>
                    <div className="font-semibold">
                      {selectedPackage.limits.maxUsers || 'Ilimitado'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-500">Máx. reservas/mes</div>
                    <div className="font-semibold">
                      {selectedPackage.limits.maxBookingsMonth || 'Ilimitado'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Módulos detallados */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Módulos del paquete</h4>
                <div className="space-y-3">
                  {selectedPackage.modules.map((module) => {
                    const IconComponent = getModuleIcon(module.moduleCode)
                    return (
                      <div
                        key={module.moduleCode}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {module.moduleName}
                            </div>
                            {module.moduleDescription && (
                              <div className="text-sm text-gray-500">
                                {module.moduleDescription}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {module.isIncluded ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Incluido
                            </span>
                          ) : module.isOptional ? (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                              Opcional
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              No incluido
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-4 border-t">
                <button 
                  onClick={() => {
                    setEditingPackageId(selectedPackage.id)
                    setSelectedPackage(null)
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar Paquete
                </button>
                <button 
                  onClick={() => setSelectedPackage(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {editingPackageId && (
        <PackageEditModal
          packageId={editingPackageId}
          onClose={() => setEditingPackageId(null)}
          onSave={() => {
            setEditingPackageId(null)
            fetchPackages() // Recargar paquetes después de guardar
          }}
        />
      )}
    </div>
  )
}