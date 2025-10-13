'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Eye,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  MoreHorizontal
} from 'lucide-react'

interface Booking {
  id: string
  playerName: string
  playerEmail?: string
  playerPhone: string
  date: Date
  startTime: string
  endTime: string
  duration: number
  price: number
  status: string
  paymentStatus: string
  paymentType: string
  totalPlayers: number
  notes?: string
  createdAt: Date
  club: {
    id: string
    name: string
    city: string
    state: string
  }
  court: {
    id: string
    name: string
    type: string
  }
}

interface Club {
  id: string
  name: string
  city: string
  state: string
}

interface Stats {
  total: number
  today: number
  week: number
  status: {
    pending: number
    confirmed: number
    completed: number
    cancelled: number
  }
  payment: {
    pending: number
    completed: number
    failed: number
  }
  revenue: number
}

interface Filters {
  status: string
  paymentStatus: string
  club: string
  search: string
  dateFrom: string
  dateTo: string
}

interface BookingsMonitorProps {
  bookings: Booking[]
  clubs: Club[]
  stats: Stats
  currentPage: number
  totalPages: number
  filters: Filters
}

export default function BookingsMonitor({
  bookings,
  clubs,
  stats,
  currentPage,
  totalPages,
  filters
}: BookingsMonitorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(filters.search)
  const [dateFrom, setDateFrom] = useState(filters.dateFrom)
  const [dateTo, setDateTo] = useState(filters.dateTo)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    if (dateFrom) {
      params.set('dateFrom', dateFrom)
    } else {
      params.delete('dateFrom')
    }
    if (dateTo) {
      params.set('dateTo', dateTo)
    } else {
      params.delete('dateTo')
    }
    params.delete('page')
    router.push(`/admin/bookings?${params.toString()}`)
  }

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`/admin/bookings?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`/admin/bookings?${params.toString()}`)
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'CONFIRMED':
        return `${baseClasses} bg-green-100 text-green-700`
      case 'COMPLETED':
        return `${baseClasses} bg-blue-100 text-blue-700`
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-700`
      case 'NO_SHOW':
        return `${baseClasses} bg-orange-100 text-orange-700`
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-700`
    }
  }

  const getPaymentBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-700`
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-700`
      case 'cancelled':
        return `${baseClasses} bg-gray-100 text-gray-700`
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-700`
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{stats.today}</div>
          <div className="text-sm text-gray-600">Hoy</div>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{stats.week}</div>
          <div className="text-sm text-gray-600">Esta Semana</div>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{stats.status.pending}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{stats.status.confirmed}</div>
          <div className="text-sm text-gray-600">Confirmadas</div>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{stats.status.completed}</div>
          <div className="text-sm text-gray-600">Completadas</div>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{stats.status.cancelled}</div>
          <div className="text-sm text-gray-600">Canceladas</div>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-green-600">${stats.revenue.toLocaleString('es-MX')}</div>
          <div className="text-sm text-gray-600">Ingresos</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filters.club}
              onChange={(e) => handleFilter('club', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los clubes</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} - {club.city}
                </option>
              ))}
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilter('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
              <option value="no_show">No Show</option>
            </select>
            
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilter('paymentStatus', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los pagos</option>
              <option value="pending">Pago Pendiente</option>
              <option value="completed">Pago Completado</option>
              <option value="failed">Pago Fallido</option>
              <option value="cancelled">Pago Cancelado</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-end gap-2">
              <button type="submit" className="btn btn-primary flex-1">
                Buscar
              </button>
              <button type="button" className="btn btn-success">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Cliente</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Club & Cancha</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Fecha & Hora</th>
                <th className="text-center py-3 px-6 font-medium text-gray-900">Precio</th>
                <th className="text-center py-3 px-6 font-medium text-gray-900">Estado</th>
                <th className="text-center py-3 px-6 font-medium text-gray-900">Pago</th>
                <th className="text-center py-3 px-6 font-medium text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{booking.playerName}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        {booking.playerEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {booking.playerEmail}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {booking.playerPhone}
                      </div>
                      <div className="text-xs text-gray-400">
                        {booking.totalPlayers} jugadores
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{booking.club.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {booking.club.city}, {booking.club.state}
                      </div>
                      <div className="text-sm text-blue-600">{booking.court.name}</div>
                      <div className="text-xs text-gray-400">{booking.court.type}</div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(booking.date).toLocaleDateString('es-MX')}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="text-xs text-gray-400">
                        {booking.duration} minutos
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6 text-center">
                    <div className="font-medium text-gray-900 flex items-center justify-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {(booking.price / 100).toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500">{booking.paymentType}</div>
                  </td>
                  
                  <td className="py-4 px-6 text-center">
                    <span className={getStatusBadge(booking.status)}>
                      {booking.status}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6 text-center">
                    <span className={getPaymentBadge(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <Link 
                        href={`/admin/bookings/${booking.id}`}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                          <MoreHorizontal className="w-4 h-4" />
                        </label>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          {booking.status === 'PENDING' && (
                            <li>
                              <button className="text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                Confirmar
                              </button>
                            </li>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <li>
                              <button className="text-blue-600">
                                <CheckCircle className="w-4 h-4" />
                                Marcar Completada
                              </button>
                            </li>
                          )}
                          {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                            <li>
                              <button className="text-red-600">
                                <X className="w-4 h-4" />
                                Cancelar
                              </button>
                            </li>
                          )}
                          <li>
                            <button className="text-purple-600">
                              <Edit className="w-4 h-4" />
                              Editar
                            </button>
                          </li>
                          <li>
                            <button className="text-orange-600">
                              <AlertCircle className="w-4 h-4" />
                              Reportar Problema
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-sm btn-ghost"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-sm btn-ghost"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}