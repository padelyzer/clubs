'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, X, Trophy, Grid3x3, Users, Calendar, Activity,
  Settings, LogOut, Bell, Search, ChevronRight, Home,
  BarChart3, FileText, MessageSquare, HelpCircle, Shield,
  TrendingUp, Clock, Star, Zap, User, ChevronDown
} from 'lucide-react'

interface SimpleDashboardLayoutProps {
  children: React.ReactNode
  clubName?: string
  userName?: string
  userRole?: string
}

export function SimpleDashboardLayout({ 
  children, 
  clubName = 'Club Pádel México',
  userName = 'Administrador del Club',
  userRole = 'Administrador'
}: SimpleDashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
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

  const navSections = [
    {
      title: 'MAIN',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
        { href: '/dashboard/courts', label: 'Canchas', icon: <Grid3x3 size={18} /> },
        { href: '/dashboard/players', label: 'Jugadores', icon: <Users size={18} /> },
        { href: '/dashboard/tournaments', label: 'Torneos', icon: <Trophy size={18} /> },
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { href: '/dashboard/analytics', label: 'Resumen', icon: <BarChart3 size={18} /> },
        { href: '/dashboard/reports', label: 'Reportes', icon: <FileText size={18} /> },
        { href: '/dashboard/performance', label: 'Rendimiento', icon: <TrendingUp size={18} /> },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { href: '/dashboard/bookings', label: 'Reservas', icon: <Clock size={18} /> },
        { href: '/dashboard/messages', label: 'Mensajes', icon: <MessageSquare size={18} /> },
        { href: '/dashboard/settings', label: 'Configuración', icon: <Settings size={18} /> },
      ]
    }
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
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
              color: '#182A01',
            }}>
              P
            </div>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#182A01',
                lineHeight: 1,
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
          padding: '24px 16px',
          overflowY: 'auto',
        }}>
          {navSections.map((section) => (
            <div key={section.title} style={{ marginBottom: '32px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#516640',
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
                        padding: '12px',
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
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
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
            border: '1px solid rgba(164, 223, 78, 0.1)',
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
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#182A01' }}>
                {userName}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#516640',
              }}>
                {userRole}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        marginLeft: isSidebarOpen && !isMobile ? '280px' : '0',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </main>

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
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
          }}
        />
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 101,
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(164, 223, 78, 0.2)',
            borderRadius: '12px',
            color: '#182A01',
            cursor: 'pointer',
          }}
        >
          <Menu size={20} />
        </button>
      )}
    </div>
  )
}