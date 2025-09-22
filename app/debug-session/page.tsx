'use client'

import { useEffect, useState } from 'react'

export default function DebugSessionPage() {
  const [cookies, setCookies] = useState<string>('')
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [loginResponse, setLoginResponse] = useState<any>(null)
  
  useEffect(() => {
    // Get all cookies
    setCookies(document.cookie)
    
    // Check session via API
    checkSession()
  }, [])
  
  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setSessionData(data)
    } catch (err) {
      setError(String(err))
    }
  }
  
  const testNavigation = () => {
    // Navigate without changing page
    window.history.pushState({}, '', '/dashboard/test')
    checkSession()
  }
  
  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        })
      })
      
      const data = await response.json()
      setLoginResponse(data)
      
      // Re-check cookies after login
      setTimeout(() => {
        setCookies(document.cookie)
        checkSession()
      }, 500)
    } catch (err) {
      setError('Login test failed: ' + String(err))
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug de Sesión</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Cookies:</h2>
          <pre className="text-xs overflow-auto">{cookies || 'No cookies'}</pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Session Data:</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify(sessionData, null, 2)}</pre>
        </div>
        
        {error && (
          <div className="bg-red-100 p-4 rounded">
            <h2 className="font-bold mb-2">Error:</h2>
            <pre className="text-xs">{error}</pre>
          </div>
        )}
        
        {loginResponse && (
          <div className="bg-green-100 p-4 rounded">
            <h2 className="font-bold mb-2">Login Response:</h2>
            <pre className="text-xs overflow-auto">{JSON.stringify(loginResponse, null, 2)}</pre>
          </div>
        )}
        
        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-bold mb-2">Información del Sitio:</h2>
          <p className="text-sm">URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          <p className="text-sm">Protocolo: {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</p>
          <p className="text-sm">Es HTTPS: {typeof window !== 'undefined' ? window.location.protocol === 'https:' ? 'Sí' : 'No' : 'N/A'}</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={checkSession}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Revisar Sesión
          </button>
          
          <button 
            onClick={testNavigation}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Test Navegación
          </button>
          
          <a 
            href="/dashboard"
            className="bg-purple-500 text-white px-4 py-2 rounded inline-block"
          >
            Ir a Dashboard (Link)
          </a>
          
          <button 
            onClick={testLogin}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Test Login (debug)
          </button>
        </div>
      </div>
    </div>
  )
}