import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { getEnabledModulesForClub } from '@/lib/saas/get-enabled-modules'
import { ModernDashboardLayout } from './ModernDashboardLayout'

interface ModernDashboardLayoutWithModulesProps {
  children: React.ReactNode
  clubName?: string
  userName?: string
  userRole?: string
}

export async function ModernDashboardLayoutWithModules({
  children,
  clubName,
  userName,
  userRole
}: ModernDashboardLayoutWithModulesProps) {
  const session = await getServerSession(authOptions)
  
  // Obtener el clubId del usuario en sesión
  const clubId = session?.user?.clubId
  
  // Si no hay clubId, devolver el layout con módulos por defecto
  if (!clubId) {
    return (
      <ModernDashboardLayout
        clubName={clubName}
        userName={userName}
        userRole={userRole}
        enabledModules={['bookings', 'customers', 'finance']}
      >
        {children}
      </ModernDashboardLayout>
    )
  }
  
  // Obtener los módulos habilitados para el club
  const modules = await getEnabledModulesForClub(clubId)
  const enabledModuleCodes = modules
    .filter(m => m.isIncluded)
    .map(m => m.code)
  
  return (
    <ModernDashboardLayout
      clubName={clubName}
      userName={userName}
      userRole={userRole}
      enabledModules={enabledModuleCodes}
    >
      {children}
    </ModernDashboardLayout>
  )
}