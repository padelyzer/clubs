/**
 * ErrorState Component
 * Extracted from page.tsx (lines 470-492)
 */

import { AlertCircle } from 'lucide-react'
import { CardModern } from '@/components/design-system/CardModern'

type ErrorStateProps = {
  error: string
  onRetry: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb'
      }}
    >
      <CardModern variant="glass" padding="lg">
        <div style={{ textAlign: 'center' }}>
          <AlertCircle
            size={48}
            style={{ color: '#ef4444', margin: '0 auto 16px' }}
          />
          <p
            style={{
              fontSize: '16px',
              color: '#1f2937',
              fontWeight: 600,
              marginBottom: '8px'
            }}
          >
            {error}
          </p>
          <button
            onClick={onRetry}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#047857',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#059669'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#047857'
            }}
          >
            Reintentar
          </button>
        </div>
      </CardModern>
    </div>
  )
}
