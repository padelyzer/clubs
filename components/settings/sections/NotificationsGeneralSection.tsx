'use client'

import React from 'react'
import { SettingsCard } from '@/components/design-system/SettingsCard'
import { Bell } from 'lucide-react'

export const NotificationsGeneralSection: React.FC = () => {
  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <Bell size={24} style={{ marginRight: '12px', color: '#007aff' }} />
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1d1d1f',
            margin: 0
          }}>
            Notificaciones Generales
          </h1>
        </div>
        <p style={{
          fontSize: '17px',
          color: '#424245',
          margin: 0,
          lineHeight: '1.4'
        }}>
          Configura las notificaciones por email y SMS
        </p>
      </div>

      {/* Placeholder Content */}
      <SettingsCard title="Configuración de Notificaciones" icon={<Bell size={18} />}>
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#8e8e93'
        }}>
          <Bell size={48} style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#1d1d1f' }}>
            Próximamente
          </h3>
          <p style={{ margin: 0 }}>
            La configuración de notificaciones generales estará disponible pronto
          </p>
        </div>
      </SettingsCard>
    </div>
  )
}