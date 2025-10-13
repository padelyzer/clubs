'use client'

import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
import ReportsModule from '../modules/ReportsModule-Professional'

export default function ReportsPage() {
  return (
    <DashboardWithNotifications
      clubName="Club Pádel México"
      userName="Administrador del Club"
      userRole="Administrador"
    >
      <ReportsModule />
    </DashboardWithNotifications>
  )
}