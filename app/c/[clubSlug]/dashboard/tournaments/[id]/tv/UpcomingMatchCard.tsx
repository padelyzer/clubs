/**
 * UpcomingMatchCard Component
 * Extracted from page.tsx (lines 4144-4189)
 * Displays an upcoming match
 */

import React from 'react'
import type { Match } from '../types/tournament'

type UpcomingMatchCardProps = {
  match: Match
  colors: any
}

export function UpcomingMatchCard({ match, colors }: UpcomingMatchCardProps) {
  return (
    <div
      style={{
        padding: '12px',
        borderRadius: '8px',
        background: 'white',
        border: `1px solid ${colors.border.light}`
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: colors.warning[600]
          }}
        >
          {match.scheduledAt
            ? new Date(match.scheduledAt).toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'Por definir'}
        </span>
        <span
          style={{
            fontSize: '11px',
            color: colors.text.secondary
          }}
        >
          Cancha {match.courtNumber || '?'}
        </span>
      </div>
      <p
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: colors.text.primary,
          marginBottom: '4px'
        }}
      >
        {match.team1Name} vs {match.team2Name}
      </p>
      <p
        style={{
          fontSize: '11px',
          color: colors.text.secondary
        }}
      >
        {match.round}
      </p>
    </div>
  )
}
