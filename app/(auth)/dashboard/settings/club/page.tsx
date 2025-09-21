'use client'

import React from 'react'
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { ClubInformationSection } from '@/components/settings/sections/ClubInformationSection'

export default function ClubSettingsPage() {
  return (
    <CleanDashboardLayout>
      <ClubInformationSection />
    </CleanDashboardLayout>
  )
}