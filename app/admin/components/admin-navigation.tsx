'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronRight, 
  Bell, 
  User, 
  LogOut, 
  Search,
  BarChart3, 
  Building2, 
  CalendarDays, 
  DollarSign, 
  Home, 
  Mail, 
  Settings, 
  Shield, 
  Users2, 
  FileText,
  HeadphonesIcon,
  Activity,
  TrendingUp,
  CreditCard,
  Globe,
  Lock,
  Database,
  Zap,
  Menu,
  X,
  LayoutDashboard,
  ChartBar,
  UserCheck,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

interface NavigationItem {
  name: string
  href: string
  icon: any
  description?: string
  badge?: number | string
  badgeType?: 'success' | 'warning' | 'error' | 'info'
}

interface AdminNavigationProps {
  stats?: {
    pendingClubs: number
    pendingSupportTickets: number
    unreadNotifications: number
  }
  systemMetrics?: {
    uptime: number
  }
}

export default function AdminNavigation({ stats, systemMetrics }: AdminNavigationProps = {}) {
  const pathname = usePathname()
  const [collapsedSections, setCollapsedSections] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const pendingCounts = {
    clubs: stats?.pendingClubs || 0,
    users: 0,
    bookings: 0,
    support: stats?.pendingSupportTickets || 0,
    logs: 0,
    notifications: stats?.unreadNotifications || 0
  }

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  const navigationSections: NavigationSection[] = [
    {
      title: 'PRINCIPAL',
      items: [
        {
          name: 'Dashboard',
          href: '/admin/dashboard',
          icon: LayoutDashboard,
          description: 'Vista general'
        },
        {
          name: 'Clubes',
          href: '/admin/clubs',
          icon: Building2,
          description: 'Gestionar clubes',
          badge: pendingCounts.clubs,
          badgeType: 'warning'
        },
        {
          name: 'Usuarios',
          href: '/admin/users',
          icon: Users2,
          description: 'Gestionar usuarios',
          badge: pendingCounts.users,
          badgeType: 'info'
        },
        {
          name: 'Reservas',
          href: '/admin/bookings',
          icon: CalendarDays,
          description: 'Monitor de reservas',
          badge: pendingCounts.bookings,
          badgeType: 'success'
        }
      ]
    },
    {
      title: 'OPERACIONES',
      items: [
        {
          name: 'Finanzas',
          href: '/admin/finance',
          icon: DollarSign,
          description: 'Ingresos y comisiones'
        },
        {
          name: 'Comunicación',
          href: '/admin/communications',
          icon: Mail,
          description: 'Notificaciones masivas'
        },
        {
          name: 'Analytics',
          href: '/admin/analytics',
          icon: ChartBar,
          description: 'Reportes y métricas'
        },
        {
          name: 'Pagos',
          href: '/admin/payments',
          icon: CreditCard,
          description: 'Gestión de pagos'
        }
      ]
    },
    {
      title: 'SISTEMA',
      items: [
        {
          name: 'Logs',
          href: '/admin/logs',
          icon: Activity,
          description: 'Auditoría del sistema',
          badge: pendingCounts.logs,
          badgeType: 'error'
        },
        {
          name: 'Soporte',
          href: '/admin/support',
          icon: HeadphonesIcon,
          description: 'Herramientas de soporte',
          badge: pendingCounts.support,
          badgeType: 'warning'
        },
        {
          name: 'Configuración',
          href: '/admin/settings',
          icon: Settings,
          description: 'Configuración global'
        },
        {
          name: 'Seguridad',
          href: '/admin/security',
          icon: Lock,
          description: 'Configuración de seguridad'
        }
      ]
    }
  ]

  // Filtrar elementos de navegación basado en búsqueda
  const filteredSections = navigationSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.items.length > 0)

  const getBadgeColor = (type?: string) => {
    switch(type) {
      case 'success': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <nav className={`flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'}`}>
      {/* Header con Logo y Usuario */}
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-base font-bold text-gray-900">Padelyzer</h2>
                <p className="text-xs text-gray-500">Panel Admin</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            {isCollapsed ? <Menu className="h-5 w-5 text-gray-600" /> : <X className="h-5 w-5 text-gray-600" />}
          </button>
        </div>

        {/* Barra de búsqueda */}
        {!isCollapsed && (
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-gray-50 px-9 py-2.5 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
            />
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {filteredSections.map((section, sectionIndex) => {
          const isCollapsedSection = collapsedSections.includes(section.title)
          
          return (
            <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {/* Section Header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="tracking-wider">{section.title}</span>
                  {isCollapsedSection ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}

              {/* Section Items */}
              {!isCollapsedSection && (
                <ul className="mt-1 space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 shadow-sm border border-emerald-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'} ${isCollapsed ? 'justify-center px-3' : ''}`}
                          title={isCollapsed ? item.name : ''}
                        >
                          {/* Active Indicator */}
                          {isActive && !isCollapsed && (
                            <div className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-gradient-to-b from-emerald-500 to-green-600" />
                          )}
                          
                          {/* Icon */}
                          <div className={`flex flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'} ${isCollapsed ? 'h-8 w-8' : 'h-8 w-8'}`}>
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Text Content */}
                          {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="truncate">{item.name}</span>
                                {item.badge !== undefined && item.badge !== 0 && (
                                  <span className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(item.badgeType)}`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <div className={`text-xs truncate mt-0.5 ${isActive ? 'text-emerald-600/70' : 'text-gray-400'}`}>
                                  {item.description}
                                </div>
                              )}
                            </div>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer con Estado del Sistema */}
      <div className="border-t border-gray-200 p-4">
        {/* Quick Actions */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-around'} mb-3`}>
          <button className="relative group flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-all hover:bg-emerald-50 hover:text-emerald-600">
            <Bell className="h-5 w-5" />
            {pendingCounts.notifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center font-bold">
                  {pendingCounts.notifications}
                </span>
              </span>
            )}
          </button>
          {!isCollapsed && (
            <>
              <button className="group flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-all hover:bg-emerald-50 hover:text-emerald-600">
                <User className="h-5 w-5" />
              </button>
              <button className="group flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-all hover:bg-emerald-50 hover:text-emerald-600">
                <Settings className="h-5 w-5" />
              </button>
              <Link 
                href="/api/auth/logout"
                className="group flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-all hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
              </Link>
            </>
          )}
        </div>

        {/* System Status */}
        {!isCollapsed && (
          <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">Estado del Sistema</div>
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-xs text-emerald-700 font-medium">Todos los servicios operativos</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-500">Uptime</span>
              <span className="font-semibold text-gray-700">{systemMetrics?.uptime || 99.9}%</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </nav>
  )
}