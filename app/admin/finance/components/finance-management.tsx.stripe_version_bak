'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  CreditCard,
  Building2,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

interface Props {
  stats: {
    revenue: {
      total: number
      month: number
      lastMonth: number
      year: number
      growth: number
    }
    commission: {
      total: number
      month: number
      estimated: number
    }
    bookings: {
      total: number
      month: number
      lastMonth: number
      year: number
    }
  }
  trends: Array<{
    month: string
    revenue: number
    bookings: number
    commission: number
  }>
  clubRevenues: Array<{
    id: string
    name: string
    revenue: number
    bookings: number
    commission: number
  }>
  pendingPayouts: Array<{
    clubId: string
    clubName: string
    grossAmount: number
    commission: number
    netAmount: number
    bookingsCount: number
  }>
  paymentMethods: Array<{
    type: string
    revenue: number
    count: number
    percentage: number
  }>
}

export default function FinanceManagement({
  stats,
  trends,
  clubRevenues,
  pendingPayouts,
  paymentMethods
}: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [showChart, setShowChart] = useState<'revenue' | 'bookings' | 'commission'>('revenue')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const maxRevenue = Math.max(...trends.map(t => t.revenue))
  const maxBookings = Math.max(...trends.map(t => t.bookings))

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            {stats.revenue.growth > 0 ? (
              <div className="flex items-center text-green-600 text-sm">
                <ArrowUpRight className="h-4 w-4" />
                <span>{stats.revenue.growth.toFixed(1)}%</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600 text-sm">
                <ArrowDownRight className="h-4 w-4" />
                <span>{Math.abs(stats.revenue.growth).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600">Ingresos del Mes</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.revenue.month)}</p>
          <p className="text-xs text-gray-500 mt-1">
            vs {formatCurrency(stats.revenue.lastMonth)} mes anterior
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">
              {((stats.bookings.month / stats.bookings.lastMonth - 1) * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Reservas del Mes</p>
          <p className="text-2xl font-bold">{stats.bookings.month.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">
            Total histórico: {stats.bookings.total.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Comisiones del Mes</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.commission.month)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Total histórico: {formatCurrency(stats.commission.total)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Building2 className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Ingresos Anuales</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.revenue.year)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Promedio mensual: {formatCurrency(stats.revenue.year / 12)}
          </p>
        </div>
      </div>

      {/* Revenue Trends Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Tendencias de Ingresos</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowChart('revenue')}
              className={`px-3 py-1 text-sm rounded-lg ${
                showChart === 'revenue' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Ingresos
            </button>
            <button
              onClick={() => setShowChart('bookings')}
              className={`px-3 py-1 text-sm rounded-lg ${
                showChart === 'bookings' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Reservas
            </button>
            <button
              onClick={() => setShowChart('commission')}
              className={`px-3 py-1 text-sm rounded-lg ${
                showChart === 'commission' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Comisiones
            </button>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between gap-2">
          {trends.map((month, index) => {
            const value = showChart === 'revenue' 
              ? month.revenue 
              : showChart === 'bookings' 
              ? month.bookings 
              : month.commission
            const max = showChart === 'revenue' 
              ? maxRevenue 
              : showChart === 'bookings' 
              ? maxBookings 
              : Math.max(...trends.map(t => t.commission))
            const height = (value / max) * 100

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-t relative group cursor-pointer">
                  <div 
                    className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all hover:from-emerald-600 hover:to-emerald-500"
                    style={{ height: `${height * 2}px` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {showChart === 'revenue' || showChart === 'commission'
                        ? formatCurrency(value)
                        : value.toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 mt-2">{month.month}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clubs by Revenue */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Clubs por Ingresos</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {clubRevenues.slice(0, 5).map((club, index) => (
              <div key={club.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{club.name}</p>
                    <p className="text-xs text-gray-500">{club.bookings} reservas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(club.revenue)}</p>
                  <p className="text-xs text-gray-500">Com: {formatCurrency(club.commission)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pagos Pendientes</h2>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
          <div className="space-y-3">
            {pendingPayouts.slice(0, 5).map((payout) => (
              <div key={payout.clubId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{payout.clubName}</p>
                  <p className="text-xs text-gray-500">{payout.bookingsCount} reservas</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(payout.netAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Bruto: {formatCurrency(payout.grossAmount)}
                  </p>
                </div>
              </div>
            ))}
            {pendingPayouts.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay pagos pendientes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Methods Distribution */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Métodos de Pago</h2>
          <PieChart className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <div key={method.type} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize">{method.type}</span>
                <span className="text-sm text-gray-500">{method.percentage.toFixed(1)}%</span>
              </div>
              <p className="text-lg font-semibold">{formatCurrency(method.revenue)}</p>
              <p className="text-xs text-gray-500">{method.count.toLocaleString()} transacciones</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}