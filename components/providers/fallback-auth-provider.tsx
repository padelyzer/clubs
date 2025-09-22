'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useFallbackAuth } from '@/hooks/use-fallback-auth'
import type { FallbackSession } from '@/lib/auth/fallback-auth'

interface FallbackAuthContextType {
  session: FallbackSession | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const FallbackAuthContext = createContext<FallbackAuthContextType | undefined>(undefined)

export function FallbackAuthProvider({ children }: { children: ReactNode }) {
  const auth = useFallbackAuth()

  return (
    <FallbackAuthContext.Provider value={auth}>
      {children}
    </FallbackAuthContext.Provider>
  )
}

export function useFallbackAuthContext() {
  const context = useContext(FallbackAuthContext)
  if (!context) {
    throw new Error('useFallbackAuthContext must be used within FallbackAuthProvider')
  }
  return context
}