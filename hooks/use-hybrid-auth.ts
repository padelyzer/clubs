'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, saveSession, clearSession, hasValidSession, canUseCookies, type SessionData } from '@/lib/auth/hybrid-session'

export function useHybridAuth() {
  const [session, setSession] = useState<SessionData | null>(() => {
    // Inicializar con la sesión existente si hay
    if (typeof window !== 'undefined') {
      return getSession()
    }
    return null
  })
  const [loading, setLoading] = useState(true)
  const [authMethod, setAuthMethod] = useState<'cookies' | 'localStorage' | 'none'>('none')
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, []) // Solo al montar

  const checkSession = async () => {
    try {
      // Verificar método disponible
      const cookiesWork = canUseCookies()
      setAuthMethod(cookiesWork ? 'cookies' : 'localStorage')
      
      // Intentar obtener sesión local
      const localSession = getSession()
      
      if (localSession) {
        // TEMPORAL: No verificar con el servidor para evitar problemas
        // Solo confiar en la sesión local
        console.log('[HybridAuth] Using local session without server verification')
        setSession(localSession)
        
        // TODO: Re-habilitar verificación del servidor cuando se resuelva el problema
        /* 
        const response = await fetch('/api/auth/verify-session', {
          ...
        })
        */
      } else {
        setSession(null)
      }
    } catch (error) {
      console.error('Error checking session:', error)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Importante para cookies
      })

      const data = await response.json()
      console.log('[HybridAuth] Login response:', data)

      if (response.ok && data.success) {
        // Guardar sesión usando método híbrido
        if (data.sessionData) {
          console.log('[HybridAuth] Saving session data:', data.sessionData)
          saveSession(data.sessionData)
          setSession(data.sessionData)
        } else {
          console.error('[HybridAuth] No sessionData in response!')
        }
        
        // Esperar un momento para asegurar que se guarde
        await new Promise(resolve => setTimeout(resolve, 100))
        
        router.push(data.redirectUrl || '/dashboard')
        router.refresh()
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' }
    }
  }

  const logout = async () => {
    try {
      // Invalidar sesión en el servidor
      const localSession = getSession()
      if (localSession) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId: localSession.sessionId })
        })
      }
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      clearSession()
      setSession(null)
      router.push('/login')
      router.refresh()
    }
  }

  return {
    session,
    loading,
    login,
    logout,
    authMethod,
    isAuthenticated: !!session,
    canUseCookies: authMethod === 'cookies'
  }
}