/**
 * ScheduleView Component
 * Vista de programación del torneo
 * Muestra partidos organizados por fecha y cancha
 */

import React, { useState } from 'react'
import { Calendar, Clock, MapPin, List, LayoutGrid } from 'lucide-react'
import {
  CardModern,
  CardModernHeader,
  CardModernTitle,
  CardModernDescription,
  CardModernContent
} from '@/components/design-system/CardModern'
import type { TournamentData } from '../types/tournament'
import { CourtQRPanel } from './CourtQRPanel'

type ScheduleViewProps = {
  tournamentData: TournamentData
  colors: any
}

type ViewMode = 'list' | 'grid'

export function ScheduleView({ tournamentData, colors }: ScheduleViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Obtener todas las fechas únicas de los partidos
  const allMatches = [
    ...tournamentData.matches.upcoming,
    ...tournamentData.matches.inProgress,
    ...tournamentData.matches.completed
  ]

  // Agrupar partidos por fecha
  const matchesByDate = allMatches.reduce((acc, match) => {
    const date = match.scheduledAt ? new Date(match.scheduledAt).toDateString() : 'Sin fecha'
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(match)
    return acc
  }, {} as Record<string, typeof allMatches>)

  const dates = Object.keys(matchesByDate).sort()

  // Filtrar partidos por fecha seleccionada
  const filteredMatches = selectedDate === 'all'
    ? allMatches
    : matchesByDate[selectedDate] || []

  // Agrupar partidos por cancha para vista de cuadrícula
  const matchesByCourt = filteredMatches.reduce((acc, match) => {
    const courtKey = match.courtNumber?.toString() || 'Sin asignar'
    if (!acc[courtKey]) {
      acc[courtKey] = []
    }
    acc[courtKey].push(match)
    return acc
  }, {} as Record<string, typeof allMatches>)

  const courts = Object.keys(matchesByCourt).sort((a, b) => {
    if (a === 'Sin asignar') return 1
    if (b === 'Sin asignar') return -1
    return parseInt(a) - parseInt(b)
  })

  return (
    <div style={{ marginTop: '24px' }}>
      {/* QR Codes Panel */}
      <CourtQRPanel tournamentId={tournamentData.id} colors={colors} />

      <CardModern variant="glass" padding="lg">
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
                <Calendar size={20} style={{ color: colors.primary[600] }} />
              </div>
              <div>
                <CardModernTitle>Programación de Partidos</CardModernTitle>
                <CardModernDescription>
                  {filteredMatches.length} partidos programados
                </CardModernDescription>
              </div>
            </div>

            {/* View mode toggle */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                background: colors.neutral[100],
                padding: '4px',
                borderRadius: '8px'
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'grid' ? 'white' : 'transparent',
                  color: viewMode === 'grid' ? colors.primary[600] : colors.text.secondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <LayoutGrid size={16} />
                Cuadrícula
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'list' ? 'white' : 'transparent',
                  color: viewMode === 'list' ? colors.primary[600] : colors.text.secondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <List size={16} />
                Lista
              </button>
            </div>
          </div>
        </CardModernHeader>

        <CardModernContent>
          {/* Filtro por fecha */}
          <div style={{ marginBottom: '24px' }}>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${colors.border.default}`,
                background: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                minWidth: '200px'
              }}
            >
              <option value="all">Todas las fechas</option>
              {dates.map(date => (
                <option key={date} value={date}>
                  {date === 'Sin fecha' ? date : new Date(date).toLocaleDateString('es-MX', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Grid View - Por Cancha */}
          {viewMode === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(courts.length, 3)}, 1fr)`, gap: '16px' }}>
              {filteredMatches.length === 0 ? (
                <div
                  style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: colors.text.tertiary,
                    borderRadius: '12px',
                    background: 'white',
                    border: `1px solid ${colors.border.light}`,
                    gridColumn: '1 / -1'
                  }}
                >
                  No hay partidos programados
                </div>
              ) : (
                courts.map((court) => (
                  <div key={court}>
                    {/* Court Header */}
                    <div
                      style={{
                        padding: '12px',
                        background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]})`,
                        borderRadius: '12px 12px 0 0',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'center'
                      }}
                    >
                      <MapPin size={16} />
                      Cancha {court}
                    </div>

                    {/* Matches for this court */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '12px',
                        background: 'white',
                        borderRadius: '0 0 12px 12px',
                        border: `1px solid ${colors.border.light}`,
                        borderTop: 'none',
                        minHeight: '200px'
                      }}
                    >
                      {matchesByCourt[court].length === 0 ? (
                        <div
                          style={{
                            padding: '24px',
                            textAlign: 'center',
                            color: colors.text.tertiary,
                            fontSize: '13px'
                          }}
                        >
                          Sin partidos
                        </div>
                      ) : (
                        matchesByCourt[court]
                          .sort((a, b) => {
                            if (!a.scheduledAt) return 1
                            if (!b.scheduledAt) return -1
                            return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
                          })
                          .map((match) => (
                            <div
                              key={match.id}
                              style={{
                                padding: '12px',
                                borderRadius: '8px',
                                background:
                                  match.status === 'completed'
                                    ? `${colors.accent[600]}10`
                                    : match.status === 'in_progress'
                                    ? `${colors.warning[600]}10`
                                    : colors.neutral[50],
                                border: `1px solid ${
                                  match.status === 'completed'
                                    ? colors.accent[600] + '30'
                                    : match.status === 'in_progress'
                                    ? colors.warning[600] + '30'
                                    : colors.border.light
                                }`,
                                transition: 'all 0.2s'
                              }}
                            >
                              {/* Time */}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  marginBottom: '8px',
                                  fontSize: '12px',
                                  color: colors.text.secondary,
                                  fontWeight: 500
                                }}
                              >
                                <Clock size={12} />
                                {match.scheduledAt
                                  ? new Date(match.scheduledAt).toLocaleTimeString('es-MX', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'Sin horario'}
                              </div>

                              {/* Round */}
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: colors.text.tertiary,
                                  marginBottom: '6px',
                                  fontWeight: 500
                                }}
                              >
                                {match.round}
                              </div>

                              {/* Teams */}
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: colors.text.primary,
                                  marginBottom: '6px',
                                  lineHeight: '1.4'
                                }}
                              >
                                {match.team1Name}
                                <br />
                                <span style={{ color: colors.text.tertiary, fontWeight: 400 }}>vs</span>
                                <br />
                                {match.team2Name}
                              </div>

                              {/* Status */}
                              <div
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  textAlign: 'center',
                                  background:
                                    match.status === 'completed'
                                      ? `${colors.accent[600]}20`
                                      : match.status === 'in_progress'
                                      ? `${colors.warning[600]}20`
                                      : `${colors.neutral[200]}`,
                                  color:
                                    match.status === 'completed'
                                      ? colors.accent[700]
                                      : match.status === 'in_progress'
                                      ? colors.warning[600]
                                      : colors.text.secondary
                                }}
                              >
                                {match.status === 'completed'
                                  ? '✓ Completado'
                                  : match.status === 'in_progress'
                                  ? '▶ En progreso'
                                  : '○ Pendiente'}
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* List View - Original */}
          {viewMode === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredMatches.length === 0 ? (
                <div
                  style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: colors.text.tertiary,
                    borderRadius: '12px',
                    background: 'white',
                    border: `1px solid ${colors.border.light}`
                  }}
                >
                  No hay partidos programados
                </div>
              ) : (
                filteredMatches.map((match) => (
                  <div
                    key={match.id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'white',
                      border: `1px solid ${colors.border.light}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    {/* Información del partido */}
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '8px' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            color: colors.text.secondary,
                            fontWeight: 500
                          }}
                        >
                          {match.round}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: colors.text.primary,
                          marginBottom: '4px'
                        }}
                      >
                        {match.team1Name} vs {match.team2Name}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '16px',
                          fontSize: '13px',
                          color: colors.text.secondary
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} />
                          {match.scheduledAt ? new Date(match.scheduledAt).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Sin horario'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} />
                          Cancha {match.courtNumber || '?'}
                        </div>
                      </div>
                    </div>

                    {/* Estado del partido */}
                    <div>
                      <div
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 500,
                          background:
                            match.status === 'completed'
                              ? `${colors.accent[600]}20`
                              : match.status === 'in_progress'
                              ? `${colors.warning[600]}20`
                              : `${colors.neutral[200]}`,
                          color:
                            match.status === 'completed'
                              ? colors.accent[700]
                              : match.status === 'in_progress'
                              ? colors.warning[700]
                              : colors.text.secondary
                        }}
                      >
                        {match.status === 'completed'
                          ? '✓ Completado'
                          : match.status === 'in_progress'
                          ? '▶ En progreso'
                          : '○ Pendiente'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardModernContent>
      </CardModern>
    </div>
  )
}
