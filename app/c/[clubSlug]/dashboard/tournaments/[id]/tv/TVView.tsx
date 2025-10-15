/**
 * TVView Component
 * Extracted from page.tsx (lines 3963-4195)
 * Public TV display mode for showing live matches
 */

import React from 'react'
import { Tv2 } from 'lucide-react'
import {
  CardModern,
  CardModernHeader,
  CardModernTitle,
  CardModernDescription,
  CardModernContent
} from '@/components/design-system/CardModern'
import { LiveMatchCard } from './LiveMatchCard'
import { UpcomingMatchCard } from './UpcomingMatchCard'
import type { TournamentData } from '../types/tournament'

type TVViewProps = {
  tournamentData: TournamentData
  colors: any
}

export function TVView({ tournamentData, colors }: TVViewProps) {
  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    }
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <CardModern variant="glow" padding="lg">
        <CardModernHeader>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${colors.primary[600]}15, ${colors.accent[300]}15)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Tv2 size={20} style={{ color: colors.primary[600] }} />
              </div>
              <div>
                <CardModernTitle>Modo TV - Visualización Pública</CardModernTitle>
                <CardModernDescription>
                  Vista optimizada para pantallas grandes en el club
                </CardModernDescription>
              </div>
            </div>
            <button
              onClick={handleFullscreen}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[300]})`,
                color: 'white',
                border: 'none',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Tv2 size={16} />
              Pantalla completa
            </button>
          </div>
        </CardModernHeader>

        <CardModernContent>
          {/* Partidos en juego */}
          {tournamentData.matches.inProgress.length > 0 && (
            <div
              style={{
                padding: '24px',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${colors.accent[600]}10, ${colors.accent[300]}10)`,
                border: `1px solid ${colors.accent[600]}30`,
                marginBottom: '24px'
              }}
            >
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: colors.accent[600],
                    animation: 'pulse 2s infinite'
                  }}
                />
                EN JUEGO AHORA
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '20px'
                }}
              >
                {tournamentData.matches.inProgress.map((match) => (
                  <LiveMatchCard key={match.id} match={match} colors={colors} />
                ))}
              </div>
            </div>
          )}

          {/* Próximos partidos */}
          <div
            style={{
              padding: '20px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${colors.border.light}`
            }}
          >
            <h4
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '16px'
              }}
            >
              PRÓXIMOS PARTIDOS
            </h4>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '12px'
              }}
            >
              {tournamentData.matches.upcoming.slice(0, 6).map((next) => (
                <UpcomingMatchCard key={next.id} match={next} colors={colors} />
              ))}
            </div>
          </div>
        </CardModernContent>
      </CardModern>
    </div>
  )
}
