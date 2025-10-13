'use client'

import React, { useState } from 'react'
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { PaymentsCashSection } from '@/components/settings/sections/PaymentsCashSection'
import { PaymentsTransferSection } from '@/components/settings/sections/PaymentsTransferSection'
import { PaymentsTerminalSection } from '@/components/settings/sections/PaymentsTerminalSection'
import { PaymentsStripeSection } from '@/components/settings/sections/PaymentsStripeSection'
import { CreditCard } from 'lucide-react'

type PaymentsTab = 'cash' | 'transfer' | 'terminal' | 'stripe'

export default function PaymentsSettingsPage() {
  const [activeTab, setActiveTab] = useState<PaymentsTab>('cash')

  const tabs = [
    { id: 'cash', label: 'Efectivo', component: <PaymentsCashSection /> },
    { id: 'transfer', label: 'Transferencia', component: <PaymentsTransferSection /> },
    { id: 'terminal', label: 'Terminal', component: <PaymentsTerminalSection /> },
    { id: 'stripe', label: 'Stripe', component: <PaymentsStripeSection /> }
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
            Configuración de Pagos
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#516640',
            fontWeight: 400,
            margin: 0
          }}>
            Configura los métodos de pago disponibles para tu club
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
              onClick={() => setActiveTab(tab.id as PaymentsTab)}
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