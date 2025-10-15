/**
 * LoadingTeamsState Component
 * Extracted from page.tsx (lines 3027-3039)
 * Loading state for registrations
 */

import React from 'react'
import { Loader2 } from 'lucide-react'

type LoadingTeamsStateProps = {
  colors: any
}

export function LoadingTeamsState({ colors }: LoadingTeamsStateProps) {
  return (
    <div
      style={{
        padding: '48px',
        textAlign: 'center',
        color: colors.text.tertiary
      }}
    >
      <Loader2
        size={32}
        style={{
          color: colors.primary[600],
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}
      />
      <p>Cargando inscripciones...</p>
    </div>
  )
}
