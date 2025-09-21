'use client'

import { useState, useCallback } from 'react'
import { Notification, NotificationType } from '@/components/ui/notification'

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((
    type: NotificationType,
    message: string,
    options?: {
      title?: string
      duration?: number
    }
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      title: options?.title,
      duration: options?.duration ?? 5000
    }
    
    setNotifications(prev => [...prev, notification])
    
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, notification.duration)
    }
    
    return notification.id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const notify = {
    success: (message: string, options?: { title?: string; duration?: number }) =>
      addNotification('success', message, options),
    
    error: (message: string, options?: { title?: string; duration?: number }) =>
      addNotification('error', message, options),
    
    warning: (message: string, options?: { title?: string; duration?: number }) =>
      addNotification('warning', message, options),
    
    info: (message: string, options?: { title?: string; duration?: number }) =>
      addNotification('info', message, options),
  }

  return {
    notifications,
    notify,
    removeNotification,
    clearAll
  }
}