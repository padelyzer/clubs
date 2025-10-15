/**
 * TeamsList Component
 * Extracted from page.tsx (lines 3019-3384)
 * Grid/list of team cards with filtering and empty states
 */

import React from 'react'
import { TeamCard } from './TeamCard'
import { EmptyTeamsState } from './EmptyTeamsState'
import { LoadingTeamsState } from './LoadingTeamsState'
import type { Registration } from '../types/tournament'

type TeamsListProps = {
  registrations: Registration[]
  searchTerm: string
  loadingRegistrations: boolean
  onEditTeam: (reg: Registration) => void
  onDeleteTeam?: (id: string) => void
  colors: any
}

export function TeamsList({
  registrations,
  searchTerm,
  loadingRegistrations,
  onEditTeam,
  onDeleteTeam,
  colors
}: TeamsListProps) {
  // Loading state
  if (loadingRegistrations) {
    return <LoadingTeamsState colors={colors} />
  }

  // Empty state - no teams at all
  if (registrations.length === 0) {
    return <EmptyTeamsState type="no-teams" colors={colors} />
  }

  // Filter teams based on search term
  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.player1Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.player2Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Empty state - no search results
  if (filteredRegistrations.length === 0) {
    return <EmptyTeamsState type="no-results" colors={colors} />
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '16px'
      }}
    >
      {filteredRegistrations.map((reg, idx) => (
        <TeamCard
          key={reg.id}
          registration={reg}
          index={idx}
          onEdit={onEditTeam}
          onDelete={onDeleteTeam}
        />
      ))}
    </div>
  )
}
