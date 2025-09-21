'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2,
  Save,
  X,
  DollarSign,
  CheckCircle,
  Circle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react'
import PackageFormModal from './package-form-modal'

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
  module: Module
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
  _count?: {
    clubPackages: number
  }
  clubsCount?: number
}

export default function PackagesCRUD() {
  const [packages, setPackages] = useState<SaasPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<SaasPackage | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState<SaasPackage | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<boolean | null>(null)

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

  const handleDelete = async (packageId: string) => {
    if (!confirm('¿Estás seguro de que quieres desactivar este paquete?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        fetchPackages()
      } else {
        alert(data.error || 'Error al desactivar el paquete')
      }
    } catch (error) {
      console.error('Error deleting package:', error)
      alert('Error al desactivar el paquete')
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return `$${(price / 100).toLocaleString()} ${currency}`
  }

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterActive === null || pkg.isActive === filterActive
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar paquetes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive(filterActive === true ? null : true)}
                className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  filterActive === true 
                    ? 'bg-green-50 border-green-300 text-green-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Activos
              </button>
              <button
                onClick={() => setFilterActive(filterActive === false ? null : false)}
                className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  filterActive === false 
                    ? 'bg-red-50 border-red-300 text-red-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Inactivos
              </button>
            </div>
          </div>

          {/* Botón crear */}
          <button
            onClick={() => {
              setEditingPackage(null)
              setShowFormModal(true)
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nuevo Paquete
          </button>
        </div>
      </div>

      {/* Tabla de paquetes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paquete
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Base
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Límites
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Módulos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clubs
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {pkg.displayName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pkg.name}
                      </div>
                      {pkg.description && (
                        <div className="text-xs text-gray-400 mt-1">
                          {pkg.description}
                        </div>
                      )}
                      {pkg.isDefault && (
                        <span className="inline-flex px-2 py-1 mt-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                          Por defecto
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatPrice(pkg.basePrice, pkg.currency)}
                    </div>
                    <div className="text-xs text-gray-500">por mes</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-gray-500">Canchas:</span>
                        <span className="font-medium">{pkg.maxCourts || '∞'}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-gray-500">Usuarios:</span>
                        <span className="font-medium">{pkg.maxUsers || '∞'}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-gray-500">Reservas:</span>
                        <span className="font-medium">{pkg.maxBookingsMonth || '∞'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {pkg.modules.filter(m => m.isIncluded).length}
                        </span>
                      </div>
                      {pkg.modules.filter(m => m.isOptional && !m.isIncluded).length > 0 && (
                        <div className="flex items-center gap-1">
                          <Circle className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-500">
                            {pkg.modules.filter(m => m.isOptional && !m.isIncluded).length}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-gray-700">
                      {pkg.clubsCount || pkg._count?.clubPackages || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      pkg.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {pkg.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingPackage(pkg)
                          setShowFormModal(true)
                        }}
                        className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        disabled={(pkg.clubsCount || pkg._count?.clubPackages || 0) > 0}
                        className={`p-1.5 rounded transition-colors ${
                          (pkg.clubsCount || pkg._count?.clubPackages || 0) > 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title={(pkg.clubsCount || pkg._count?.clubPackages || 0) > 0 ? 'No se puede eliminar, tiene clubs asignados' : 'Desactivar'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPackages.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron paquetes</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulario */}
      {showFormModal && (
        <PackageFormModal
          package={editingPackage}
          onClose={() => {
            setShowFormModal(false)
            setEditingPackage(null)
          }}
          onSave={() => {
            setShowFormModal(false)
            setEditingPackage(null)
            fetchPackages()
          }}
        />
      )}
    </div>
  )
}