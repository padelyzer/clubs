/**
 * OverviewView Component
 * Extracted from page.tsx (lines 1806-2445 approx)
 * Main overview/dashboard view for tournament
 */

import React from 'react'
import { TournamentStatusCard } from './TournamentStatusCard'
import type { TournamentData } from '../types/tournament'

type OverviewViewProps = {
  tournamentData: TournamentData
  colors: any
}

export function OverviewView({ tournamentData, colors }: OverviewViewProps) {
  return (
    <>
      <TournamentStatusCard
        tournamentStatus={tournamentData.tournament.status as 'active' | 'pending' | 'completed'}
        stats={tournamentData.stats}
        colors={colors}
      />

      {/* TODO: Add CategoriesGrid component here */}
      {/* Categories grid and other overview sections can be added in future iterations */}
    </>
  )
}
