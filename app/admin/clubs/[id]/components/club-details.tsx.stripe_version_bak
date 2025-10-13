'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  Calendar, 
  DollarSign,
  CheckCircle,
  XCircle,
  Ban,
  Edit,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  CreditCard,
  Clock
} from 'lucide-react'

interface Club {
  id: string
  name: string
  slug: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  website?: string
  description?: string
  status: string
  active: boolean
  stripeAccountId?: string
  stripeOnboardingCompleted: boolean
  stripePayoutsEnabled: boolean
  stripeChargesEnabled: boolean
  stripeCommissionRate: number
  createdAt: Date
  approvedAt?: Date
  users: Array<{
    id: string
    name: string
    email: string
    role: string
    active: boolean
    createdAt: Date
  }>
  courts: Array<{
    id: string
    name: string
    type: string
    indoor: boolean
    active: boolean
  }>
  bookings: Array<{
    id: string
    playerName: string
    date: Date
    startTime: string
    price: number
    status: string
    paymentStatus: string
    court: { name: string }
  }>
}

interface Stats {
  bookings: {
    month: number
    lastMonth: number
    total: number
    growth: number
  }
  revenue: {
    month: number
    lastMonth: number
    total: number
    growth: number
  }
  users: number
  courts: number
}

interface ClubDetailsProps {
  club: Club
  stats: Stats
}

export default function ClubDetails({ club, stats }: ClubDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Debug: Ver qué usuarios están llegando
  console.log('Club users:', club.users)
  console.log('Users count:', club.users.length)

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"
    switch (status) {
      case 'APPROVED':
        return `${baseClasses} bg-green-100 text-green-700`
      case 'REJECTED':
        return `${baseClasses} bg-red-100 text-red-700`
      case 'SUSPENDED':
        return `${baseClasses} bg-orange-100 text-orange-700`
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-700`
    }
  }

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: Building2 },
    { id: 'users', name: 'Usuarios', icon: Users },
    { id: 'bookings', name: 'Reservas', icon: Calendar },
    { id: 'settings', name: 'Configuración', icon: Edit }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/clubs" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{club.name}</h1>
          <p className="text-gray-600">{club.city}, {club.state}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={getStatusBadge(club.status)}>
            {club.status}
          </span>
          <Link href={`/admin/clubs/${club.id}/edit`} className="btn btn-primary">
            Editar Club
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Reservas del Mes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{stats.bookings.month}</span>
            <div className={`flex items-center gap-1 text-xs ${
              stats.bookings.growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.bookings.growth >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(stats.bookings.growth).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Ingresos del Mes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">${stats.revenue.month.toLocaleString('es-MX')}</span>
            <div className={`flex items-center gap-1 text-xs ${
              stats.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.revenue.growth >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(stats.revenue.growth).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Usuarios</span>
          </div>
          <span className="text-2xl font-bold">{stats.users}</span>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Canchas</span>
          </div>
          <span className="text-2xl font-bold">{stats.courts}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Club Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información del Club</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{club.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{club.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{club.address}</span>
                    </div>
                    {club.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {club.website}
                        </a>
                      </div>
                    )}
                  </div>
                  {club.description && (
                    <div>
                      <h4 className="font-medium mb-2">Descripción</h4>
                      <p className="text-gray-600">{club.description}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Estado de Stripe</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Onboarding Completo</span>
                      {club.stripeOnboardingCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Pagos Habilitados</span>
                      {club.stripeChargesEnabled ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Comisión</span>
                      <span className="font-medium">{(club.stripeCommissionRate / 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Courts */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Canchas ({club.courts.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {club.courts.map((court) => (
                    <div key={court.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{court.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          court.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {court.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {court.type} • {court.indoor ? 'Interior' : 'Exterior'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Usuarios del Club</h3>
                <span className="text-sm text-gray-500">{club.users.length} usuarios</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Usuario</th>
                      <th className="text-left py-3 px-4 font-medium">Rol</th>
                      <th className="text-center py-3 px-4 font-medium">Estado</th>
                      <th className="text-left py-3 px-4 font-medium">Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {club.users.length > 0 ? (
                      club.users.map((user) => (
                        <tr key={user.id}>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {user.active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('es-MX')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          No hay usuarios registrados en este club
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Reservas Recientes</h3>
                <Link href={`/admin/bookings?club=${club.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                  Ver todas
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Cliente</th>
                      <th className="text-left py-3 px-4 font-medium">Cancha</th>
                      <th className="text-left py-3 px-4 font-medium">Fecha</th>
                      <th className="text-center py-3 px-4 font-medium">Precio</th>
                      <th className="text-center py-3 px-4 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {club.bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="py-3 px-4 font-medium">{booking.playerName}</td>
                        <td className="py-3 px-4">{booking.court.name}</td>
                        <td className="py-3 px-4">
                          <div>
                            <div>{new Date(booking.date).toLocaleDateString('es-MX')}</div>
                            <div className="text-sm text-gray-500">{booking.startTime}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          ${(booking.price / 100).toFixed(0)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' :
                            booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {booking.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Acciones de Club</h3>
                  <div className="space-y-3">
                    {club.status === 'PENDING' && (
                      <>
                        <button className="w-full btn btn-success flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Aprobar Club
                        </button>
                        <button className="w-full btn btn-error flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Rechazar Club
                        </button>
                      </>
                    )}
                    {club.status === 'APPROVED' && (
                      <button className="w-full btn btn-warning flex items-center gap-2">
                        <Ban className="w-4 h-4" />
                        Suspender Club
                      </button>
                    )}
                    {club.status === 'SUSPENDED' && (
                      <button className="w-full btn btn-success flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Reactivar Club
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configuración de Comisiones</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comisión Actual
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={(club.stripeCommissionRate / 100).toFixed(2)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                    <button className="btn btn-primary">
                      Actualizar Comisión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}