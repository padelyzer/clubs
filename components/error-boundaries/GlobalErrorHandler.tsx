'use client'

import React, { useState, useEffect } from 'react'
import { logger } from '@/lib/logging/logger'
import { X, AlertTriangle, Wifi, RefreshCw } from 'lucide-react'

interface GlobalError {
  id: string
  type: 'network' | 'permission' | 'quota' | 'generic'
  message: string
  action?: () => void
  actionLabel?: string
  timestamp: number
  persistent?: boolean
}

let globalErrors: GlobalError[] = []
let errorListeners: ((errors: GlobalError[]) => void)[] = []

export function addGlobalError(error: Omit<GlobalError, 'id' | 'timestamp'>) {
  const newError: GlobalError = {
    ...error,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }

  globalErrors.push(newError)

  // Auto-remove non-persistent errors after 5 seconds
  if (!error.persistent) {
    setTimeout(() => {
      removeGlobalError(newError.id)
    }, 5000)
  }

  notifyListeners()

  // Log to our logging system
  logger.error('Global Error', new Error(error.message), {
    category: 'global-error',
    errorType: error.type,
    errorId: newError.id,
  })
}

export function removeGlobalError(id: string) {
  globalErrors = globalErrors.filter(error => error.id !== id)
  notifyListeners()
}

function notifyListeners() {
  errorListeners.forEach(listener => listener([...globalErrors]))
}

export function GlobalErrorHandler() {
  const [errors, setErrors] = useState<GlobalError[]>([])

  useEffect(() => {
    const listener = (newErrors: GlobalError[]) => {
      setErrors(newErrors)
    }

    errorListeners.push(listener)

    // Check network status
    const handleOnline = () => {
      // Remove network errors when back online
      globalErrors = globalErrors.filter(error => error.type !== 'network')
      notifyListeners()
    }

    const handleOffline = () => {
      addGlobalError({
        type: 'network',
        message: 'Sin conexión a internet',
        persistent: true,
        action: () => window.location.reload(),
        actionLabel: 'Reintentar',
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial network status
    if (!navigator.onLine) {
      handleOffline()
    }

    return () => {
      errorListeners = errorListeners.filter(l => l !== listener)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (errors.length === 0) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      right: '16px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '400px',
    }}>
      {errors.map((error) => (
        <GlobalErrorToast
          key={error.id}
          error={error}
          onDismiss={() => removeGlobalError(error.id)}
        />
      ))}
    </div>
  )
}

function GlobalErrorToast({
  error,
  onDismiss,
}: {
  error: GlobalError
  onDismiss: () => void
}) {
  const getIcon = () => {
    switch (error.type) {
      case 'network':
        return <Wifi size={20} />
      case 'permission':
      case 'quota':
      case 'generic':
      default:
        return <AlertTriangle size={20} />
    }
  }

  const getColor = () => {
    switch (error.type) {
      case 'network':
        return '#F59E0B'
      case 'permission':
        return '#EF4444'
      case 'quota':
        return '#8B5CF6'
      case 'generic':
      default:
        return '#6B7280'
    }
  }

  return (
    <div
      style={{
        background: 'white',
        border: `1px solid ${getColor()}`,
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div style={{ color: getColor(), flexShrink: 0, marginTop: '2px' }}>
        {getIcon()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: 500,
          color: '#111827',
          wordBreak: 'break-word',
        }}>
          {error.message}
        </p>

        {error.action && (
          <button
            onClick={error.action}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              background: getColor(),
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RefreshCw size={12} />
            {error.actionLabel || 'Reintentar'}
          </button>
        )}
      </div>

      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: '#6B7280',
          cursor: 'pointer',
          padding: '2px',
          flexShrink: 0,
        }}
      >
        <X size={16} />
      </button>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

// Utility functions for common error scenarios
export const GlobalErrorUtils = {
  networkError: () => addGlobalError({
    type: 'network',
    message: 'Error de conexión. Verifica tu internet.',
    action: () => window.location.reload(),
    actionLabel: 'Reintentar',
  }),

  permissionError: (resource: string) => addGlobalError({
    type: 'permission',
    message: `No tienes permisos para acceder a ${resource}`,
  }),

  quotaError: () => addGlobalError({
    type: 'quota',
    message: 'Has alcanzado el límite de uso. Contacta al administrador.',
  }),

  genericError: (message: string, action?: () => void) => addGlobalError({
    type: 'generic',
    message,
    action,
    actionLabel: action ? 'Reintentar' : undefined,
  }),
}