'use client'

import { TrendingUp, TrendingDown, Building2, Users, Calendar, DollarSign } from 'lucide-react'

interface Metrics {
  clubs: {
    total: number
    approved: number
    pending: number
    rejected: number
    growthRate: number
  }
  users: {
    total: number
    growthRate: number
  }
  bookings: {
    total: number
    today: number
    week: number
    month: number
    growthRate: number
  }
  revenue: {
    total: number
    month: number
    lastMonth: number
    growthRate: number
  }
}

interface DashboardMetricsProps {
  metrics: Metrics
}

export default function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const metricCards = [
    {
      title: 'Clubes Totales',
      value: metrics.clubs.total,
      change: metrics.clubs.growthRate,
      icon: Building2,
      subtitle: `${metrics.clubs.approved} aprobados, ${metrics.clubs.pending} pendientes`,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      title: 'Usuarios Totales',
      value: metrics.users.total,
      change: metrics.users.growthRate,
      icon: Users,
      subtitle: 'Usuarios registrados',
      color: 'green',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      hoverColor: 'hover:bg-emerald-100'
    },
    {
      title: 'Reservas del Mes',
      value: metrics.bookings.month,
      change: metrics.bookings.growthRate,
      icon: Calendar,
      subtitle: `${metrics.bookings.today} hoy, ${metrics.bookings.week} esta semana`,
      color: 'purple',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600',
      hoverColor: 'hover:bg-violet-100'
    },
    {
      title: 'Ingresos del Mes',
      value: `$${metrics.revenue.month.toLocaleString('es-MX')}`,
      change: metrics.revenue.growthRate,
      icon: DollarSign,
      subtitle: `Total: $${metrics.revenue.total.toLocaleString('es-MX')}`,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      hoverColor: 'hover:bg-orange-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-float-up">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon
        const isPositive = metric.change >= 0
        
        return (
          <div 
            key={index} 
            className="card-elevated p-8 hover-lift transition-all duration-200 shadow-lg"
          >
            {/* Top Section with Icon and Trend */}
            <div className="flex items-start justify-between mb-6">
              <div className={`card-elevated inline-flex items-center justify-center rounded-xl p-4 shadow-sm hover-lift transition-all duration-200`}>
                <Icon className={`h-7 w-7 ${metric.iconColor}`} />
              </div>
              
              <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                isPositive 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(metric.change).toFixed(1)}%</span>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="mt-4 space-y-1">
              <div className="text-2xl font-bold tracking-tight text-gray-900">
                {metric.value}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {metric.title}
              </div>
              <div className="text-xs text-gray-500">
                {metric.subtitle}
              </div>
            </div>

            {/* Optional Progress Bar for visual enhancement */}
            <div className="mt-4">
              <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    metric.color === 'blue' ? 'bg-blue-500' :
                    metric.color === 'green' ? 'bg-emerald-500' :
                    metric.color === 'purple' ? 'bg-violet-500' :
                    'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.abs(metric.change) * 10)}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}