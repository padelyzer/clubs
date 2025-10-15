/**
 * CaptureMatchCard Component
 * Extracted from page.tsx (lines 2665-2802)
 * Match card with score input fields
 */

import React from 'react'
import type { Match } from '../types/tournament'

type CaptureMatchCardProps = {
  match: Match
  isSelected: boolean
  onToggleSelect: (checked: boolean) => void
  colors: any
}

export function CaptureMatchCard({
  match,
  isSelected,
  onToggleSelect,
  colors
}: CaptureMatchCardProps) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: match.status === 'completed' ? 'rgba(102, 231, 170, 0.05)' : 'white',
        border: `1px solid ${match.status === 'completed' ? colors.accent[600] + '30' : colors.border.light}`,
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onToggleSelect(e.target.checked)}
        style={{
          width: '20px',
          height: '20px',
          cursor: 'pointer'
        }}
      />

      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 100px 100px 100px 2fr',
            gap: '16px',
            alignItems: 'center'
          }}
        >
          <div>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: colors.text.primary
              }}
            >
              {match.team1Name}
            </p>
            <p
              style={{
                fontSize: '12px',
                color: colors.text.secondary
              }}
            >
              {match.round}
            </p>
          </div>

          <input
            type="text"
            placeholder="Set 1"
            defaultValue={match.team1Score?.split('-')[0]}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: `1px solid ${colors.border.default}`,
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 500
            }}
          />

          <input
            type="text"
            placeholder="Set 2"
            defaultValue={match.team1Score?.split('-')[1]}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: `1px solid ${colors.border.default}`,
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 500
            }}
          />

          <input
            type="text"
            placeholder="Set 3"
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: `1px solid ${colors.border.default}`,
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 500
            }}
          />

          <div style={{ textAlign: 'right' }}>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: colors.text.primary
              }}
            >
              {match.team2Name}
            </p>
            <p
              style={{
                fontSize: '12px',
                color: colors.text.secondary
              }}
            >
              Cancha {match.courtNumber || '?'}
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '8px 12px',
          borderRadius: '8px',
          background:
            match.status === 'completed'
              ? `linear-gradient(135deg, ${colors.accent[600]}20, ${colors.accent[300]}20)`
              : colors.neutral[100],
          border: `1px solid ${match.status === 'completed' ? colors.accent[600] + '40' : colors.border.light}`,
          minWidth: '120px',
          textAlign: 'center'
        }}
      >
        {match.status === 'completed' ? (
          <span
            style={{
              fontSize: '12px',
              color: colors.accent[700],
              fontWeight: 500
            }}
          >
            ✓ Completado
          </span>
        ) : (
          <span
            style={{
              fontSize: '12px',
              color: colors.text.secondary
            }}
          >
            Pendiente
          </span>
        )}
      </div>
    </div>
  )
}
