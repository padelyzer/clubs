'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
import { TournamentEditor } from '@/components/tournaments/TournamentEditor'

export default function EditTournamentPage() {
  const params = useParams()
  const tournamentId = params?.id as string

  return (
    <DashboardWithNotifications>
      <TournamentEditor tournamentId={tournamentId} />
    </DashboardWithNotifications>
  )
}