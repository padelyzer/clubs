'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function DashboardSidebar({ 
  club, 
  needsSetup 
}: { 
  club: any
  needsSetup: boolean 
}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: 'Dashboard',
      description: 'Vista general'
    },
    { 
      name: 'Reservas', 
      href: '/dashboard/bookings', 
      icon: 'Reservas', 
      disabled: needsSetup,
      description: 'Gestionar reservas'
    },
    { 
      name: 'Recepción', 
      href: '/dashboard/reception', 
      icon: 'Recepción', 
      disabled: needsSetup,
      description: 'Check-in diario'
    },
    { 
      name: 'Configuración', 
      href: '/dashboard/settings', 
      icon: 'Config',
      description: 'Canchas, horarios, precios, pagos y más'
    },
    { 
      name: 'Clientes', 
      href: '/dashboard/customers', 
      icon: 'Clientes', 
      disabled: needsSetup,
      description: 'Base de datos'
    },
    { 
      name: 'Analytics', 
      href: '/dashboard/analytics', 
      icon: 'Analytics', 
      disabled: needsSetup,
      description: 'Métricas y reportes'
    },
  ]

  return (
    <aside className={`bg-white/80 backdrop-blur-sm border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-80'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm z-10"
      >
        <span className={`text-xs transition-transform ${isCollapsed ? 'rotate-180' : ''}`}>
          ←
        </span>
      </button>

      <div className="p-6">
        {/* Club Info */}
        <div className={`mb-8 transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-95' : 'opacity-100'}`}>
          <div className="flex items-center mb-4">
            {club.logo ? (
              <img 
                src={club.logo} 
                alt={club.name}
                className="w-12 h-12 rounded-full mr-4 border-2 border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                {club.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">{club.name}</h2>
              <p className="text-sm text-gray-500 truncate">{club.city}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="mb-4">
            {club.active ? (
              <div className="club-status approved flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Club Activo
              </div>
            ) : (
              <div className="club-status pending flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Configuración Pendiente
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-600">
                {club.courts?.length || 0}
              </div>
              <div className="text-xs text-green-700">Canchas</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-600">
                {club._count?.bookings || 0}
              </div>
              <div className="text-xs text-blue-700">Reservas</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const isDisabled = item.disabled && needsSetup

            return (
              <div key={item.name} className="relative group">
                {isDisabled ? (
                  <div className={`flex items-center px-4 py-3 text-gray-400 cursor-not-allowed rounded-xl transition-all duration-200 ${
                    isCollapsed ? 'justify-center' : ''
                  }`}>
                    <span className="text-xl">{item.icon}</span>
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 font-medium">{item.name}</span>
                        <span className="ml-auto text-xs">Bloqueado</span>
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isCollapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className={`text-xl ${isActive ? 'filter brightness-200' : ''}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <div className="ml-3 flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    )}
                  </Link>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                    {item.name}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Upgrade CTA - Sidebar version */}
        {!isCollapsed && (
          <div className="mt-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 text-white">
              <div className="text-lg font-semibold mb-2">¿Quieres más?</div>
              <p className="text-sm text-purple-100 mb-3">
                Desbloquea torneos, IA y finanzas avanzadas
              </p>
              <a
                href="https://pro.padelyzer.com"
                target="_blank"
                className="btn-secondary btn-sm w-full !text-purple-600 !bg-white !border-white hover:!bg-purple-50"
              >
                Ver Padelyzer Pro
              </a>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}