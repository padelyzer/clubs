'use client'

import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
import IncomeModule from '../modules/IncomeModule-Professional'

export default function IncomePage() {
  return (
    <DashboardWithNotifications
      clubName="Club Pádel México"
      userName="Administrador del Club"
      userRole="Administrador"
    >
      <IncomeModule activeTab="income-transactions" />
    </DashboardWithNotifications>
  )
}