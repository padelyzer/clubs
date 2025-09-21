'use client'

import React from 'react'
import { WhatsAppDashboard } from '@/components/whatsapp/whatsapp-dashboard'
import { MessageCircle } from 'lucide-react'

export const NotificationsWhatsAppSection: React.FC = () => {
  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <MessageCircle size={24} style={{ marginRight: '12px', color: '#007aff' }} />
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1d1d1f',
            margin: 0
          }}>
            WhatsApp
          </h1>
        </div>
        <p style={{
          fontSize: '17px',
          color: '#424245',
          margin: 0,
          lineHeight: '1.4'
        }}>
          Gestiona las notificaciones y comunicación por WhatsApp
        </p>
      </div>

      {/* WhatsApp Dashboard Component */}
      <WhatsAppDashboard />
    </div>
  )
}