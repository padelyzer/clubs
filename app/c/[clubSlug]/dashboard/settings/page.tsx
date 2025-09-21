'use client'

import React, { Suspense } from 'react'
import { ClubInformationSection } from '@/components/settings/sections/ClubInformationSection'

function SettingsPageContent() {
  return (
    <ClubInformationSection />
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SettingsPageContent />
    </Suspense>
  )
}