import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { Activity, Server, Database, Cpu, MemoryStick, HardDrive, Wifi, AlertTriangle, CheckCircle, Clock, TrendingUp, RefreshCw, Settings, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SystemMonitoringPage() {
  await requireSuperAdmin()

  // Obtener datos reales de la base de datos para algunos métricas
  const [
    totalUsers,
    totalClubs,
    totalBookings,
    recentActivity
  ] = await Promise.all([
    prisma.user.count(),
    prisma.club.count(),
    prisma.booking.count(),
    // Actividad reciente (últimas 24 horas)
    prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        club: { select: { name: true } }
      }
    })
  ])

  // Métricas del sistema (simuladas para propósitos de demostración)
  const systemMetrics = [
    {
      title: 'CPU Usage',
      value: '23.5%',
      subtitle: 'Normal operation',
      status: 'healthy',
      icon: <Cpu size={24} />,
      color: 'green',
      bgColor: '#10b981',
      trend: -2.1
    },
    {
      title: 'Memory Usage',
      value: '67.2%',
      subtitle: '5.4 GB / 8 GB',
      status: 'warning',
      icon: <MemoryStick size={24} />,
      color: 'orange',
      bgColor: '#f97316',
      trend: 3.2
    },
    {
      title: 'Disk Usage',
      value: '45.8%',
      subtitle: '183 GB / 400 GB',
      status: 'healthy',
      icon: <HardDrive size={24} />,
      color: 'blue',
      bgColor: '#3b82f6',
      trend: 0.8
    },
    {
      title: 'Network I/O',
      value: '1.2 MB/s',
      subtitle: 'In: 0.8 MB/s | Out: 0.4 MB/s',
      status: 'healthy',
      icon: <Wifi size={24} />,
      color: 'purple',
      bgColor: '#8b5cf6',
      trend: 15.3
    },
    {
      title: 'Database Connections',
      value: '24',
      subtitle: 'Active connections',
      status: 'healthy',
      icon: <Database size={24} />,
      color: 'indigo',
      bgColor: '#6366f1',
      trend: -1.5
    },
    {
      title: 'Response Time',
      value: '142 ms',
      subtitle: 'Average last hour',
      status: 'healthy',
      icon: <Zap size={24} />,
      color: 'green',
      bgColor: '#10b981',
      trend: -8.2
    }
  ]

  // Servicios y su estado
  const services = [
    { name: 'Web Server (Nginx)', status: 'running', uptime: '15d 4h 23m', cpu: '2.1%', memory: '45 MB' },
    { name: 'Database (PostgreSQL)', status: 'running', uptime: '15d 4h 20m', cpu: '1.8%', memory: '128 MB' },
    { name: 'Redis Cache', status: 'running', uptime: '15d 4h 18m', cpu: '0.5%', memory: '32 MB' },
    { name: 'Background Jobs', status: 'running', uptime: '2h 15m', cpu: '0.3%', memory: '18 MB' },
    { name: 'File Storage', status: 'running', uptime: '15d 4h 23m', cpu: '0.1%', memory: '12 MB' },
    { name: 'Email Service', status: 'warning', uptime: '3h 42m', cpu: '0.8%', memory: '25 MB' }
  ]

  // Alertas activas
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Memory usage has been above 65% for the last 30 minutes',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'Database backup scheduled for tonight at 2:00 AM',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      severity: 'low'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Email Service Restart',
      message: 'Email service was restarted due to connection timeout',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      severity: 'medium'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'healthy':
        return <CheckCircle size={16} color="#10b981" />
      case 'warning':
        return <AlertTriangle size={16} color="#f59e0b" />
      case 'error':
        return <AlertTriangle size={16} color="#ef4444" />
      default:
        return <Clock size={16} color="#6b7280" />
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle size={16} color="#ef4444" />
      case 'warning':
        return <AlertTriangle size={16} color="#f59e0b" />
      case 'info':
        return <CheckCircle size={16} color="#3b82f6" />
      default:
        return <Clock size={16} color="#6b7280" />
    }
  }

  const getAlertBadge = (severity: string) => {
    const colors = {
      high: { color: '#ef4444', bg: '#fee2e2' },
      medium: { color: '#f59e0b', bg: '#fef3c7' },
      low: { color: '#3b82f6', bg: '#dbeafe' }
    }
    const config = colors[severity as keyof typeof colors] || colors.low
    
    return (
      <span style={{
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '500',
        color: config.color,
        background: config.bg
      }}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
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
                Monitoreo del Sistema
              </h1>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Estado en tiempo real de servidores, base de datos y servicios
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

        {/* System Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {systemMetrics.map((metric, index) => (
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
                {metric.trend && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '12px',
                    color: metric.trend > 0 ? '#ef4444' : '#10b981'
                  }}>
                    <TrendingUp size={12} style={{ 
                      transform: metric.trend < 0 ? 'rotate(180deg)' : 'none' 
                    }} />
                    {Math.abs(metric.trend)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Services Status */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              Estado de Servicios
            </h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Servicio
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Estado
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Uptime
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      CPU
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Memoria
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getStatusIcon(service.status)}
                          <span style={{ fontWeight: '500' }}>
                            {service.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: service.status === 'running' ? '#10b981' : 
                                 service.status === 'warning' ? '#f59e0b' : '#ef4444',
                          background: service.status === 'running' ? '#d1fae5' : 
                                     service.status === 'warning' ? '#fef3c7' : '#fee2e2'
                        }}>
                          {service.status === 'running' ? 'Ejecutándose' : 
                           service.status === 'warning' ? 'Advertencia' : 'Error'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 0', fontSize: '14px', color: '#6b7280' }}>
                        {service.uptime}
                      </td>
                      <td style={{ padding: '16px 0', fontSize: '14px', color: '#6b7280' }}>
                        {service.cpu}
                      </td>
                      <td style={{ padding: '16px 0', fontSize: '14px', color: '#6b7280' }}>
                        {service.memory}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Alerts */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Alertas del Sistema
            </h2>
            
            <div>
              {alerts.map((alert) => (
                <div key={alert.id} style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {getAlertIcon(alert.type)}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h4 style={{ fontWeight: '500', fontSize: '14px' }}>
                          {alert.title}
                        </h4>
                        {getAlertBadge(alert.severity)}
                      </div>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                        {alert.message}
                      </p>
                      <p style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {alert.timestamp.toLocaleString('es-MX')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Application Metrics */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            Métricas de la Aplicación
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              padding: '20px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Activity size={32} color="#10b981" style={{ marginBottom: '8px' }} />
              <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {totalUsers}
              </h3>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                Usuarios Totales
              </p>
            </div>
            
            <div style={{
              padding: '20px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Server size={32} color="#3b82f6" style={{ marginBottom: '8px' }} />
              <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {totalClubs}
              </h3>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                Clubs Registrados
              </p>
            </div>
            
            <div style={{
              padding: '20px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <CheckCircle size={32} color="#f97316" style={{ marginBottom: '8px' }} />
              <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {totalBookings}
              </h3>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                Reservas Totales
              </p>
            </div>
            
            <div style={{
              padding: '20px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Clock size={32} color="#8b5cf6" style={{ marginBottom: '8px' }} />
              <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {recentActivity.length}
              </h3>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                Actividad 24h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}