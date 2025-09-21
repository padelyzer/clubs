'use client'

import React from 'react'
import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
import { TournamentCreationWizard } from '@/components/tournaments/TournamentCreationWizard'

export default function CreateTournamentPage() {
  return (
    <DashboardWithNotifications>
      <TournamentCreationWizard />
    </DashboardWithNotifications>
  )
}