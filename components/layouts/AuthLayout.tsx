'use client'

import { ReactNode } from 'react'
import { BaseLayout } from './BaseLayout'
import { Sidebar } from '../navigation/Sidebar'
import { MobileNav } from '../navigation/MobileNav'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AuthLayoutProps {
  children: ReactNode
  userInfo: {
    name: string
    email: string
    clubName?: string
    role: 'club' | 'admin'
  }
}

export function AuthLayout({ children, userInfo }: AuthLayoutProps) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  
  // Define navigation based on role
  const clubNavigation = {
    main: [
      { label: 'Resumen', href: '/dashboard', icon: '📊' },
      { label: 'Reservas', href: '/dashboard/bookings', icon: '📅' },
      { label: 'Canchas', href: '/dashboard/courts', icon: '🎾' },
      { label: 'Precios', href: '/dashboard/pricing', icon: '💰' },
      { label: 'Horarios', href: '/dashboard/schedule', icon: '⏰' },
      { label: 'Recepción', href: '/dashboard/reception', icon: '📱' },
    ],
    secondary: [
      { label: 'Pagos', href: '/dashboard/payments', icon: '💳' },
      { label: 'Notificaciones', href: '/dashboard/notifications', icon: '🔔' },
      { label: 'Widget', href: '/dashboard/widget', icon: '🔗' },
      { label: 'Ajustes', href: '/dashboard/settings', icon: '⚙️' },
    ]
  }
  
  const adminNavigation = {
    main: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
      { label: 'Clubes', href: '/admin/clubs', icon: '🏢' },
      { label: 'Usuarios', href: '/admin/users', icon: '👥' },
      { label: 'Reservas', href: '/admin/bookings', icon: '📚' },
      { label: 'Finanzas', href: '/admin/finance', icon: '💵' },
      { label: 'Comunicaciones', href: '/admin/communications', icon: '📨' },
      { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
      { label: 'Logs', href: '/admin/logs', icon: '📝' },
      { label: 'Soporte', href: '/admin/support', icon: '🛠️' },
      { label: 'Configuración', href: '/admin/settings', icon: '⚙️' },
    ]
  }
  
  const navigation = isAdmin ? adminNavigation : clubNavigation
  const mobileNavItems = [...navigation.main, ...(navigation.secondary || [])]
  
  const header = (
    <div role="navigation" aria-label="Top navigation">
      <div data-header-container>
        {/* Logo */}
        <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'}>
          <span>Padelyzer</span>
        </Link>
        
        {/* User info */}
        <div data-user-info>
          {userInfo.clubName && <span>{userInfo.clubName}</span>}
          <span>{userInfo.name}</span>
          <span>{userInfo.role === 'admin' ? 'Super Admin' : 'Club'}</span>
        </div>
        
        {/* Mobile nav toggle */}
        <div data-mobile-only>
          <MobileNav 
            navigation={mobileNavItems}
            userInfo={{
              name: userInfo.name,
              role: userInfo.role === 'admin' ? 'Super Admin' : 'Club Dashboard'
            }}
          />
        </div>
        
        {/* Logout */}
        <form action="/api/logout" method="POST">
          <button type="submit" aria-label="Logout">
            Cerrar Sesión
          </button>
        </form>
      </div>
    </div>
  )
  
  const sidebar = (
    <div data-desktop-only>
      <Sidebar 
        navigation={navigation}
        userRole={userInfo.role}
      />
    </div>
  )
  
  const footer = (
    <div role="contentinfo">
      <nav aria-label="Footer navigation">
        <Link href="/terms">Términos</Link>
        <Link href="/privacy">Privacidad</Link>
        <Link href="/support">Soporte</Link>
      </nav>
      <p>© 2024 Padelyzer</p>
    </div>
  )
  
  return (
    <BaseLayout
      header={header}
      sidebar={sidebar}
      footer={footer}
      showBreadcrumbs={true}
    >
      {children}
    </BaseLayout>
  )
}