'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFallbackAuthContext } from '@/components/providers/fallback-auth-provider'

interface FallbackAuthGuardProps {
  children: React.ReactNode
  requiredRole?: string[]
  redirectTo?: string
}

export function FallbackAuthGuard({ 
  children, 
  requiredRole,
  redirectTo = '/login' 
}: FallbackAuthGuardProps) {
  const { session, loading, isAuthenticated } = useFallbackAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo)
    }
    
    if (!loading && isAuthenticated && requiredRole) {
      if (!requiredRole.includes(session!.role)) {
        router.push('/unauthorized')
      }
    }
  }, [loading, isAuthenticated, session, router, redirectTo, requiredRole])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && !requiredRole.includes(session!.role)) {
    return null
  }

  return <>{children}</>
}