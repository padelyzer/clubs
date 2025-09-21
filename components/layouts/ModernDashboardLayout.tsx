'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { 
  Menu, X, Trophy, BookOpen, Users, Calendar, Activity,
  Settings, LogOut, Bell, Search, ChevronRight, Home,
  BarChart3, FileText, MessageSquare, HelpCircle, Shield,
  TrendingUp, Clock, Star, Zap, User, ChevronDown, DollarSign
} from 'lucide-react'

interface ModernDashboardLayoutProps {
  children: React.ReactNode
  clubName?: string
  userName?: string
  userRole?: string
  enabledModules?: string[]
}

export function ModernDashboardLayout({ 
  children, 
  clubName = 'Club Pádel México',
  userName = 'Administrador del Club',
  userRole = 'Administrador',
  enabledModules = ['bookings', 'customers', 'tournaments', 'classes', 'finance']
}: ModernDashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Definir todos los elementos del menú con sus módulos correspondientes
  const allNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <Home size={18} />, module: null }, // Siempre visible
    { href: '/dashboard/bookings', label: 'Reservas', icon: <Clock size={18} />, module: 'bookings' },
    { href: '/dashboard/players', label: 'Clientes', icon: <Users size={18} />, module: 'customers' },
    { href: '/dashboard/tournaments', label: 'Torneos', icon: <Trophy size={18} />, module: 'tournaments' },
    { href: '/dashboard/classes', label: 'Clases', icon: <BookOpen size={18} />, hasSubmenu: true, module: 'classes' },
    { href: '/dashboard/finance', label: 'Finanzas', icon: <DollarSign size={18} />, hasSubmenu: true, module: 'finance' },
    { href: '/dashboard/settings', label: 'Configuración', icon: <Settings size={18} />, hasSubmenu: true, module: null }, // Siempre visible
  ]
  
  // Filtrar elementos según los módulos habilitados
  const navItems = allNavItems.filter(item => {
    // Si no tiene módulo asociado, siempre se muestra
    if (!item.module) return true
    // Si tiene módulo, verificar si está habilitado
    return enabledModules.includes(item.module)
  })

  const notifications = [
    { id: 1, title: 'Nueva inscripción al torneo', time: 'Hace 5 min', unread: true },
    { id: 2, title: 'Mantenimiento cancha 3 completado', time: 'Hace 1 hora', unread: true },
    { id: 3, title: 'Membresía de cliente renovada', time: 'Hace 3 horas', unread: false },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
    }}>
      {/* Sidebar */}
      <aside
        style={{
          width: isSidebarOpen ? '280px' : '0',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(164, 223, 78, 0.1)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          zIndex: 100,
          display: isMobile && !isMobileSidebarOpen ? 'none' : 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo Section */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(164, 223, 78, 0.1)',
        }}>
          <Link href="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Trophy size={22} color="#182A01" />
            </div>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#182A01',
                letterSpacing: '-0.02em',
              }}>
                Padelyzer
              </div>
              <div style={{
                fontSize: '12px',
                color: '#516640',
                marginTop: '2px',
              }}>
                {clubName}
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href === '/dashboard/finance' && pathname.startsWith('/dashboard/finance')) ||
                (item.href === '/dashboard/classes' && pathname.startsWith('/dashboard/classes')) ||
                (item.href === '/dashboard/settings' && pathname.startsWith('/dashboard/settings'))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 20px',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#182A01' : '#6B7280',
                    background: isActive 
                      ? '#E8F7DC'
                      : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(232, 247, 220, 0.5)'
                      e.currentTarget.style.color = '#182A01'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#6B7280'
                    }
                  }}
                >
                  <div style={{
                    color: isActive ? '#182A01' : '#6B7280',
                    transition: 'color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {item.icon}
                  </div>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.hasSubmenu && (
                    <ChevronRight size={16} style={{ 
                      color: isActive ? '#182A01' : '#9CA3AF',
                      opacity: 0.6 
                    }} />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Section */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(164, 223, 78, 0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(164, 223, 78, 0.05)',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User size={20} color="#182A01" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#182A01',
              }}>
                {userName}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#516640',
              }}>
                {userRole}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: isSidebarOpen && !isMobile ? '280px' : '0',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top Header */}
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
          {/* Left Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}>
            {/* Toggle Sidebar */}
            <button
              onClick={() => {
                if (isMobile) {
                  setIsMobileSidebarOpen(!isMobileSidebarOpen)
                } else {
                  setIsSidebarOpen(!isSidebarOpen)
                }
              }}
              style={{
                padding: '8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#516640',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
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
              <Menu size={20} />
            </button>

            {/* Search */}
            <div style={{
              position: 'relative',
              width: '320px',
              display: isMobile ? 'none' : 'block',
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
                placeholder="Buscar clientes, canchas, torneos..."
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

          {/* Right Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
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

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '320px',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                  overflow: 'hidden',
                  zIndex: 1000,
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(164, 223, 78, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 600, color: '#182A01' }}>Notificaciones</span>
                    <span style={{ fontSize: '12px', color: '#A4DF4E', cursor: 'pointer' }}>Marcar todas como leídas</span>
                  </div>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid rgba(164, 223, 78, 0.05)',
                        background: notif.unread ? 'rgba(164, 223, 78, 0.03)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(164, 223, 78, 0.08)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = notif.unread ? 'rgba(164, 223, 78, 0.03)' : 'transparent'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'start',
                        gap: '12px',
                      }}>
                        {notif.unread && (
                          <div style={{
                            width: '6px',
                            height: '6px',
                            background: '#A4DF4E',
                            borderRadius: '50%',
                            marginTop: '6px',
                          }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', color: '#182A01', marginBottom: '4px' }}>
                            {notif.title}
                          </div>
                          <div style={{ fontSize: '12px', color: '#516640' }}>
                            {notif.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{
                    padding: '12px',
                    textAlign: 'center',
                  }}>
                    <Link href="/dashboard/notifications" style={{
                      fontSize: '13px',
                      color: '#A4DF4E',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}>
                      Ver todas las notificaciones
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
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
                  display: isMobile ? 'none' : 'block',
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

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div style={{
                  position: 'absolute',
                  top: '56px',
                  right: 0,
                  width: '240px',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                  overflow: 'hidden',
                  zIndex: 1000,
                }}>
                  <div style={{ padding: '8px' }}>
                    <Link href="/dashboard/profile" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#516640',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
                      e.currentTarget.style.color = '#182A01'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#516640'
                    }}>
                      <User size={18} />
                      <span style={{ fontSize: '14px' }}>Perfil</span>
                    </Link>
                    <Link href="/dashboard/settings" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#516640',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
                      e.currentTarget.style.color = '#182A01'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#516640'
                    }}>
                      <Settings size={18} />
                      <span style={{ fontSize: '14px' }}>Configuración</span>
                    </Link>
                    <Link href="/dashboard/help" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#516640',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
                      e.currentTarget.style.color = '#182A01'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#516640'
                    }}>
                      <HelpCircle size={18} />
                      <span style={{ fontSize: '14px' }}>Ayuda</span>
                    </Link>
                    <div style={{
                      borderTop: '1px solid rgba(164, 223, 78, 0.1)',
                      marginTop: '8px',
                      paddingTop: '8px',
                    }}>
                      <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#dc2626',
                        transition: 'all 0.2s',
                        fontSize: '14px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}>
                        <LogOut size={18} />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '24px',
        }}>
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && isMobile && mounted && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 99,
          }}
        />
      )}
    </div>
  )
}