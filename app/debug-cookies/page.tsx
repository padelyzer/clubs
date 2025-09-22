'use client'

import { useEffect, useState } from 'react'

export default function DebugCookiesPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loginResponse, setLoginResponse] = useState<any>(null)
  
  useEffect(() => {
    gatherDebugInfo()
  }, [])
  
  const gatherDebugInfo = async () => {
    const info: any = {
      cookies: document.cookie,
      cookieEnabled: navigator.cookieEnabled,
      userAgent: navigator.userAgent,
      isHttps: window.location.protocol === 'https:',
      hostname: window.location.hostname,
      headers: {}
    }
    
    // Test cookie
    try {
      const testName = 'test_cookie_' + Date.now()
      document.cookie = `${testName}=test; path=/`
      info.canSetCookies = document.cookie.includes(testName)
      if (info.canSetCookies) {
        document.cookie = `${testName}=; path=/; max-age=0`
      }
    } catch (e) {
      info.canSetCookies = false
      info.cookieError = e.message
    }
    
    // Get session info
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      info.sessionData = data
      info.sessionHeaders = Object.fromEntries(response.headers.entries())
    } catch (e) {
      info.sessionError = e.message
    }
    
    setDebugInfo(info)
  }
  
  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com', // Cambiar por credenciales válidas
          password: 'test123'
        }),
        credentials: 'include'
      })
      
      const data = await response.json()
      const headers = Object.fromEntries(response.headers.entries())
      
      setLoginResponse({
        status: response.status,
        data,
        headers,
        cookiesAfter: document.cookie
      })
      
      // Refresh debug info
      setTimeout(gatherDebugInfo, 1000)
    } catch (e) {
      setLoginResponse({ error: e.message })
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug de Cookies y Sesión</h1>
      
      <div className="space-y-6">
        <section className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Información del Navegador</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              cookieEnabled: debugInfo.cookieEnabled,
              canSetCookies: debugInfo.canSetCookies,
              isHttps: debugInfo.isHttps,
              hostname: debugInfo.hostname,
              userAgent: debugInfo.userAgent
            }, null, 2)}
          </pre>
        </section>
        
        <section className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Cookies Actuales</h2>
          <pre className="text-xs overflow-auto">
            {debugInfo.cookies || 'No hay cookies'}
          </pre>
        </section>
        
        <section className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Información de Sesión</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo.sessionData, null, 2)}
          </pre>
        </section>
        
        <section className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Headers de Sesión</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo.sessionHeaders, null, 2)}
          </pre>
        </section>
        
        <section>
          <button
            onClick={testLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Login (con credenciales de prueba)
          </button>
          
          {loginResponse && (
            <div className="mt-4 bg-yellow-100 p-4 rounded">
              <h3 className="font-bold mb-2">Respuesta del Login</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(loginResponse, null, 2)}
              </pre>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}