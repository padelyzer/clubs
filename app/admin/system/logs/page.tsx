import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { FileText, AlertTriangle, Info, CheckCircle, XCircle, Search, Filter, Download, RefreshCw, Calendar, Clock, User, Activity, Zap, Database } from 'lucide-react'

export default async function SystemLogsPage() {
  await requireSuperAdmin()

  // Obtener datos reales para actividad reciente
  const [
    recentBookings,
    recentUsers,
    recentClubs
  ] = await Promise.all([
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        club: { select: { name: true } }
      }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    }),
    prisma.club.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true
      }
    })
  ])

  // Logs simulados del sistema
  const systemLogs = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      level: 'ERROR',
      category: 'Database',
      message: 'Connection pool exhausted - retrying connection',
      details: 'Max connections (20) reached. Query timeout after 30s.',
      source: 'prisma.client',
      userId: null,
      ip: '10.0.0.15'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      level: 'WARN',
      category: 'Authentication',
      message: 'Failed login attempt from suspicious IP',
      details: 'Multiple failed attempts detected for user: john.doe@email.com',
      source: 'auth.middleware',
      userId: null,
      ip: '192.168.1.100'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      level: 'INFO',
      category: 'Booking',
      message: 'New booking created successfully',
      details: `Booking ID: ${recentBookings[0]?.id || 'N/A'} for club: ${recentBookings[0]?.club?.name || 'N/A'}`,
      source: 'booking.service',
      userId: recentBookings[0]?.userId || null,
      ip: '203.0.113.45'
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      level: 'INFO',
      category: 'Payment',
      message: 'Payment processed successfully',
      details: 'Stripe payment webhook received and processed',
      source: 'payment.webhook',
      userId: null,
      ip: '54.187.216.72'
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 32 * 60 * 1000),
      level: 'DEBUG',
      category: 'Cache',
      message: 'Redis cache cleared',
      details: 'Cache invalidation for key pattern: user_sessions:*',
      source: 'cache.service',
      userId: null,
      ip: '10.0.0.5'
    },
    {
      id: 6,
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      level: 'ERROR',
      category: 'Email',
      message: 'Failed to send notification email',
      details: 'SMTP timeout for booking confirmation email',
      source: 'email.service',
      userId: recentBookings[1]?.userId || null,
      ip: '10.0.0.8'
    },
    {
      id: 7,
      timestamp: new Date(Date.now() - 50 * 60 * 1000),
      level: 'INFO',
      category: 'User',
      message: 'New user registration',
      details: `User registered: ${recentUsers[0]?.email || 'N/A'}`,
      source: 'auth.service',
      userId: recentUsers[0]?.id || null,
      ip: '192.168.1.50'
    },
    {
      id: 8,
      timestamp: new Date(Date.now() - 65 * 60 * 1000),
      level: 'WARN',
      category: 'API',
      message: 'Rate limit exceeded',
      details: 'Client exceeded 100 requests per minute limit',
      source: 'rate.limiter',
      userId: null,
      ip: '203.0.113.89'
    },
    {
      id: 9,
      timestamp: new Date(Date.now() - 75 * 60 * 1000),
      level: 'INFO',
      category: 'Club',
      message: 'Club status updated',
      details: `Club ${recentClubs[0]?.name || 'N/A'} approved by admin`,
      source: 'club.service',
      userId: null,
      ip: '10.0.0.12'
    },
    {
      id: 10,
      timestamp: new Date(Date.now() - 80 * 60 * 1000),
      level: 'DEBUG',
      category: 'System',
      message: 'Scheduled backup completed',
      details: 'Database backup completed successfully - 2.3GB archived',
      source: 'backup.scheduler',
      userId: null,
      ip: '10.0.0.1'
    }
  ]

  // Estadísticas de logs
  const logStats = [
    {
      title: 'Total Logs Hoy',
      value: '1,247',
      subtitle: 'Últimas 24 horas',
      icon: <FileText size={24} />,
      color: 'blue',
      bgColor: '#3b82f6'
    },
    {
      title: 'Errores',
      value: '23',
      subtitle: 'Requieren atención',
      icon: <XCircle size={24} />,
      color: 'red',
      bgColor: '#ef4444'
    },
    {
      title: 'Advertencias',
      value: '67',
      subtitle: 'Posibles problemas',
      icon: <AlertTriangle size={24} />,
      color: 'orange',
      bgColor: '#f97316'
    },
    {
      title: 'Información',
      value: '1,157',
      subtitle: 'Eventos normales',
      icon: <Info size={24} />,
      color: 'green',
      bgColor: '#10b981'
    }
  ]

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <XCircle size={16} color="#ef4444" />
      case 'WARN':
        return <AlertTriangle size={16} color="#f97316" />
      case 'INFO':
        return <Info size={16} color="#3b82f6" />
      case 'DEBUG':
        return <CheckCircle size={16} color="#10b981" />
      default:
        return <Info size={16} color="#6b7280" />
    }
  }

  const getLogBadge = (level: string) => {
    const colors = {
      ERROR: { color: '#ef4444', bg: '#fee2e2' },
      WARN: { color: '#f97316', bg: '#fed7aa' },
      INFO: { color: '#3b82f6', bg: '#dbeafe' },
      DEBUG: { color: '#10b981', bg: '#d1fae5' }
    }
    const config = colors[level as keyof typeof colors] || colors.INFO
    
    return (
      <span style={{
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '500',
        color: config.color,
        background: config.bg
      }}>
        {level}
      </span>
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Database':
        return <Database size={14} color="#8b5cf6" />
      case 'Authentication':
        return <User size={14} color="#f59e0b" />
      case 'Booking':
        return <Calendar size={14} color="#10b981" />
      case 'Payment':
        return <Zap size={14} color="#3b82f6" />
      case 'User':
        return <User size={14} color="#06b6d4" />
      case 'Club':
        return <Activity size={14} color="#ef4444" />
      default:
        return <FileText size={14} color="#6b7280" />
    }
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
                Logs del Sistema
              </h1>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Monitoreo de eventos, errores y actividad del sistema en tiempo real
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
                <Search size={16} />
                Buscar
              </button>
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
                <Filter size={16} />
                Filtros
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
                <Download size={16} />
                Exportar
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

        {/* Log Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {logStats.map((stat, index) => (
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
                    {stat.title}
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: `${stat.bgColor}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.bgColor
                }}>
                  {stat.icon}
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                {stat.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Logs Table */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
              Logs Recientes
            </h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                Actualizando en tiempo real
              </span>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                animation: 'pulse 2s infinite'
              }} />
            </div>
          </div>

          <div style={{ 
            maxHeight: '600px', 
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ 
                background: '#f9fafb',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: '#6b7280', fontWeight: '500', borderBottom: '1px solid #e5e7eb' }}>
                    Nivel
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: '#6b7280', fontWeight: '500', borderBottom: '1px solid #e5e7eb' }}>
                    Tiempo
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: '#6b7280', fontWeight: '500', borderBottom: '1px solid #e5e7eb' }}>
                    Categoría
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: '#6b7280', fontWeight: '500', borderBottom: '1px solid #e5e7eb' }}>
                    Mensaje
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: '#6b7280', fontWeight: '500', borderBottom: '1px solid #e5e7eb' }}>
                    Origen
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: '#6b7280', fontWeight: '500', borderBottom: '1px solid #e5e7eb' }}>
                    IP
                  </th>
                </tr>
              </thead>
              <tbody>
                {systemLogs.map((log, index) => (
                  <tr key={log.id} style={{ 
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white'
                  }}>
                    <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getLogIcon(log.level)}
                        {getLogBadge(log.level)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', verticalAlign: 'top' }}>
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                          {log.timestamp.toLocaleTimeString('es-MX')}
                        </div>
                        <div style={{ fontSize: '11px' }}>
                          {log.timestamp.toLocaleDateString('es-MX')}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {getCategoryIcon(log.category)}
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>
                          {log.category}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                          {log.message}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          {log.details}
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b7280', verticalAlign: 'top' }}>
                      <code style={{ 
                        background: '#f3f4f6',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        {log.source}
                      </code>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b7280', verticalAlign: 'top' }}>
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '24px'
        }}>
          <button style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s',
            textAlign: 'left'
          }}>
            <XCircle size={20} color="#ef4444" />
            <span style={{ fontWeight: 500 }}>Ver Solo Errores</span>
          </button>
          
          <button style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s',
            textAlign: 'left'
          }}>
            <Download size={20} color="#3b82f6" />
            <span style={{ fontWeight: 500 }}>Exportar Logs</span>
          </button>
          
          <button style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s',
            textAlign: 'left'
          }}>
            <Search size={20} color="#10b981" />
            <span style={{ fontWeight: 500 }}>Búsqueda Avanzada</span>
          </button>
        </div>
      </div>
    </div>
  )
}