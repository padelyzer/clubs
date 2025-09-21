'use client'

import { useState, useCallback } from 'react'
import { Notification } from '@/components/notifications/NotificationSystem'

export interface NotificationOptions {
  title: string
  message?: string
  duration?: number // milliseconds, default 5000, 0 for persistent
  action?: {
    label: string
    onClick: () => void
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((
    type: Notification['type'], 
    options: NotificationOptions
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    
    const notification: Notification = {
      id,
      type,
      title: options.title,
      message: options.message,
      duration: options.duration ?? 5000,
      action: options.action
    }

    setNotifications(prev => [...prev, notification])
    
    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Convenience methods
  const success = useCallback((options: NotificationOptions) => 
    addNotification('success', options), [addNotification])

  const error = useCallback((options: NotificationOptions) => 
    addNotification('error', options), [addNotification])

  const warning = useCallback((options: NotificationOptions) => 
    addNotification('warning', options), [addNotification])

  const info = useCallback((options: NotificationOptions) => 
    addNotification('info', options), [addNotification])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
}