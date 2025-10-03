'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Users, Trophy, Settings,
  Home, Clock, User, Search, Bell,
  ChevronDown, ChevronRight, DollarSign, BookOpen, Activity, TrendingUp, Calendar,
  Building, Zap, CreditCard, MessageCircle, GraduationCap, Award, UserCheck,
  Receipt, FileText, Target, ChartBar, Package, LogOut
} from 'lucide-react'
// import { logoutAction } from '@/lib/auth/actions' // OLD - Server Action
import { logout } from '@/lib/auth/logout-helper' // NEW - API Route
import { PageErrorBoundary } from '@/components/error-boundaries/ErrorBoundary'

interface CleanDashboardLayoutProps {
  children: React.ReactNode
  clubName?: string
  userName?: string
  userRole?: string
  enabledModules?: string[]
}

export function CleanDashboardLayout({ 
  children, 
  clubName = 'Club Pádel México',
  userName = 'Administrador del Club',
  userRole = 'Administrador',
  enabledModules = ['bookings', 'customers', 'tournaments', 'classes', 'finance']
}: CleanDashboardLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const pathname = usePathname()
  
  // Extract club slug from pathname - only if we're in a /c/[slug] route
  let clubSlug = ''
  let basePath = ''
  
  if (pathname.startsWith('/c/')) {
    const pathParts = pathname.split('/')
    clubSlug = pathParts[2] || '' // /c/[clubSlug]/...
    basePath = clubSlug ? `/c/${clubSlug}` : ''
  }

  useEffect(() => {
    setMounted(true)
    // Auto-expand settings if we're in a settings page
    if (pathname.includes('/dashboard/settings')) {
      setExpandedMenus(['settings'])
    }
    // Auto-expand classes if we're in a classes or coaches page
    if (pathname.includes('/dashboard/classes') || pathname.includes('/dashboard/coaches')) {
      setExpandedMenus(['classes'])
    }
    // Auto-expand finance if we're in a finance page
    if (pathname.includes('/dashboard/finance')) {
      setExpandedMenus(['finance'])
    }
  }, [pathname])

  // Definir todos los elementos del menú con sus módulos correspondientes
  const allMainNavItems = [
    { href: `${basePath}/dashboard`, label: 'Dashboard', icon: <Home size={18} />, module: null },
    { href: `${basePath}/dashboard/bookings`, label: 'Reservas', icon: <Clock size={18} />, module: 'bookings' },
    { href: `${basePath}/dashboard/players`, label: 'Clientes', icon: <Users size={18} />, module: 'customers' },
    { href: `/dashboard/tournaments`, label: 'Torneos', icon: <Trophy size={18} />, module: 'tournaments' },
  ]
  
  // Filtrar elementos según los módulos habilitados
  const mainNavItems = allMainNavItems.filter(item => {
    if (!item.module) return true
    return enabledModules.includes(item.module)
  })

  const classesSubItems = [
    { href: `${basePath}/dashboard/classes`, label: 'Clases', icon: <BookOpen size={16} /> },
    { href: `${basePath}/dashboard/coaches`, label: 'Coaches', icon: <GraduationCap size={16} /> },
  ]

  const financeSubItems = [
    { href: `${basePath}/dashboard/finance`, label: 'Dashboard', icon: <ChartBar size={16} /> },
    { href: `${basePath}/dashboard/finance/income`, label: 'Ingresos', icon: <TrendingUp size={16} /> },
    { href: `${basePath}/dashboard/finance/expenses`, label: 'Gastos', icon: <Receipt size={16} /> },
    { href: `${basePath}/dashboard/finance/payroll`, label: 'Nómina', icon: <Users size={16} /> },
    { href: `${basePath}/dashboard/finance/reports`, label: 'Reportes', icon: <FileText size={16} /> },
    { href: `${basePath}/dashboard/finance/budgets`, label: 'Presupuestos', icon: <Target size={16} /> },
  ]

  const settingsSubItems = [
    { href: `${basePath}/dashboard/settings/club`, label: 'Información del Club', icon: <Building size={16} /> },
    { href: `${basePath}/dashboard/team`, label: 'Usuarios', icon: <Users size={16} /> },
    { href: `${basePath}/dashboard/settings/courts`, label: 'Canchas', icon: <Zap size={16} /> },
    { href: `${basePath}/dashboard/settings/payments`, label: 'Pagos', icon: <CreditCard size={16} /> },
    { href: `${basePath}/dashboard/settings/notifications`, label: 'Notificaciones', icon: <MessageCircle size={16} /> },
  ]

  const toggleMenu = (menuId: string) => {
    if (expandedMenus.includes(menuId)) {
      setExpandedMenus(expandedMenus.filter(id => id !== menuId))
    } else {
      setExpandedMenus([...expandedMenus, menuId])
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      <style jsx global>{`
        body, html {
          margin: 0 !important;
          padding: 0 !important;
        }
        * {
          box-sizing: border-box !important;
        }
      `}</style>
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
        margin: 0,
        padding: 0,
      }}>
      {/* Fixed Sidebar */}
      <aside style={{
        width: '280px',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(164, 223, 78, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(164, 223, 78, 0.1)',
        }}>
          <Link href={`${basePath}/dashboard`} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}>
              <Image 
                src="/Padelyzer-Logo-Negro.png" 
                alt="Padelyzer" 
                width={161} 
                height={40}
                style={{
                  height: 'auto',
                  maxWidth: '161px',
                }}
                priority
              />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
        }}>
          {/* Main Navigation Items */}
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  marginBottom: '4px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? '#182A01' : '#516640',
                  background: isActive 
                    ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(164, 223, 78, 0.2)' : '1px solid transparent',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}

          {/* Classes Menu with Submenu - Solo mostrar si el módulo está habilitado */}
          {enabledModules.includes('classes') && (
          <div style={{ marginTop: '4px' }}>
            {/* Classes Main Item */}
            <button
              onClick={() => toggleMenu('classes')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '4px',
                borderRadius: '12px',
                background: (pathname.includes('/dashboard/classes') || pathname.includes('/dashboard/coaches'))
                  ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))'
                  : 'transparent',
                border: (pathname.includes('/dashboard/classes') || pathname.includes('/dashboard/coaches'))
                  ? '1px solid rgba(164, 223, 78, 0.2)' 
                  : '1px solid transparent',
                color: (pathname.includes('/dashboard/classes') || pathname.includes('/dashboard/coaches')) ? '#182A01' : '#516640',
                fontWeight: (pathname.includes('/dashboard/classes') || pathname.includes('/dashboard/coaches')) ? 600 : 400,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOpen size={18} />
                <span>Clases</span>
              </div>
              {expandedMenus.includes('classes') ? 
                <ChevronDown size={16} /> : 
                <ChevronRight size={16} />
              }
            </button>

            {/* Classes Submenu */}
            {expandedMenus.includes('classes') && (
              <div style={{
                paddingLeft: '16px',
                marginTop: '4px',
                borderLeft: '2px solid rgba(164, 223, 78, 0.2)',
                marginLeft: '16px'
              }}>
                {classesSubItems.map((subItem) => {
                  const isActiveSubItem = pathname === subItem.href
                  
                  return (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        marginBottom: '2px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActiveSubItem ? '#182A01' : '#7A8471',
                        background: isActiveSubItem 
                          ? 'rgba(164, 223, 78, 0.08)'
                          : 'transparent',
                        fontWeight: isActiveSubItem ? 600 : 400,
                        fontSize: '13px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActiveSubItem) {
                          e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                          e.currentTarget.style.color = '#516640'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActiveSubItem) {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = '#7A8471'
                        }
                      }}
                    >
                      {subItem.icon}
                      <span>{subItem.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
          )}

          {/* Finance Menu with Submenu - Solo mostrar si el módulo está habilitado */}
          {enabledModules.includes('finance') && (
          <div style={{ marginTop: '4px' }}>
            {/* Finance Main Item */}
            <button
              onClick={() => toggleMenu('finance')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '4px',
                borderRadius: '12px',
                background: pathname.includes('/dashboard/finance')
                  ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))'
                  : 'transparent',
                border: pathname.includes('/dashboard/finance') 
                  ? '1px solid rgba(164, 223, 78, 0.2)' 
                  : '1px solid transparent',
                color: pathname.includes('/dashboard/finance') ? '#182A01' : '#516640',
                fontWeight: pathname.includes('/dashboard/finance') ? 600 : 400,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <DollarSign size={18} />
                <span>Finanzas</span>
              </div>
              {expandedMenus.includes('finance') ? 
                <ChevronDown size={16} /> : 
                <ChevronRight size={16} />
              }
            </button>

            {/* Finance Submenu */}
            {expandedMenus.includes('finance') && (
              <div style={{
                paddingLeft: '16px',
                marginTop: '4px',
                borderLeft: '2px solid rgba(164, 223, 78, 0.2)',
                marginLeft: '16px'
              }}>
                {financeSubItems.map((subItem) => {
                  const isActiveSubItem = pathname === subItem.href
                  
                  return (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        marginBottom: '2px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActiveSubItem ? '#182A01' : '#7A8471',
                        background: isActiveSubItem 
                          ? 'rgba(164, 223, 78, 0.08)'
                          : 'transparent',
                        fontWeight: isActiveSubItem ? 600 : 400,
                        fontSize: '13px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActiveSubItem) {
                          e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                          e.currentTarget.style.color = '#516640'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActiveSubItem) {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = '#7A8471'
                        }
                      }}
                    >
                      {subItem.icon}
                      <span>{subItem.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
          )}

          {/* Settings Menu with Submenu - Solo mostrar para CLUB_OWNER o si tiene algún permiso */}
          {(userRole === 'CLUB_OWNER' || userRole === 'SUPER_ADMIN' || enabledModules.length > 0) && (
          <div style={{ marginTop: '4px' }}>
            {/* Settings Main Item */}
            <button
              onClick={() => toggleMenu('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '4px',
                borderRadius: '12px',
                background: pathname.includes('/dashboard/settings')
                  ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))'
                  : 'transparent',
                border: pathname.includes('/dashboard/settings') 
                  ? '1px solid rgba(164, 223, 78, 0.2)' 
                  : '1px solid transparent',
                color: pathname.includes('/dashboard/settings') ? '#182A01' : '#516640',
                fontWeight: pathname.includes('/dashboard/settings') ? 600 : 400,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Settings size={18} />
                <span>Configuración</span>
              </div>
              {expandedMenus.includes('settings') ? 
                <ChevronDown size={16} /> : 
                <ChevronRight size={16} />
              }
            </button>

            {/* Settings Submenu */}
            {expandedMenus.includes('settings') && (
              <div style={{
                paddingLeft: '16px',
                marginTop: '4px',
                borderLeft: '2px solid rgba(164, 223, 78, 0.2)',
                marginLeft: '16px'
              }}>
                {settingsSubItems.map((subItem) => {
                  const isActiveSubItem = pathname === subItem.href
                  
                  return (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        marginBottom: '2px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActiveSubItem ? '#182A01' : '#7A8471',
                        background: isActiveSubItem 
                          ? 'rgba(164, 223, 78, 0.08)'
                          : 'transparent',
                        fontWeight: isActiveSubItem ? 600 : 400,
                        fontSize: '13px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActiveSubItem) {
                          e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                          e.currentTarget.style.color = '#516640'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActiveSubItem) {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = '#7A8471'
                        }
                      }}
                    >
                      {subItem.icon}
                      <span>{subItem.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
          )}
        </nav>

        {/* User */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(164, 223, 78, 0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(164, 223, 78, 0.05)',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User size={16} color="#182A01" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#182A01' }}>
                {userName}
              </div>
              <div style={{ fontSize: '11px', color: '#516640' }}>
                {userRole}
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={() => logout()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'transparent',
              border: '1px solid rgba(164, 223, 78, 0.1)',
              color: '#516640',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'
              e.currentTarget.style.color = '#dc2626'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.1)'
              e.currentTarget.style.color = '#516640'
            }}
          >
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Offset by sidebar width */}
      <div style={{
        marginLeft: '280px',
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <header style={{
          height: '72px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(164, 223, 78, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          {/* Left Section - Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flex: 1,
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '400px',
            }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#516640',
              }} />
              <input
                type="text"
                placeholder="Buscar jugadores, canchas, torneos..."
                style={{
                  width: '100%',
                  height: '40px',
                  paddingLeft: '44px',
                  paddingRight: '16px',
                  background: 'rgba(164, 223, 78, 0.05)',
                  border: '1px solid transparent',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.3)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              />
            </div>
          </div>

          {/* Right Section - Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>

            {/* Notifications */}
            <button
              style={{
                padding: '10px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#516640',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                position: 'relative',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
                e.currentTarget.style.color = '#182A01'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#516640'
              }}
            >
              <Bell size={20} />
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                background: '#A4DF4E',
                borderRadius: '50%',
              }} />
            </button>

            {/* Profile */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                background: 'rgba(164, 223, 78, 0.05)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <User size={16} color="#182A01" />
              </div>
              <div style={{
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#182A01' }}>
                  {userName}
                </div>
                <div style={{ fontSize: '11px', color: '#516640' }}>
                  {userRole}
                </div>
              </div>
              <ChevronDown size={16} color="#516640" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
        }}>
          <PageErrorBoundary context="dashboard-content">
            {children}
          </PageErrorBoundary>
        </div>
      </div>
    </div>
    </>
  )
}