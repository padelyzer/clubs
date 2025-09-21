import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { Shield, Lock, Key, AlertTriangle, CheckCircle, Eye, Users, Globe, Activity, Settings, RefreshCw, Ban, UserX, Clock, Zap } from 'lucide-react'

export default async function SecuritySettingsPage() {
  await requireSuperAdmin()

  // Obtener datos reales de actividad reciente para contexto de seguridad
  const [
    recentUsers,
    activeUsers,
    totalBookings
  ] = await Promise.all([
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        createdAt: true,
        role: true
      }
    }),
    prisma.user.count({
      where: {
        // Usuarios activos en las últimas 24 horas (simulado)
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.booking.count()
  ])

  // Métricas de seguridad simuladas
  const securityMetrics = [
    {
      title: 'Intentos de Login',
      value: '1,247',
      subtitle: 'Últimas 24h (98.2% éxito)',
      icon: <Lock size={24} />,
      color: 'green',
      bgColor: '#10b981',
      status: 'healthy'
    },
    {
      title: 'IPs Bloqueadas',
      value: '23',
      subtitle: 'Bloqueados por actividad sospechosa',
      icon: <Ban size={24} />,
      color: 'red',
      bgColor: '#ef4444',
      status: 'warning'
    },
    {
      title: 'Sesiones Activas',
      value: '456',
      subtitle: 'Usuarios conectados ahora',
      icon: <Users size={24} />,
      color: 'blue',
      bgColor: '#3b82f6',
      status: 'healthy'
    },
    {
      title: 'Rate Limits',
      value: '12',
      subtitle: 'Activaciones en la última hora',
      icon: <Zap size={24} />,
      color: 'orange',
      bgColor: '#f97316',
      status: 'normal'
    },
    {
      title: 'SSL/TLS',
      value: '100%',
      subtitle: 'Conexiones seguras',
      icon: <Shield size={24} />,
      color: 'green',
      bgColor: '#10b981',
      status: 'secure'
    },
    {
      title: '2FA Activo',
      value: '67%',
      subtitle: 'De usuarios admin',
      icon: <Key size={24} />,
      color: 'purple',
      bgColor: '#8b5cf6',
      status: 'improving'
    }
  ]

  // Actividad sospechosa simulada
  const suspiciousActivity = [
    {
      id: 1,
      type: 'Multiple failed logins',
      ip: '192.168.1.100',
      user: 'john.doe@email.com',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      severity: 'high',
      status: 'blocked'
    },
    {
      id: 2,
      type: 'Rate limit exceeded',
      ip: '203.0.113.45',
      user: 'anonymous',
      timestamp: new Date(Date.now() - 32 * 60 * 1000),
      severity: 'medium',
      status: 'throttled'
    },
    {
      id: 3,
      type: 'Suspicious API usage',
      ip: '10.0.0.50',
      user: 'api_client_2',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      severity: 'medium',
      status: 'monitored'
    },
    {
      id: 4,
      type: 'Invalid JWT token',
      ip: '198.51.100.22',
      user: 'anonymous',
      timestamp: new Date(Date.now() - 65 * 60 * 1000),
      severity: 'low',
      status: 'logged'
    },
    {
      id: 5,
      type: 'SQL injection attempt',
      ip: '172.16.0.33',
      user: 'anonymous',
      timestamp: new Date(Date.now() - 85 * 60 * 1000),
      severity: 'critical',
      status: 'blocked'
    }
  ]

  // Configuración de seguridad
  const securitySettings = [
    {
      category: 'Autenticación',
      settings: [
        { name: 'Requerir 2FA para admins', enabled: true, description: 'Autenticación de dos factores obligatoria' },
        { name: 'Sesiones SSL únicamente', enabled: true, description: 'Forzar HTTPS para todas las conexiones' },
        { name: 'Timeout de sesión', value: '30 minutos', description: 'Expiración automática de sesiones inactivas' },
        { name: 'Máximo intentos de login', value: '5', description: 'Bloquear IP después de fallos consecutivos' }
      ]
    },
    {
      category: 'API Security',
      settings: [
        { name: 'Rate limiting', enabled: true, description: '1000 requests por minuto por IP' },
        { name: 'API Key rotation', value: '90 días', description: 'Rotación automática de claves' },
        { name: 'CORS políticas estrictas', enabled: true, description: 'Solo dominios autorizados' },
        { name: 'Request logging', enabled: true, description: 'Log de todas las peticiones API' }
      ]
    },
    {
      category: 'Base de Datos',
      settings: [
        { name: 'Encriptación en reposo', enabled: true, description: 'AES-256 para datos sensibles' },
        { name: 'Backups encriptados', enabled: true, description: 'Respaldos con encriptación GPG' },
        { name: 'Auditoría de consultas', enabled: true, description: 'Log de consultas modificadoras' },
        { name: 'IP whitelist DB', enabled: false, description: 'Solo IPs autorizadas pueden conectar' }
      ]
    }
  ]

  // IPs bloqueadas
  const blockedIPs = [
    { ip: '192.168.1.100', reason: 'Multiple failed login attempts', blocked: new Date(Date.now() - 2 * 60 * 60 * 1000), expires: new Date(Date.now() + 22 * 60 * 60 * 1000) },
    { ip: '203.0.113.89', reason: 'Rate limit violations', blocked: new Date(Date.now() - 6 * 60 * 60 * 1000), expires: new Date(Date.now() + 18 * 60 * 60 * 1000) },
    { ip: '172.16.0.33', reason: 'SQL injection attempt', blocked: new Date(Date.now() - 12 * 60 * 60 * 1000), expires: new Date(Date.now() + 36 * 60 * 60 * 1000) },
    { ip: '198.51.100.44', reason: 'Suspicious bot behavior', blocked: new Date(Date.now() - 18 * 60 * 60 * 1000), expires: new Date(Date.now() + 6 * 60 * 60 * 1000) }
  ]

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: { color: '#ef4444', bg: '#fee2e2' },
      high: { color: '#f97316', bg: '#fed7aa' },
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

  const getStatusBadge = (status: string) => {
    const colors = {
      blocked: { color: '#ef4444', bg: '#fee2e2' },
      throttled: { color: '#f59e0b', bg: '#fef3c7' },
      monitored: { color: '#3b82f6', bg: '#dbeafe' },
      logged: { color: '#6b7280', bg: '#f3f4f6' }
    }
    const config = colors[status as keyof typeof colors] || colors.logged
    
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
                Configuración de Seguridad
              </h1>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Administra políticas de seguridad, monitorea amenazas y configura protecciones
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
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}>
                <AlertTriangle size={16} />
                Scan Seguridad
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

        {/* Security Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {securityMetrics.map((metric, index) => (
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
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                {metric.subtitle}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Suspicious Activity */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              Actividad Sospechosa Reciente
            </h2>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {suspiciousActivity.map((activity) => (
                <div key={activity.id} style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  borderLeftColor: activity.severity === 'critical' ? '#ef4444' : 
                                  activity.severity === 'high' ? '#f97316' :
                                  activity.severity === 'medium' ? '#f59e0b' : '#3b82f6',
                  borderLeftWidth: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontWeight: '500', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={16} color={
                          activity.severity === 'critical' ? '#ef4444' : 
                          activity.severity === 'high' ? '#f97316' :
                          activity.severity === 'medium' ? '#f59e0b' : '#3b82f6'
                        } />
                        {activity.type}
                      </h4>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {getSeverityBadge(activity.severity)}
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                    <p><strong>IP:</strong> {activity.ip}</p>
                    <p><strong>Usuario:</strong> {activity.user}</p>
                    <p><strong>Tiempo:</strong> {activity.timestamp.toLocaleString('es-MX')}</p>
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
                      Ver Detalles
                    </button>
                    {activity.status !== 'blocked' && (
                      <button style={{
                        padding: '4px 8px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}>
                        Bloquear IP
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blocked IPs */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              IPs Bloqueadas
            </h2>
            
            <div>
              {blockedIPs.map((blocked, index) => (
                <div key={index} style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <code style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      background: '#fee2e2',
                      color: '#ef4444',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {blocked.ip}
                    </code>
                  </div>
                  
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                    <strong>Razón:</strong> {blocked.reason}
                  </p>
                  
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>
                    <p>Bloqueado: {blocked.blocked.toLocaleString('es-MX')}</p>
                    <p>Expira: {blocked.expires.toLocaleString('es-MX')}</p>
                  </div>
                  
                  <button style={{
                    width: '100%',
                    padding: '4px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: '#374151'
                  }}>
                    Desbloquear
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            Configuración de Seguridad
          </h2>
          
          {securitySettings.map((category, categoryIndex) => (
            <div key={categoryIndex} style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                {category.category}
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px'
              }}>
                {category.settings.map((setting, settingIndex) => (
                  <div key={settingIndex} style={{
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 style={{ fontWeight: '500', fontSize: '14px' }}>
                        {setting.name}
                      </h4>
                      {setting.enabled !== undefined ? (
                        <div style={{
                          width: '40px',
                          height: '20px',
                          borderRadius: '10px',
                          background: setting.enabled ? '#10b981' : '#e5e7eb',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: 'white',
                            position: 'absolute',
                            top: '2px',
                            left: setting.enabled ? '22px' : '2px',
                            transition: 'left 0.2s'
                          }} />
                        </div>
                      ) : (
                        <span style={{
                          fontSize: '12px',
                          padding: '2px 6px',
                          background: '#f3f4f6',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          {setting.value}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                      {setting.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}