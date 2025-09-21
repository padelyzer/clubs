'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Building2, 
  Calendar, 
  DollarSign,
  Download,
  Filter,
  Map,
  Clock,
  Target,
  Zap,
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalClubs: number
    totalUsers: number
    totalBookings: number
    totalRevenue: number
  }
  growth: Array<{
    month: string
    clubs: number
    users: number
    bookings: number
    revenue: number
  }>
  dailyTrends: Array<{
    date: string
    bookings: number
    revenue: number
    users: number
  }>
  clubs: Array<{
    id: string
    name: string
    location: string
    totalUsers: number
    totalCourts: number
    totalBookings: number
    monthlyBookings: number
    monthlyRevenue: number
    avgBookingValue: number
  }>
  users: {
    byRole: Array<{ role: string; _count: { _all: number } }>
    byPaymentType: Array<{ paymentType: string; _count: { _all: number }; _sum: { price: number } }>
    recentActivity: Array<{ playerPhone: string; createdAt: Date; price: number }>
  }
  revenue: {
    byStatus: Array<{ paymentStatus: string; _count: { _all: number }; _sum: { price: number } }>
    monthlyTotal: number
    yearlyTotal: number
  }
  geographic: Array<{ state: string; city: string; _count: { _all: number } }>
}

interface AnalyticsManagementProps {
  analytics: AnalyticsData
}

export default function AnalyticsManagement({ analytics }: AnalyticsManagementProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: BarChart3 },
    { id: 'growth', name: 'Crecimiento', icon: TrendingUp },
    { id: 'clubs', name: 'Performance Clubes', icon: Building2 },
    { id: 'users', name: 'Usuarios', icon: Users },
    { id: 'revenue', name: 'Ingresos', icon: DollarSign },
    { id: 'geographic', name: 'Geográfico', icon: Map }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? ArrowUp : ArrowDown
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Clubes Activos</span>
          </div>
          <div className="text-2xl font-bold">{analytics.overview.totalClubs.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Usuarios Totales</span>
          </div>
          <div className="text-2xl font-bold">{analytics.overview.totalUsers.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Reservas Totales</span>
          </div>
          <div className="text-2xl font-bold">{analytics.overview.totalBookings.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Ingresos Totales</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="1y">Último año</option>
            </select>
            <button className="btn btn-ghost btn-sm">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm">
              <Eye className="w-4 h-4" />
              Reporte Personalizado
            </button>
            <button className="btn btn-primary btn-sm">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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
              <h3 className="text-lg font-semibold">Resumen General</h3>
              
              {/* Tendencias Diarias */}
              <div className="space-y-4">
                <h4 className="font-medium">Tendencias Diarias (Últimos 30 días)</h4>
                <div className="space-y-2">
                  {analytics.dailyTrends.slice(-10).map((day, index) => {
                    const maxBookings = Math.max(...analytics.dailyTrends.map(d => d.bookings))
                    const maxRevenue = Math.max(...analytics.dailyTrends.map(d => d.revenue))
                    
                    return (
                      <div key={index} className="grid grid-cols-3 gap-4 items-center">
                        <div className="text-sm font-medium">{day.date}</div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Reservas</span>
                            <span>{day.bookings}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${maxBookings > 0 ? (day.bookings / maxBookings) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Ingresos</span>
                            <span>{formatCurrency(day.revenue)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Tasa de Conversión</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">85.2%</div>
                  <div className="text-sm text-gray-600">Reservas confirmadas vs pendientes</div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Valor Promedio</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(analytics.overview.totalRevenue / analytics.overview.totalBookings)}
                  </div>
                  <div className="text-sm text-gray-600">Por reserva</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Usuarios Activos</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(analytics.overview.totalUsers * 0.65)}
                  </div>
                  <div className="text-sm text-gray-600">Últimos 30 días</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'growth' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Análisis de Crecimiento</h3>
              
              {/* Gráficas de crecimiento mensual */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Crecimiento de Clubes</h4>
                  <div className="space-y-2">
                    {analytics.growth.map((month, index) => {
                      const maxClubs = Math.max(...analytics.growth.map(m => m.clubs))
                      const prevMonth = analytics.growth[index - 1]
                      const growth = prevMonth ? calculateGrowth(month.clubs, prevMonth.clubs) : 0
                      const GrowthIcon = getGrowthIcon(growth)
                      
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-12 text-sm font-medium">{month.month}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div 
                              className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${maxClubs > 0 ? (month.clubs / maxClubs) * 100 : 0}%` }}
                            >
                              {month.clubs > 0 && (
                                <span className="text-xs text-white font-medium">
                                  {month.clubs}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${getGrowthColor(growth)}`}>
                            <GrowthIcon className="w-3 h-3" />
                            {Math.abs(growth).toFixed(1)}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Crecimiento de Ingresos</h4>
                  <div className="space-y-2">
                    {analytics.growth.map((month, index) => {
                      const maxRevenue = Math.max(...analytics.growth.map(m => m.revenue))
                      const prevMonth = analytics.growth[index - 1]
                      const growth = prevMonth ? calculateGrowth(month.revenue, prevMonth.revenue) : 0
                      const GrowthIcon = getGrowthIcon(growth)
                      
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-12 text-sm font-medium">{month.month}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div 
                              className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0}%` }}
                            >
                              {month.revenue > 0 && (
                                <span className="text-xs text-white font-medium">
                                  {formatCurrency(month.revenue)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${getGrowthColor(growth)}`}>
                            <GrowthIcon className="w-3 h-3" />
                            {Math.abs(growth).toFixed(1)}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clubs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Performance por Club</h3>
                <button className="btn btn-ghost btn-sm">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Club</th>
                      <th className="text-center py-3 px-4 font-medium">Usuarios</th>
                      <th className="text-center py-3 px-4 font-medium">Canchas</th>
                      <th className="text-center py-3 px-4 font-medium">Reservas/Mes</th>
                      <th className="text-right py-3 px-4 font-medium">Ingresos/Mes</th>
                      <th className="text-right py-3 px-4 font-medium">Promedio/Reserva</th>
                      <th className="text-center py-3 px-4 font-medium">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analytics.clubs
                      .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
                      .map((club, index) => (
                      <tr key={club.id}>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{club.name}</div>
                            <div className="text-sm text-gray-500">{club.location}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">{club.totalUsers}</td>
                        <td className="py-3 px-4 text-center">{club.totalCourts}</td>
                        <td className="py-3 px-4 text-center">{club.monthlyBookings}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(club.monthlyRevenue)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(club.avgBookingValue)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            index < 3 ? 'bg-green-100 text-green-700' :
                            index < 7 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {index < 3 ? 'Excelente' : index < 7 ? 'Bueno' : 'Regular'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Análisis de Usuarios</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Distribución por Rol</h4>
                  <div className="space-y-3">
                    {analytics.users.byRole.map((role, index) => {
                      const total = analytics.users.byRole.reduce((sum, r) => sum + r._count._all, 0)
                      const percentage = total > 0 ? (role._count._all / total * 100) : 0
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{role.role}</span>
                          <div className="text-right">
                            <div className="font-bold">{role._count._all.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Métodos de Pago Preferidos</h4>
                  <div className="space-y-3">
                    {analytics.users.byPaymentType.map((payment, index) => {
                      const total = analytics.users.byPaymentType.reduce((sum, p) => sum + p._count._all, 0)
                      const percentage = total > 0 ? (payment._count._all / total * 100) : 0
                      
                      const paymentLabels: Record<string, string> = {
                        'ONSITE': 'En Sitio',
                        'ONLINE_FULL': 'Online Completo',
                        'ONLINE_SPLIT': 'Online Dividido'
                      }
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{paymentLabels[payment.paymentType] || payment.paymentType}</span>
                          <div className="text-right">
                            <div className="font-bold">{payment._count._all.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Análisis de Ingresos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(analytics.revenue.monthlyTotal)}
                  </div>
                  <div className="text-sm text-gray-600">Ingresos del Mes</div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(analytics.revenue.yearlyTotal)}
                  </div>
                  <div className="text-sm text-gray-600">Ingresos del Año</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(analytics.revenue.yearlyTotal * 0.025)}
                  </div>
                  <div className="text-sm text-gray-600">Comisiones Estimadas</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Distribución por Estado de Pago</h4>
                <div className="space-y-3">
                  {analytics.revenue.byStatus.map((status, index) => {
                    const total = analytics.revenue.byStatus.reduce((sum, s) => sum + (s._sum.price || 0), 0)
                    const percentage = total > 0 ? ((status._sum.price || 0) / total * 100) : 0
                    
                    const statusLabels: Record<string, string> = {
                      'completed': 'Completado',
                      'pending': 'Pendiente',
                      'failed': 'Fallido',
                      'cancelled': 'Cancelado'
                    }
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{statusLabels[status.paymentStatus] || status.paymentStatus}</span>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency((status._sum.price || 0) / 100)}</div>
                          <div className="text-sm text-gray-500">
                            {status._count._all} reservas • {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'geographic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Distribución Geográfica</h3>
              
              <div className="space-y-4">
                <h4 className="font-medium">Clubes por Estado</h4>
                <div className="space-y-3">
                  {analytics.geographic
                    .reduce((acc, item) => {
                      const existing = acc.find(a => a.state === item.state)
                      if (existing) {
                        existing.count += item._count._all
                      } else {
                        acc.push({ state: item.state, count: item._count._all })
                      }
                      return acc
                    }, [] as Array<{ state: string; count: number }>)
                    .sort((a, b) => b.count - a.count)
                    .map((state, index) => {
                      const total = analytics.geographic.reduce((sum, item) => sum + item._count._all, 0)
                      const percentage = total > 0 ? (state.count / total * 100) : 0
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{state.state}</span>
                          <div className="text-right">
                            <div className="font-bold">{state.count} clubes</div>
                            <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Top Ciudades</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics.geographic
                    .sort((a, b) => b._count._all - a._count._all)
                    .slice(0, 10)
                    .map((city, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <div className="font-medium">{city.city}</div>
                          <div className="text-sm text-gray-500">{city.state}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{city._count._all}</div>
                          <div className="text-sm text-gray-500">clubes</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}