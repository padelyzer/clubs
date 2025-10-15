/**
 * TournamentStatusCard Component
 * Extracted from page.tsx (lines 1808-2108)
 * Main tournament status card with progress bar and metrics
 */

import React from 'react'
import { Users, Calendar, PlayCircle, Clock } from 'lucide-react'
import { CardModern } from '@/components/design-system/CardModern'
import type { TournamentStats } from '../types/tournament'

type TournamentStatusCardProps = {
  tournamentStatus: 'active' | 'pending' | 'completed'
  stats: TournamentStats
  colors: any
}

export function TournamentStatusCard({
  tournamentStatus,
  stats,
  colors
}: TournamentStatusCardProps) {
  const progressPercentage =
    stats.totalMatches > 0
      ? Math.round((stats.completedMatches / stats.totalMatches) * 100)
      : 0

  const estimatedHours = Math.round((stats.totalMatches - stats.completedMatches) * 1.5)

  return (
    <CardModern
      variant="glass"
      padding="none"
      style={{
        marginBottom: '32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        border: `1px solid ${colors.border.light}`,
        overflow: 'hidden'
      }}
    >
      {/* Header con información básica */}
      <div
        style={{
          padding: '24px 32px',
          borderBottom: `1px solid ${colors.border.light}`,
          background: 'white'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '4px'
              }}
            >
              Estado del Torneo
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: colors.text.secondary
              }}
            >
              {new Date().toLocaleDateString('es-MX', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: colors.neutral[100],
                fontSize: '13px',
                fontWeight: 500,
                color: colors.text.secondary
              }}
            >
              {tournamentStatus === 'active'
                ? '🟢 Activo'
                : tournamentStatus === 'pending'
                ? '🟡 Pendiente'
                : '🔴 Finalizado'}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Progreso Principal */}
      <div
        style={{
          padding: '28px 32px',
          background: 'linear-gradient(180deg, #FAFAFA, #FFFFFF)'
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '16px'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: colors.text.secondary,
                  marginRight: '12px'
                }}
              >
                Progreso General
              </span>
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: colors.primary[700]
                }}
              >
                {progressPercentage}%
              </span>
            </div>
            <div
              style={{
                textAlign: 'right'
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  color: colors.text.secondary,
                  marginBottom: '4px'
                }}
              >
                {stats.completedMatches} de {stats.totalMatches} partidos
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: colors.text.tertiary
                }}
              >
                Tiempo estimado: {estimatedHours} horas
              </p>
            </div>
          </div>

          {/* Barra de progreso mejorada */}
          <div
            style={{
              position: 'relative',
              height: '12px',
              background: colors.neutral[200],
              borderRadius: '100px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${progressPercentage}%`,
                background: `linear-gradient(90deg, ${colors.primary[600]}, ${colors.accent[400]})`,
                borderRadius: '100px',
                transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {/* Efecto de brillo animado */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shimmer 2s infinite'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Métricas con iconos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: `1px solid ${colors.border.light}`,
          background: 'white'
        }}
      >
        <div
          style={{
            padding: '24px',
            borderRight: `1px solid ${colors.border.light}`,
            textAlign: 'center'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.primary[100]}, ${colors.primary[50]})`,
              marginBottom: '12px'
            }}
          >
            <Users size={24} style={{ color: colors.primary[600] }} />
          </div>
          <p
            style={{
              fontSize: '11px',
              color: colors.text.tertiary,
              marginBottom: '4px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Equipos
          </p>
          <p
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: colors.text.primary,
              lineHeight: 1
            }}
          >
            {stats.totalTeams}
          </p>
        </div>

        <div
          style={{
            padding: '24px',
            borderRight: `1px solid ${colors.border.light}`,
            textAlign: 'center'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.accent[100]}, ${colors.accent[50]})`,
              marginBottom: '12px'
            }}
          >
            <Calendar size={24} style={{ color: colors.accent[600] }} />
          </div>
          <p
            style={{
              fontSize: '11px',
              color: colors.text.tertiary,
              marginBottom: '4px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Partidos Hoy
          </p>
          <p
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: colors.text.primary,
              lineHeight: 1
            }}
          >
            {stats.todayMatches}
          </p>
        </div>

        <div
          style={{
            padding: '24px',
            borderRight: `1px solid ${colors.border.light}`,
            textAlign: 'center'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.warning[100]}, ${colors.warning[50]})`,
              marginBottom: '12px'
            }}
          >
            <PlayCircle size={24} style={{ color: colors.warning[600] }} />
          </div>
          <p
            style={{
              fontSize: '11px',
              color: colors.text.tertiary,
              marginBottom: '4px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            En Juego
          </p>
          <p
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: colors.text.primary,
              lineHeight: 1
            }}
          >
            {stats.inProgressMatches}
          </p>
        </div>

        <div
          style={{
            padding: '24px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: colors.neutral[100],
              marginBottom: '12px'
            }}
          >
            <Clock size={24} style={{ color: colors.text.secondary }} />
          </div>
          <p
            style={{
              fontSize: '11px',
              color: colors.text.tertiary,
              marginBottom: '4px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Pendientes
          </p>
          <p
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: colors.text.primary,
              lineHeight: 1
            }}
          >
            {stats.pendingMatches}
          </p>
        </div>
      </div>
    </CardModern>
  )
}
