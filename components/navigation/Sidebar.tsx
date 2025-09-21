'use client'

import { BaseNav } from './BaseNav'
import { useState } from 'react'

interface SidebarProps {
  navigation: {
    main: Array<{
      label: string
      href: string
      icon?: string
      children?: Array<{
        label: string
        href: string
        icon?: string
      }>
    }>
    secondary?: Array<{
      label: string
      href: string
      icon?: string
    }>
  }
  userRole?: 'club' | 'admin'
}

export function Sidebar({ navigation, userRole = 'club' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  return (
    <aside 
      role="complementary"
      aria-label="Sidebar navigation"
      data-collapsed={isCollapsed}
    >
      {/* Collapse toggle for mobile/desktop */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!isCollapsed}
      >
        <span aria-hidden="true">{isCollapsed ? '→' : '←'}</span>
      </button>
      
      {/* User info */}
      {!isCollapsed && (
        <div role="region" aria-label="User information">
          <span>{userRole === 'admin' ? 'Super Admin' : 'Club Dashboard'}</span>
        </div>
      )}
      
      {/* Main navigation */}
      <div role="region" aria-label="Main menu">
        {!isCollapsed && <h2>Menu Principal</h2>}
        <BaseNav 
          items={navigation.main} 
          ariaLabel="Main menu navigation"
        />
      </div>
      
      {/* Secondary navigation */}
      {navigation.secondary && (
        <div role="region" aria-label="Settings menu">
          {!isCollapsed && <h2>Configuración</h2>}
          <BaseNav 
            items={navigation.secondary} 
            ariaLabel="Settings navigation"
          />
        </div>
      )}
    </aside>
  )
}