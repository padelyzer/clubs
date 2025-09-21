'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number // milliseconds, 0 for persistent
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationSystemProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    colors: {
      accent: '#34C759', // iOS green
      text: '#1D1D1F',
      secondary: '#86868B'
    }
  },
  error: {
    icon: AlertCircle,
    colors: {
      accent: '#FF3B30', // iOS red
      text: '#1D1D1F',
      secondary: '#86868B'
    }
  },
  warning: {
    icon: AlertTriangle,
    colors: {
      accent: '#FF9F0A', // iOS orange
      text: '#1D1D1F',
      secondary: '#86868B'
    }
  },
  info: {
    icon: Info,
    colors: {
      accent: '#007AFF', // iOS blue
      text: '#1D1D1F',
      secondary: '#86868B'
    }
  }
}

export function NotificationSystem({ 
  notifications, 
  onDismiss, 
  position = 'top-right' 
}: NotificationSystemProps) {
  const positionStyles = {
    'top-right': { top: '24px', right: '24px' },
    'top-left': { top: '24px', left: '24px' },
    'bottom-right': { bottom: '24px', right: '24px' },
    'bottom-left': { bottom: '24px', left: '24px' }
  }

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '380px',
        maxWidth: 'calc(100vw - 32px)'
      }}
    >
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}

function NotificationCard({ 
  notification, 
  onDismiss 
}: { 
  notification: Notification
  onDismiss: (id: string) => void 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const config = typeConfig[notification.type]
  const Icon = config.icon

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Auto dismiss
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification.duration])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(notification.id)
    }, 300)
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '18px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        transform: isVisible && !isExiting ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.95)',
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        position: 'relative',
        overflow: 'hidden',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)', // Safari support
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Icon - more minimal */}
        <div
          style={{
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '1px'
          }}
        >
          <Icon size={20} color={config.colors.accent} strokeWidth={2.5} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 590, // Apple system weight
              fontSize: '15px',
              color: config.colors.text,
              lineHeight: '1.35',
              marginBottom: notification.message ? '6px' : 0,
              letterSpacing: '-0.01em' // Apple's tight spacing
            }}
          >
            {notification.title}
          </div>
          {notification.message && (
            <div
              style={{
                fontSize: '14px',
                color: config.colors.secondary,
                lineHeight: '1.4',
                marginBottom: notification.action ? '14px' : 0,
                letterSpacing: '-0.005em'
              }}
            >
              {notification.message}
            </div>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              style={{
                background: config.colors.accent,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 590,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                letterSpacing: '-0.01em',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)'
                e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.opacity = '1'
              }}
            >
              {notification.action.label}
            </button>
          )}
        </div>

        {/* Close button - more minimal */}
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: config.colors.secondary,
            padding: '6px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            flexShrink: 0,
            width: '32px',
            height: '32px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.06)'
            e.currentTarget.style.color = config.colors.text
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = config.colors.secondary
          }}
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}