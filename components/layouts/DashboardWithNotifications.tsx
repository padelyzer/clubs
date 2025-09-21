'use client'

import React from 'react'
import { CleanDashboardLayout } from './CleanDashboardLayout'
import { NotificationProvider } from '@/contexts/NotificationContext'

interface DashboardWithNotificationsProps {
  children: React.ReactNode
  clubName?: string
  userName?: string
  userRole?: string
  enabledModules?: string[]
}

export function DashboardWithNotifications({ 
  children, 
  clubName,
  userName,
  userRole,
  enabledModules
}: DashboardWithNotificationsProps) {
  return (
    <NotificationProvider>
      <CleanDashboardLayout 
        clubName={clubName}
        userName={userName}
        userRole={userRole}
        enabledModules={enabledModules}
      >
        {children}
      </CleanDashboardLayout>
    </NotificationProvider>
  )
}