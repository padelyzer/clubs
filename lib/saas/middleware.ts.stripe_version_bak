import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { hasModuleAccess, ModuleCode } from './modules'

export interface ModuleMiddlewareOptions {
  requiredModule: ModuleCode
  redirectTo?: string
  showUpgradePrompt?: boolean
}

/**
 * Middleware para verificar acceso a módulos en rutas de API
 */
export async function requireModuleAccess(
  request: NextRequest,
  options: ModuleMiddlewareOptions
): Promise<NextResponse | null> {
  try {
    const session = await requireAuthAPI()
    
    if (!session?.clubId) {
      return NextResponse.json(
        { error: 'No club associated with user' },
        { status: 403 }
      )
    }

    const access = await hasModuleAccess(session.clubId, options.requiredModule)
    
    if (!access.hasAccess) {
      const errorMessage = access.needsPayment 
        ? `Access to ${options.requiredModule} module requires payment`
        : `Access to ${options.requiredModule} module is not enabled`
        
      return NextResponse.json(
        { 
          error: errorMessage,
          moduleRequired: options.requiredModule,
          needsPayment: access.needsPayment,
          upgradeRequired: true
        },
        { status: 402 } // Payment Required
      )
    }

    // Agregar headers informativos sobre el acceso
    const headers = new Headers()
    headers.set('X-Module-Access', 'granted')
    headers.set('X-Module-Code', options.requiredModule)
    headers.set('X-Grace-Period', access.isInGracePeriod.toString())
    
    if (access.gracePeriodEnd) {
      headers.set('X-Grace-Period-End', access.gracePeriodEnd.toISOString())
    }

    return null // Permitir continuar
  } catch (error) {
    console.error('Error in module middleware:', error)
    return NextResponse.json(
      { error: 'Failed to verify module access' },
      { status: 500 }
    )
  }
}

/**
 * Higher-order function para crear middleware específico de módulo
 */
export function createModuleMiddleware(moduleCode: ModuleCode) {
  return async (request: NextRequest) => {
    return requireModuleAccess(request, { requiredModule: moduleCode })
  }
}

/**
 * Middleware específicos para cada módulo
 */
export const requireBookingsModule = createModuleMiddleware('bookings')
export const requireCustomersModule = createModuleMiddleware('customers')
export const requireTournamentsModule = createModuleMiddleware('tournaments')
export const requireClassesModule = createModuleMiddleware('classes')
export const requireFinanceModule = createModuleMiddleware('finance')

/**
 * Verificación de acceso para componentes React
 */
export async function checkModuleAccessForComponent(
  clubId: string,
  moduleCode: ModuleCode
): Promise<{
  hasAccess: boolean
  shouldShowUpgrade: boolean
  gracePeriodEnd?: Date
  isInGracePeriod: boolean
}> {
  const access = await hasModuleAccess(clubId, moduleCode)
  
  return {
    hasAccess: access.hasAccess,
    shouldShowUpgrade: !access.hasAccess,
    gracePeriodEnd: access.gracePeriodEnd,
    isInGracePeriod: access.isInGracePeriod
  }
}

/**
 * Hook para uso en componentes del cliente
 */
export interface UseModuleAccess {
  hasAccess: boolean
  isLoading: boolean
  isInGracePeriod: boolean
  gracePeriodEnd?: Date
  needsPayment: boolean
  error?: string
}

/**
 * Componente para envolver funcionalidades que requieren módulos específicos
 */
export interface ModuleGateProps {
  moduleCode: ModuleCode
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
  clubId: string
}

/**
 * Utility para generar mensajes de error de módulos
 */
export function getModuleErrorMessage(
  moduleCode: ModuleCode,
  access: { hasAccess: boolean; needsPayment: boolean; isInGracePeriod: boolean }
): string {
  const moduleNames = {
    bookings: 'Reservas',
    customers: 'Registro de Clientes',
    tournaments: 'Torneos',
    classes: 'Clases',
    finance: 'Finanzas'
  }

  const moduleName = moduleNames[moduleCode]

  if (access.isInGracePeriod) {
    return `Estás en período de prueba para el módulo ${moduleName}. Activa tu suscripción para continuar usándolo.`
  }

  if (access.needsPayment) {
    return `El módulo ${moduleName} requiere suscripción activa. Contacta al administrador para activarlo.`
  }

  return `El módulo ${moduleName} no está habilitado para tu club.`
}

/**
 * Función para validar múltiples módulos a la vez
 */
export async function validateMultipleModules(
  clubId: string,
  modules: ModuleCode[]
): Promise<Record<ModuleCode, boolean>> {
  const results: Record<string, boolean> = {}
  
  for (const moduleCode of modules) {
    const access = await hasModuleAccess(clubId, moduleCode)
    results[moduleCode] = access.hasAccess
  }
  
  return results as Record<ModuleCode, boolean>
}

/**
 * Decorator para funciones que requieren acceso a módulo específico
 */
export function requireModule(moduleCode: ModuleCode) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      // Asumir que el primer argumento es el clubId
      const clubId = args[0]
      
      if (typeof clubId !== 'string') {
        throw new Error('First argument must be clubId (string)')
      }
      
      const access = await hasModuleAccess(clubId, moduleCode)
      
      if (!access.hasAccess) {
        throw new Error(`Module ${moduleCode} access required`)
      }
      
      return method.apply(this, args)
    }
    
    return descriptor
  }
}

/**
 * Tipos para respuestas de API con información de módulos
 */
export interface ModuleApiResponse<T = any> {
  data?: T
  error?: string
  moduleInfo?: {
    required: ModuleCode
    hasAccess: boolean
    isInGracePeriod: boolean
    gracePeriodEnd?: string
    needsPayment: boolean
  }
}