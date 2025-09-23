import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { Zap, Webhook, Key, Globe, Activity, BarChart, AlertTriangle, CheckCircle, Clock, Settings, RefreshCw, Plus, Copy, Eye, EyeOff, Trash2, Edit3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function APIManagementPage() {
  await requireSuperAdmin()

  // Obtener algunos datos reales para contexto
  const [totalBookings, totalClubs] = await Promise.all([
    prisma.booking.count(),
    prisma.club.count()
  ])

  // Métricas de API simuladas
  const apiMetrics = [
    {
      title: 'Requests Totales',
      value: '1.2M',
      subtitle: 'Último mes',
      icon: <Globe size={24} />,
      color: 'blue',
      bgColor: '#3b82f6',
      trend: 15.2
    },
    {
      title: 'Requests/min',
      value: '847',
      subtitle: 'Promedio actual',
      icon: <Activity size={24} />,
      color: 'green',
      bgColor: '#10b981',
      trend: -3.1
    },
    {
      title: 'Latencia Promedio',
      value: '145ms',
      subtitle: 'Tiempo respuesta',
      icon: <Zap size={24} />,
      color: 'orange',
      bgColor: '#f97316',
      trend: -12.5
    },
    {
      title: 'Rate Limit',
      value: '98.7%',
      subtitle: 'Dentro del límite',
      icon: <BarChart size={24} />,
      color: 'purple',
      bgColor: '#8b5cf6',
      trend: 2.3
    },
    {
      title: 'Uptime',
      value: '99.9%',
      subtitle: 'Últimos 30 días',
      icon: <CheckCircle size={24} />,
      color: 'green',
      bgColor: '#10b981',
      trend: 0.1
    },
    {
      title: 'Webhooks Activos',
      value: '12',
      subtitle: 'Configurados',
      icon: <Webhook size={24} />,
      color: 'indigo',
      bgColor: '#6366f1',
      trend: 0
    }
  ]

  // API Keys simuladas
  const apiKeys = [
    {
      id: '1',
      name: 'Frontend Production',
      key: 'pk_live_51H...',
      created: new Date('2024-01-15'),
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      requests: 45200,
      status: 'active',
      scopes: ['bookings:read', 'bookings:write', 'clubs:read']
    },
    {
      id: '2',
      name: 'Mobile App',
      key: 'pk_live_52K...',
      created: new Date('2024-02-20'),
      lastUsed: new Date(Date.now() - 15 * 60 * 1000),
      requests: 28300,
      status: 'active',
      scopes: ['bookings:read', 'bookings:write', 'users:read']
    },
    {
      id: '3',
      name: 'Analytics Service',
      key: 'pk_live_53M...',
      created: new Date('2024-03-10'),
      lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000),
      requests: 12100,
      status: 'active',
      scopes: ['analytics:read', 'reports:read']
    },
    {
      id: '4',
      name: 'Testing Environment',
      key: 'pk_test_54N...',
      created: new Date('2024-08-05'),
      lastUsed: new Date('2024-08-20'),
      requests: 850,
      status: 'inactive',
      scopes: ['*']
    }
  ]

  // Webhooks configurados
  const webhooks = [
    {
      id: 1,
      name: 'Payment Notifications',
      url: 'https://api.bmad.mx/webhooks/payments',
      events: ['payment.completed', 'payment.failed'],
      status: 'active',
      lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
      successRate: 99.2,
      retries: 2
    },
    {
      id: 2,
      name: 'Booking Updates',
      url: 'https://notifications.bmad.mx/bookings',
      events: ['booking.created', 'booking.cancelled'],
      status: 'active',
      lastTriggered: new Date(Date.now() - 5 * 60 * 1000),
      successRate: 100,
      retries: 0
    },
    {
      id: 3,
      name: 'Club Approvals',
      url: 'https://admin.bmad.mx/webhooks/clubs',
      events: ['club.approved', 'club.rejected'],
      status: 'active',
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
      successRate: 97.8,
      retries: 1
    },
    {
      id: 4,
      name: 'Email Service',
      url: 'https://email.service.com/bmad',
      events: ['user.registered', 'booking.reminder'],
      status: 'warning',
      lastTriggered: new Date(Date.now() - 12 * 60 * 60 * 1000),
      successRate: 85.3,
      retries: 5
    }
  ]

  // Endpoints más utilizados
  const topEndpoints = [
    { path: '/api/bookings', method: 'GET', requests: 125400, avgTime: '120ms', status: 'healthy' },
    { path: '/api/bookings', method: 'POST', requests: 45200, avgTime: '230ms', status: 'healthy' },
    { path: '/api/clubs', method: 'GET', requests: 38900, avgTime: '95ms', status: 'healthy' },
    { path: '/api/users/me', method: 'GET', requests: 28300, avgTime: '85ms', status: 'healthy' },
    { path: '/api/courts', method: 'GET', requests: 22100, avgTime: '110ms', status: 'healthy' },
    { path: '/api/payments', method: 'POST', requests: 12400, avgTime: '450ms', status: 'warning' }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
        return <CheckCircle size={16} color="#10b981" />
      case 'warning':
        return <AlertTriangle size={16} color="#f59e0b" />
      case 'inactive':
      case 'error':
        return <AlertTriangle size={16} color="#ef4444" />
      default:
        return <Clock size={16} color="#6b7280" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: { color: '#10b981', bg: '#d1fae5' },
      inactive: { color: '#6b7280', bg: '#f3f4f6' },
      warning: { color: '#f59e0b', bg: '#fef3c7' },
      healthy: { color: '#10b981', bg: '#d1fae5' }
    }
    const config = colors[status as keyof typeof colors] || colors.inactive
    
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

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: { color: '#10b981', bg: '#d1fae5' },
      POST: { color: '#3b82f6', bg: '#dbeafe' },
      PUT: { color: '#f59e0b', bg: '#fef3c7' },
      DELETE: { color: '#ef4444', bg: '#fee2e2' }
    }
    const config = colors[method as keyof typeof colors] || colors.GET
    
    return (
      <span style={{
        padding: '2px 6px',
        borderRadius: '8px',
        fontSize: '10px',
        fontWeight: '600',
        color: config.color,
        background: config.bg
      }}>
        {method}
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
                Gestión de API & Webhooks
              </h1>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Administra claves API, webhooks y monitorea el rendimiento de la API
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
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}>
                <Plus size={16} />
                Nueva API Key
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

        {/* API Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {apiMetrics.map((metric, index) => (
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
                {metric.trend !== 0 && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '12px',
                    color: metric.trend > 0 ? (metric.title === 'Latencia Promedio' ? '#ef4444' : '#10b981') : '#ef4444'
                  }}>
                    <Activity size={12} />
                    {Math.abs(metric.trend)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* API Keys */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                API Keys
              </h2>
              <button style={{
                padding: '6px 12px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px'
              }}>
                <Plus size={14} />
                Nueva Key
              </button>
            </div>
            
            <div>
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontWeight: '500', marginBottom: '4px' }}>
                        {apiKey.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <code style={{
                          fontSize: '12px',
                          background: '#f3f4f6',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {apiKey.key}
                        </code>
                        <Copy size={12} color="#6b7280" style={{ cursor: 'pointer' }} />
                      </div>
                    </div>
                    {getStatusBadge(apiKey.status)}
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                    <p>Creada: {apiKey.created.toLocaleDateString('es-MX')}</p>
                    <p>Último uso: {apiKey.lastUsed.toLocaleDateString('es-MX')}</p>
                    <p>Requests: {apiKey.requests.toLocaleString()}</p>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Permisos:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {apiKey.scopes.map((scope, index) => (
                        <span key={index} style={{
                          padding: '2px 6px',
                          background: '#e5e7eb',
                          borderRadius: '8px',
                          fontSize: '10px',
                          color: '#374151'
                        }}>
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      padding: '4px 8px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Edit3 size={10} />
                      Editar
                    </button>
                    <button style={{
                      padding: '4px 8px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Trash2 size={10} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhooks */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                Webhooks
              </h2>
              <button style={{
                padding: '6px 12px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px'
              }}>
                <Plus size={14} />
                Nuevo Webhook
              </button>
            </div>
            
            <div>
              {webhooks.map((webhook) => (
                <div key={webhook.id} style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontWeight: '500' }}>
                      {webhook.name}
                    </h4>
                    {getStatusBadge(webhook.status)}
                  </div>
                  
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', wordBreak: 'break-all' }}>
                    {webhook.url}
                  </p>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Eventos:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {webhook.events.map((event, index) => (
                        <span key={index} style={{
                          padding: '2px 6px',
                          background: '#e5e7eb',
                          borderRadius: '8px',
                          fontSize: '10px',
                          color: '#374151'
                        }}>
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>
                    <p>Último disparo: {webhook.lastTriggered.toLocaleString('es-MX')}</p>
                    <p>Tasa de éxito: {webhook.successRate}%</p>
                    <p>Reintentos: {webhook.retries}</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      padding: '4px 8px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}>
                      Probar
                    </button>
                    <button style={{
                      padding: '4px 8px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}>
                      Logs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Endpoints */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            Endpoints Más Utilizados
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    Endpoint
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    Método
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    Requests
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    Tiempo Promedio
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {topEndpoints.map((endpoint, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 0' }}>
                      <code style={{
                        fontSize: '13px',
                        background: '#f3f4f6',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {endpoint.path}
                      </code>
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      {getMethodBadge(endpoint.method)}
                    </td>
                    <td style={{ padding: '12px 0', fontWeight: '500' }}>
                      {endpoint.requests.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 0', fontSize: '14px', color: '#6b7280' }}>
                      {endpoint.avgTime}
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getStatusIcon(endpoint.status)}
                        {getStatusBadge(endpoint.status)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}