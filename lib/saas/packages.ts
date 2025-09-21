import { prisma } from '@/lib/config/prisma'
import { ModuleCode } from './modules'

export interface ClubPackageInfo {
  packageId: string
  packageName: string
  displayName: string
  description: string | null
  basePrice: number
  currency: string
  limits: {
    maxCourts: number | null
    maxUsers: number | null
    maxBookingsMonth: number | null
  }
  modules: {
    moduleId: string
    moduleCode: ModuleCode
    moduleName: string
    isIncluded: boolean
    isOptional: boolean
    isActive: boolean
  }[]
}

/**
 * Obtiene información completa del paquete asignado a un club
 */
export async function getClubPackageInfo(clubId: string): Promise<ClubPackageInfo | null> {
  try {
    const clubPackage = await prisma.clubPackage.findUnique({
      where: { clubId },
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

    if (!clubPackage || !clubPackage.isActive) {
      return null
    }

    // Obtener módulos activos del club
    const activeClubModules = await prisma.clubModule.findMany({
      where: {
        clubId,
        isEnabled: true
      }
    })

    const activeModuleIds = new Set(activeClubModules.map(cm => cm.moduleId))

    return {
      packageId: clubPackage.package.id,
      packageName: clubPackage.package.name,
      displayName: clubPackage.package.displayName,
      description: clubPackage.package.description,
      basePrice: clubPackage.package.basePrice,
      currency: clubPackage.package.currency,
      limits: {
        maxCourts: clubPackage.package.maxCourts,
        maxUsers: clubPackage.package.maxUsers,
        maxBookingsMonth: clubPackage.package.maxBookingsMonth
      },
      modules: clubPackage.package.modules.map(pm => ({
        moduleId: pm.module.id,
        moduleCode: pm.module.code as ModuleCode,
        moduleName: pm.module.name,
        isIncluded: pm.isIncluded,
        isOptional: pm.isOptional,
        isActive: activeModuleIds.has(pm.module.id)
      }))
    }
  } catch (error) {
    console.error('Error getting club package info:', error)
    return null
  }
}

/**
 * Verifica si un club tiene acceso a un módulo específico basado en su paquete
 */
export async function hasPackageModuleAccess(
  clubId: string,
  moduleCode: ModuleCode
): Promise<{
  hasAccess: boolean
  isIncluded: boolean
  isOptional: boolean
  isActive: boolean
  requiresActivation: boolean
}> {
  try {
    const packageInfo = await getClubPackageInfo(clubId)
    
    if (!packageInfo) {
      return {
        hasAccess: false,
        isIncluded: false,
        isOptional: false,
        isActive: false,
        requiresActivation: false
      }
    }

    const moduleInfo = packageInfo.modules.find(m => m.moduleCode === moduleCode)
    
    if (!moduleInfo) {
      return {
        hasAccess: false,
        isIncluded: false,
        isOptional: false,
        isActive: false,
        requiresActivation: false
      }
    }

    return {
      hasAccess: moduleInfo.isIncluded || (moduleInfo.isOptional && moduleInfo.isActive),
      isIncluded: moduleInfo.isIncluded,
      isOptional: moduleInfo.isOptional,
      isActive: moduleInfo.isActive,
      requiresActivation: moduleInfo.isOptional && !moduleInfo.isActive
    }
  } catch (error) {
    console.error('Error checking package module access:', error)
    return {
      hasAccess: false,
      isIncluded: false,
      isOptional: false,
      isActive: false,
      requiresActivation: false
    }
  }
}

/**
 * Obtiene todos los paquetes disponibles
 */
export async function getAvailablePackages() {
  try {
    const packages = await prisma.saasPackage.findMany({
      where: { isActive: true },
      include: {
        modules: {
          include: {
            module: true
          }
        },
        _count: {
          select: {
            clubPackages: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      displayName: pkg.displayName,
      description: pkg.description,
      basePrice: pkg.basePrice,
      currency: pkg.currency,
      isDefault: pkg.isDefault,
      isActive: pkg.isActive,
      maxCourts: pkg.maxCourts,
      maxUsers: pkg.maxUsers,
      maxBookingsMonth: pkg.maxBookingsMonth,
      limits: {
        maxCourts: pkg.maxCourts,
        maxUsers: pkg.maxUsers,
        maxBookingsMonth: pkg.maxBookingsMonth
      },
      modules: pkg.modules.map(pm => ({
        moduleId: pm.moduleId,
        moduleCode: pm.module.code as ModuleCode,
        moduleName: pm.module.name,
        moduleDescription: pm.module.description,
        isIncluded: pm.isIncluded,
        isOptional: pm.isOptional,
        priceOverride: pm.priceOverride,
        module: pm.module
      })),
      clubsCount: pkg._count.clubPackages
    }))
  } catch (error) {
    console.error('Error getting available packages:', error)
    return []
  }
}

/**
 * Asigna un paquete a un club
 */
export async function assignPackageToClub(
  clubId: string,
  packageId: string,
  notes?: string
): Promise<boolean> {
  try {
    // Verificar que el paquete existe y está activo
    const packageInfo = await prisma.saasPackage.findFirst({
      where: {
        id: packageId,
        isActive: true
      },
      include: {
        modules: {
          where: { isIncluded: true },
          include: { module: true }
        }
      }
    })

    if (!packageInfo) {
      throw new Error('Package not found or inactive')
    }

    // Usar transacción para asegurar consistencia
    await prisma.$transaction(async (tx) => {
      // Verificar si ya existe un paquete para este club
      const existingClubPackage = await tx.clubPackage.findUnique({
        where: { clubId }
      })

      if (existingClubPackage) {
        // Actualizar paquete existente
        await tx.clubPackage.update({
          where: { clubId },
          data: {
            packageId,
            isActive: true,
            activatedAt: new Date(),
            deactivatedAt: null,
            notes: notes || `Actualizado el ${new Date().toLocaleDateString()}`
          }
        })
      } else {
        // Crear nueva asignación de paquete
        await tx.clubPackage.create({
          data: {
            clubId,
            packageId,
            notes: notes || `Asignado el ${new Date().toLocaleDateString()}`
          }
        })
      }

      // Activar módulos incluidos automáticamente
      for (const packageModule of packageInfo.modules) {
        await tx.clubModule.upsert({
          where: {
            clubId_moduleId: {
              clubId,
              moduleId: packageModule.moduleId
            }
          },
          update: {
            isEnabled: true,
            enabledAt: new Date(),
            gracePeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
          },
          create: {
            clubId,
            moduleId: packageModule.moduleId,
            isEnabled: true,
            enabledAt: new Date(),
            gracePeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
          }
        })
      }
    })

    return true
  } catch (error) {
    console.error('Error assigning package to club:', error)
    return false
  }
}

/**
 * Activa/desactiva un módulo opcional para un club
 */
export async function toggleOptionalModule(
  clubId: string,
  moduleCode: ModuleCode,
  enable: boolean
): Promise<boolean> {
  try {
    // Verificar que el módulo es opcional en el paquete del club
    const access = await hasPackageModuleAccess(clubId, moduleCode)
    
    if (!access.isOptional) {
      throw new Error('Module is not optional in current package')
    }

    const module = await prisma.saasModule.findUnique({
      where: { code: moduleCode }
    })

    if (!module) {
      throw new Error('Module not found')
    }

    if (enable) {
      // Activar módulo
      await prisma.clubModule.upsert({
        where: {
          clubId_moduleId: {
            clubId,
            moduleId: module.id
          }
        },
        update: {
          isEnabled: true,
          enabledAt: new Date(),
          gracePeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
        },
        create: {
          clubId,
          moduleId: module.id,
          isEnabled: true,
          enabledAt: new Date(),
          gracePeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
        }
      })
    } else {
      // Desactivar módulo
      await prisma.clubModule.update({
        where: {
          clubId_moduleId: {
            clubId,
            moduleId: module.id
          }
        },
        data: {
          isEnabled: false,
          disabledAt: new Date(),
          gracePeriodEnd: null
        }
      })
    }

    return true
  } catch (error) {
    console.error('Error toggling optional module:', error)
    return false
  }
}

/**
 * Obtiene estadísticas de uso del paquete para un club
 */
export async function getClubPackageUsage(clubId: string) {
  try {
    const packageInfo = await getClubPackageInfo(clubId)
    
    if (!packageInfo) {
      return null
    }

    // Contar recursos actuales
    const [courtsCount, usersCount, currentMonthBookings] = await Promise.all([
      prisma.court.count({
        where: { clubId, active: true }
      }),
      prisma.user.count({
        where: { clubId, active: true }
      }),
      prisma.booking.count({
        where: {
          clubId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    return {
      packageInfo,
      currentUsage: {
        courts: courtsCount,
        users: usersCount,
        bookingsThisMonth: currentMonthBookings
      },
      limits: packageInfo.limits,
      utilization: {
        courts: packageInfo.limits.maxCourts 
          ? (courtsCount / packageInfo.limits.maxCourts) * 100 
          : 0,
        users: packageInfo.limits.maxUsers 
          ? (usersCount / packageInfo.limits.maxUsers) * 100 
          : 0,
        bookings: packageInfo.limits.maxBookingsMonth 
          ? (currentMonthBookings / packageInfo.limits.maxBookingsMonth) * 100 
          : 0
      },
      isOverLimit: {
        courts: packageInfo.limits.maxCourts ? courtsCount > packageInfo.limits.maxCourts : false,
        users: packageInfo.limits.maxUsers ? usersCount > packageInfo.limits.maxUsers : false,
        bookings: packageInfo.limits.maxBookingsMonth ? currentMonthBookings > packageInfo.limits.maxBookingsMonth : false
      }
    }
  } catch (error) {
    console.error('Error getting club package usage:', error)
    return null
  }
}

/**
 * Calcula el costo total del paquete para un club
 */
export async function calculatePackageCost(
  clubId: string,
  packageId?: string
): Promise<{
  basePrice: number
  modulesCost: number
  totalCost: number
  currency: string
  breakdown: Array<{
    item: string
    cost: number
    type: 'base' | 'module'
  }>
} | null> {
  try {
    let targetPackageId = packageId
    
    if (!targetPackageId) {
      const currentPackage = await getClubPackageInfo(clubId)
      if (!currentPackage) return null
      targetPackageId = currentPackage.packageId
    }

    const packageInfo = await prisma.saasPackage.findUnique({
      where: { id: targetPackageId },
      include: {
        modules: {
          include: { module: true }
        }
      }
    })

    if (!packageInfo) return null

    const breakdown: Array<{ item: string; cost: number; type: 'base' | 'module' }> = []
    
    // Precio base del paquete
    breakdown.push({
      item: `Paquete ${packageInfo.displayName}`,
      cost: packageInfo.basePrice,
      type: 'base'
    })

    let modulesCost = 0

    // Calcular costo de módulos opcionales activos
    const activeModules = await prisma.clubModule.findMany({
      where: {
        clubId,
        isEnabled: true
      },
      include: { module: true }
    })

    for (const activeModule of activeModules) {
      const packageModule = packageInfo.modules.find(pm => pm.moduleId === activeModule.moduleId)
      
      if (packageModule && packageModule.isOptional) {
        // Usar precio override si existe, sino calcular precio estándar
        let moduleCost = 0
        if (packageModule.priceOverride) {
          moduleCost = packageModule.priceOverride
        } else {
          // Aquí podrías implementar cálculo dinámico basado en tiers
          // Por simplicidad, usaremos un precio fijo por ahora
          moduleCost = 20000 // $200 MXN por módulo opcional
        }
        
        modulesCost += moduleCost
        breakdown.push({
          item: `Módulo ${activeModule.module.name}`,
          cost: moduleCost,
          type: 'module'
        })
      }
    }

    return {
      basePrice: packageInfo.basePrice,
      modulesCost,
      totalCost: packageInfo.basePrice + modulesCost,
      currency: packageInfo.currency,
      breakdown
    }
  } catch (error) {
    console.error('Error calculating package cost:', error)
    return null
  }
}