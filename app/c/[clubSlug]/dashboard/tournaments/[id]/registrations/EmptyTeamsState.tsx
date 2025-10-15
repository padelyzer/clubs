/**
 * EmptyTeamsState Component
 * Extracted from page.tsx (lines 3040-3067 and 3077-3104)
 * Empty states for no teams or no search results
 */

import React from 'react'
import { Users, Search } from 'lucide-react'

type EmptyTeamsStateProps = {
  type: 'no-teams' | 'no-results'
  colors: any
}

export function EmptyTeamsState({ type, colors }: EmptyTeamsStateProps) {
  if (type === 'no-teams') {
    return (
      <div
        style={{
          padding: '48px',
          textAlign: 'center',
          color: colors.text.tertiary,
          borderRadius: '12px',
          background: 'white',
          border: `1px solid ${colors.border.light}`
        }}
      >
        <Users
          size={48}
          style={{
            color: colors.neutral[400],
            margin: '0 auto 16px'
          }}
        />
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: colors.text.primary,
            marginBottom: '8px'
          }}
        >
          No hay equipos inscritos
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: colors.text.secondary
          }}
        >
          Agrega el primer equipo para comenzar
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '48px',
        textAlign: 'center',
        color: colors.text.tertiary,
        borderRadius: '12px',
        background: colors.neutral[50],
        border: `1px solid ${colors.border.light}`
      }}
    >
      <Search
        size={48}
        style={{
          color: colors.neutral[400],
          margin: '0 auto 16px'
        }}
      />
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: colors.text.primary,
          marginBottom: '8px'
        }}
      >
        No se encontraron resultados
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: colors.text.secondary
        }}
      >
        Prueba con un término de búsqueda diferente
      </p>
    </div>
  )
}
