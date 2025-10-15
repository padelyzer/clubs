/**
 * RegistrationsView Component
 * Extracted from page.tsx (lines 2812-3384)
 * Main registrations/teams management view
 */

import React from 'react'
import { RegistrationsHeader } from './RegistrationsHeader'
import { TeamsList } from './TeamsList'
import type { Registration } from '../types/tournament'

type RegistrationsViewProps = {
  registrations: Registration[]
  searchTerm: string
  setSearchTerm: (value: string) => void
  loadingRegistrations: boolean
  onRefresh: () => void
  onAddTeam: () => void
  onEditTeam: (reg: Registration) => void
  onDeleteTeam?: (id: string) => void
  colors: any
}

export function RegistrationsView({
  registrations,
  searchTerm,
  setSearchTerm,
  loadingRegistrations,
  onRefresh,
  onAddTeam,
  onEditTeam,
  onDeleteTeam,
  colors
}: RegistrationsViewProps) {
  return (
    <div style={{ marginTop: '24px' }}>
      <RegistrationsHeader
        registrations={registrations}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        loadingRegistrations={loadingRegistrations}
        onRefresh={onRefresh}
        onAddTeam={onAddTeam}
      />

      {/* Contenido con fondo blanco */}
      <div
        style={{
          background: 'white',
          borderRadius: '0 0 16px 16px',
          padding: '24px'
        }}
      >
        <TeamsList
          registrations={registrations}
          searchTerm={searchTerm}
          loadingRegistrations={loadingRegistrations}
          onEditTeam={onEditTeam}
          onDeleteTeam={onDeleteTeam}
          colors={colors}
        />
      </div>
    </div>
  )
}
