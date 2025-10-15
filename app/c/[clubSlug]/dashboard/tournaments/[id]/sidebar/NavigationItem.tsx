/**
 * NavigationItem Component
 * Extracted from page.tsx (lines 721-803, 806-891, etc.)
 * Reusable navigation item with icon, label, and tooltip
 */

import React from 'react'
import type { LucideIcon } from 'lucide-react'

type NavigationItemProps = {
  icon: LucideIcon
  label: string
  subtitle: string
  isActive: boolean
  onClick: () => void
  sidebarCollapsed: boolean
  badge?: {
    text: string
    color: string
    background: string
  }
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

export function NavigationItem({
  icon: Icon,
  label,
  subtitle,
  isActive,
  onClick,
  sidebarCollapsed,
  badge
}: NavigationItemProps) {
  return (
    <div
      onClick={onClick}
      className="sidebar-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: sidebarCollapsed ? '16px' : '12px 16px',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: isActive
          ? 'linear-gradient(135deg, #047857, #059669)'
          : 'transparent',
        color: isActive ? 'white' : colors.text.secondary,
        gap: '12px',
        position: 'relative',
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = colors.neutral[100]
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
        size={sidebarCollapsed ? 21 : 20}
        style={{
          minWidth: sidebarCollapsed ? '21px' : '20px',
          minHeight: sidebarCollapsed ? '21px' : '20px'
        }}
      />
      {!sidebarCollapsed && (
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{label}</span>
            {badge && (
              <span style={{
                padding: '2px 6px',
                borderRadius: '6px',
                background: isActive
                  ? 'rgba(255,255,255,0.2)'
                  : badge.background,
                color: isActive ? 'white' : badge.color,
                fontSize: '10px',
                fontWeight: 600
              }}>
                {badge.text}
              </span>
            )}
          </div>
          <div style={{
            fontSize: '11px',
            opacity: 0.8,
            marginTop: '2px'
          }}>
            {subtitle}
          </div>
        </div>
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
          {label}
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
  )
}
