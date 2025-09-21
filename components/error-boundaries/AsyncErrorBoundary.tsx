'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import { logger } from '@/lib/logging/logger'
import { ErrorBoundary } from './ErrorBoundary'

interface AsyncErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error) => void
}

interface AsyncError {
  error: Error
  timestamp: number
  id: string
}

// Global error handler for unhandled promise rejections
let globalAsyncErrors: AsyncError[] = []
let globalErrorListeners: ((error: AsyncError) => void)[] = []

// Set up global error handling
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const asyncError: AsyncError = {
      error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      timestamp: Date.now(),
      id: crypto.randomUUID(),
    }

    logger.error('Unhandled Promise Rejection', asyncError.error, {
      category: 'async-error',
      errorId: asyncError.id,
      global: true,
    })

    globalAsyncErrors.push(asyncError)
    globalErrorListeners.forEach(listener => listener(asyncError))

    // Clean up old errors (keep only last 10)
    if (globalAsyncErrors.length > 10) {
      globalAsyncErrors = globalAsyncErrors.slice(-10)
    }

    // Prevent default error handling
    event.preventDefault()
  })
}

export function AsyncErrorBoundary({ children, fallback, onError }: AsyncErrorBoundaryProps) {
  const [asyncError, setAsyncError] = useState<AsyncError | null>(null)

  useEffect(() => {
    const handleAsyncError = (error: AsyncError) => {
      setAsyncError(error)
      if (onError) {
        onError(error.error)
      }
    }

    globalErrorListeners.push(handleAsyncError)

    return () => {
      globalErrorListeners = globalErrorListeners.filter(listener => listener !== handleAsyncError)
    }
  }, [onError])

  const retry = () => {
    setAsyncError(null)
  }

  if (asyncError) {
    if (fallback) {
      return fallback(asyncError.error, retry)
    }

    // Default fallback UI
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        background: 'rgba(239, 68, 68, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        margin: '16px 0',
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#DC2626',
          margin: '0 0 8px 0',
        }}>
          Error de Conexión
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#6B7280',
          margin: '0 0 16px 0',
        }}>
          Hubo un problema al cargar los datos. Por favor, intenta nuevamente.
        </p>
        <button
          onClick={retry}
          style={{
            padding: '8px 16px',
            background: '#DC2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    )
  }

  return <>{children}</>
}

// Hook for handling async errors in components
export function useAsyncError() {
  return (error: Error) => {
    const asyncError: AsyncError = {
      error,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
    }

    logger.error('Async Error from Component', error, {
      category: 'async-error',
      errorId: asyncError.id,
      component: true,
    })

    globalAsyncErrors.push(asyncError)
    globalErrorListeners.forEach(listener => listener(asyncError))
  }
}

// HOC for wrapping async functions with error handling
export function withAsyncErrorHandling<T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await asyncFn(...args)
    } catch (error) {
      logger.error(`Async function error: ${context}`, error as Error, {
        category: 'async-error',
        context,
        args: JSON.stringify(args),
      })

      throw error
    }
  }
}

// Wrapper component that combines both error boundaries
export function RobustErrorBoundary({
  children,
  context,
  level = 'component' as 'page' | 'component' | 'critical'
}: {
  children: ReactNode
  context?: string
  level?: 'page' | 'component' | 'critical'
}) {
  return (
    <ErrorBoundary
      level={level}
      context={context}
      onError={(error, errorInfo) => {
        logger.error(`React Error in ${context}`, error, {
          componentStack: errorInfo.componentStack,
          context,
          level,
        })
      }}
    >
      <AsyncErrorBoundary
        onError={(error) => {
          logger.error(`Async Error in ${context}`, error, {
            context,
            level,
          })
        }}
      >
        {children}
      </AsyncErrorBoundary>
    </ErrorBoundary>
  )
}