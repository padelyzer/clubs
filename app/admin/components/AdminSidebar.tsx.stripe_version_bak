'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Building2, CreditCard, DollarSign, 
  BarChart3, Users, Settings, Shield, LogOut,
  ChevronDown, ChevronRight, FileText, Wallet,
  Activity, Database, Globe, ShieldCheck, Zap, Package
} from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>([])

  const toggleMenu = (menuId: string) => {
    if (expandedMenus.includes(menuId)) {
      setExpandedMenus(expandedMenus.filter(id => id !== menuId))
    } else {
      setExpandedMenus([...expandedMenus, menuId])
    }
  }

  const menuItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />
    },
    {
      href: '/admin/clubs',
      label: 'Clubs',
      icon: <Building2 size={20} />
    },
    {
      href: '/admin/users',
      label: 'Usuarios',
      icon: <Users size={20} />
    },
    {
      href: '/admin/billing',
      label: 'Facturación',
      icon: <DollarSign size={20} />
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: <BarChart3 size={20} />
    }
  ]

  const advancedMenus = [
    {
      id: 'subscriptions',
      label: 'Suscripciones',
      icon: <CreditCard size={20} />,
      items: [
        { href: '/admin/subscriptions', label: 'Dashboard', icon: <BarChart3 size={16} /> },
        { href: '/admin/packages', label: 'Ver Paquetes', icon: <Package size={16} /> },
        { href: '/admin/packages/crud', label: 'Gestionar Paquetes', icon: <Package size={16} /> },
        { href: '/admin/subscriptions/billing', label: 'Facturación', icon: <DollarSign size={16} /> },
        { href: '/admin/subscriptions/reports', label: 'Reportes', icon: <FileText size={16} /> }
      ]
    },
    {
      id: 'revenue',
      label: 'Ingresos',
      icon: <Wallet size={20} />,
      items: [
        { href: '/admin/revenue', label: 'Dashboard', icon: <BarChart3 size={16} /> },
        { href: '/admin/revenue/commissions', label: 'Comisiones', icon: <Wallet size={16} /> },
        { href: '/admin/revenue/payouts', label: 'Pagos', icon: <DollarSign size={16} /> },
        { href: '/admin/revenue/reports', label: 'Reportes', icon: <FileText size={16} /> }
      ]
    },
    {
      id: 'system',
      label: 'Sistema',
      icon: <Settings size={20} />,
      items: [
        { href: '/admin/system/monitoring', label: 'Monitoreo', icon: <Activity size={16} /> },
        { href: '/admin/system/logs', label: 'Logs', icon: <FileText size={16} /> },
        { href: '/admin/system/database', label: 'Base de Datos', icon: <Database size={16} /> },
        { href: '/admin/system/api', label: 'API', icon: <Globe size={16} /> },
        { href: '/admin/system/security', label: 'Seguridad', icon: <ShieldCheck size={16} /> },
        { href: '/admin/system/performance', label: 'Performance', icon: <Zap size={16} /> }
      ]
    }
  ]

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      width: '280px',
      height: '100vh',
      background: 'white',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <Link href="/admin/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Image 
              src="/Padelyzer-Logo-Negro.png" 
              alt="Padelyzer" 
              width={161} 
              height={40}
              style={{ height: 'auto', maxWidth: '161px' }}
              priority
            />
          </div>
        </Link>
        
        {/* Admin Badge */}
        <div style={{
          marginTop: '16px',
          padding: '8px 12px',
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Shield size={16} color="white" />
          <span style={{
            color: 'white',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}>
            SUPER ADMIN
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto'
      }}>
        {/* Main Menu */}
        <div style={{ marginBottom: '24px' }}>
          {menuItems.map((item) => {
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
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? '#7c3aed' : '#4b5563',
                  background: isActive ? '#f3f4f6' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#f9fafb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Advanced Menus */}
        <div style={{
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#9ca3af',
            letterSpacing: '0.5px',
            marginBottom: '12px',
            paddingLeft: '8px'
          }}>
            AVANZADO
          </div>
          
          {advancedMenus.map((menu) => {
            const isExpanded = expandedMenus.includes(menu.id)
            const hasActiveChild = menu.items.some(item => pathname.startsWith(item.href))
            
            return (
              <div key={menu.id} style={{ marginBottom: '4px' }}>
                <button
                  onClick={() => toggleMenu(menu.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    background: hasActiveChild ? '#f3f4f6' : 'transparent',
                    color: hasActiveChild ? '#7c3aed' : '#4b5563',
                    fontWeight: hasActiveChild ? 600 : 400,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!hasActiveChild) {
                      e.currentTarget.style.background = '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!hasActiveChild) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {menu.icon}
                  <span style={{ flex: 1, textAlign: 'left' }}>{menu.label}</span>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                
                {isExpanded && (
                  <div style={{ marginTop: '4px', marginLeft: '20px' }}>
                    {menu.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            marginBottom: '2px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            color: isActive ? '#7c3aed' : '#6b7280',
                            background: isActive ? '#ede9fe' : 'transparent',
                            fontSize: '13px',
                            fontWeight: isActive ? 500 : 400,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = '#f9fafb'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'transparent'
                            }
                          }}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* User Section */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          borderRadius: '8px',
          background: '#f9fafb'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={16} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
              Super Admin
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              root@padelyzer.com
            </div>
          </div>
        </div>
        
        <Link
          href="/api/auth/logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '12px',
            marginTop: '8px',
            border: 'none',
            borderRadius: '8px',
            background: 'transparent',
            color: '#ef4444',
            fontSize: '14px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fee2e2'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <LogOut size={18} />
          Cerrar Sesión
        </Link>
      </div>
    </aside>
  )
}