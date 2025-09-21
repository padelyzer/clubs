import { validateRequest } from '@/lib/auth/lucia'
import { getEnabledModulesForClub } from '@/lib/saas/get-enabled-modules'
import { getUserPermissions } from '@/lib/auth/get-user-permissions'
import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ clubSlug: string }>
}) {
  // Await the params in Next.js 15
  const { clubSlug } = await params
  const { user, session } = await validateRequest()

  if (!user || !session) {
    redirect('/login')
  }

  // Obtener los permisos del usuario
  let enabledModuleCodes = await getUserPermissions(user.id)

  // Si no tiene permisos específicos y es CLUB_OWNER, obtener todos los módulos del club
  if (enabledModuleCodes.length === 0 && user.role === 'CLUB_OWNER' && user.clubId) {
    const modules = await getEnabledModulesForClub(user.clubId)
    enabledModuleCodes = modules
      .filter(m => m.isIncluded)
      .map(m => m.code)
  }
  
  return (
    <NotificationProvider>
      <CleanDashboardLayout 
        clubName={user?.name || 'Club'}
        userName={user?.name || 'Usuario'}
        userRole={user?.role || 'Usuario'}
        enabledModules={enabledModuleCodes}
      >
        {children}
      </CleanDashboardLayout>
    </NotificationProvider>
  )
}