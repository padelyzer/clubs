/**
 * CaptureMatchCard Component
 * Extracted from page.tsx (lines 2665-2802)
 * Match card with score input fields
 */

import React from 'react'
import { Trophy } from 'lucide-react'
import type { Match } from '../types/tournament'

type MatchScores = {
  team1Sets: (number | null)[]
  team2Sets: (number | null)[]
}

type CaptureMatchCardProps = {
  match: Match
  isSelected: boolean
  onToggleSelect: (checked: boolean) => void
  onScoreChange: (scores: MatchScores) => void
  colors: any
}

export function CaptureMatchCard({
  match,
  isSelected,
  onToggleSelect,
  onScoreChange,
  colors
}: CaptureMatchCardProps) {
  // State local para los scores
  const [team1Sets, setTeam1Sets] = React.useState<(number | null)[]>([
    match.team1Sets?.[0] ?? null,
    match.team1Sets?.[1] ?? null,
    match.team1Sets?.[2] ?? null
  ])
  const [team2Sets, setTeam2Sets] = React.useState<(number | null)[]>([
    match.team2Sets?.[0] ?? null,
    match.team2Sets?.[1] ?? null,
    match.team2Sets?.[2] ?? null
  ])

  // Notificar cambios al padre
  const notifyChange = (newTeam1Sets: (number | null)[], newTeam2Sets: (number | null)[]) => {
    onScoreChange({
      team1Sets: newTeam1Sets,
      team2Sets: newTeam2Sets
    })
  }

  // Actualizar set del equipo 1
  const handleTeam1SetChange = (setIndex: number, value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10)
    const newSets = [...team1Sets]
    newSets[setIndex] = numValue
    setTeam1Sets(newSets)
    notifyChange(newSets, team2Sets)
  }

  // Actualizar set del equipo 2
  const handleTeam2SetChange = (setIndex: number, value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10)
    const newSets = [...team2Sets]
    newSets[setIndex] = numValue
    setTeam2Sets(newSets)
    notifyChange(team1Sets, newSets)
  }

  // Helper para obtener el valor de un set
  const getSetValue = (sets: (number | null)[], setIndex: number): string => {
    const value = sets[setIndex]
    if (value === null || value === undefined) return ''
    return String(value)
  }

  // Determinar el ganador (el API guarda 'TEAM1' o 'TEAM2')
  const isTeam1Winner = match.winner === 'TEAM1' || match.winner === match.team1Name
  const isTeam2Winner = match.winner === 'TEAM2' || match.winner === match.team2Name

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
        {/* Header con información del partido */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: `1px solid ${colors.border.light}`
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: colors.text.secondary, fontWeight: 500 }}>
              {match.round}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: colors.text.secondary }}>
              Cancha {match.courtNumber || '?'}
            </span>
          </div>
        </div>

        {/* Tabla de resultados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Equipo 1 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 80px 80px 80px',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: isTeam1Winner ? 700 : 600,
                  color: isTeam1Winner ? colors.accent[700] : colors.text.primary
                }}
              >
                {match.team1Name}
              </p>
              {isTeam1Winner && (
                <Trophy size={16} style={{ color: colors.accent[600], flexShrink: 0 }} />
              )}
            </div>

            <input
              type="number"
              placeholder="Set 1"
              value={getSetValue(team1Sets, 0)}
              onChange={(e) => handleTeam1SetChange(0, e.target.value)}
              min="0"
              max="7"
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
              type="number"
              placeholder="Set 2"
              value={getSetValue(team1Sets, 1)}
              onChange={(e) => handleTeam1SetChange(1, e.target.value)}
              min="0"
              max="7"
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
              type="number"
              placeholder="Set 3"
              value={getSetValue(team1Sets, 2)}
              onChange={(e) => handleTeam1SetChange(2, e.target.value)}
              min="0"
              max="7"
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: `1px solid ${colors.border.default}`,
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500
              }}
            />
          </div>

          {/* Equipo 2 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 80px 80px 80px',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: isTeam2Winner ? 700 : 600,
                  color: isTeam2Winner ? colors.accent[700] : colors.text.primary
                }}
              >
                {match.team2Name}
              </p>
              {isTeam2Winner && (
                <Trophy size={16} style={{ color: colors.accent[600], flexShrink: 0 }} />
              )}
            </div>

            <input
              type="number"
              placeholder="Set 1"
              value={getSetValue(team2Sets, 0)}
              onChange={(e) => handleTeam2SetChange(0, e.target.value)}
              min="0"
              max="7"
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
              type="number"
              placeholder="Set 2"
              value={getSetValue(team2Sets, 1)}
              onChange={(e) => handleTeam2SetChange(1, e.target.value)}
              min="0"
              max="7"
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
              type="number"
              placeholder="Set 3"
              value={getSetValue(team2Sets, 2)}
              onChange={(e) => handleTeam2SetChange(2, e.target.value)}
              min="0"
              max="7"
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: `1px solid ${colors.border.default}`,
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          minWidth: '120px'
        }}
      >
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            background:
              match.status === 'completed'
                ? `linear-gradient(135deg, ${colors.accent[600]}20, ${colors.accent[300]}20)`
                : colors.neutral[100],
            border: `1px solid ${match.status === 'completed' ? colors.accent[600] + '40' : colors.border.light}`,
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
    </div>
  )
}
