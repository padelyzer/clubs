/**
 * CaptureView Component
 * Extracted from page.tsx (lines 2473-2809)
 * Mass result capture interface
 */

import React from 'react'
import { Camera, CheckCircle } from 'lucide-react'
import {
  CardModern,
  CardModernHeader,
  CardModernTitle,
  CardModernDescription,
  CardModernContent
} from '@/components/design-system/CardModern'
import { CaptureFilters } from './CaptureFilters'
import { CaptureMatchCard } from './CaptureMatchCard'
import type { TournamentData, Match } from '../types/tournament'

type CaptureViewProps = {
  tournamentData: TournamentData
  colors: any
  captureCategoryFilter: string
  setCaptureCategoryFilter: (value: string) => void
  captureStatusFilter: 'pending' | 'all' | 'completed'
  setCaptureStatusFilter: (value: 'pending' | 'all' | 'completed') => void
  selectedMatches: Set<string>
  setSelectedMatches: (value: Set<string>) => void
}

export function CaptureView({
  tournamentData,
  colors,
  captureCategoryFilter,
  setCaptureCategoryFilter,
  captureStatusFilter,
  setCaptureStatusFilter,
  selectedMatches,
  setSelectedMatches
}: CaptureViewProps) {
  const handleToggleSelectAll = () => {
    const allMatches = [...tournamentData.matches.upcoming, ...tournamentData.matches.inProgress]
    const filteredMatches = filterMatches(allMatches)

    const allSelected = filteredMatches.every((m) => selectedMatches.has(m.id))
    if (allSelected) {
      setSelectedMatches(new Set())
    } else {
      setSelectedMatches(new Set(filteredMatches.map((m) => m.id)))
    }
  }

  const filterMatches = (matches: Match[]) => {
    return matches.filter((m) => {
      // Category filter
      if (captureCategoryFilter !== 'all') {
        const matchCategory = m.round?.split('-')[0] || ''
        const matchModality = m.round?.includes('FEM') ? 'F' : 'M'
        const categoryKey = `${matchCategory}-${matchModality}`
        if (categoryKey !== captureCategoryFilter) return false
      }

      // Status filter
      if (captureStatusFilter === 'pending' && m.status !== 'pending') {
        return false
      } else if (captureStatusFilter === 'completed' && m.status !== 'completed') {
        return false
      }

      return true
    })
  }

  const allMatches = [...tournamentData.matches.upcoming, ...tournamentData.matches.inProgress]
  const filteredMatches = filterMatches(allMatches)

  return (
    <div style={{ marginTop: '24px' }}>
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
                <Camera size={20} style={{ color: colors.primary[600] }} />
              </div>
              <div>
                <CardModernTitle>Captura Masiva de Resultados</CardModernTitle>
                <CardModernDescription>
                  Registra múltiples resultados de forma rápida y eficiente
                </CardModernDescription>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleToggleSelectAll}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border.default}`,
                  background: 'white',
                  color: colors.text.secondary,
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle size={16} />
                {selectedMatches.size > 0 ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: `linear-gradient(135deg, ${colors.accent[600]}, ${colors.accent[300]})`,
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
                <Camera size={16} />
                Guardar seleccionados
              </button>
            </div>
          </div>
        </CardModernHeader>

        <CardModernContent>
          <CaptureFilters
            captureCategoryFilter={captureCategoryFilter}
            setCaptureCategoryFilter={setCaptureCategoryFilter}
            captureStatusFilter={captureStatusFilter}
            setCaptureStatusFilter={setCaptureStatusFilter}
            selectedMatchesCount={selectedMatches.size}
            categories={tournamentData.categories}
            colors={colors}
          />

          {/* Lista de partidos */}
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
                No hay partidos que coincidan con los filtros seleccionados
              </div>
            ) : (
              filteredMatches.slice(0, 10).map((match) => (
                <CaptureMatchCard
                  key={match.id}
                  match={match}
                  isSelected={selectedMatches.has(match.id)}
                  onToggleSelect={(checked) => {
                    const newSelected = new Set(selectedMatches)
                    if (checked) {
                      newSelected.add(match.id)
                    } else {
                      newSelected.delete(match.id)
                    }
                    setSelectedMatches(newSelected)
                  }}
                  colors={colors}
                />
              ))
            )}
          </div>
        </CardModernContent>
      </CardModern>
    </div>
  )
}
