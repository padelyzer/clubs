'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { NotificationSystem } from '@/components/notifications/NotificationSystem'
import { useNotifications, NotificationOptions } from '@/hooks/useNotifications'

interface NotificationContextType {
  success: (options: NotificationOptions) => void
  error: (options: NotificationOptions) => void
  warning: (options: NotificationOptions) => void
  info: (options: NotificationOptions) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { notifications, removeNotification, success, error, warning, info, clearAll } = useNotifications()

  const contextValue: NotificationContextType = {
    success,
    error,
    warning,
    info,
    clearAll
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationSystem 
        notifications={notifications} 
        onDismiss={removeNotification}
        position="top-right"
      />
    </NotificationContext.Provider>
  )
}

export function useNotify(): NotificationContextType {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotify must be used within a NotificationProvider')
  }
  return context
}