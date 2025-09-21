'use client'

import React, { useState } from 'react'
import { 
  Building, Zap, DollarSign, Bell, 
  ChevronDown, ChevronRight 
} from 'lucide-react'

export type MainSection = 'club' | 'courts' | 'payments' | 'notifications'

export type SubSection = {
  courts: 'management' | 'schedule' | 'pricing'
  payments: 'cash' | 'transfer' | 'terminal' | 'stripe'  
  notifications: 'whatsapp' | 'general'
}

interface SettingsNavigationProps {
  activeSection: MainSection
  activeSubSection: string
  onSectionChange: (section: MainSection, subSection?: string) => void
}

interface NavigationItem {
  id: MainSection
  label: string
  icon: React.ReactNode
  subItems?: Array<{
    id: string
    label: string
  }>
}

export const SettingsNavigation: React.FC<SettingsNavigationProps> = ({
  activeSection,
  activeSubSection,
  onSectionChange
}) => {
  const [expandedSections, setExpandedSections] = useState<MainSection[]>([
    activeSection // Auto-expand active section
  ])

  const navigationItems: NavigationItem[] = [
    {
      id: 'club',
      label: 'Información del Club',
      icon: <Building size={18} />
    },
    {
      id: 'courts',
      label: 'Canchas',
      icon: <Zap size={18} />,
      subItems: [
        { id: 'management', label: 'Gestión de Canchas' },
        { id: 'schedule', label: 'Horarios' },
        { id: 'pricing', label: 'Precios' }
      ]
    },
    {
      id: 'payments',
      label: 'Pagos',
      icon: <DollarSign size={18} />,
      subItems: [
        { id: 'cash', label: 'Efectivo' },
        { id: 'transfer', label: 'Transferencia' },
        { id: 'terminal', label: 'Terminal' },
        { id: 'stripe', label: 'Stripe' }
      ]
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: <Bell size={18} />,
      subItems: [
        { id: 'whatsapp', label: 'WhatsApp' },
        { id: 'general', label: 'Generales' }
      ]
    }
  ]

  const toggleSection = (sectionId: MainSection) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter(id => id !== sectionId))
    } else {
      setExpandedSections([...expandedSections, sectionId])
    }
  }

  const handleSectionClick = (sectionId: MainSection, subSectionId?: string) => {
    // If section has sub-items, expand/collapse it
    if (navigationItems.find(item => item.id === sectionId)?.subItems) {
      if (!expandedSections.includes(sectionId)) {
        setExpandedSections([...expandedSections, sectionId])
      }
      // If no sub-section specified, select the first one
      if (!subSectionId) {
        const firstSubItem = navigationItems.find(item => item.id === sectionId)?.subItems?.[0]
        if (firstSubItem) {
          onSectionChange(sectionId, firstSubItem.id)
        }
      } else {
        onSectionChange(sectionId, subSectionId)
      }
    } else {
      // Simple section without sub-items
      onSectionChange(sectionId)
    }
  }

  return (
    <div style={{
      width: '280px',
      borderRight: '1px solid #e5e5e7',
      backgroundColor: '#f5f5f7',
      padding: '20px 0',
      height: '100%',
      overflowY: 'auto'
    }}>
      <div style={{
        fontSize: '20px',
        fontWeight: '600',
        color: '#1d1d1f',
        marginBottom: '24px',
        paddingLeft: '20px'
      }}>
        Configuración
      </div>

      {navigationItems.map((item) => (
        <div key={item.id} style={{ marginBottom: '4px' }}>
          {/* Main Section */}
          <div
            onClick={() => handleSectionClick(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              cursor: 'pointer',
              backgroundColor: activeSection === item.id ? '#e8f4fd' : 'transparent',
              borderRight: activeSection === item.id ? '3px solid #007aff' : '3px solid transparent',
              color: activeSection === item.id ? '#007aff' : '#1d1d1f',
              transition: 'all 0.2s ease',
              fontSize: '15px',
              fontWeight: activeSection === item.id ? '600' : '500'
            }}
            onMouseEnter={(e) => {
              if (activeSection !== item.id) {
                e.currentTarget.style.backgroundColor = '#e8e8ed'
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <span style={{ marginRight: '12px' }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.subItems && (
              <span style={{ marginLeft: '8px' }}>
                {expandedSections.includes(item.id) ? 
                  <ChevronDown size={16} /> : 
                  <ChevronRight size={16} />
                }
              </span>
            )}
          </div>

          {/* Sub Items */}
          {item.subItems && expandedSections.includes(item.id) && (
            <div style={{ backgroundColor: '#ffffff', borderLeft: '1px solid #e5e5e7' }}>
              {item.subItems.map((subItem) => (
                <div
                  key={subItem.id}
                  onClick={() => handleSectionClick(item.id, subItem.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 20px 10px 52px',
                    cursor: 'pointer',
                    backgroundColor: activeSection === item.id && activeSubSection === subItem.id ? 
                      '#f0f8ff' : 'transparent',
                    color: activeSection === item.id && activeSubSection === subItem.id ? 
                      '#007aff' : '#424245',
                    fontSize: '14px',
                    fontWeight: activeSection === item.id && activeSubSection === subItem.id ? 
                      '600' : '400',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!(activeSection === item.id && activeSubSection === subItem.id)) {
                      e.currentTarget.style.backgroundColor = '#f8f8f8'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(activeSection === item.id && activeSubSection === subItem.id)) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {subItem.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}