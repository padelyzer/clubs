'use client'

import { useState } from 'react'
import { 
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Users,
  DollarSign,
  Zap,
  CheckCircle,
  XCircle,
  ArrowRight,
  Brain,
  BarChart3,
  Shield,
  Rocket,
  AlertCircle,
  Activity,
  Clock,
  Star
} from 'lucide-react'

interface Insights {
  highChurn: boolean
  strongGrowth: boolean
  lowUtilization: boolean
  healthyLTV: boolean
  trends: {
    mrrTrend: 'up' | 'down'
    customerTrend: 'up' | 'down'
    revenueTrend: 'up' | 'down'
  }
}

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

interface InsightsProps {
  insights: Insights
  metrics: SaasMetrics
  growth: Growth
}

interface Recommendation {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  urgency: 'urgent' | 'important' | 'suggested'
  category: 'revenue' | 'retention' | 'growth' | 'operational'
  icon: any
  actions: string[]
  expectedOutcome: string
  timeFrame: string
}

interface Alert {
  id: string
  type: 'warning' | 'danger' | 'info' | 'success'
  title: string
  message: string
  icon: any
  actionRequired: boolean
}

export default function Insights({ insights, metrics, growth }: InsightsProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Generate AI-style alerts based on metrics
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = []

    if (insights.highChurn) {
      alerts.push({
        id: 'high-churn',
        type: 'danger',
        title: 'Tasa de Churn Elevada',
        message: `La tasa de churn del ${metrics.churnRate.toFixed(1)}% está por encima del objetivo del 5%. Se requiere atención inmediata.`,
        icon: AlertTriangle,
        actionRequired: true
      })
    }

    if (metrics.mrrGrowth < 0) {
      alerts.push({
        id: 'negative-mrr',
        type: 'warning',
        title: 'Crecimiento MRR Negativo',
        message: `El MRR ha decrecido un ${Math.abs(metrics.mrrGrowth).toFixed(1)}% este mes. Revisar estrategia de retención.`,
        icon: TrendingDown,
        actionRequired: true
      })
    }

    if (!insights.healthyLTV && metrics.cac > 0) {
      const ratio = metrics.ltv / metrics.cac
      alerts.push({
        id: 'ltv-cac-ratio',
        type: 'warning',
        title: 'Ratio LTV:CAC Subóptimo',
        message: `El ratio LTV:CAC de ${ratio.toFixed(1)}:1 está por debajo del óptimo de 3:1. Revisar costos de adquisición.`,
        icon: Target,
        actionRequired: false
      })
    }

    if (insights.lowUtilization) {
      alerts.push({
        id: 'low-utilization',
        type: 'info',
        title: 'Baja Utilización de Clubes',
        message: 'Muchos clubes registrados no están siendo utilizados activamente. Oportunidad de mejora.',
        icon: Activity,
        actionRequired: false
      })
    }

    if (insights.strongGrowth && metrics.mrrGrowth > 20) {
      alerts.push({
        id: 'strong-growth',
        type: 'success',
        title: 'Crecimiento Excepcional',
        message: `MRR creciendo a ${metrics.mrrGrowth.toFixed(1)}% mensual. Excelente momento para escalar.`,
        icon: Rocket,
        actionRequired: false
      })
    }

    return alerts
  }

  // Generate detailed recommendations
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = []

    // Revenue optimization
    if (metrics.arpu < 2000) {
      recommendations.push({
        id: 'increase-arpu',
        title: 'Incrementar ARPU',
        description: 'El ingreso promedio por usuario está por debajo del potencial del mercado',
        impact: 'high',
        urgency: 'important',
        category: 'revenue',
        icon: DollarSign,
        actions: [
          'Introducir planes premium con funcionalidades avanzadas',
          'Implementar upselling automático basado en uso',
          'Crear add-ons para servicios adicionales',
          'Revisar estructura de precios comparada con competencia'
        ],
        expectedOutcome: `Potencial incremento de ${formatCurrency(500)} por usuario/mes`,
        timeFrame: '2-3 meses'
      })
    }

    // Churn reduction
    if (insights.highChurn) {
      recommendations.push({
        id: 'reduce-churn',
        title: 'Programa de Retención Urgente',
        description: 'La alta tasa de churn requiere intervención inmediata',
        impact: 'high',
        urgency: 'urgent',
        category: 'retention',
        icon: Shield,
        actions: [
          'Implementar alertas tempranas de riesgo de churn',
          'Crear programa de éxito del cliente',
          'Mejorar onboarding y tiempo de activación',
          'Desarrollar encuestas de cancelación automáticas'
        ],
        expectedOutcome: `Reducción del churn a <5% podría incrementar MRR en ${formatCurrency(metrics.mrr * 0.1)}`,
        timeFrame: '1-2 meses'
      })
    }

    // Growth acceleration
    if (growth.netGrowth > 0 && metrics.mrrGrowth > 5) {
      recommendations.push({
        id: 'scale-growth',
        title: 'Acelerar Crecimiento',
        description: 'Las métricas positivas indican momento ideal para escalar',
        impact: 'high',
        urgency: 'important',
        category: 'growth',
        icon: Rocket,
        actions: [
          'Aumentar presupuesto de marketing en canales efectivos',
          'Implementar programa de referidos',
          'Expandir a nuevos mercados geográficos',
          'Desarrollar partnerships estratégicos'
        ],
        expectedOutcome: `Potencial para doblar el crecimiento actual`,
        timeFrame: '3-6 meses'
      })
    }

    // Operational efficiency
    if (insights.lowUtilization) {
      recommendations.push({
        id: 'improve-utilization',
        title: 'Mejorar Utilización de Clubes',
        description: 'Muchos clubes registrados no están generando valor',
        impact: 'medium',
        urgency: 'suggested',
        category: 'operational',
        icon: Activity,
        actions: [
          'Programa de activación para clubes inactivos',
          'Mejorar capacitación y soporte inicial',
          'Crear incentivos para uso temprano',
          'Identificar barreras de adopción principales'
        ],
        expectedOutcome: 'Incremento del 20% en utilización activa',
        timeFrame: '2-4 meses'
      })
    }

    // CAC optimization
    if (metrics.cac > metrics.arpu * 2) {
      recommendations.push({
        id: 'optimize-cac',
        title: 'Optimizar Costo de Adquisición',
        description: 'El CAC es elevado comparado con el ARPU actual',
        impact: 'medium',
        urgency: 'important',
        category: 'growth',
        icon: Target,
        actions: [
          'Analizar rendimiento por canal de marketing',
          'Mejorar targeting y segmentación',
          'Optimizar funnel de conversión',
          'Implementar marketing de contenido orgánico'
        ],
        expectedOutcome: `Reducción del CAC en 30-40%`,
        timeFrame: '1-3 meses'
      })
    }

    // Product development
    if (metrics.activeSubscriptions > 50 && metrics.mrrGrowth > 0) {
      recommendations.push({
        id: 'product-expansion',
        title: 'Expandir Oferta de Producto',
        description: 'Base de usuarios sólida para nuevas funcionalidades',
        impact: 'medium',
        urgency: 'suggested',
        category: 'revenue',
        icon: Star,
        actions: [
          'Desarrollar funcionalidades enterprise',
          'Crear integraciones con herramientas populares',
          'Lanzar API para desarrolladores',
          'Implementar analytics avanzados para clubes'
        ],
        expectedOutcome: 'Nuevas fuentes de ingreso y diferenciación',
        timeFrame: '4-8 meses'
      })
    }

    return recommendations
  }

  const alerts = generateAlerts()
  const recommendations = generateRecommendations()

  const filteredRecommendations = activeCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === activeCategory)

  const categories = [
    { id: 'all', name: 'Todas', icon: Brain },
    { id: 'revenue', name: 'Ingresos', icon: DollarSign },
    { id: 'retention', name: 'Retención', icon: Shield },
    { id: 'growth', name: 'Crecimiento', icon: TrendingUp },
    { id: 'operational', name: 'Operacional', icon: BarChart3 }
  ]

  const getAlertIcon = (alert: Alert) => {
    const IconComponent = alert.icon
    const colorClass = {
      danger: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500',
      success: 'text-green-500'
    }[alert.type]
    
    return <IconComponent className={`w-5 h-5 ${colorClass}`} />
  }

  const getAlertBg = (type: string) => {
    return {
      danger: 'bg-red-50 border-red-200',
      warning: 'bg-yellow-50 border-yellow-200',
      info: 'bg-blue-50 border-blue-200',
      success: 'bg-green-50 border-green-200'
    }[type]
  }

  const getImpactColor = (impact: string) => {
    return {
      high: 'text-red-600 bg-red-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-green-600 bg-green-100'
    }[impact]
  }

  const getUrgencyColor = (urgency: string) => {
    return {
      urgent: 'text-red-600 bg-red-100',
      important: 'text-yellow-600 bg-yellow-100',
      suggested: 'text-blue-600 bg-blue-100'
    }[urgency]
  }

  // Business health score calculation
  const calculateHealthScore = () => {
    let score = 50 // Base score
    
    // MRR Growth (30 points)
    if (metrics.mrrGrowth > 15) score += 30
    else if (metrics.mrrGrowth > 5) score += 20
    else if (metrics.mrrGrowth > 0) score += 10
    else score -= 10
    
    // Churn Rate (25 points)
    if (metrics.churnRate < 3) score += 25
    else if (metrics.churnRate < 5) score += 15
    else if (metrics.churnRate < 8) score += 5
    else score -= 15
    
    // LTV:CAC Ratio (20 points)
    if (metrics.cac > 0) {
      const ratio = metrics.ltv / metrics.cac
      if (ratio > 5) score += 20
      else if (ratio > 3) score += 15
      else if (ratio > 2) score += 5
      else score -= 10
    }
    
    // Net Growth (15 points)
    if (growth.netGrowth > 10) score += 15
    else if (growth.netGrowth > 5) score += 10
    else if (growth.netGrowth > 0) score += 5
    else score -= 5
    
    // Revenue Growth (10 points)
    if (growth.revenueGrowth > 50) score += 10
    else if (growth.revenueGrowth > 25) score += 7
    else if (growth.revenueGrowth > 0) score += 3
    
    return Math.max(0, Math.min(100, score))
  }

  const healthScore = calculateHealthScore()
  const healthLabel = healthScore >= 80 ? 'Excelente' : 
                     healthScore >= 60 ? 'Bueno' : 
                     healthScore >= 40 ? 'Regular' : 'Necesita Mejora'
  
  const healthColor = healthScore >= 80 ? 'text-green-600' : 
                     healthScore >= 60 ? 'text-blue-600' : 
                     healthScore >= 40 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="space-y-6">
      {/* Business Health Score */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <Brain className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold">Salud del Negocio</h2>
            </div>
            <p className="text-indigo-100">Análisis integral de métricas SaaS</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{healthScore}/100</div>
            <div className="text-lg font-medium text-indigo-100">{healthLabel}</div>
          </div>
        </div>
        
        {/* Health Score Bar */}
        <div className="mt-4 bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${healthScore}%` }}
          />
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Alertas y Notificaciones
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`border rounded-xl p-4 ${getAlertBg(alert.type)}`}>
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {getAlertIcon(alert)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                      {alert.actionRequired && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                          Acción Requerida
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            <Lightbulb className="w-5 h-5 mr-2" />
            Recomendaciones Inteligentes
          </h3>
          
          <div className="flex space-x-2">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-1" />
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecommendations.map((rec) => {
            const IconComponent = rec.icon
            return (
              <div key={rec.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-100 mr-4">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(rec.impact)}`}>
                    Impacto {rec.impact === 'high' ? 'Alto' : rec.impact === 'medium' ? 'Medio' : 'Bajo'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(rec.urgency)}`}>
                    {rec.urgency === 'urgent' ? 'Urgente' : rec.urgency === 'important' ? 'Importante' : 'Sugerido'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Acciones Recomendadas:</h5>
                    <ul className="space-y-1">
                      {rec.actions.map((action, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <ArrowRight className="w-3 h-3 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-gray-600">Resultado Esperado:</span>
                        <div className="font-medium text-green-600">{rec.expectedOutcome}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-600">Tiempo:</span>
                        <div className="font-medium text-gray-900">{rec.timeFrame}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {filteredRecommendations.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <div className="text-gray-500">No hay recomendaciones para esta categoría</div>
          </div>
        )}
      </div>

      {/* Key Insights Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Resumen de Insights Clave
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatCurrency(metrics.mrr * 12)}
            </div>
            <div className="text-sm text-gray-600">Potencial ARR</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Math.round((metrics.ltv - metrics.cac) * metrics.activeSubscriptions)}
            </div>
            <div className="text-sm text-gray-600">Valor Neto Clientes</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {growth.netGrowth > 0 ? Math.round(365 / (30 / growth.netGrowth)) : 0}
            </div>
            <div className="text-sm text-gray-600">Clientes/Año Proyectados</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 mb-1">
              {alerts.filter(a => a.actionRequired).length}
            </div>
            <div className="text-sm text-gray-600">Acciones Pendientes</div>
          </div>
        </div>
      </div>
    </div>
  )
}