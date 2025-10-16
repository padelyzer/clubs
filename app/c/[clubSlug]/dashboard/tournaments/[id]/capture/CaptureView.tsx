/**
 * CaptureView Component
 * Extracted from page.tsx (lines 2473-2809)
 * Mass result capture interface
 */

import React, { useState } from 'react'
import { Camera, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
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

type MatchScores = {
  team1Sets: (number | null)[]
  team2Sets: (number | null)[]
}

type CaptureViewProps = {
  tournamentData: TournamentData
  colors: any
  captureCategoryFilter: string
  setCaptureCategoryFilter: (value: string) => void
  captureStatusFilter: 'pending' | 'all' | 'completed'
  setCaptureStatusFilter: (value: 'pending' | 'all' | 'completed') => void
  selectedMatches: Set<string>
  setSelectedMatches: (value: Set<string>) => void
  onRefresh: () => Promise<void>
}

export function CaptureView({
  tournamentData,
  colors,
  captureCategoryFilter,
  setCaptureCategoryFilter,
  captureStatusFilter,
  setCaptureStatusFilter,
  selectedMatches,
  setSelectedMatches,
  onRefresh
}: CaptureViewProps) {
  // State para almacenar los scores capturados
  const [matchScores, setMatchScores] = useState<Record<string, MatchScores>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Todos los partidos disponibles
  const allMatches = [
    ...tournamentData.matches.upcoming,
    ...tournamentData.matches.inProgress,
    ...tournamentData.matches.completed
  ]

  // Actualizar scores de un partido específico
  const handleScoreChange = (matchId: string, scores: MatchScores) => {
    setMatchScores(prev => ({
      ...prev,
      [matchId]: scores
    }))
  }

  // Guardar resultados seleccionados
  const handleSaveResults = async () => {
    if (selectedMatches.size === 0) {
      toast.error('No hay partidos seleccionados')
      return
    }

    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const selectedMatchesArray = Array.from(selectedMatches)
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      // Procesar cada partido seleccionado
      const results: string[] = []

      for (const matchId of selectedMatchesArray) {
        const scores = matchScores[matchId]

        // Buscar el partido para obtener el nombre de los equipos
        const match = allMatches.find(m => m.id === matchId)
        const matchName = match ? `${match.team1Name} vs ${match.team2Name}` : matchId

        if (!scores) {
          errors.push(`${matchName}: No se capturaron resultados`)
          errorCount++
          continue
        }

        // Filtrar valores null y convertir a números
        const team1Sets = scores.team1Sets.filter(s => s !== null) as number[]
        const team2Sets = scores.team2Sets.filter(s => s !== null) as number[]

        // Validar que haya al menos un set capturado
        if (team1Sets.length === 0 || team2Sets.length === 0) {
          errors.push(`${matchName}: Debe capturar al menos un set`)
          errorCount++
          continue
        }

        // Validar que ambos equipos tengan la misma cantidad de sets
        if (team1Sets.length !== team2Sets.length) {
          errors.push(`${matchName}: Ambos equipos deben tener la misma cantidad de sets`)
          errorCount++
          continue
        }

        try {
          const response = await fetch(`/api/match/${matchId}/score`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              player1Score: team1Sets,
              player2Score: team2Sets,
              capturedBy: 'admin'
            })
          })

          const data = await response.json()

          if (data.success) {
            successCount++
            results.push(`✅ ${matchName}: ${data.message}`)
          } else {
            errors.push(`${matchName}: ${data.error}`)
            errorCount++
          }
        } catch (err) {
          errors.push(`${matchName}: Error de conexión`)
          errorCount++
        }
      }

      // Mostrar resultado
      if (successCount > 0) {
        setSaveSuccess(true)

        // Mostrar toasts de éxito
        results.forEach(result => {
          toast.success(result.replace('✅ ', ''), {
            duration: 4000,
            position: 'bottom-right'
          })
        })

        // Mostrar errores si los hay
        if (errorCount > 0) {
          errors.forEach(error => {
            toast.error(error, {
              duration: 5000,
              position: 'bottom-right'
            })
          })
        }

        // Toast resumen
        toast.success(
          `${successCount} resultado${successCount > 1 ? 's guardados' : ' guardado'} exitosamente`,
          {
            duration: 3000,
            position: 'top-center',
            icon: '🎾'
          }
        )

        // Limpiar selección y scores después de guardar
        setSelectedMatches(new Set())
        setMatchScores({})

        // Recargar datos del torneo sin cambiar de vista
        setTimeout(async () => {
          await onRefresh()
        }, 2000)
      } else {
        setSaveError(`No se pudo guardar ningún resultado`)
        errors.forEach(error => {
          toast.error(error, {
            duration: 5000,
            position: 'bottom-right'
          })
        })
        toast.error('No se pudo guardar ningún resultado', {
          duration: 4000,
          position: 'top-center'
        })
      }
    } catch (error) {
      setSaveError('Error inesperado al guardar resultados')
      toast.error('Error inesperado al guardar resultados', {
        duration: 4000,
        position: 'top-center'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleSelectAll = () => {
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
                onClick={handleSaveResults}
                disabled={saving || selectedMatches.size === 0}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: saving || selectedMatches.size === 0
                    ? colors.neutral[300]
                    : `linear-gradient(135deg, ${colors.accent[600]}, ${colors.accent[300]})`,
                  color: 'white',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: saving || selectedMatches.size === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: saving || selectedMatches.size === 0 ? 0.6 : 1
                }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                {saving ? 'Guardando...' : `Guardar seleccionados (${selectedMatches.size})`}
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
              filteredMatches.map((match) => (
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
                  onScoreChange={(scores) => handleScoreChange(match.id, scores)}
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
