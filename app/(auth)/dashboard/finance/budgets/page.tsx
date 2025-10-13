'use client'

import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
import BudgetsModule from '../modules/BudgetsModule-Professional'

export default function BudgetsPage() {
  return (
    <DashboardWithNotifications
      clubName="Club Pádel México"
      userName="Administrador del Club"
      userRole="Administrador"
    >
      <BudgetsModule />
    </DashboardWithNotifications>
  )
}