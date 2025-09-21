'use client'

import React, { useState } from 'react'
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { CourtsManagementSection } from '@/components/settings/sections/CourtsManagementSection'
import { CourtsScheduleSection } from '@/components/settings/sections/CourtsScheduleSection'
import { CourtsPricingSection } from '@/components/settings/sections/CourtsPricingSection'
import { Zap } from 'lucide-react'

type CourtsTab = 'management' | 'schedule' | 'pricing'

export default function CourtsSettingsPage() {
  const [activeTab, setActiveTab] = useState<CourtsTab>('management')

  const tabs = [
    { id: 'management', label: 'Canchas', component: <CourtsManagementSection /> },
    { id: 'schedule', label: 'Horarios', component: <CourtsScheduleSection /> },
    { id: 'pricing', label: 'Precios', component: <CourtsPricingSection /> }
  ]

  return (
    <CleanDashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
        {/* Header - Clean style matching other pages */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#182A01',
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em'
          }}>
            Configuración de Canchas
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#516640',
            fontWeight: 400,
            margin: 0
          }}>
            Gestiona las canchas, horarios y precios de tu club
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          background: 'rgba(164, 223, 78, 0.05)',
          padding: '4px',
          borderRadius: '12px'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CourtsTab)}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: activeTab === tab.id 
                  ? 'white' 
                  : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeTab === tab.id ? '#182A01' : '#516640',
                fontWeight: activeTab === tab.id ? '600' : '400',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </CleanDashboardLayout>
  )
}