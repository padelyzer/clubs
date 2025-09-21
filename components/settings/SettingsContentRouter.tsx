'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { ClubInformationSection } from './sections/ClubInformationSection'
import { CourtsManagementSection } from './sections/CourtsManagementSection'
import { CourtsScheduleSection } from './sections/CourtsScheduleSection'
import { CourtsPricingSection } from './sections/CourtsPricingSection'
import { PaymentsCashSection } from './sections/PaymentsCashSection'
import { PaymentsTransferSection } from './sections/PaymentsTransferSection'
import { PaymentsTerminalSection } from './sections/PaymentsTerminalSection'
import { PaymentsStripeSection } from './sections/PaymentsStripeSection'
import { NotificationsWhatsAppSection } from './sections/NotificationsWhatsAppSection'
import { NotificationsGeneralSection } from './sections/NotificationsGeneralSection'

export const SettingsContentRouter: React.FC = () => {
  const searchParams = useSearchParams()
  const section = searchParams.get('section') || 'club'
  const sub = searchParams.get('sub') || ''

  const renderContent = () => {
    // Club Information (default)
    if (section === 'club') {
      return <ClubInformationSection />
    }

    // Courts sections
    if (section === 'courts') {
      switch (sub) {
        case 'management':
          return <CourtsManagementSection />
        case 'schedule':
          return <CourtsScheduleSection />
        case 'pricing':
          return <CourtsPricingSection />
        default:
          return <CourtsManagementSection /> // Default to management
      }
    }

    // Payments sections  
    if (section === 'payments') {
      switch (sub) {
        case 'cash':
          return <PaymentsCashSection />
        case 'transfer':
          return <PaymentsTransferSection />
        case 'terminal':
          return <PaymentsTerminalSection />
        case 'stripe':
          return <PaymentsStripeSection />
        default:
          return <PaymentsCashSection /> // Default to cash
      }
    }

    // Notifications sections
    if (section === 'notifications') {
      switch (sub) {
        case 'whatsapp':
          return <NotificationsWhatsAppSection />
        case 'general':
          return <NotificationsGeneralSection />
        default:
          return <NotificationsWhatsAppSection /> // Default to whatsapp
      }
    }

    // Fallback to club info
    return <ClubInformationSection />
  }

  return renderContent()
}