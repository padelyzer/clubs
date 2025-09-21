'use client'

import { useEffect, useState } from 'react'

interface PaymentStats {
  totalEarnings: number
  thisMonth: number
  thisWeek: number
  pendingPayouts: number
  completedBookings: number
  pendingBookings: number
  averageBookingValue: number
  conversionRate: number
}

interface PaymentStatsProps {
  clubId: string
}

export default function PaymentStats({ clubId }: PaymentStatsProps) {
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    fetchStats()
  }, [clubId, timeRange])

  const fetchStats = async () => {
    try {
      setLoading(true)
      // Mock data for now - in real implementation, fetch from API
      const mockStats: PaymentStats = {
        totalEarnings: 125000,
        thisMonth: 28500,
        thisWeek: 7200,
        pendingPayouts: 3400,
        completedBookings: 87,
        pendingBookings: 12,
        averageBookingValue: 32750, // 327.50 MXN in cents
        conversionRate: 78.5,
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching payment stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(cents / 100)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="ml-5 flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se pudieron cargar las estadísticas</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Estadísticas de Pagos</h2>
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
              timeRange === 'week'
                ? 'bg-green-50 text-green-700 border-green-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 text-sm font-medium border-t border-b ${
              timeRange === 'month'
                ? 'bg-green-50 text-green-700 border-green-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
              timeRange === 'year'
                ? 'bg-green-50 text-green-700 border-green-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Año
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Ingresos Totales
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(stats.totalEarnings)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Period Earnings */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {timeRange === 'week' ? 'Esta Semana' : timeRange === 'month' ? 'Este Mes' : 'Este Año'}
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(timeRange === 'week' ? stats.thisWeek : stats.thisMonth)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Próximo Pago
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(stats.pendingPayouts)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Completed Bookings */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Reservas Pagadas
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.completedBookings}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas de Rendimiento</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Valor Promedio por Reserva</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(stats.averageBookingValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Tasa de Conversión</span>
              <span className="text-sm font-medium text-gray-900">{formatPercentage(stats.conversionRate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Reservas Pendientes</span>
              <span className="text-sm font-medium text-yellow-600">{stats.pendingBookings}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Frecuencia de Pagos</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Próximo pago</span>
              <span className="text-sm font-medium text-gray-900">En 3 días</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Frecuencia</span>
              <span className="text-sm font-medium text-gray-900">Semanal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Método</span>
              <span className="text-sm font-medium text-gray-900">Transferencia bancaria</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}