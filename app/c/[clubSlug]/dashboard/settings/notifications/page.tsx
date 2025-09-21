'use client'

import React, { useState } from 'react'
import { NotificationsWhatsAppSection } from '@/components/settings/sections/NotificationsWhatsAppSection'
import { MessageCircle } from 'lucide-react'

type NotificationsTab = 'whatsapp'

export default function NotificationsSettingsPage() {
  const [activeTab, setActiveTab] = useState<NotificationsTab>('whatsapp')

  const tabs = [
    { id: 'whatsapp', label: 'WhatsApp', component: <NotificationsWhatsAppSection /> }
  ]

  return (
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
          Configuración de Notificaciones
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#516640',
          fontWeight: 400,
          margin: 0
        }}>
          Gestiona las notificaciones automáticas para tus clientes
        </p>
      </div>

      {/* Single tab for now */}
      {tabs.length > 1 ? (
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
              onClick={() => setActiveTab(tab.id as NotificationsTab)}
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
      ) : null}

      {/* Content */}
      <div>
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  )
}