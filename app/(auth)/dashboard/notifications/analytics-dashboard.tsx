'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

interface AnalyticsData {
  metrics: {
    totalSent: number
    delivered: number
    opened: number
    clicked: number
    replied: number
    failed: number
    deliveryRate: number
    openRate: number
    clickRate: number
    responseRate: number
    avgResponseTime: number
  }
  peakHours: Array<{ hour: number, count: number }>
  topTemplates: Array<{ template: string, performance: number }>
  deviceBreakdown: Record<string, number>
  engagementFunnel: Array<{ name: string, count: number, percentage: number }>
  weeklyTrend: Array<{ day: string, sent: number, delivered: number, opened: number }>
}

export function AnalyticsDashboard({ clubId }: { clubId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7days')
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, refreshInterval)
    return () => clearInterval(interval)
  }, [clubId, dateRange, refreshInterval])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/notifications/analytics?clubId=${clubId}&range=${dateRange}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !analytics) {
    return <div className="animate-pulse">Cargando analytics...</div>
  }

  const { metrics, peakHours, topTemplates, deviceBreakdown, engagementFunnel, weeklyTrend } = analytics

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  // Format device breakdown for pie chart
  const deviceData = Object.entries(deviceBreakdown).map(([device, count]) => ({
    name: device,
    value: count
  }))

  // Performance radar data
  const performanceData = [
    { metric: 'Entrega', value: metrics.deliveryRate },
    { metric: 'Apertura', value: metrics.openRate },
    { metric: 'Click', value: metrics.clickRate },
    { metric: 'Respuesta', value: metrics.responseRate },
    { metric: 'Velocidad', value: Math.max(0, 100 - metrics.avgResponseTime) }
  ]

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics de Notificaciones</h2>
        <div className="flex gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="24h">Últimas 24 horas</option>
            <option value="7days">Últimos 7 días</option>
            <option value="30days">Últimos 30 días</option>
            <option value="90days">Últimos 90 días</option>
          </select>
          <select
            value={refreshInterval.toString()}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="10000">Actualizar cada 10s</option>
            <option value="30000">Actualizar cada 30s</option>
            <option value="60000">Actualizar cada 1m</option>
            <option value="300000">Actualizar cada 5m</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Tasa de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {metrics.deliveryRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.delivered} de {metrics.totalSent} enviados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Tasa de Apertura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {metrics.openRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.opened} abiertos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Tasa de Click</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {metrics.clickRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.clicked} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Tiempo de Respuesta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {metrics.avgResponseTime} min
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Promedio de respuesta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Embudo de Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementFunnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {engagementFunnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="sent" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="delivered" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="opened" stackId="1" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Horas Pico</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Dispositivos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento General</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={performanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Top Plantillas por Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topTemplates.map((template, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <span className="font-medium">{template.template}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${template.performance}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{template.performance.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad en Tiempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-gray-600">Sistema activo - Actualizando cada {refreshInterval / 1000}s</span>
            </div>
            <div className="text-xs text-gray-500">
              Última actualización: {new Date().toLocaleTimeString('es-MX')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}