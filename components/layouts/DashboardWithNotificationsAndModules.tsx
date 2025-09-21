import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { getEnabledModulesForClub } from '@/lib/saas/get-enabled-modules'
import { DashboardWithNotifications } from './DashboardWithNotifications'

interface DashboardWithNotificationsAndModulesProps {
  children: React.ReactNode
  clubName?: string
  userName?: string
  userRole?: string
}

export async function DashboardWithNotificationsAndModules({
  children,
  clubName,
  userName,
  userRole
}: DashboardWithNotificationsAndModulesProps) {
  const session = await getServerSession(authOptions)
  
  // Obtener el clubId del usuario en sesión
  const clubId = session?.user?.clubId
  
  // Si no hay clubId, devolver el layout con módulos por defecto
  if (!clubId) {
    return (
      <DashboardWithNotifications
        clubName={clubName}
        userName={userName}
        userRole={userRole}
        enabledModules={['bookings', 'customers', 'finance']}
      >
        {children}
      </DashboardWithNotifications>
    )
  }
  
  // Obtener los módulos habilitados para el club
  const modules = await getEnabledModulesForClub(clubId)
  const enabledModuleCodes = modules
    .filter(m => m.isIncluded)
    .map(m => m.code)
  
  return (
    <DashboardWithNotifications
      clubName={clubName}
      userName={userName}
      userRole={userRole}
      enabledModules={enabledModuleCodes}
    >
      {children}
    </DashboardWithNotifications>
  )
}