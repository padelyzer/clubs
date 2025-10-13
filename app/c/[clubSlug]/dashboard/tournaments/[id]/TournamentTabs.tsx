'use client'

import React, { useState } from 'react'
import {
  LayoutGrid,
  Users,
  Trophy,
  Calendar,
  Settings,
  BarChart3,
  QrCode
} from 'lucide-react'

interface Tab {
  id: string
  name: string
  icon: any
}

interface TournamentTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function TournamentTabs({ activeTab, onTabChange }: TournamentTabsProps) {
  const tabs: Tab[] = [
    { id: 'overview', name: 'Resumen', icon: LayoutGrid },
    { id: 'registrations', name: 'Inscripciones', icon: Users },
    { id: 'bracket', name: 'Bracket', icon: Trophy },
    { id: 'matches', name: 'Partidos', icon: Calendar },
    { id: 'checkin', name: 'Check-in', icon: QrCode },
    { id: 'rankings', name: 'Rankings', icon: BarChart3 },
    { id: 'settings', name: 'Configuración', icon: Settings },
  ]

  return (
    <div style={{
      background: 'white',
      borderBottom: '1px solid #E5E7EB',
      overflowX: 'auto'
    }}>
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '0 32px',
        minWidth: 'max-content'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #10B981' : '2px solid transparent',
                color: isActive ? '#10B981' : '#6B7280',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#374151'
                  e.currentTarget.style.borderBottomColor = '#D1D5DB'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#6B7280'
                  e.currentTarget.style.borderBottomColor = 'transparent'
                }
              }}
            >
              <Icon size={18} />
              <span>{tab.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
