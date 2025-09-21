'use client'

import React, { Suspense } from 'react'
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { ClubInformationSection } from '@/components/settings/sections/ClubInformationSection'

function SettingsPageContent() {
  return (
    <CleanDashboardLayout>
      <ClubInformationSection />
    </CleanDashboardLayout>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SettingsPageContent />
    </Suspense>
  )
}