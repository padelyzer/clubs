'use client'

import Link from 'next/link'
import Image from 'next/image'

export function DashboardHeader({ club, user }: { club: any, user: any }) {
  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
      <div className="px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo y breadcrumb */}
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center group">
              <Image 
                src="/Padelyzer-Logo-Negro.png" 
                alt="Padelyzer" 
                width={120} 
                height={30}
                className="h-8 w-auto mr-3 group-hover:scale-110 transition-transform"
                priority
              />
              <div>
                <p className="text-sm text-[var(--text-secondary)] -mt-1">Panel de Control</p>
              </div>
            </Link>
            
            <div className="hidden md:block text-[var(--text-quaternary)]">|</div>
            
            <div className="hidden md:block">
              <h2 className="font-semibold text-[var(--text-primary)]">{club.name}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{club.city}, {club.state}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Upgrade CTA - Sutil pero visible */}
            <a
              href="https://pro.padelyzer.com"
              target="_blank"
              className="hidden lg:block px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--text-inverse)] transition-[var(--transition-base)]"
            >
              Actualizar a Pro
            </a>

            {/* Notifications */}
            <button className="relative p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-[var(--transition-base)]">
              <span className="text-xl">Notificaciones</span>
              <span className="absolute -top-1 -right-1 bg-[var(--danger)] text-[var(--text-inverse)] text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-[var(--text-primary)]">{user.name}</p>
                <p className="text-xs text-[var(--text-secondary)] capitalize">
                  {user.role.toLowerCase().replace('_', ' ')}
                </p>
              </div>
              
              <div className="relative group">
                <button className="w-10 h-10 bg-[var(--accent-primary)] rounded-full flex items-center justify-center text-[var(--text-inverse)] font-semibold hover:shadow-[var(--shadow-md)] transition-all duration-[var(--transition-base)]">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-primary)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--border-primary)] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-[var(--transition-base)] z-50">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  >
                    <span className="mr-3">Perfil:</span>
                    Mi Perfil
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  >
                    <span className="mr-3">Config:</span>
                    Configuración
                  </Link>
                  <div className="border-t border-[var(--border-primary)] my-2"></div>
                  <button
                    onClick={() => {
                      // Por ahora, redirigir directamente al login
                      window.location.href = '/login'
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger-wash)]"
                  >
                    <span className="mr-3">Salir:</span>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}