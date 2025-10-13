'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { colors } from '@/lib/design-system/colors'
import { 
  Home,
  Calendar,
  Target,
  BarChart3,
  Users,
  Settings,
  ChevronRight
} from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  path: string
  description: string
  badge?: string
}

interface TournamentNavigationProps {
  tournamentId: string
  activeView?: string
  tournamentName?: string
}

export function TournamentNavigation({ 
  tournamentId, 
  activeView = 'overview',
  tournamentName = 'Torneo'
}: TournamentNavigationProps) {
  const router = useRouter()

  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Vista General',
      icon: Home,
      path: `/dashboard/tournaments/${tournamentId}`,
      description: 'Resumen del torneo'
    },
    {
      id: 'today',
      label: 'Partidos de Hoy',
      icon: Calendar,
      path: `/dashboard/tournaments/${tournamentId}/today`,
      description: 'Ver partidos del día'
    },
    {
      id: 'capture',
      label: 'Capturar Resultados',
      icon: Target,
      path: `/dashboard/tournaments/${tournamentId}/capture`,
      description: 'Registrar resultados rápidamente'
    },
    {
      id: 'standings',
      label: 'Tablas de Posición',
      icon: BarChart3,
      path: `/dashboard/tournaments/${tournamentId}/standings`,
      description: 'Ver clasificaciones'
    },
    {
      id: 'participants',
      label: 'Participantes',
      icon: Users,
      path: `/dashboard/tournaments/${tournamentId}/participants`,
      description: 'Gestionar equipos'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      path: `/dashboard/tournaments/${tournamentId}/settings`,
      description: 'Ajustes del torneo'
    }
  ]

  const handleNavigation = (item: NavigationItem) => {
    router.push(item.path)
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: `1px solid ${colors.border.light}`
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${colors.border.light}`
      }}>
        <h3 style={{ 
          fontSize: '16px',
          fontWeight: 600,
          color: colors.text.primary,
          margin: '0 0 4px 0'
        }}>
          Navegación Rápida
        </h3>
        <p style={{ 
          fontSize: '12px',
          color: colors.text.secondary,
          margin: 0
        }}>
          {tournamentName}
        </p>
      </div>

      {/* Navigation Items */}
      <div style={{ 
        display: 'grid',
        gap: '8px'
      }}>
        {navigationItems.map((item) => {
          const isActive = activeView === item.id
          const Icon = item.icon
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: isActive 
                  ? `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`
                  : 'transparent',
                color: isActive ? 'white' : colors.text.secondary,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = colors.neutral[50]
                  e.currentTarget.style.color = colors.text.primary
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = colors.text.secondary
                }
              }}
            >
              <Icon 
                size={20} 
                style={{ 
                  color: isActive ? 'white' : colors.text.tertiary,
                  flexShrink: 0
                }} 
              />
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ 
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'inherit'
                  }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isActive ? 'rgba(255,255,255,0.2)' : colors.accent[100],
                      color: isActive ? 'white' : colors.accent[700],
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p style={{ 
                  fontSize: '11px',
                  color: isActive ? 'rgba(255,255,255,0.8)' : colors.text.tertiary,
                  margin: '2px 0 0 0',
                  lineHeight: 1.3
                }}>
                  {item.description}
                </p>
              </div>
              
              <ChevronRight 
                size={16} 
                style={{ 
                  color: isActive ? 'white' : colors.text.tertiary,
                  opacity: isActive ? 1 : 0.5
                }} 
              />
            </button>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div style={{ 
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: `1px solid ${colors.border.light}`
      }}>
        <p style={{ 
          fontSize: '12px',
          fontWeight: 500,
          color: colors.text.tertiary,
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Acciones Rápidas
        </p>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px'
        }}>
          <button
            onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/today`)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: colors.accent[50],
              color: colors.accent[700],
              border: `1px solid ${colors.accent[200]}`,
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.accent[100]
              e.currentTarget.style.borderColor = colors.accent[300]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.accent[50]
              e.currentTarget.style.borderColor = colors.accent[200]
            }}
          >
            <Calendar size={14} />
            Hoy
          </button>
          
          <button
            onClick={() => router.push(`/dashboard/tournaments/${tournamentId}/capture`)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: colors.primary[50],
              color: colors.primary[700],
              border: `1px solid ${colors.primary[200]}`,
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.primary[100]
              e.currentTarget.style.borderColor = colors.primary[300]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.primary[50]
              e.currentTarget.style.borderColor = colors.primary[200]
            }}
          >
            <Target size={14} />
            Capturar
          </button>
        </div>
      </div>
    </div>
  )
}

