'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div role="alert" aria-live="assertive">
          <h2>Algo salió mal</h2>
          <details>
            <summary>Detalles del error</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false })}
            type="button"
          >
            Intentar de nuevo
          </button>
        </div>
      )
    }

    return this.props.children
  }
}