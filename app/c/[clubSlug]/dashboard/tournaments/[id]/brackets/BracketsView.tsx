/**
 * BracketsView Component
 * Vista de brackets del torneo
 * Muestra la visualización de llaves y permite generar brackets
 */

import React, { useState } from 'react'
import { Trophy, Play, AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
import {
  CardModern,
  CardModernHeader,
  CardModernTitle,
  CardModernDescription,
  CardModernContent
} from '@/components/design-system/CardModern'
import { BracketVisualization } from '@/components/tournaments/BracketVisualization'
import type { TournamentData } from '../types/tournament'
import toast from 'react-hot-toast'

type BracketsViewProps = {
  tournamentData: TournamentData
  colors: any
  onRefresh: () => Promise<void>
}

export function BracketsView({ tournamentData, colors, onRefresh }: BracketsViewProps) {
  const [generating, setGenerating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const allMatches = [
    ...tournamentData.matches.upcoming,
    ...tournamentData.matches.inProgress,
    ...tournamentData.matches.completed
  ]

  const hasBrackets = allMatches.length > 0
  const hasCompletedMatches = tournamentData.matches.completed.length > 0

  // Agrupar matches por categoría
  const matchesByCategory = allMatches.reduce((acc, match) => {
    const categoryKey = match.round.includes('Final') || match.round.includes('Ronda')
      ? 'General' // Si no tiene categoría explícita, usar General
      : match.round

    if (!acc[categoryKey]) {
      acc[categoryKey] = []
    }
    acc[categoryKey].push(match)
    return acc
  }, {} as Record<string, typeof allMatches>)

  const categories = Object.keys(matchesByCategory)
  const filteredMatches = selectedCategory === 'all'
    ? allMatches
    : matchesByCategory[selectedCategory] || []

  const handleGenerateBrackets = async () => {
    try {
      setGenerating(true)

      const response = await fetch(`/api/tournaments/${tournamentData.tournament.id}/generate-brackets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seedingMethod: 'random',
          bracketType: 'single_elimination'
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al generar brackets')
      }

      toast.success(data.message, {
        duration: 4000,
        icon: '🏆'
      })

      if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach((warning: string) => {
          toast.error(warning, { duration: 5000 })
        })
      }

      // Refrescar datos
      await onRefresh()

    } catch (error) {
      console.error('Error generating brackets:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al generar brackets',
        { duration: 5000 }
      )
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteBrackets = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar todos los brackets? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      setDeleting(true)

      const response = await fetch(`/api/tournaments/${tournamentData.tournament.id}/generate-brackets`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al eliminar brackets')
      }

      toast.success(data.message, {
        duration: 4000,
        icon: '🗑️'
      })

      // Refrescar datos
      await onRefresh()

    } catch (error) {
      console.error('Error deleting brackets:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al eliminar brackets',
        { duration: 5000 }
      )
    } finally {
      setDeleting(false)
    }
  }

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
                <Trophy size={20} style={{ color: colors.primary[600] }} />
              </div>
              <div>
                <CardModernTitle>Brackets del Torneo</CardModernTitle>
                <CardModernDescription>
                  {hasBrackets
                    ? `${allMatches.length} partidos generados`
                    : 'Genera las llaves del torneo'}
                </CardModernDescription>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {hasBrackets && !hasCompletedMatches && (
                <button
                  onClick={handleDeleteBrackets}
                  disabled={deleting}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border.default}`,
                    background: 'white',
                    color: colors.text.secondary,
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: deleting ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!deleting) {
                      e.currentTarget.style.background = colors.neutral[50]
                      e.currentTarget.style.borderColor = colors.border.default
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!deleting) {
                      e.currentTarget.style.background = 'white'
                    }
                  }}
                >
                  {deleting ? (
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {deleting ? 'Eliminando...' : 'Eliminar Brackets'}
                </button>
              )}

              {!hasBrackets && (
                <button
                  onClick={handleGenerateBrackets}
                  disabled={generating}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]})`,
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: generating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: generating ? 0.6 : 1,
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!generating) {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!generating) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  {generating ? (
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Play size={16} />
                  )}
                  {generating ? 'Generando...' : 'Generar Brackets'}
                </button>
              )}
            </div>
          </div>
        </CardModernHeader>

        <CardModernContent>
          {!hasBrackets ? (
            <div
              style={{
                padding: '64px 32px',
                textAlign: 'center',
                borderRadius: '12px',
                background: 'white',
                border: `1px solid ${colors.border.light}`
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.primary[600]}15, ${colors.accent[300]}15)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Trophy size={32} style={{ color: colors.primary[600] }} />
              </div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  marginBottom: '8px'
                }}
              >
                No hay brackets generados
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: colors.text.secondary,
                  marginBottom: '24px',
                  maxWidth: '400px',
                  margin: '0 auto 24px'
                }}
              >
                Genera las llaves del torneo basándote en los equipos inscritos.
                El sistema creará automáticamente la estructura de eliminación.
              </p>

              <div
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: colors.warning[50],
                  border: `1px solid ${colors.warning[400]}30`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  maxWidth: '500px',
                  margin: '0 auto',
                  textAlign: 'left'
                }}
              >
                <AlertCircle size={20} style={{ color: colors.warning[600], flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontSize: '13px', color: colors.warning[700], fontWeight: 500, marginBottom: '4px' }}>
                    Antes de generar brackets:
                  </p>
                  <ul style={{ fontSize: '13px', color: colors.warning[700], paddingLeft: '20px', margin: 0 }}>
                    <li>Verifica que todos los equipos estén inscritos</li>
                    <li>Confirma que los pagos estén completos</li>
                    <li>Una vez generados, solo podrás eliminarlos si no hay partidos jugados</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Filtro por categoría */}
              {categories.length > 1 && (
                <div style={{ marginBottom: '24px' }}>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
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
                    <option value="all">Todas las categorías</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat} ({matchesByCategory[cat].length} partidos)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Visualización de Brackets */}
              <div style={{ marginTop: '24px' }}>
                <BracketVisualization
                  matches={filteredMatches.map(m => ({
                    id: m.id,
                    round: m.round,
                    matchNumber: 1,
                    player1Name: m.team1Name,
                    player2Name: m.team2Name,
                    player1Score: m.team1Score,
                    player2Score: m.team2Score,
                    winner: m.winner || undefined,
                    status: m.status === 'completed' ? 'COMPLETED' : m.status === 'in_progress' ? 'IN_PROGRESS' : 'SCHEDULED',
                    scheduledAt: m.scheduledAt || undefined
                  }))}
                  tournamentType="ELIMINATION"
                  onMatchClick={(match) => {
                    console.log('Match clicked:', match)
                    // TODO: Abrir modal para ver detalles del partido
                  }}
                />
              </div>
            </>
          )}
        </CardModernContent>
      </CardModern>
    </div>
  )
}
