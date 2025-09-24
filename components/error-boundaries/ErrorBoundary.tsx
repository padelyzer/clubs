'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from '@/lib/logging/logger'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { generateId } from '@/lib/utils/generate-id'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'component' | 'critical'
  context?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: generateId(),
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { level = 'component', context, onError } = this.props
    const errorId = generateId()

    this.setState({
      error,
      errorInfo,
      errorId,
    })

    // Log the error with context
    logger.error(`React Error Boundary (${level})`, error, {
      errorId,
      level,
      context,
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      category: 'react-error',
    })

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo)
    }

    // Send to Sentry in production
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
            level,
            context,
          },
        },
        tags: {
          errorBoundary: level,
          errorId,
        },
      })
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    })
  }

  handleRefresh = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    const { hasError, error, errorId } = this.state
    const { children, fallback, level = 'component' } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Different UI based on error level
      return (
        <div style={{
          padding: level === 'page' ? '64px 32px' : '32px',
          textAlign: 'center',
          background: level === 'critical' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(156, 163, 175, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(156, 163, 175, 0.2)',
          margin: level === 'component' ? '16px 0' : '32px 0',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            {/* Error Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: level === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(156, 163, 175, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertTriangle
                size={32}
                color={level === 'critical' ? '#EF4444' : '#6B7280'}
              />
            </div>

            {/* Error Message */}
            <div>
              <h2 style={{
                fontSize: level === 'page' ? '24px' : '20px',
                fontWeight: 600,
                color: '#111827',
                margin: '0 0 8px 0',
              }}>
                {level === 'critical'
                  ? 'Error Crítico'
                  : level === 'page'
                  ? 'Error en la Página'
                  : 'Error en el Componente'
                }
              </h2>

              <p style={{
                fontSize: '16px',
                color: '#6B7280',
                margin: '0 0 16px 0',
                lineHeight: '1.5',
              }}>
                {level === 'critical'
                  ? 'Se ha producido un error crítico que requiere atención inmediata.'
                  : 'Algo salió mal al cargar este contenido. Puedes intentar nuevamente.'
                }
              </p>

              {process.env.NODE_ENV === 'development' && error && (
                <details style={{
                  textAlign: 'left',
                  background: '#f3f4f6',
                  padding: '16px',
                  borderRadius: '8px',
                  marginTop: '16px',
                }}>
                  <summary style={{
                    cursor: 'pointer',
                    fontWeight: 600,
                    marginBottom: '8px',
                  }}>
                    Detalles del Error (Desarrollo)
                  </summary>
                  <pre style={{
                    fontSize: '12px',
                    overflow: 'auto',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {error.name}: {error.message}
                    {error.stack && '\n\n' + error.stack}
                  </pre>
                  {errorId && (
                    <p style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      margin: '8px 0 0 0',
                    }}>
                      Error ID: {errorId}
                    </p>
                  )}
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <button
                onClick={this.handleRetry}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2563EB'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#3B82F6'
                }}
              >
                <RefreshCw size={16} />
                Intentar de Nuevo
              </button>

              {level === 'page' && (
                <>
                  <button
                    onClick={this.handleRefresh}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: '#6B7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#4B5563'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#6B7280'
                    }}
                  >
                    <RefreshCw size={16} />
                    Recargar Página
                  </button>

                  <button
                    onClick={this.handleGoHome}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: 'transparent',
                      color: '#6B7280',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F3F4F6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <Home size={16} />
                    Ir al Inicio
                  </button>
                </>
              )}

              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    console.error('Error details:', { error, errorInfo: this.state.errorInfo, errorId })
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: 'transparent',
                    color: '#9333EA',
                    border: '1px solid #9333EA',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(147, 51, 234, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <Bug size={16} />
                  Debug Console
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}

// Convenience components for different levels
export const PageErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="page" />
)

export const ComponentErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="component" />
)

export const CriticalErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="critical" />
)