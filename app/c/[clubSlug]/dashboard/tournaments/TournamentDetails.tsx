'use client'

import React from 'react'
import { TournamentManagement } from './TournamentManagement'

interface TournamentDetailsProps {
  tournamentId: string
}

export function TournamentDetails({ tournamentId }: TournamentDetailsProps) {
  return <TournamentManagement tournamentId={tournamentId} />
}