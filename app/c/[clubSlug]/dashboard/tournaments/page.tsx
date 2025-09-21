'use client'

import React from 'react'
import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
import { TournamentsList } from './tournaments-list'

export default function TournamentsPage() {
  return (
    <DashboardWithNotifications>
      <TournamentsList />
    </DashboardWithNotifications>
  )
}