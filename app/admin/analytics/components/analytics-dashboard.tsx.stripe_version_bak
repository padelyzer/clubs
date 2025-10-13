'use client'

import { useState } from 'react'
import MetricsCards from './metrics-cards'
import GrowthChart from './growth-chart'
import UsageAnalytics from './usage-analytics'
import Insights from './insights'
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  Lightbulb,
  Calendar,
  Filter
} from 'lucide-react'

interface AnalyticsData {
  saasMetrics: {
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
  growth: {
    newCustomers: number
    customerGrowthRate: number
    churnedCustomers: number
    netGrowth: number
    revenueGrowth: number
  }
  monthlyData: Array<{
    month: string
    newSubscriptions: number
    churnedSubscriptions: number
    revenue: number
    activeSubscriptions: number
    netGrowth: number
  }>
  usage: {
    totalClubs: number
    activeClubs: number
    utilizationRate: number
    topClubs: Array<{
      id: string
      name: string
      location: string
      planName: string
      monthlyRevenue: number
      bookingsCount: number
      usersCount: number
      courtsCount: number
      subscriptionStatus: string
    }>
    dailyBookings: number[]
  }
  revenueAnalysis: Array<{
    month: string
    subscriptionRevenue: number
    bookingRevenue: number
    totalRevenue: number
  }>
  planDistribution: Array<{
    planName: string
    count: number
    revenue: number
  }>
  insights: {
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
}

interface AnalyticsDashboardProps {
  data: AnalyticsData
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('12m')

  const tabs = [
    { id: 'overview', name: 'Resumen General', icon: BarChart3 },
    { id: 'growth', name: 'Crecimiento', icon: TrendingUp },
    { id: 'usage', name: 'Uso y Actividad', icon: Activity },
    { id: 'insights', name: 'Insights', icon: Lightbulb }
  ]

  const dateRanges = [
    { id: '1m', name: '1 Mes' },
    { id: '3m', name: '3 Meses' },
    { id: '6m', name: '6 Meses' },
    { id: '12m', name: '12 Meses' }
  ]

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {dateRanges.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <MetricsCards 
            metrics={data.saasMetrics} 
            growth={data.growth}
            planDistribution={data.planDistribution}
          />
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GrowthChart 
              data={data.monthlyData}
              title="Crecimiento MRR"
              type="mrr"
            />
            <GrowthChart 
              data={data.revenueAnalysis}
              title="Análisis de Ingresos"
              type="revenue"
            />
          </div>
          
          {/* Additional overview sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Distribución por Plan</h3>
              <div className="space-y-3">
                {data.planDistribution.map((plan, index) => {
                  const percentage = data.saasMetrics.activeSubscriptions > 0 
                    ? (plan.count / data.saasMetrics.activeSubscriptions) * 100 
                    : 0
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{plan.planName}</div>
                        <div className="text-xs text-gray-500">{plan.count} clubes</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          ${plan.revenue.toLocaleString('es-MX')}
                        </div>
                        <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Estadísticas Rápidas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasa de Utilización</span>
                  <span className="font-medium">{data.usage.utilizationRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clubes Totales</span>
                  <span className="font-medium">{data.usage.totalClubs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clubes Activos</span>
                  <span className="font-medium">{data.usage.activeClubs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">LTV:CAC Ratio</span>
                  <span className={`font-medium ${
                    data.saasMetrics.cac > 0 && (data.saasMetrics.ltv / data.saasMetrics.cac) > 3 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {data.saasMetrics.cac > 0 ? (data.saasMetrics.ltv / data.saasMetrics.cac).toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Health Score */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Salud del Negocio</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Churn Rate</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    data.saasMetrics.churnRate > 5 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {data.saasMetrics.churnRate < 5 ? 'Saludable' : 'Alto'}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Crecimiento MRR</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    data.saasMetrics.mrrGrowth > 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {data.saasMetrics.mrrGrowth > 0 ? 'Positivo' : 'Negativo'}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">LTV/CAC</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    data.insights.healthyLTV 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {data.insights.healthyLTV ? 'Óptimo' : 'Mejorar'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'growth' && (
        <div className="space-y-6">
          <GrowthChart 
            data={data.monthlyData}
            title="Tendencias de Crecimiento"
            type="growth"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GrowthChart 
              data={data.monthlyData}
              title="Suscripciones Nuevas vs Canceladas"
              type="subscriptions"
            />
            <GrowthChart 
              data={data.revenueAnalysis}
              title="Desglose de Ingresos"
              type="revenue_breakdown"
            />
          </div>
        </div>
      )}

      {activeTab === 'usage' && (
        <UsageAnalytics 
          usage={data.usage}
          revenueAnalysis={data.revenueAnalysis}
        />
      )}

      {activeTab === 'insights' && (
        <Insights 
          insights={data.insights}
          metrics={data.saasMetrics}
          growth={data.growth}
        />
      )}
    </div>
  )
}