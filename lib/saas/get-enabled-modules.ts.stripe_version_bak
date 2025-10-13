import { prisma } from '@/lib/config/prisma'

export interface EnabledModule {
  code: string
  name: string
  displayName?: string
  isIncluded: boolean
}

/**
 * Obtiene los módulos habilitados para un club específico basado en su paquete
 */
export async function getEnabledModulesForClub(clubId: string): Promise<EnabledModule[]> {
  try {
    console.log('[getEnabledModulesForClub] Checking modules for club:', clubId)

    // First, check for individually enabled modules
    const clubModules = await prisma.clubModule.findMany({
      where: {
        clubId,
        isEnabled: true
      },
      include: {
        module: true
      }
    })

    console.log('[getEnabledModulesForClub] Found club modules:', clubModules.map(cm => ({
      code: cm.module.code,
      name: cm.module.name,
      isEnabled: cm.isEnabled
    })))

    // If there are individually enabled modules, return them
    if (clubModules.length > 0) {
      const modules = clubModules.map(cm => {
        // Map database codes to frontend codes
        let frontendCode = cm.module.code.toLowerCase()
        if (cm.module.code === 'TOURNAMENTS') {
          frontendCode = 'tournaments'
        } else if (cm.module.code === 'CLASSES') {
          frontendCode = 'classes'
        }

        return {
          code: frontendCode,
          name: cm.module.name,
          displayName: cm.module.name,
          isIncluded: true
        }
      })

      // Always include basic modules
      const basicModules = [
        { code: 'bookings', name: 'Sistema de Reservas', isIncluded: true },
        { code: 'customers', name: 'Registro de Clientes', isIncluded: true },
        { code: 'finance', name: 'Finanzas', isIncluded: true },
      ]

      // Merge unique modules
      const allModules = [...basicModules]
      modules.forEach(m => {
        if (!allModules.some(am => am.code === m.code)) {
          allModules.push(m)
        }
      })

      console.log('[getEnabledModulesForClub] Returning modules:', allModules.map(m => m.code))
      return allModules
    }

    // If no individual modules, check for package-based modules
    const clubPackage = await prisma.clubPackage.findFirst({
      where: { 
        clubId,
        isActive: true 
      },
      include: {
        package: {
          include: {
            modules: {
              include: {
                module: true
              }
            }
          }
        }
      }
    })

    if (!clubPackage?.package) {
      // Si no hay paquete activo, devolver módulos básicos por defecto
      return [
        { code: 'bookings', name: 'Sistema de Reservas', isIncluded: true },
        { code: 'customers', name: 'Registro de Clientes', isIncluded: true },
        { code: 'finance', name: 'Finanzas', isIncluded: true },
      ]
    }

    // Mapear los módulos del paquete
    return clubPackage.package.modules.map(pm => ({
      code: pm.module.code,
      name: pm.module.name,
      displayName: pm.module.name,
      isIncluded: pm.isIncluded
    }))
  } catch (error) {
    console.error('Error fetching enabled modules:', error)
    // En caso de error, devolver módulos básicos
    return [
      { code: 'bookings', name: 'Sistema de Reservas', isIncluded: true },
      { code: 'customers', name: 'Registro de Clientes', isIncluded: true },
      { code: 'finance', name: 'Finanzas', isIncluded: true },
    ]
  }
}

/**
 * Verifica si un módulo específico está habilitado para un club
 */
export async function isModuleEnabledForClub(
  clubId: string, 
  moduleCode: string
): Promise<boolean> {
  const modules = await getEnabledModulesForClub(clubId)
  return modules.some(m => m.code === moduleCode && m.isIncluded)
}

/**
 * Obtiene los códigos de módulos habilitados como un Set para verificación rápida
 */
export async function getEnabledModuleCodesForClub(clubId: string): Promise<Set<string>> {
  const modules = await getEnabledModulesForClub(clubId)
  return new Set(modules.filter(m => m.isIncluded).map(m => m.code))
}