/**
 * CaptureFilters Component
 * Extracted from page.tsx (lines 2563-2622)
 * Filter controls for capture view
 */

import React from 'react'
import type { Category } from '../types/tournament'

type CaptureFiltersProps = {
  captureCategoryFilter: string
  setCaptureCategoryFilter: (value: string) => void
  captureStatusFilter: 'pending' | 'all' | 'completed'
  setCaptureStatusFilter: (value: 'pending' | 'all' | 'completed') => void
  selectedMatchesCount: number
  categories: Category[]
  colors: any
}

export function CaptureFilters({
  captureCategoryFilter,
  setCaptureCategoryFilter,
  captureStatusFilter,
  setCaptureStatusFilter,
  selectedMatchesCount,
  categories,
  colors
}: CaptureFiltersProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '12px',
        border: `1px solid ${colors.border.light}`
      }}
    >
      <select
        value={captureCategoryFilter}
        onChange={(e) => setCaptureCategoryFilter(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: '8px',
          border: `1px solid ${colors.border.default}`,
          background: 'white',
          fontSize: '13px',
          color: colors.text.primary,
          cursor: 'pointer'
        }}
      >
        <option value="all">Todas las categorías</option>
        {categories.map((cat) => (
          <option key={`${cat.code}-${cat.modality}`} value={`${cat.code}-${cat.modality}`}>
            {cat.name} {cat.modality === 'masculine' ? 'Masculino' : cat.modality === 'feminine' ? 'Femenino' : 'Mixto'}
          </option>
        ))}
      </select>
      <select
        value={captureStatusFilter}
        onChange={(e) => setCaptureStatusFilter(e.target.value as 'pending' | 'all' | 'completed')}
        style={{
          padding: '8px 12px',
          borderRadius: '8px',
          border: `1px solid ${colors.border.default}`,
          background: 'white',
          fontSize: '13px',
          color: colors.text.primary,
          cursor: 'pointer'
        }}
      >
        <option value="pending">Solo pendientes</option>
        <option value="all">Todos los partidos</option>
        <option value="completed">Completados</option>
      </select>
      <span
        style={{
          marginLeft: 'auto',
          padding: '8px 12px',
          borderRadius: '8px',
          background: `linear-gradient(135deg, ${colors.primary[600]}10, ${colors.accent[300]}10)`,
          border: `1px solid ${colors.primary[600]}30`,
          fontSize: '13px',
          color: colors.primary[700],
          fontWeight: 500
        }}
      >
        {selectedMatchesCount} seleccionados
      </span>
    </div>
  )
}
