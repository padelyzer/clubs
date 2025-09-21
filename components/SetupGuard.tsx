'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface SetupGuardProps {
  children: React.ReactNode
}

export default function SetupGuard({ children }: SetupGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [setupCompleted, setSetupCompleted] = useState(false)

  useEffect(() => {
    // Skip check if already on setup page
    if (pathname.includes('/setup')) {
      setIsChecking(false)
      setSetupCompleted(true) // Allow rendering of setup page
      return
    }

    checkSetupStatus()
  }, [pathname])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/club/setup-status')
      const data = await response.json()

      if (data.success) {
        if (!data.setupCompleted) {
          // Redirect to the setup wizard
          router.push('/setup')
          return
        }
        setSetupCompleted(true)
      }
    } catch (error) {
      console.error('Error checking setup status:', error)
      // Allow access on error to prevent blocking
      setSetupCompleted(true)
    } finally {
      setIsChecking(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando configuración...</p>
        </div>
      </div>
    )
  }

  if (!setupCompleted && !pathname.includes('/setup')) {
    return null // Will be redirected by the router
  }

  return <>{children}</>
}