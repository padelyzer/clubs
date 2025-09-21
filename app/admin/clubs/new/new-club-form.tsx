'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Mail, Phone, Globe, Save, ArrowLeft, Loader2, User, Package } from 'lucide-react'
import Link from 'next/link'

export default function NewClubForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [packages, setPackages] = useState<any[]>([])
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    description: '',
    website: '',
    adminEmail: '',
    adminName: '',
    packageId: ''
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/packages')
      const data = await response.json()
      if (data.success) {
        setPackages(data.packages)
        // Seleccionar el paquete por defecto si existe
        const defaultPackage = data.packages.find((pkg: any) => pkg.isDefault)
        if (defaultPackage) {
          setSelectedPackage(defaultPackage.id)
          setFormData(prev => ({ ...prev, packageId: defaultPackage.id }))
        }
      }
    } catch (error) {
      console.error('Error loading packages:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Generar slug automáticamente si está vacío
      let slug = formData.slug
      if (!slug) {
        slug = formData.name
          .toLowerCase()
          .replace(/[áàäâ]/g, 'a')
          .replace(/[éèëê]/g, 'e')
          .replace(/[íìïî]/g, 'i')
          .replace(/[óòöô]/g, 'o')
          .replace(/[úùüû]/g, 'u')
          .replace(/ñ/g, 'n')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      }

      const response = await fetch('/api/admin/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, slug, packageId: selectedPackage || formData.packageId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Handle both error formats: { error: string } and { error: { message: string } }
        const errorMessage = typeof errorData.error === 'string' 
          ? errorData.error 
          : errorData.error?.message || 'Error al crear el club'
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Mostrar las credenciales del administrador
      if (data.adminCredentials) {
        alert(`✅ Club creado exitosamente!\n\n📧 Email del administrador: ${data.adminCredentials.email}\n🔑 Contraseña: ${data.adminCredentials.password}\n\n⚠️ ${data.adminCredentials.message}`)
      }
      
      // Redirigir a la lista de clubes
      router.push('/admin/clubs')
      router.refresh()
    } catch (error: any) {
      let errorMessage = 'Error al crear el club'
      if (error.message) {
        errorMessage = typeof error.message === 'string' 
          ? error.message 
          : JSON.stringify(error.message)
      }
      alert(errorMessage)
      console.error('Error creating club:', error)
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600" />
          Información del Club
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Club *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ej: Club Pádel Madrid"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL)
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="Se genera automáticamente"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Dejar vacío para generar automáticamente del nombre
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="contacto@clubpadel.com"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Teléfono *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+52 555 123 4567"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Sitio Web
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.clubpadel.com"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Breve descripción del club..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Selección de Paquete SaaS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-600" />
          Paquete de Suscripción
        </h2>
        
        <div className="space-y-4">
          {packages.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackage(pkg.id)
                      setFormData(prev => ({ ...prev, packageId: pkg.id }))
                    }}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      selectedPackage === pkg.id || formData.packageId === pkg.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {pkg.isDefault && (
                      <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                        Por defecto
                      </span>
                    )}
                    
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{pkg.displayName}</h3>
                        <p className="text-sm text-gray-500">{pkg.name}</p>
                      </div>
                      <input
                        type="radio"
                        name="packageId"
                        value={pkg.id}
                        checked={selectedPackage === pkg.id || formData.packageId === pkg.id}
                        onChange={() => {
                          setSelectedPackage(pkg.id)
                          setFormData(prev => ({ ...prev, packageId: pkg.id }))
                        }}
                        className="mt-1 text-purple-600 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div className="text-lg font-bold text-purple-600 mb-2">
                      ${(pkg.basePrice / 100).toFixed(2)} MXN/mes
                    </div>
                    
                    {pkg.description && (
                      <p className="text-xs text-gray-600 mb-3">{pkg.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm py-2">
                      <span className="text-gray-600">Máximo de canchas:</span>
                      <span className="font-semibold text-gray-900">
                        {pkg.maxCourts ? pkg.maxCourts : 'Ilimitadas'}
                      </span>
                    </div>
                    
                    {pkg.modules && pkg.modules.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-1">Módulos incluidos:</p>
                        <div className="flex flex-wrap gap-1">
                          {pkg.modules.filter((m: any) => m.isIncluded).map((m: any, index: number) => (
                            <span key={`${pkg.id}-module-${m.moduleId || index}`} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              {m.module?.name || m.moduleId}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {!selectedPackage && !formData.packageId && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Por favor selecciona un paquete de suscripción para el club
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Cargando paquetes disponibles...</p>
            </div>
          )}
        </div>
      </div>

      {/* Configuración del Administrador */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" />
          Usuario Administrador (Opcional)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Administrador
            </label>
            <input
              type="text"
              name="adminName"
              value={formData.adminName}
              onChange={handleChange}
              placeholder="Admin (por defecto)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email del Administrador
            </label>
            <input
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleChange}
              placeholder="Se generará automáticamente"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si no especifica, será: admin@[slug].com
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            💡 La contraseña por defecto será: <strong>admin123</strong>
          </p>
        </div>
      </div>


      {/* Botones de acción */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex justify-center items-center gap-4">
          <Link
            href="/admin/clubs"
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancelar
          </Link>
          
          <button
            type="submit"
            disabled={loading}
            className="px-12 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#9333ea',
              color: 'white',
              border: '1px solid #7c3aed',
              minWidth: '180px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7c3aed';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#9333ea';
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'white' }} />
                <span style={{ color: 'white' }}>Guardando...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save className="w-5 h-5" style={{ color: 'white', flexShrink: 0 }} />
                <span style={{ color: 'white' }}>Guardar</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}