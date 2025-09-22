'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getFallbackToken, 
  saveFallbackToken, 
  clearFallbackToken,
  type FallbackSession 
} from '@/lib/auth/fallback-auth'

export function useFallbackAuth() {
  const [session, setSession] = useState<FallbackSession | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const token = getFallbackToken()
      if (!token) {
        setSession(null)
        setLoading(false)
        return
      }

      // Verificar token con el servidor
      const response = await fetch('/api/auth/verify-fallback', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
      } else {
        // Token inválido, limpiar
        clearFallbackToken()
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
      const response = await fetch('/api/auth/login-fallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        saveFallbackToken(data.token)
        setSession(data.session)
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
    clearFallbackToken()
    setSession(null)
    router.push('/login')
    router.refresh()
  }

  return {
    session,
    loading,
    login,
    logout,
    isAuthenticated: !!session,
  }
}