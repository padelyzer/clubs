'use client'

import React, { useState } from 'react'
import { SettingsNavigation, MainSection, SubSection } from './SettingsNavigation'
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

interface SettingsLayoutProps {
  initialSection?: MainSection
  initialSubSection?: string
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  initialSection = 'club',
  initialSubSection = ''
}) => {
  const [activeSection, setActiveSection] = useState<MainSection>(initialSection)
  const [activeSubSection, setActiveSubSection] = useState<string>(initialSubSection)

  const handleSectionChange = (section: MainSection, subSection?: string) => {
    setActiveSection(section)
    setActiveSubSection(subSection || '')
  }

  const renderContent = () => {
    // Club Information (no subsections)
    if (activeSection === 'club') {
      return <ClubInformationSection />
    }

    // Courts sections
    if (activeSection === 'courts') {
      switch (activeSubSection) {
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
    if (activeSection === 'payments') {
      switch (activeSubSection) {
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
    if (activeSection === 'notifications') {
      switch (activeSubSection) {
        case 'whatsapp':
          return <NotificationsWhatsAppSection />
        case 'general':
          return <NotificationsGeneralSection />
        default:
          return <NotificationsWhatsAppSection /> // Default to whatsapp
      }
    }

    // Fallback
    return <ClubInformationSection />
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#ffffff'
    }}>
      {/* Navigation Sidebar */}
      <SettingsNavigation
        activeSection={activeSection}
        activeSubSection={activeSubSection}
        onSectionChange={handleSectionChange}
      />

      {/* Content Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#fbfbfd'
      }}>
        {renderContent()}
      </div>
    </div>
  )
}