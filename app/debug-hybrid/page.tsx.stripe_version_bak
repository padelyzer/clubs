'use client'

import { useHybridAuth } from '@/hooks/use-hybrid-auth'
import { getSession, canUseCookies } from '@/lib/auth/hybrid-session'
import { useEffect, useState } from 'react'

export const dynamic = 'force-dynamic'

export default function DebugHybridPage() {
  const { session, loading, authMethod } = useHybridAuth()
  const [localSession, setLocalSession] = useState<any>(null)
  const [cookieTest, setCookieTest] = useState<boolean>(false)
  const [storageData, setStorageData] = useState<any>({})

  useEffect(() => {
    // Test direct session access
    const sess = getSession()
    setLocalSession(sess)
    
    // Test cookie functionality
    setCookieTest(canUseCookies())
    
    // Check storage
    setStorageData({
      localStorage: localStorage.getItem('padelyzer-session'),
      sessionStorage: sessionStorage.getItem('padelyzer-session'),
      cookies: document.cookie
    })
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Sistema Híbrido</h1>
      
      <div className="space-y-6">
        <section className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Estado del Hook</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              loading,
              authMethod,
              session,
              hasSession: !!session
            }, null, 2)}
          </pre>
        </section>
        
        <section className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Sesión Local Directa</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(localSession, null, 2)}
          </pre>
        </section>
        
        <section className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Capacidades del Navegador</h2>
          <p>Puede usar cookies: {cookieTest ? '✅ SÍ' : '❌ NO'}</p>
        </section>
        
        <section className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Datos en Storage</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(storageData, null, 2)}
          </pre>
        </section>
        
        <div className="mt-6 space-y-2">
          <a href="/login" className="text-blue-500 hover:underline block">→ Ir a Login</a>
          <a href="/admin/dashboard" className="text-blue-500 hover:underline block">→ Probar Admin Dashboard</a>
        </div>
      </div>
    </div>
  )
}