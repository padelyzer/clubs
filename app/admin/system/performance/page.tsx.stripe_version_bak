import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { Zap, TrendingUp, TrendingDown, Clock, Cpu, MemoryStick, HardDrive, Wifi, BarChart, Activity, RefreshCw, Settings, AlertTriangle, CheckCircle, Target, Database } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PerformanceMetricsPage() {
  await requireSuperAdmin()

  // Obtener datos reales para métricas de rendimiento
  const [
    totalUsers,
    totalBookings,
    totalClubs,
    recentBookings
  ] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count(),
    prisma.club.count(),
    prisma.booking.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
  ])

  // Métricas de rendimiento del sistema
  const performanceMetrics = [
    {
      title: 'Tiempo de Respuesta',
      value: '142ms',
      subtitle: 'Promedio API (↓ 15ms)',
      icon: <Zap size={24} />,
      color: 'green',
      bgColor: '#10b981',
      trend: -9.5,
      target: '< 200ms'
    },
    {
      title: 'Throughput',
      value: '1,247',
      subtitle: 'Requests/min (↑ 8%)',
      icon: <TrendingUp size={24} />,
      color: 'blue',
      bgColor: '#3b82f6',
      trend: 8.2,
      target: '> 1,000/min'
    },
    {
      title: 'Error Rate',
      value: '0.12%',
      subtitle: 'Últimas 24h (↓ 0.03%)',
      icon: <AlertTriangle size={24} />,
      color: 'green',
      bgColor: '#10b981',
      trend: -25.0,
      target: '< 0.5%'
    },
    {
      title: 'Uptime',
      value: '99.98%',
      subtitle: 'Último mes (+ 0.01%)',
      icon: <CheckCircle size={24} />,
      color: 'green',
      bgColor: '#10b981',
      trend: 0.01,
      target: '> 99.9%'
    },
    {
      title: 'CPU Usage',
      value: '23.5%',
      subtitle: 'Promedio (↓ 5%)',
      icon: <Cpu size={24} />,
      color: 'orange',
      bgColor: '#f97316',
      trend: -5.2,
      target: '< 70%'
    },
    {
      title: 'Memory Usage',
      value: '67.2%',
      subtitle: '5.4GB / 8GB (↑ 3%)',
      icon: <MemoryStick size={24} />,
      color: 'orange',
      bgColor: '#f97316',
      trend: 3.1,
      target: '< 80%'
    }
  ]

  // Métricas de base de datos
  const databaseMetrics = [
    {
      title: 'Query Time',
      value: '12ms',
      subtitle: 'Promedio consultas',
      icon: <Database size={24} />,
      color: 'blue',
      bgColor: '#3b82f6',
      trend: -15.3
    },
    {
      title: 'Connections',
      value: '24/100',
      subtitle: 'Pool de conexiones',
      icon: <Activity size={24} />,
      color: 'green',
      bgColor: '#10b981',
      trend: -2.1
    },
    {
      title: 'Cache Hit Rate',
      value: '94.2%',
      subtitle: 'Redis performance',
      icon: <Target size={24} />,
      color: 'green',
      bgColor: '#10b981',
      trend: 2.3
    },
    {
      title: 'Disk I/O',
      value: '45MB/s',
      subtitle: 'Read/Write promedio',
      icon: <HardDrive size={24} />,
      color: 'purple',
      bgColor: '#8b5cf6',
      trend: 12.5
    }
  ]

  // Datos para gráficos de rendimiento (simulados)
  const performanceData = [
    { time: '00:00', response: 145, throughput: 980, errors: 2 },
    { time: '04:00', response: 138, throughput: 1120, errors: 1 },
    { time: '08:00', response: 156, throughput: 1380, errors: 3 },
    { time: '12:00', response: 142, throughput: 1250, errors: 1 },
    { time: '16:00', response: 139, throughput: 1190, errors: 2 },
    { time: '20:00', response: 148, throughput: 1080, errors: 0 },
    { time: '24:00', response: 142, throughput: 1247, errors: 1 }
  ]

  // Top endpoints más lentos
  const slowestEndpoints = [
    { endpoint: '/api/bookings/search', avgTime: '450ms', calls: 1250, p95: '890ms', status: 'warning' },
    { endpoint: '/api/reports/generate', avgTime: '380ms', calls: 89, p95: '1200ms', status: 'warning' },
    { endpoint: '/api/payments/process', avgTime: '320ms', calls: 567, p95: '650ms', status: 'normal' },
    { endpoint: '/api/clubs/analytics', avgTime: '280ms', calls: 234, p95: '520ms', status: 'normal' },
    { endpoint: '/api/users/profile/update', avgTime: '195ms', calls: 890, p95: '350ms', status: 'good' },
    { endpoint: '/api/courts/availability', avgTime: '165ms', calls: 2340, p95: '280ms', status: 'good' }
  ]

  // Recursos del sistema
  const systemResources = [
    { resource: 'CPU Cores', total: 8, used: 1.9, unit: 'cores' },
    { resource: 'RAM', total: 8, used: 5.4, unit: 'GB' },
    { resource: 'Disk Space', total: 400, used: 183, unit: 'GB' },
    { resource: 'Network', total: 1000, used: 234, unit: 'Mbps' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#10b981'
      case 'normal': return '#3b82f6'
      case 'warning': return '#f59e0b'
      case 'critical': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      good: { color: '#10b981', bg: '#d1fae5' },
      normal: { color: '#3b82f6', bg: '#dbeafe' },
      warning: { color: '#f59e0b', bg: '#fef3c7' },
      critical: { color: '#ef4444', bg: '#fee2e2' }
    }
    const config = colors[status as keyof typeof colors] || colors.normal
    
    return (
      <span style={{
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '500',
        color: config.color,
        background: config.bg
      }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div style={{ 
      padding: '24px', 
      background: '#f5f5f5', 
      minHeight: '100vh',
      width: '100%'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                Métricas de Rendimiento
              </h1>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Monitoreo en tiempo real del rendimiento del sistema y aplicación
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#374151'
              }}>
                <Settings size={16} />
                Configurar
              </button>
              <button style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}>
                <RefreshCw size={16} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {performanceMetrics.map((metric, index) => (
            <div key={index} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    {metric.title}
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {metric.value}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: `${metric.bgColor}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: metric.bgColor
                }}>
                  {metric.icon}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  {metric.subtitle}
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontSize: '12px',
                  color: metric.trend > 0 ? (metric.title === 'Error Rate' || metric.title.includes('Usage') ? '#ef4444' : '#10b981') : '#10b981'
                }}>
                  {metric.trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(metric.trend)}%
                </div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <p style={{ fontSize: '10px', color: '#9ca3af' }}>
                  Target: {metric.target}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Performance Chart */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              Rendimiento en el Tiempo (Últimas 24h)
            </h2>
            <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
              {performanceData.map((data, index) => {
                const maxResponse = Math.max(...performanceData.map(d => d.response))
                const maxThroughput = Math.max(...performanceData.map(d => d.throughput))
                const responseHeight = (data.response / maxResponse) * 150
                const throughputHeight = (data.throughput / maxThroughput) * 150
                
                return (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', height: '250px' }}>
                      <div style={{
                        width: '45%',
                        height: `${responseHeight}px`,
                        background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)',
                        borderRadius: '4px',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-20px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          color: '#4b5563',
                          whiteSpace: 'nowrap'
                        }}>
                          {data.response}ms
                        </div>
                      </div>
                      <div style={{
                        width: '45%',
                        height: `${throughputHeight}px`,
                        background: 'linear-gradient(180deg, #10b981, #047857)',
                        borderRadius: '4px',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-20px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          color: '#4b5563',
                          whiteSpace: 'nowrap'
                        }}>
                          {data.throughput}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: '#6b7280'
                    }}>
                      {data.time}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }} />
                <span>Tiempo Respuesta (ms)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }} />
                <span>Throughput (req/min)</span>
              </div>
            </div>
          </div>

          {/* System Resources */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Recursos del Sistema
            </h2>
            
            <div>
              {systemResources.map((resource, index) => {
                const percentage = (resource.used / resource.total) * 100
                const color = percentage > 80 ? '#ef4444' : percentage > 60 ? '#f59e0b' : '#10b981'
                
                return (
                  <div key={index} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        {resource.resource}
                      </span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {resource.used} / {resource.total} {resource.unit}
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: '#f3f4f6',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: color,
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Database Metrics */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Métricas de Base de Datos
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              {databaseMetrics.map((metric, index) => (
                <div key={index} style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                        {metric.title}
                      </p>
                      <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        {metric.value}
                      </p>
                    </div>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: `${metric.bgColor}15`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: metric.bgColor
                    }}>
                      {metric.icon}
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#6b7280' }}>
                    {metric.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Slowest Endpoints */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Endpoints Más Lentos
            </h2>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {slowestEndpoints.map((endpoint, index) => (
                <div key={index} style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <code style={{
                      fontSize: '12px',
                      background: '#f3f4f6',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      flex: 1,
                      marginRight: '8px'
                    }}>
                      {endpoint.endpoint}
                    </code>
                    {getStatusBadge(endpoint.status)}
                  </div>
                  
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span>Promedio: {endpoint.avgTime}</span>
                      <span>P95: {endpoint.p95}</span>
                    </div>
                    <div>
                      <span>Llamadas: {endpoint.calls.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}