/**
 * LiveMatchCard Component
 * Extracted from page.tsx (lines 4047-4117)
 * Displays a match currently in progress
 */

import React from 'react'
import type { Match } from '../types/tournament'

type LiveMatchCardProps = {
  match: Match
  colors: any
}

export function LiveMatchCard({ match, colors }: LiveMatchCardProps) {
  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '12px',
        background: 'white',
        border: `1px solid ${colors.border.light}`
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}
      >
        <span
          style={{
            fontSize: '14px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
            color: 'white',
            fontWeight: 500
          }}
        >
          CANCHA {match.courtNumber}
        </span>
        <span
          style={{
            fontSize: '14px',
            color: colors.text.secondary
          }}
        >
          {match.startTime
            ? `${Math.floor((Date.now() - new Date(match.startTime).getTime()) / 60000)} minutos`
            : 'En juego'}
        </span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <p
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: colors.text.primary,
            marginBottom: '8px'
          }}
        >
          {match.team1Name}
        </p>
        <div
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: colors.primary[600],
            margin: '12px 0'
          }}
        >
          {match.team1Score || '0-0'} | {match.team2Score || '0-0'}
        </div>
        <p
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: colors.text.primary
          }}
        >
          {match.team2Name}
        </p>
      </div>

      <div
        style={{
          padding: '8px',
          borderRadius: '8px',
          background: colors.neutral[50],
          textAlign: 'center',
          fontSize: '12px',
          color: colors.text.secondary
        }}
      >
        {match.round}
      </div>
    </div>
  )
}
