import { prisma } from '@/lib/config/prisma'
import { getCurrentUser } from '@/lib/auth/actions'

export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        clubId: true,
        permissions: {
          select: {
            moduleCode: true
          }
        }
      }
    })

    if (!user) return []

    // Los CLUB_OWNER y SUPER_ADMIN tienen todos los permisos
    if (user.role === 'CLUB_OWNER' || user.role === 'SUPER_ADMIN') {
      // Obtener todos los módulos habilitados para el club
      if (user.clubId) {
        const { getEnabledModulesForClub } = await import('@/lib/saas/get-enabled-modules')
        const modules = await getEnabledModulesForClub(user.clubId)
        return modules.filter(m => m.isIncluded).map(m => m.code)
      }
      // Si es SUPER_ADMIN sin club, tiene acceso a todo
      return ['bookings', 'customers', 'finance', 'settings', 'tournaments', 'classes', 'coaches']
    }

    // Para otros roles, devolver solo los permisos asignados
    return user.permissions.map(p => p.moduleCode)
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return []
  }
}

export async function currentUserHasPermission(moduleCode: string): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    const permissions = await getUserPermissions(user.id)
    return permissions.includes(moduleCode)
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}