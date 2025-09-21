'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
import { TournamentDetails } from '@/components/tournaments/TournamentDetails'

export default function TournamentDetailPage() {
  const params = useParams()
  const tournamentId = params?.id as string

  return (
    <DashboardWithNotifications>
      <TournamentDetails tournamentId={tournamentId} />
    </DashboardWithNotifications>
  )
}