'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Lock, Upgrade, Clock, AlertTriangle } from 'lucide-react'
import { ModuleCode } from './modules'
import { hasPackageModuleAccess } from './packages'

interface FeatureGateProps {
  moduleCode: ModuleCode
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
  className?: string
}

interface ModuleAccess {
  hasAccess: boolean
  isIncluded: boolean
  isOptional: boolean
  isActive: boolean
  requiresActivation: boolean
}

export function FeatureGate({
  moduleCode,
  children,
  fallback,
  showUpgradePrompt = true,
  className = ''
}: FeatureGateProps) {
  const { data: session } = useSession()
  const [access, setAccess] = useState<ModuleAccess | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      if (!session?.user?.clubId) {
        setLoading(false)
        return
      }

      try {
        const accessInfo = await hasPackageModuleAccess(session.user.clubId, moduleCode)
        setAccess(accessInfo)
      } catch (error) {
        console.error('Error checking module access:', error)
        setAccess({
          hasAccess: false,
          isIncluded: false,
          isOptional: false,
          isActive: false,
          requiresActivation: false
        })
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [session?.user?.clubId, moduleCode])

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  // Si no hay acceso, mostrar fallback o mensaje de upgrade
  if (!access?.hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showUpgradePrompt) {
      return <UpgradePrompt moduleCode={moduleCode} access={access} className={className} />
    }

    return null
  }

  // Si requiere activación manual (módulo opcional)
  if (access.requiresActivation) {
    return <ActivationPrompt moduleCode={moduleCode} className={className} />
  }

  // Tiene acceso, mostrar contenido
  return <>{children}</>
}

interface UpgradePromptProps {
  moduleCode: ModuleCode
  access: ModuleAccess | null
  className?: string
}

function UpgradePrompt({ moduleCode, access, className }: UpgradePromptProps) {
  const moduleNames = {
    bookings: 'Reservas',
    customers: 'Registro de Clientes',
    tournaments: 'Torneos',
    classes: 'Clases',
    finance: 'Finanzas'
  }

  const moduleName = moduleNames[moduleCode]

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-dashed border-purple-200 rounded-xl p-6 text-center ${className}`}>
      <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
        <Lock className="w-6 h-6 text-purple-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Módulo {moduleName} No Disponible
      </h3>
      
      <p className="text-gray-600 mb-4">
        Este módulo no está incluido en tu paquete actual. 
        Actualiza tu plan para acceder a esta funcionalidad.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Upgrade className="w-4 h-4" />
          Actualizar Plan
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Ver Planes
        </button>
      </div>
    </div>
  )
}

interface ActivationPromptProps {
  moduleCode: ModuleCode
  className?: string
}

function ActivationPrompt({ moduleCode, className }: ActivationPromptProps) {
  const [activating, setActivating] = useState(false)

  const moduleNames = {
    bookings: 'Reservas',
    customers: 'Registro de Clientes', 
    tournaments: 'Torneos',
    classes: 'Clases',
    finance: 'Finanzas'
  }

  const moduleName = moduleNames[moduleCode]

  const handleActivate = async () => {
    setActivating(true)
    try {
      // TODO: Implementar activación del módulo
      console.log(`Activating module: ${moduleCode}`)
      // Recargar la página para actualizar el estado
      window.location.reload()
    } catch (error) {
      console.error('Error activating module:', error)
    } finally {
      setActivating(false)
    }
  }

  return (
    <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-dashed border-yellow-200 rounded-xl p-6 text-center ${className}`}>
      <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
        <Clock className="w-6 h-6 text-yellow-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Activar Módulo {moduleName}
      </h3>
      
      <p className="text-gray-600 mb-4">
        Este módulo está disponible en tu paquete pero no está activado. 
        Actívalo para comenzar a usar sus funcionalidades.
      </p>
      
      <button
        onClick={handleActivate}
        disabled={activating}
        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {activating ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Clock className="w-4 h-4" />
        )}
        {activating ? 'Activando...' : 'Activar Módulo'}
      </button>
    </div>
  )
}

// Hook para verificar acceso a módulos
export function useModuleAccess(moduleCode: ModuleCode) {
  const { data: session } = useSession()
  const [access, setAccess] = useState<ModuleAccess | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      if (!session?.user?.clubId) {
        setLoading(false)
        return
      }

      try {
        const accessInfo = await hasPackageModuleAccess(session.user.clubId, moduleCode)
        setAccess(accessInfo)
      } catch (error) {
        console.error('Error checking module access:', error)
        setAccess({
          hasAccess: false,
          isIncluded: false,
          isOptional: false,
          isActive: false,
          requiresActivation: false
        })
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [session?.user?.clubId, moduleCode])

  return { access, loading }
}

// Componente para navegación condicional
interface ConditionalNavItemProps {
  moduleCode: ModuleCode
  href: string
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function ConditionalNavItem({
  moduleCode,
  href,
  children,
  icon,
  className = ''
}: ConditionalNavItemProps) {
  const { access, loading } = useModuleAccess(moduleCode)

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded p-2 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  if (!access?.hasAccess) {
    return null // No mostrar en navegación si no tiene acceso
  }

  return (
    <a href={href} className={className}>
      <div className="flex items-center gap-2">
        {icon}
        {children}
        {access.requiresActivation && (
          <AlertTriangle className="w-4 h-4 text-yellow-500" title="Requiere activación" />
        )}
      </div>
    </a>
  )
}

// Componente para mostrar estado del módulo
interface ModuleStatusBadgeProps {
  moduleCode: ModuleCode
}

export function ModuleStatusBadge({ moduleCode }: ModuleStatusBadgeProps) {
  const { access, loading } = useModuleAccess(moduleCode)

  if (loading) {
    return <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
  }

  if (!access) {
    return (
      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
        Sin acceso
      </span>
    )
  }

  if (access.requiresActivation) {
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
        Pendiente activación
      </span>
    )
  }

  if (access.hasAccess) {
    return (
      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
        Activo
      </span>
    )
  }

  return (
    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
      Inactivo
    </span>
  )
}