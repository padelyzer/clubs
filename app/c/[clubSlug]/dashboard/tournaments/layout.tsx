'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import {
  Trophy,
  Users,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  Menu,
  X,
  Home,
  ChevronLeft
} from 'lucide-react'

export default function TournamentsV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const params = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const clubSlug = params.clubSlug as string

  const navigation = useMemo(() => [
    { name: 'Inicio', href: `/c/${clubSlug}/dashboard`, icon: Home },
    { name: 'Torneos', href: `/c/${clubSlug}/dashboard/tournaments`, icon: Trophy },
    { name: 'Crear Torneo', href: `/c/${clubSlug}/dashboard/tournaments/create`, icon: Calendar },
  ], [clubSlug])

  const isActive = (href: string) => {
    if (href === `/c/${clubSlug}/dashboard/tournaments`) {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#FAFAFA'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '280px' : '80px',
        background: 'linear-gradient(180deg, #065F46 0%, #047857 100%)',
        transition: 'width 0.3s ease',
        position: 'relative',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Trophy size={28} style={{ color: '#10B981' }} />
              <span style={{
                color: 'white',
                fontSize: '18px',
                fontWeight: 700
              }}>
                Torneos
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px' }}>
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  marginBottom: '4px',
                  borderRadius: '8px',
                  background: active ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent'
                }}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer Info */}
        {sidebarOpen && (
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            right: '24px',
            padding: '16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.7)'
          }}>
            <div style={{ marginBottom: '4px', fontWeight: 600, color: 'white' }}>
              Sistema de Torneos V2
            </div>
            Gestión profesional de torneos de pádel
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        overflow: 'auto'
      }}>
        {children}
      </main>
    </div>
  )
}