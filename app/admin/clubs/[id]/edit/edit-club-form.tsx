'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Mail, Phone, Globe, Save, ArrowLeft, Loader2, Key, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface Club {
  id: string
  name: string
  slug: string | null
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  description: string | null
  website: string | null
  status: string
  active: boolean
  stripeOnboardingCompleted: boolean
  _count: {
    User: number
    Court: number
    Booking: number
  }
}

interface EditClubFormProps {
  club: Club
}

export default function EditClubForm({ club }: EditClubFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: club.name || '',
    slug: club.slug || '',
    email: club.email || '',
    phone: club.phone || '',
    address: club.address || '',
    city: club.city || '',
    state: club.state || '',
    zipCode: club.zipCode || '',
    country: club.country || '',
    description: club.description || '',
    website: club.website || '',
    status: club.status || 'PENDING',
    active: club.active ?? true
  })

  // Password reset state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

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

      const response = await fetch(`/api/admin/clubs/${club.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, slug })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar el club')
      }

      router.push('/admin/clubs')
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Error al actualizar el club')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handlePasswordReset = async () => {
    if (!newPassword) {
      setPasswordMessage('Por favor ingrese una nueva contraseña')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (!confirm(`¿Estás seguro de cambiar la contraseña para el club ${club.name}?`)) {
      return
    }

    setPasswordLoading(true)
    setPasswordMessage('')

    try {
      const response = await fetch(`/api/admin/clubs/${club.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword })
      })

      if (!response.ok) {
        throw new Error('Error al resetear la contraseña')
      }

      const data = await response.json()
      setPasswordMessage('✅ Contraseña actualizada exitosamente')
      setNewPassword('')
      setConfirmPassword('')

      // Mostrar información del usuario actualizado
      setTimeout(() => {
        alert(`✅ Contraseña actualizada\n\nEmail: ${data.userEmail}\nNueva contraseña: ${newPassword}`)
      }, 500)
    } catch (error) {
      setPasswordMessage('❌ Error al resetear la contraseña')
    } finally {
      setPasswordLoading(false)
    }
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL) *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="club-padel-test"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se generará automáticamente si lo dejas vacío
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
              placeholder="https://ejemplo.com"
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>


      {/* Cambio de Contraseña */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Key className="w-5 h-5 text-orange-600" />
          Cambiar Contraseña del Administrador
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Repite la contraseña"
            />
          </div>

          {passwordMessage && (
            <div className={`p-3 rounded-md ${
              passwordMessage.includes('✅')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {passwordMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={passwordLoading || !newPassword || !confirmPassword}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {passwordLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Key className="h-4 w-4" />
                Cambiar Contraseña
              </>
            )}
          </button>
        </div>
      </div>

      {/* Estado y Configuración */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-6">Estado y Configuración</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del Club
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="PENDING">Pendiente</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
              <option value="SUSPENDED">Suspendido</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
              Club Activo
            </label>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">Estadísticas</h3>
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-6 max-w-md">
              <div className="bg-gray-50 rounded-lg p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-blue-600">{club._count.Court}</div>
                <div className="text-xs text-gray-500 mt-1">Canchas</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-emerald-600">{club._count.User}</div>
                <div className="text-xs text-gray-500 mt-1">Usuarios</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-purple-600">{club._count.Booking}</div>
                <div className="text-xs text-gray-500 mt-1">Reservas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '24px',
        marginTop: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Link
            href="/admin/clubs"
            style={{
              padding: '12px 24px',
              color: '#374151',
              background: '#f3f4f6',
              borderRadius: '8px',
              fontWeight: '500',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Cancelar
          </Link>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 32px',
              background: loading ? '#9ca3af' : 'linear-gradient(to right, #10b981, #059669)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: '500',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
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
    </form>
  )
}