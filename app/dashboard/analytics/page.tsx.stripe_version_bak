'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Activity,
  Clock,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Loader2,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react'

interface MetricCard {
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease'
  icon: any
  color: string
}

interface ChartData {
  labels: string[]
  values: number[]
}

export default function ClubAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week') // week, month, year
  const [metrics, setMetrics] = useState({
    revenue: 0,
    revenueChange: 0,
    bookings: 0,
    bookingsChange: 0,
    players: 0,
    playersChange: 0,
    occupancy: 0,
    occupancyChange: 0
  })
  const [revenueChart, setRevenueChart] = useState<ChartData>({
    labels: [],
    values: []
  })
  const [bookingsChart, setBookingsChart] = useState<ChartData>({
    labels: [],
    values: []
  })
  const [courtUsage, setCourtUsage] = useState<any[]>([])
  const [peakHours, setPeakHours] = useState<any[]>([])
  const [topPlayers, setTopPlayers] = useState<any[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/club/analytics?range=${timeRange}`)
      if (!response.ok) throw new Error('Error fetching analytics')
      
      const data = await response.json()
      
      // Actualizar métricas
      setMetrics({
        revenue: data.revenue || 0,
        revenueChange: data.revenueChange || 0,
        bookings: data.bookings || 0,
        bookingsChange: data.bookingsChange || 0,
        players: data.players || 0,
        playersChange: data.playersChange || 0,
        occupancy: data.occupancy || 0,
        occupancyChange: data.occupancyChange || 0
      })

      // Actualizar gráficos
      if (data.revenueChart) {
        setRevenueChart(data.revenueChart)
      }
      if (data.bookingsChart) {
        setBookingsChart(data.bookingsChart)
      }
      if (data.courtUsage) {
        setCourtUsage(data.courtUsage)
      }
      if (data.peakHours) {
        setPeakHours(data.peakHours)
      }
      if (data.topPlayers) {
        setTopPlayers(data.topPlayers)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const metricCards: MetricCard[] = [
    {
      title: 'Ingresos Totales',
      value: formatCurrency(metrics.revenue),
      change: metrics.revenueChange,
      changeType: metrics.revenueChange >= 0 ? 'increase' : 'decrease',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Reservas',
      value: metrics.bookings,
      change: metrics.bookingsChange,
      changeType: metrics.bookingsChange >= 0 ? 'increase' : 'decrease',
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Jugadores Únicos',
      value: metrics.players,
      change: metrics.playersChange,
      changeType: metrics.playersChange >= 0 ? 'increase' : 'decrease',
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Ocupación',
      value: `${metrics.occupancy}%`,
      change: metrics.occupancyChange,
      changeType: metrics.occupancyChange >= 0 ? 'increase' : 'decrease',
      icon: Activity,
      color: 'orange'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Métricas</h1>
            <p className="text-gray-600 mt-1">Analítica y rendimiento del club</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-2 bg-white rounded-lg border border-gray-200 p-1">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : 'Año'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                
                <div className="flex items-center gap-1 mt-3">
                  {metric.changeType === 'increase' ? (
                    <>
                      <ChevronUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        +{Math.abs(metric.change)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">
                        -{Math.abs(metric.change)}%
                      </span>
                    </>
                  )}
                  <span className="text-sm text-gray-500">vs período anterior</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${metric.color}-50`}>
                <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Evolución de Ingresos</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          {revenueChart.labels.length > 0 ? (
            <div className="h-64 flex items-end gap-2">
              {revenueChart.values.map((value, idx) => {
                const maxValue = Math.max(...revenueChart.values)
                const height = (value / maxValue) * 100
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-blue-100 rounded-t-md relative" style={{ height: `${height}%` }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700">
                        {formatCurrency(value)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{revenueChart.labels[idx]}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-400">No hay datos disponibles</p>
            </div>
          )}
        </div>

        {/* Bookings Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Reservas por Día</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          
          {bookingsChart.labels.length > 0 ? (
            <div className="h-64 flex items-end gap-2">
              {bookingsChart.values.map((value, idx) => {
                const maxValue = Math.max(...bookingsChart.values)
                const height = (value / maxValue) * 100
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-green-100 rounded-t-md relative" style={{ height: `${height}%` }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700">
                        {value}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{bookingsChart.labels[idx]}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-400">No hay datos disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Court Usage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso de Canchas</h3>
          <div className="space-y-4">
            {courtUsage.length > 0 ? (
              courtUsage.map((court, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{court.name}</span>
                    <span className="text-sm text-gray-500">{court.usage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${court.usage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No hay datos disponibles</p>
            )}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Horas Pico</h3>
          <div className="space-y-3">
            {peakHours.length > 0 ? (
              peakHours.slice(0, 5).map((hour, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{hour.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(hour.bookings / Math.max(...peakHours.map(h => h.bookings))) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{hour.bookings}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No hay datos disponibles</p>
            )}
          </div>
        </div>

        {/* Top Players */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Jugadores Top</h3>
          <div className="space-y-3">
            {topPlayers.length > 0 ? (
              topPlayers.slice(0, 5).map((player, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{player.name}</p>
                      <p className="text-xs text-gray-500">{player.bookings} reservas</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {formatCurrency(player.revenue)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No hay datos disponibles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}