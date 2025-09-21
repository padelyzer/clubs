'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { 
  Menu, X, Trophy, Shield, Building2, Users, Globe,
  Settings, LogOut, Bell, Search, ChevronRight, Home,
  BarChart3, FileText, MessageSquare, HelpCircle, Database,
  TrendingUp, Clock, Star, Zap, User, ChevronDown, Activity,
  CreditCard, AlertTriangle, Network, Server, Layers, Command
} from 'lucide-react'

interface ModernSuperAdminLayoutProps {
  children: React.ReactNode
  userName?: string
  userRole?: string
}

export function ModernSuperAdminLayout({ 
  children, 
  userName = 'Super Admin',
  userRole = 'System Administrator'
}: ModernSuperAdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navSections = [
    {
      title: 'Overview',
      items: [
        { href: '/admin', label: 'Dashboard', icon: <Home size={18} /> },
        { href: '/admin/analytics', label: 'Global Analytics', icon: <BarChart3 size={18} /> },
        { href: '/admin/monitoring', label: 'System Monitor', icon: <Activity size={18} /> },
      ]
    },
    {
      title: 'Management',
      items: [
        { href: '/admin/clubs', label: 'Clubs', icon: <Building2 size={18} /> },
        { href: '/admin/users', label: 'Users', icon: <Users size={18} /> },
        { href: '/admin/tournaments', label: 'Tournaments', icon: <Trophy size={18} /> },
        { href: '/admin/subscriptions', label: 'Subscriptions', icon: <CreditCard size={18} /> },
      ]
    },
    {
      title: 'System',
      items: [
        { href: '/admin/database', label: 'Database', icon: <Database size={18} /> },
        { href: '/admin/servers', label: 'Servers', icon: <Server size={18} /> },
        { href: '/admin/api', label: 'API Management', icon: <Network size={18} /> },
        { href: '/admin/logs', label: 'System Logs', icon: <FileText size={18} /> },
      ]
    },
    {
      title: 'Security',
      items: [
        { href: '/admin/security', label: 'Security Center', icon: <Shield size={18} /> },
        { href: '/admin/permissions', label: 'Permissions', icon: <Layers size={18} /> },
        { href: '/admin/audit', label: 'Audit Trail', icon: <Search size={18} /> },
        { href: '/admin/alerts', label: 'Security Alerts', icon: <AlertTriangle size={18} /> },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { href: '/admin/settings', label: 'Global Settings', icon: <Settings size={18} /> },
        { href: '/admin/integrations', label: 'Integrations', icon: <Globe size={18} /> },
        { href: '/admin/commands', label: 'System Commands', icon: <Command size={18} /> },
      ]
    }
  ]

  const notifications = [
    { id: 1, title: 'System maintenance in 2 hours', time: '5 min ago', unread: true, type: 'warning' },
    { id: 2, title: 'New club registration pending', time: '15 min ago', unread: true, type: 'info' },
    { id: 3, title: 'High server load detected', time: '1 hour ago', unread: true, type: 'error' },
    { id: 4, title: 'Weekly backup completed', time: '3 hours ago', unread: false, type: 'success' },
  ]

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error': return '#dc2626'
      case 'warning': return '#f59e0b'
      case 'success': return '#16a34a'
      case 'info': return '#2563eb'
      default: return '#A4DF4E'
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
    }}>
      {/* Sidebar */}
      <aside
        style={{
          width: isSidebarOpen ? '300px' : '0',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          background: 'linear-gradient(180deg, rgba(24, 42, 1, 0.97) 0%, rgba(24, 42, 1, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(164, 223, 78, 0.2)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          zIndex: 100,
          display: window.innerWidth < 1024 && !isMobileSidebarOpen ? 'none' : 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo Section */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(164, 223, 78, 0.2)',
        }}>
          <Link href="/admin" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(164, 223, 78, 0.3)',
            }}>
              <Shield size={24} color="#182A01" />
            </div>
            <div>
              <div style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'white',
                letterSpacing: '-0.02em',
              }}>
                Padelyzer Admin
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(164, 223, 78, 0.8)',
                marginTop: '2px',
                fontWeight: 500,
              }}>
                System Control Center
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 16px',
        }}>
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} style={{
              marginBottom: '32px',
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(164, 223, 78, 0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px',
                paddingLeft: '12px',
              }}>
                {section.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.items.map((item) => {
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
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#182A01' : 'rgba(255, 255, 255, 0.8)',
                        background: isActive 
                          ? 'linear-gradient(90deg, #A4DF4E, #66E7AA)'
                          : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
                          e.currentTarget.style.color = 'white'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                        }
                      }}
                    >
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '4px',
                          height: '28px',
                          background: '#182A01',
                          borderRadius: '0 4px 4px 0',
                        }} />
                      )}
                      <div style={{
                        color: isActive ? '#182A01' : '#A4DF4E',
                        transition: 'color 0.2s',
                      }}>
                        {item.icon}
                      </div>
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* System Status */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(164, 223, 78, 0.2)',
        }}>
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(164, 223, 78, 0.1)',
            border: '1px solid rgba(164, 223, 78, 0.2)',
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
                borderRadius: '50%',
                background: '#16a34a',
                animation: 'pulse 2s infinite',
              }} />
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'white',
              }}>
                All Systems Operational
              </span>
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(164, 223, 78, 0.8)',
            }}>
              99.9% uptime • 247 active clubs
            </div>
          </div>
        </div>

        {/* User Section */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(164, 223, 78, 0.2)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(164, 223, 78, 0.1)',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield size={20} color="#182A01" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
              }}>
                {userName}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(164, 223, 78, 0.8)',
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
        marginLeft: isSidebarOpen && window.innerWidth >= 1024 ? '300px' : '0',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top Header */}
        <header style={{
          height: '72px',
          background: 'rgba(255, 255, 255, 0.95)',
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
                if (window.innerWidth < 1024) {
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

            {/* Global Search */}
            <div style={{
              position: 'relative',
              width: '400px',
              display: window.innerWidth < 768 ? 'none' : 'block',
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
                placeholder="Global search: clubs, users, tournaments, logs..."
                style={{
                  width: '100%',
                  height: '42px',
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
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(164, 223, 78, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Right Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}>
            {/* System Status */}
            <div style={{
              display: window.innerWidth < 1200 ? 'none' : 'flex',
              alignItems: 'center',
              gap: '32px',
              padding: '0 32px',
              borderRight: '1px solid rgba(164, 223, 78, 0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#16a34a',
                  animation: 'pulse 2s infinite',
                }} />
                <div>
                  <div style={{ fontSize: '12px', color: '#516640' }}>System Health</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>Excellent</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} color="#16a34a" />
                <div>
                  <div style={{ fontSize: '12px', color: '#516640' }}>Performance</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>98.7%</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} color="#A4DF4E" />
                <div>
                  <div style={{ fontSize: '12px', color: '#516640' }}>Active Users</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>12,847</div>
                </div>
              </div>
            </div>

            {/* System Alerts */}
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
                <AlertTriangle size={20} />
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  background: '#f59e0b',
                  borderRadius: '50%',
                }} />
              </button>

              {/* Alert Dropdown */}
              {isNotificationOpen && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '360px',
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
                    <span style={{ fontWeight: 600, color: '#182A01' }}>System Alerts</span>
                    <span style={{ fontSize: '12px', color: '#A4DF4E', cursor: 'pointer' }}>Clear all</span>
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
                        <div style={{
                          width: '8px',
                          height: '8px',
                          background: getNotificationColor(notif.type),
                          borderRadius: '50%',
                          marginTop: '6px',
                          flexShrink: 0,
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#182A01', 
                            marginBottom: '4px',
                            fontWeight: notif.unread ? 600 : 500,
                          }}>
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
                    <Link href="/admin/alerts" style={{
                      fontSize: '13px',
                      color: '#A4DF4E',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}>
                      View all system alerts
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
                  background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))',
                  border: '1px solid rgba(164, 223, 78, 0.2)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(164, 223, 78, 0.15), rgba(102, 231, 170, 0.1))'
                  e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))'
                  e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.2)'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(164, 223, 78, 0.3)',
                }}>
                  <Shield size={18} color="#182A01" />
                </div>
                <div style={{
                  textAlign: 'left',
                  display: window.innerWidth < 1024 ? 'none' : 'block',
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
                  width: '260px',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                  overflow: 'hidden',
                  zIndex: 1000,
                  border: '1px solid rgba(164, 223, 78, 0.1)',
                }}>
                  <div style={{ padding: '8px' }}>
                    <Link href="/admin/profile" style={{
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
                      <span style={{ fontSize: '14px' }}>Admin Profile</span>
                    </Link>
                    <Link href="/admin/security" style={{
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
                      <Shield size={18} />
                      <span style={{ fontSize: '14px' }}>Security Center</span>
                    </Link>
                    <Link href="/admin/settings" style={{
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
                      <span style={{ fontSize: '14px' }}>System Settings</span>
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
                        <span>Secure Sign Out</span>
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
          padding: '32px',
        }}>
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && window.innerWidth < 1024 && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
          }}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}