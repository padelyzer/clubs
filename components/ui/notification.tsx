'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title?: string
  message: string
  duration?: number // milliseconds, 0 for persistent
}

interface NotificationProps extends Notification {
  onClose: (id: string) => void
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    containerClass: 'bg-emerald-50 border-emerald-200',
    iconClass: 'text-emerald-600',
    textClass: 'text-emerald-900',
    titleClass: 'text-emerald-900 font-semibold'
  },
  error: {
    icon: AlertCircle,
    containerClass: 'bg-red-50 border-red-200',
    iconClass: 'text-red-600',
    textClass: 'text-red-900',
    titleClass: 'text-red-900 font-semibold'
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-amber-50 border-amber-200',
    iconClass: 'text-amber-600',
    textClass: 'text-amber-900',
    titleClass: 'text-amber-900 font-semibold'
  },
  info: {
    icon: Info,
    containerClass: 'bg-blue-50 border-blue-200',
    iconClass: 'text-blue-600',
    textClass: 'text-blue-900',
    titleClass: 'text-blue-900 font-semibold'
  }
}

function NotificationItem({ id, type, title, message, duration = 5000, onClose }: NotificationProps) {
  const [isExiting, setIsExiting] = useState(false)
  const config = typeConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, id])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(id)
    }, 300) // Match animation duration
  }

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border shadow-sm
        transition-all duration-300 ease-in-out
        ${config.containerClass}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
      
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className={`text-sm mb-1 ${config.titleClass}`}>
            {title}
          </h3>
        )}
        <p className={`text-sm ${config.textClass}`}>
          {message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className={`
          flex-shrink-0 ml-2 p-1 rounded-md transition-colors
          hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-1
          ${type === 'success' ? 'focus:ring-emerald-500' : ''}
          ${type === 'error' ? 'focus:ring-red-500' : ''}
          ${type === 'warning' ? 'focus:ring-amber-500' : ''}
          ${type === 'info' ? 'focus:ring-blue-500' : ''}
        `}
        aria-label="Cerrar notificación"
      >
        <X className={`h-4 w-4 ${config.iconClass}`} />
      </button>
    </div>
  )
}

export function NotificationContainer() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const handleNotification = (event: CustomEvent<Notification>) => {
      const notification = {
        ...event.detail,
        id: event.detail.id || Date.now().toString()
      }
      setNotifications(prev => [...prev, notification])
    }

    window.addEventListener('show-notification' as any, handleNotification)
    return () => {
      window.removeEventListener('show-notification' as any, handleNotification)
    }
  }, [])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            {...notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  )
}

// Utility function to show notifications
export function showNotification(notification: Omit<Notification, 'id'>) {
  const event = new CustomEvent('show-notification', {
    detail: {
      ...notification,
      id: Date.now().toString()
    }
  })
  window.dispatchEvent(event)
}

// Convenience functions
export const notify = {
  success: (message: string, title?: string, duration?: number) => 
    showNotification({ type: 'success', message, title, duration }),
  
  error: (message: string, title?: string, duration?: number) => 
    showNotification({ type: 'error', message, title, duration }),
  
  warning: (message: string, title?: string, duration?: number) => 
    showNotification({ type: 'warning', message, title, duration }),
  
  info: (message: string, title?: string, duration?: number) => 
    showNotification({ type: 'info', message, title, duration })
}