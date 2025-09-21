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