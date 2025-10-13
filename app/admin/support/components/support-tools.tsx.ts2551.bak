'use client'

import { useState } from 'react'
import { 
  HeadphonesIcon, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search,
  Eye,
  MessageSquare,
  Settings,
  Activity,
  Database,
  Wifi,
  Zap,
  Users,
  TrendingUp,
  Phone,
  Mail,
  Building2,
  ExternalLink,
  Shield,
  UserX,
  AlertTriangle
} from 'lucide-react'

interface SupportIssue {
  id: string
  title: string
  description: string
  priority: string
  status: string
  userId: string
  userEmail: string
  clubId: string
  clubName: string
  createdAt: Date
  category: string
}

interface SupportStats {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  avgResolutionTime: number
  satisfactionRating: number
  responseTimes: {
    avg: number
    p95: number
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  createdAt: Date
  club?: {
    name: string
    status: string
  }
}

interface SystemHealth {
  uptime: number
  responseTime: number
  errorRate: number
  activeUsers: number
  totalBookingsToday: number
  systemLoad: number
  databaseStatus: string
  stripeStatus: string
  whatsappStatus: string
}

interface SupportToolsProps {
  tools: {
    issues: SupportIssue[]
    stats: SupportStats
    users: User[]
    health: SystemHealth
  }
}

export default function SupportTools({ tools }: SupportToolsProps) {
  const [activeTab, setActiveTab] = useState('tickets')
  const [searchUser, setSearchUser] = useState('')
  const [impersonateUser, setImpersonateUser] = useState<User | null>(null)
  const [showImpersonateModal, setShowImpersonateModal] = useState(false)

  const tabs = [
    { id: 'tickets', name: 'Tickets de Soporte', icon: HeadphonesIcon },
    { id: 'users', name: 'Gestión de Usuarios', icon: Users },
    { id: 'health', name: 'Estado del Sistema', icon: Activity },
    { id: 'debug', name: 'Debug Tools', icon: Settings }
  ]

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (priority) {
      case 'HIGH':
        return `${baseClasses} bg-red-100 text-red-700`
      case 'MEDIUM':
        return `${baseClasses} bg-yellow-100 text-yellow-700`
      default:
        return `${baseClasses} bg-green-100 text-green-700`
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'OPEN':
        return `${baseClasses} bg-red-100 text-red-700`
      case 'IN_PROGRESS':
        return `${baseClasses} bg-yellow-100 text-yellow-700`
      case 'RESOLVED':
        return `${baseClasses} bg-green-100 text-green-700`
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
      case 'OPERATIONAL':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'ERROR':
      case 'DOWN':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const handleImpersonate = async (user: User) => {
    if (!confirm(`¿Estás seguro de que quieres impersonar a ${user.name}? Esta acción quedará registrada en los logs.`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/support/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (response.ok) {
        alert(`Impersonando a ${user.name}. Serás redirigido a su dashboard.`)
        // Redirect to user's dashboard
        window.location.href = '/dashboard'
      } else {
        alert('Error al impersonar usuario')
      }
    } catch (error) {
      alert('Error al impersonar usuario')
    }
  }

  const filteredUsers = tools.users.filter(user =>
    user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUser.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <HeadphonesIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Tickets Abiertos</span>
          </div>
          <div className="text-2xl font-bold">{tools.stats.openTickets}</div>
          <div className="text-sm text-gray-500">de {tools.stats.totalTickets} totales</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Tiempo Respuesta</span>
          </div>
          <div className="text-2xl font-bold">{tools.stats.responseTimes.avg}h</div>
          <div className="text-sm text-gray-500">promedio</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Satisfacción</span>
          </div>
          <div className="text-2xl font-bold">{tools.stats.satisfactionRating}/5</div>
          <div className="text-sm text-gray-500">rating promedio</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Sistema</span>
          </div>
          <div className="text-2xl font-bold">{tools.health.uptime}%</div>
          <div className="text-sm text-gray-500">uptime</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tickets Recientes</h3>
                <button className="btn btn-primary">
                  Crear Ticket
                </button>
              </div>

              <div className="space-y-4">
                {tools.issues.map((issue) => (
                  <div key={issue.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{issue.title}</h4>
                          <span className={getPriorityBadge(issue.priority)}>
                            {issue.priority}
                          </span>
                          <span className={getStatusBadge(issue.status)}>
                            {issue.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{issue.userEmail}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>{issue.clubName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{issue.createdAt.toLocaleString('es-MX')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm">
                          <MessageSquare className="w-4 h-4" />
                          Responder
                        </button>
                        <button className="btn btn-ghost btn-sm">
                          <Eye className="w-4 h-4" />
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Usuario</th>
                      <th className="text-left py-3 px-4 font-medium">Rol</th>
                      <th className="text-left py-3 px-4 font-medium">Club</th>
                      <th className="text-center py-3 px-4 font-medium">Estado</th>
                      <th className="text-center py-3 px-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {user.club ? (
                            <div>
                              <div className="font-medium">{user.club.name}</div>
                              <div className="text-sm text-gray-500">{user.club.status}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Sin club</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleImpersonate(user)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Impersonar usuario"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                              <UserX className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Estado del Sistema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Wifi className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Disponibilidad</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{tools.health.uptime}%</div>
                  <div className="text-sm text-gray-600">Último mes</div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Tiempo de Respuesta</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{tools.health.responseTime}ms</div>
                  <div className="text-sm text-gray-600">Promedio</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Usuarios Activos</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{tools.health.activeUsers}</div>
                  <div className="text-sm text-gray-600">Ahora</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Estado de Servicios</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">Base de Datos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tools.health.databaseStatus)}
                        <span className="text-sm font-medium">{tools.health.databaseStatus}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img src="/stripe-logo.png" alt="Stripe" className="w-5 h-5" onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }} />
                        <Settings className="w-5 h-5 text-gray-600 hidden" />
                        <span className="font-medium">Stripe</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tools.health.stripeStatus)}
                        <span className="text-sm font-medium">{tools.health.stripeStatus}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        <span className="font-medium">WhatsApp</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tools.health.whatsappStatus)}
                        <span className="text-sm font-medium">{tools.health.whatsappStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Métricas del Sistema</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Carga del Sistema</span>
                        <span className="text-sm">{tools.health.systemLoad}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${tools.health.systemLoad}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Tasa de Error</span>
                        <span className="text-sm">{(tools.health.errorRate * 100).toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${tools.health.errorRate * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium mb-1">Reservas Hoy</div>
                      <div className="text-2xl font-bold text-green-600">{tools.health.totalBookingsToday}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'debug' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Herramientas de Debug</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Acciones del Sistema</h4>
                  <div className="space-y-3">
                    <button className="w-full btn btn-ghost text-left justify-start">
                      <Database className="w-4 h-4" />
                      Limpiar Cache de Base de Datos
                    </button>
                    <button className="w-full btn btn-ghost text-left justify-start">
                      <Activity className="w-4 h-4" />
                      Reiniciar Servicios de Background
                    </button>
                    <button className="w-full btn btn-ghost text-left justify-start">
                      <MessageSquare className="w-4 h-4" />
                      Test WhatsApp Connection
                    </button>
                    <button className="w-full btn btn-ghost text-left justify-start">
                      <Settings className="w-4 h-4" />
                      Test Stripe Connection
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Diagnósticos</h4>
                  <div className="space-y-3">
                    <button className="w-full btn btn-ghost text-left justify-start">
                      <Eye className="w-4 h-4" />
                      Ver Logs en Tiempo Real
                    </button>
                    <button className="w-full btn btn-ghost text-left justify-start">
                      <Activity className="w-4 h-4" />
                      Monitor de Performance
                    </button>
                    <button className="w-full btn btn-ghost text-left justify-start">
                      <AlertCircle className="w-4 h-4" />
                      Generar Reporte de Sistema
                    </button>
                    <button className="w-full btn btn-ghost text-left justify-start">
                      <ExternalLink className="w-4 h-4" />
                      Abrir Logs Externos
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Zona de Peligro</span>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  Las siguientes acciones pueden afectar el funcionamiento del sistema. Úsalas con precaución.
                </p>
                <div className="space-y-2">
                  <button className="btn btn-warning btn-sm">
                    Activar Modo Mantenimiento
                  </button>
                  <button className="btn btn-error btn-sm">
                    Reiniciar Aplicación
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}