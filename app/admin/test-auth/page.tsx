'use client'

import { useState } from 'react'
import { apiCall } from '@/lib/utils/hybrid-fetch'

export default function TestAuthPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const { data, error, ok } = await apiCall('/api/admin/test-auth')
      
      setResult({
        ok,
        data,
        error,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setResult({
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const testClubs = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const { data, error, ok } = await apiCall('/api/admin/clubs?status=all&search=&page=1')
      
      setResult({
        ok,
        data,
        error,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setResult({
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test de Autenticación API</h1>
      
      <div className="space-y-4">
        <button
          onClick={testAuth}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Auth Endpoint
        </button>
        
        <button
          onClick={testClubs}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          Test Clubs Endpoint
        </button>
      </div>

      {loading && (
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Resultado:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}