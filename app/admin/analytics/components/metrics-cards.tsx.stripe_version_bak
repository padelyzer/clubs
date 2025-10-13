'use client'

import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  Crown,
  Calculator,
  Zap
} from 'lucide-react'

interface SaasMetrics {
  mrr: number
  mrrGrowth: number
  arr: number
  churnRate: number
  ltv: number
  cac: number
  arpu: number
  activeSubscriptions: number
  totalRevenue: number
}

interface Growth {
  newCustomers: number
  customerGrowthRate: number
  churnedCustomers: number
  netGrowth: number
  revenueGrowth: number
}

interface PlanDistribution {
  planName: string
  count: number
  revenue: number
}

interface MetricsCardsProps {
  metrics: SaasMetrics
  growth: Growth
  planDistribution: PlanDistribution[]
}

export default function MetricsCards({ metrics, growth, planDistribution }: MetricsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp className="w-4 h-4" />
    if (growth < 0) return <ArrowDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendColor = (growth: number) => {
    if (growth > 0) return 'bg-green-50 border-green-200'
    if (growth < 0) return 'bg-red-50 border-red-200'
    return 'bg-gray-50 border-gray-200'
  }

  const cards = [
    {
      title: 'MRR (Ingresos Recurrentes Mensuales)',
      value: formatCurrency(metrics.mrr),
      change: metrics.mrrGrowth,
      changeLabel: 'vs mes anterior',
      icon: DollarSign,
      gradient: 'from-blue-500 to-blue-600',
      description: 'Ingresos mensuales de suscripciones activas'
    },
    {
      title: 'ARR (Ingresos Recurrentes Anuales)',
      value: formatCurrency(metrics.arr),
      change: metrics.mrrGrowth * 12,
      changeLabel: 'proyección anual',
      icon: Target,
      gradient: 'from-purple-500 to-purple-600',
      description: 'Proyección anual basada en MRR actual'
    },
    {
      title: 'Tasa de Churn',
      value: `${metrics.churnRate.toFixed(1)}%`,
      change: metrics.churnRate > 5 ? metrics.churnRate - 5 : -(5 - metrics.churnRate),
      changeLabel: 'objetivo: <5%',
      icon: TrendingDown,
      gradient: metrics.churnRate > 5 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600',
      description: 'Porcentaje mensual de cancelaciones',
      inverse: true
    },
    {
      title: 'LTV (Valor de Vida del Cliente)',
      value: formatCurrency(metrics.ltv),
      change: metrics.ltv > (metrics.cac * 3) ? 15 : -10,
      changeLabel: 'vs CAC ratio',
      icon: Crown,
      gradient: 'from-amber-500 to-amber-600',
      description: 'Valor promedio durante la relación comercial'
    },
    {
      title: 'CAC (Costo de Adquisición)',
      value: formatCurrency(metrics.cac),
      change: metrics.cac < (metrics.ltv / 3) ? -10 : 15,
      changeLabel: 'eficiencia',
      icon: Calculator,
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'Costo promedio para adquirir un cliente',
      inverse: true
    },
    {
      title: 'ARPU (Ingreso Promedio por Usuario)',
      value: formatCurrency(metrics.arpu),
      change: (metrics.arpu / 1000) * 100,
      changeLabel: 'potencial de crecimiento',
      icon: Users,
      gradient: 'from-teal-500 to-teal-600',
      description: 'Ingreso mensual promedio por suscripción'
    },
    {
      title: 'Suscripciones Activas',
      value: metrics.activeSubscriptions.toLocaleString(),
      change: growth.customerGrowthRate,
      changeLabel: 'vs mes anterior',
      icon: Zap,
      gradient: 'from-emerald-500 to-emerald-600',
      description: 'Número total de suscripciones activas'
    },
    {
      title: 'Ingresos Totales',
      value: formatCurrency(metrics.totalRevenue),
      change: growth.revenueGrowth,
      changeLabel: 'crecimiento anual',
      icon: TrendingUp,
      gradient: 'from-rose-500 to-rose-600',
      description: 'Ingresos acumulados de todas las fuentes'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon
        const isNegativeGood = card.inverse || false
        const actualChange = isNegativeGood ? -card.change : card.change
        
        return (
          <div key={index} className="relative overflow-hidden bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow duration-200">
            {/* Gradient Header */}
            <div className={`bg-gradient-to-r ${card.gradient} px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <IconComponent className="w-8 h-8 mb-2" />
                  <h3 className="text-sm font-medium text-white/90">
                    {card.title}
                  </h3>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="px-6 py-4">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {card.value}
                  </div>
                  <p className="text-xs text-gray-500">
                    {card.description}
                  </p>
                </div>
              </div>
              
              {/* Change Indicator */}
              <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getTrendColor(actualChange)} border`}>
                <span className={getGrowthColor(actualChange)}>
                  {getGrowthIcon(actualChange)}
                </span>
                <span className={`ml-1 ${getGrowthColor(actualChange)}`}>
                  {formatPercentage(Math.abs(card.change))}
                </span>
                <span className="ml-1 text-gray-600">
                  {card.changeLabel}
                </span>
              </div>
            </div>
            
            {/* Bottom accent line */}
            <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
          </div>
        )
      })}
      
      {/* Additional Summary Cards */}
      <div className="md:col-span-2 xl:col-span-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Growth Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Crecimiento de Clientes</h3>
              <div className={`p-2 rounded-lg ${
                growth.netGrowth > 0 
                  ? 'bg-green-100 text-green-600' 
                  : growth.netGrowth < 0 
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {growth.netGrowth > 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : growth.netGrowth < 0 ? (
                  <TrendingDown className="w-5 h-5" />
                ) : (
                  <Minus className="w-5 h-5" />
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Nuevos Clientes</span>
                <span className="text-lg font-semibold text-green-600">
                  +{growth.newCustomers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Clientes Perdidos</span>
                <span className="text-lg font-semibold text-red-600">
                  -{growth.churnedCustomers}
                </span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Crecimiento Neto</span>
                <span className={`text-xl font-bold ${
                  growth.netGrowth > 0 
                    ? 'text-green-600' 
                    : growth.netGrowth < 0 
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}>
                  {growth.netGrowth > 0 ? '+' : ''}{growth.netGrowth}
                </span>
              </div>
            </div>
          </div>
          
          {/* Revenue Health */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Salud de Ingresos</h3>
              <div className={`p-2 rounded-lg ${
                metrics.mrrGrowth > 0 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Crecimiento MRR</span>
                <span className={`text-lg font-semibold ${
                  metrics.mrrGrowth > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(metrics.mrrGrowth)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ratio LTV:CAC</span>
                <span className={`text-lg font-semibold ${
                  metrics.cac > 0 && (metrics.ltv / metrics.cac) > 3 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  {metrics.cac > 0 ? (metrics.ltv / metrics.cac).toFixed(1) : 'N/A'}:1
                </span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Estado General</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  metrics.mrrGrowth > 0 && metrics.churnRate < 5 
                    ? 'bg-green-100 text-green-700' 
                    : metrics.mrrGrowth > 0 || metrics.churnRate < 5
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}>
                  {metrics.mrrGrowth > 0 && metrics.churnRate < 5 
                    ? 'Excelente' 
                    : metrics.mrrGrowth > 0 || metrics.churnRate < 5
                      ? 'Bueno'
                      : 'Necesita atención'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Plan Performance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Rendimiento por Plan</h3>
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Target className="w-5 h-5" />
              </div>
            </div>
            
            <div className="space-y-3">
              {planDistribution.slice(0, 2).map((plan, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{plan.planName}</div>
                    <div className="text-xs text-gray-500">{plan.count} suscripciones</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(plan.revenue)}
                    </div>
                  </div>
                </div>
              ))}
              <hr />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Diversificación</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  planDistribution.length > 2 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {planDistribution.length > 2 ? 'Buena' : 'Limitada'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}