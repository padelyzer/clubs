/**
 * TournamentSidebar Component
 * Extracted from page.tsx (lines 500-1743)
 * Main sidebar for tournament management
 */

import React from 'react'
import {
  Trophy,
  Users,
  Calendar,
  Grid3x3,
  Columns3,
  Camera,
  Tv2,
  Settings,
  ChevronRight
} from 'lucide-react'
import { NavigationItem } from './NavigationItem'
import { CategorySection } from './CategorySection'
import type { TournamentData, ViewType } from '../types/tournament'

type TournamentSidebarProps = {
  tournamentData: TournamentData
  activeView: ViewType
  setActiveView: (view: ViewType) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (value: boolean) => void
  categoriesExpanded: boolean
  setCategoriesExpanded: (value: boolean) => void
  masculineExpanded: boolean
  setMasculineExpanded: (value: boolean) => void
  feminineExpanded: boolean
  setFeminineExpanded: (value: boolean) => void
  mixedExpanded: boolean
  setMixedExpanded: (value: boolean) => void
  selectedCategory: string | null
  setSelectedCategory: (value: string | null) => void
  onFetchRegistrations: () => void
}

const colors = {
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    tertiary: '#9ca3af'
  },
  neutral: {
    100: '#f3f4f6',
    900: '#111827'
  },
  border: {
    light: '#e5e7eb'
  }
}

export function TournamentSidebar({
  tournamentData,
  activeView,
  setActiveView,
  sidebarCollapsed,
  setSidebarCollapsed,
  categoriesExpanded,
  setCategoriesExpanded,
  masculineExpanded,
  setMasculineExpanded,
  feminineExpanded,
  setFeminineExpanded,
  mixedExpanded,
  setMixedExpanded,
  selectedCategory,
  setSelectedCategory,
  onFetchRegistrations
}: TournamentSidebarProps) {
  return (
    <aside
      style={{
        width: sidebarCollapsed ? '80px' : '320px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRight: `1px solid ${colors.border.light}`,
        transition: 'all 0.3s ease',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Header Section */}
      <div>
        {/* Logo de Padelyzer */}
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${colors.border.light}`,
          display: 'flex',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
        }}>
          {!sidebarCollapsed ? (
            <img
              src="/Padelyzer-Logo-Negro.png"
              alt="Padelyzer"
              style={{
                width: '140px',
                height: 'auto',
                display: 'block'
              }}
            />
          ) : (
            <img
              src="/Padelyzer-Isotipo-Negro.png"
              alt="P"
              style={{
                width: '36px',
                height: '36px',
                display: 'block'
              }}
            />
          )}
        </div>

        {/* Módulo de Gestión de Torneo con Toggle Button */}
        <div style={{
          padding: sidebarCollapsed ? '12px' : '16px',
          borderBottom: `1px solid ${colors.border.light}`,
          background: 'linear-gradient(135deg, #047857, #059669)',
          position: 'relative'
        }}>
          {/* Toggle Button integrado en la pestaña verde */}
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                background: 'rgba(255,255,255,0.25)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                zIndex: 5
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.35)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.4)'
              }}
            >
              <ChevronRight
                size={16}
                style={{
                  color: 'white',
                  transform: 'rotate(180deg)',
                  transition: 'transform 0.3s',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                }}
              />
            </button>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingRight: sidebarCollapsed ? '0' : '48px'
          }}>
            <div
              style={{
                width: sidebarCollapsed ? '32px' : '36px',
                height: sidebarCollapsed ? '32px' : '36px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: sidebarCollapsed ? 'pointer' : 'default',
                transition: 'all 0.3s',
                position: 'relative'
              }}
              onClick={sidebarCollapsed ? () => setSidebarCollapsed(false) : undefined}
              onMouseEnter={sidebarCollapsed ? (e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
                e.currentTarget.style.transform = 'scale(1.1)'
              } : undefined}
              onMouseLeave={sidebarCollapsed ? (e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.transform = 'scale(1)'
              } : undefined}
            >
              <Trophy
                size={sidebarCollapsed ? 21 : 18}
                color="white"
                style={{
                  minWidth: sidebarCollapsed ? '21px' : '18px',
                  minHeight: sidebarCollapsed ? '21px' : '18px'
                }}
              />
              {/* Indicador de expansión cuando está contraído */}
              {sidebarCollapsed && (
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '12px',
                  height: '12px',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  color: '#059669'
                }}>
                  <ChevronRight size={8} />
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <h3 style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.85)',
                  marginBottom: '2px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Gestión de Torneo
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: 'white',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '2px'
                }}>
                  {tournamentData.tournament.name}
                </p>
                <p style={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.7)'
                }}>
                  {new Date(tournamentData.tournament.startDate).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short'
                  })} - {new Date(tournamentData.tournament.endDate).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px'
      }}>
        {/* Navigation Section */}
        <div style={{ marginBottom: '24px' }}>
          {!sidebarCollapsed && (
            <h4 style={{
              fontSize: '11px',
              fontWeight: 600,
              color: colors.text.tertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
              paddingLeft: '4px'
            }}>
              NAVEGACIÓN
            </h4>
          )}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <NavigationItem
              icon={Grid3x3}
              label="Vista General"
              subtitle="Resumen del torneo"
              isActive={activeView === 'overview'}
              onClick={() => setActiveView('overview')}
              sidebarCollapsed={sidebarCollapsed}
            />
            <NavigationItem
              icon={Users}
              label="Inscritos"
              subtitle="Gestionar participantes"
              isActive={activeView === 'registrations'}
              onClick={() => {
                setActiveView('registrations')
                onFetchRegistrations()
              }}
              sidebarCollapsed={sidebarCollapsed}
            />
            <NavigationItem
              icon={Calendar}
              label="Programación"
              subtitle="Calendario de partidos"
              isActive={activeView === 'schedule'}
              onClick={() => setActiveView('schedule')}
              sidebarCollapsed={sidebarCollapsed}
            />
            <NavigationItem
              icon={Columns3}
              label="Vista Kanban"
              subtitle="Estado de canchas"
              isActive={activeView === 'kanban'}
              onClick={() => setActiveView('kanban')}
              sidebarCollapsed={sidebarCollapsed}
              badge={{
                text: 'PRO',
                color: 'white',
                background: 'linear-gradient(135deg, #a855f7, #9333ea)'
              }}
            />
            <NavigationItem
              icon={Camera}
              label="Captura Masiva"
              subtitle="Registrar resultados"
              isActive={activeView === 'capture'}
              onClick={() => setActiveView('capture')}
              sidebarCollapsed={sidebarCollapsed}
            />
            <NavigationItem
              icon={Tv2}
              label="Modo TV"
              subtitle="Pantalla pública"
              isActive={activeView === 'tv'}
              onClick={() => setActiveView('tv')}
              sidebarCollapsed={sidebarCollapsed}
            />
          </nav>
        </div>

        {/* Categorías Section */}
        <CategorySection
          categories={tournamentData.categories}
          sidebarCollapsed={sidebarCollapsed}
          categoriesExpanded={categoriesExpanded}
          setCategoriesExpanded={setCategoriesExpanded}
          masculineExpanded={masculineExpanded}
          setMasculineExpanded={setMasculineExpanded}
          feminineExpanded={feminineExpanded}
          setFeminineExpanded={setFeminineExpanded}
          mixedExpanded={mixedExpanded}
          setMixedExpanded={setMixedExpanded}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px',
        borderTop: `1px solid ${colors.border.light}`,
        marginTop: 'auto'
      }}>
        <div
          className="sidebar-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: sidebarCollapsed ? '12px' : '12px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: colors.text.secondary,
            gap: '12px',
            position: 'relative',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.neutral[100]
            e.currentTarget.style.color = colors.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = colors.text.secondary
          }}
        >
          <Settings
            size={sidebarCollapsed ? 21 : 20}
            style={{
              minWidth: sidebarCollapsed ? '21px' : '20px',
              minHeight: sidebarCollapsed ? '21px' : '20px'
            }}
          />
          {!sidebarCollapsed && (
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Configuración</span>
          )}
          {sidebarCollapsed && (
            <div className="sidebar-tooltip" style={{
              position: 'absolute',
              left: '100%',
              marginLeft: '12px',
              padding: '8px 12px',
              background: colors.neutral[900],
              color: 'white',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              opacity: 0,
              pointerEvents: 'none',
              transition: 'opacity 0.2s',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              Configuración
              <div style={{
                position: 'absolute',
                left: '-4px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '4px 4px 4px 0',
                borderColor: `transparent ${colors.neutral[900]} transparent transparent`
              }} />
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
