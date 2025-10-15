/**
 * LoadingState Component
 * Extracted from page.tsx (lines 420-470)
 */

import { Loader2 } from 'lucide-react'
import { CardModern } from '@/components/design-system/CardModern'

export function LoadingState() {
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
          <Loader2
            size={48}
            style={{
              animation: 'spin 1s linear infinite',
              color: '#047857',
              margin: '0 auto 16px'
            }}
          />
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            Cargando torneo...
          </p>
        </div>
      </CardModern>
    </div>
  )
}
