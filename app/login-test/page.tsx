'use client'

import { useState } from 'react'

export default function LoginTestPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/login-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Importante para cookies
      })
      
      const data = await response.json()
      setResult({
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries()),
        cookiesAfter: document.cookie
      })
      
      // Si login exitoso, verificar sesión
      if (response.ok) {
        setTimeout(async () => {
          const sessionResponse = await fetch('/api/auth/session')
          const sessionData = await sessionResponse.json()
          setResult(prev => ({
            ...prev,
            sessionCheck: sessionData
          }))
        }, 1000)
      }
    } catch (error) {
      setResult({ error: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Login Test (Diagnóstico)</h1>
      
      <form onSubmit={handleLogin} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Iniciando sesión...' : 'Test Login'}
        </button>
      </form>
      
      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Resultado:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8 space-y-2">
        <h3 className="font-bold">Enlaces útiles:</h3>
        <a href="/test-session" className="text-blue-500 hover:underline block">→ Ver sesión actual</a>
        <a href="/debug-cookies" className="text-blue-500 hover:underline block">→ Debug cookies</a>
        <a href="/dashboard" className="text-blue-500 hover:underline block">→ Probar Dashboard</a>
      </div>
    </div>
  )
}