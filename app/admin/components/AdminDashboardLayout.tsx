'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  Users, Trophy, Settings, Shield,
  Home, Clock, User, Search, Bell,
  ChevronDown, ChevronRight, DollarSign, Activity, TrendingUp,
  Building, CreditCard, MessageCircle, LogOut,
  BarChart3, UserCheck, FileText, Target, Package,
  AlertCircle, ShieldCheck, Database, Globe,
  Zap, Server, PieChart, Gauge, Wallet,
  BanknoteIcon, LineChart, Building2
} from 'lucide-react'

interface AdminDashboardLayoutProps {
  children: React.ReactNode
  stats?: {
    pendingClubs: number
    pendingSupportTickets: number
    unreadNotifications: number
    activeSubscriptions: number
    totalRevenue: number
    totalClubs: number
    totalUsers: number
  }
  systemMetrics?: {
    uptime: number
    latency: number
    errorRate: number
    activeConnections: number
    cpuUsage: number
    memoryUsage: number
  }
  currentUser?: {
    id: string
    name: string | null
    email: string | null
    role: string
    image: string | null
  } | null
}

export function AdminDashboardLayout({ children, stats, systemMetrics, currentUser }: AdminDashboardLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    // Auto-expand menus based on current path
    if (pathname.startsWith('/admin/users')) {
      setExpandedMenus(['users'])
    }
    if (pathname.startsWith('/admin/clubs')) {
      setExpandedMenus(['clubs'])
    }
    if (pathname.startsWith('/admin/revenue')) {
      setExpandedMenus(['revenue'])
    }
    if (pathname.startsWith('/admin/system')) {
      setExpandedMenus(['system'])
    }
  }, [pathname])

  const mainNavItems: Array<{
    href: string
    label: string
    icon: React.ReactNode
    badge?: number
  }> = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: <Gauge size={18} />,
      badge: undefined
    },
    { 
      href: '/admin/clubs', 
      label: 'Clubs', 
      icon: <Building2 size={18} />,
      badge: undefined
    },
    { 
      href: '/admin/subscriptions', 
      label: 'Suscripciones', 
      icon: <CreditCard size={18} />,
      badge: undefined
    },
    { 
      href: '/admin/billing', 
      label: 'Facturación', 
      icon: <BanknoteIcon size={18} />,
      badge: undefined
    },
    { 
      href: '/admin/analytics', 
      label: 'Analytics', 
      icon: <LineChart size={18} />,
      badge: undefined
    },
  ]

  const revenueSubItems = [
    { href: '/admin/revenue', label: 'Dashboard Ingresos', icon: <PieChart size={16} /> },
    { href: '/admin/revenue/commissions', label: 'Comisiones', icon: <Wallet size={16} /> },
    { href: '/admin/revenue/payouts', label: 'Pagos a Clubs', icon: <DollarSign size={16} /> },
    { href: '/admin/revenue/reports', label: 'Reportes', icon: <FileText size={16} /> },
  ]

  const systemSubItems = [
    { href: '/admin/system/monitoring', label: 'Monitoreo', icon: <Activity size={16} /> },
    { href: '/admin/system/logs', label: 'Logs', icon: <FileText size={16} /> },
    { href: '/admin/system/database', label: 'Base de Datos', icon: <Database size={16} /> },
    { href: '/admin/system/api', label: 'API & Webhooks', icon: <Globe size={16} /> },
    { href: '/admin/system/security', label: 'Seguridad', icon: <ShieldCheck size={16} /> },
    { href: '/admin/system/performance', label: 'Performance', icon: <Zap size={16} /> },
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
        {/* Logo & Admin Badge */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(164, 223, 78, 0.1)',
        }}>
          <Link href="/admin/dashboard" style={{ textDecoration: 'none' }}>
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
          
          {/* Admin Badge */}
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Shield size={16} color="white" />
            <span style={{
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}>
              PANEL SUPER ADMIN
            </span>
          </div>
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
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge !== undefined && (
                  <span style={{
                    padding: '2px 8px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Revenue Menu with Submenu */}
          <div style={{ marginTop: '4px' }}>
            <button
              onClick={() => toggleMenu('revenue')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '4px',
                borderRadius: '12px',
                background: pathname.startsWith('/admin/revenue')
                  ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))'
                  : 'transparent',
                border: pathname.startsWith('/admin/revenue') 
                  ? '1px solid rgba(164, 223, 78, 0.2)' 
                  : '1px solid transparent',
                color: pathname.startsWith('/admin/revenue') ? '#182A01' : '#516640',
                fontWeight: pathname.startsWith('/admin/revenue') ? 600 : 400,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!pathname.startsWith('/admin/revenue')) {
                  e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (!pathname.startsWith('/admin/revenue')) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrendingUp size={18} />
                <span>Ingresos</span>
              </div>
              {expandedMenus.includes('revenue') ? 
                <ChevronDown size={16} /> : 
                <ChevronRight size={16} />
              }
            </button>

            {/* Revenue Submenu */}
            {expandedMenus.includes('revenue') && (
              <div style={{
                paddingLeft: '16px',
                marginTop: '4px',
                borderLeft: '2px solid rgba(164, 223, 78, 0.2)',
                marginLeft: '16px'
              }}>
                {revenueSubItems.map((subItem) => {
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

          {/* System Menu with Submenu */}
          <div style={{ marginTop: '4px' }}>
            <button
              onClick={() => toggleMenu('system')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '4px',
                borderRadius: '12px',
                background: pathname.startsWith('/admin/system')
                  ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))'
                  : 'transparent',
                border: pathname.startsWith('/admin/system') 
                  ? '1px solid rgba(164, 223, 78, 0.2)' 
                  : '1px solid transparent',
                color: pathname.startsWith('/admin/system') ? '#182A01' : '#516640',
                fontWeight: pathname.startsWith('/admin/system') ? 600 : 400,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!pathname.startsWith('/admin/system')) {
                  e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (!pathname.startsWith('/admin/system')) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Server size={18} />
                <span>Sistema</span>
              </div>
              {expandedMenus.includes('system') ? 
                <ChevronDown size={16} /> : 
                <ChevronRight size={16} />
              }
            </button>

            {/* System Submenu */}
            {expandedMenus.includes('system') && (
              <div style={{
                paddingLeft: '16px',
                marginTop: '4px',
                borderLeft: '2px solid rgba(164, 223, 78, 0.2)',
                marginLeft: '16px'
              }}>
                {systemSubItems.map((subItem) => {
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

          {/* System Status */}
          <div style={{
            marginTop: '24px',
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.05))',
            borderRadius: '12px',
            border: '1px solid rgba(139, 92, 246, 0.1)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%',
              }} />
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#182A01',
              }}>
                Sistema Operativo
              </span>
            </div>
            <div style={{
              fontSize: '11px',
              color: '#516640',
              lineHeight: '16px',
            }}>
              Todos los servicios funcionando correctamente
            </div>
            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(139, 92, 246, 0.1)',
            }}>
              <div>
                <div style={{ fontSize: '10px', color: '#7A8471' }}>Uptime</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#182A01' }}>{systemMetrics?.uptime || 99.9}%</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#7A8471' }}>Latencia</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#182A01' }}>{systemMetrics?.latency || 45}ms</div>
              </div>
            </div>
          </div>
        </nav>

        {/* User & Logout */}
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
            background: 'rgba(139, 92, 246, 0.05)',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User size={16} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#182A01' }}>
                {currentUser?.name || 'Super Admin'}
              </div>
              <div style={{ fontSize: '11px', color: '#516640' }}>
                {currentUser?.email || 'admin@padelyzer.com'}
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <Link
            href="/api/auth/logout"
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
              textDecoration: 'none',
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
          </Link>
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
                placeholder="Buscar clubs, usuarios, transacciones..."
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
            {/* Quick Stats */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '0 24px',
              borderRight: '1px solid rgba(164, 223, 78, 0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="#A4DF4E" />
                <div>
                  <div style={{ fontSize: '12px', color: '#516640' }}>Clubs Activos</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#182A01' }}>127</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} color="#66E7AA" />
                <div>
                  <div style={{ fontSize: '12px', color: '#516640' }}>Comisiones</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#182A01' }}>+18%</div>
                </div>
              </div>
            </div>

            {/* Alerts */}
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
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                e.currentTarget.style.color = '#dc2626'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#516640'
              }}
            >
              <AlertCircle size={20} />
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                background: '#ef4444',
                borderRadius: '50%',
              }} />
            </button>

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
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.05))',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.1))'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.05))'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={16} color="white" />
              </div>
              <div style={{
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#182A01' }}>
                  Super Admin
                </div>
                <div style={{ fontSize: '11px', color: '#516640' }}>
                  Control Total
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
          {children}
        </div>
      </div>

    </div>
    </>
  )
}