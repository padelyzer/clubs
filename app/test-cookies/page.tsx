'use client'

import { useState } from 'react'

export default function TestCookiesPage() {
  const [results, setResults] = useState<string[]>([])
  
  const addResult = (msg: string) => {
    setResults(prev => [...prev, `${new Date().toTimeString().split(' ')[0]} - ${msg}`])
  }
  
  const testSimpleCookie = () => {
    try {
      // Test 1: Simple cookie
      document.cookie = "test-simple=value1; path=/; max-age=3600"
      addResult('Set simple cookie: test-simple=value1')
      
      // Check if it was set
      const cookies = document.cookie
      addResult(`Current cookies: ${cookies || 'NONE'}`)
      
      if (cookies.includes('test-simple')) {
        addResult('✅ Simple cookie was set successfully!')
      } else {
        addResult('❌ Simple cookie was NOT set')
      }
    } catch (err) {
      addResult(`Error: ${err}`)
    }
  }
  
  const testSecureCookie = () => {
    try {
      // Test 2: Secure cookie
      document.cookie = "test-secure=value2; path=/; secure; samesite=lax; max-age=3600"
      addResult('Set secure cookie: test-secure=value2')
      
      // Check if it was set
      const cookies = document.cookie
      addResult(`Current cookies: ${cookies || 'NONE'}`)
      
      if (cookies.includes('test-secure')) {
        addResult('✅ Secure cookie was set successfully!')
      } else {
        addResult('❌ Secure cookie was NOT set (this might be normal if not HTTPS)')
      }
    } catch (err) {
      addResult(`Error: ${err}`)
    }
  }
  
  const testFetchWithCookies = async () => {
    try {
      const response = await fetch('/api/health', {
        credentials: 'include',
        headers: {
          'Cookie': 'test-fetch=value3'
        }
      })
      
      const headers = Object.fromEntries(response.headers.entries())
      addResult(`Response headers: ${JSON.stringify(headers)}`)
      
      // Look for Set-Cookie header
      const setCookie = response.headers.get('set-cookie')
      if (setCookie) {
        addResult(`Set-Cookie header: ${setCookie}`)
      } else {
        addResult('No Set-Cookie header in response')
      }
    } catch (err) {
      addResult(`Fetch error: ${err}`)
    }
  }
  
  const clearResults = () => {
    setResults([])
  }
  
  const checkBrowserSettings = () => {
    // Check various browser features
    addResult(`Navigator.cookieEnabled: ${navigator.cookieEnabled}`)
    addResult(`Document.cookie accessible: ${typeof document.cookie !== 'undefined'}`)
    addResult(`LocalStorage available: ${typeof localStorage !== 'undefined'}`)
    addResult(`SessionStorage available: ${typeof sessionStorage !== 'undefined'}`)
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test de Cookies</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Resultados:</h2>
          <div className="text-sm font-mono space-y-1 max-h-96 overflow-auto">
            {results.length === 0 ? (
              <p className="text-gray-500">No hay resultados aún. Ejecuta las pruebas.</p>
            ) : (
              results.map((result, idx) => (
                <div key={idx} className={
                  result.includes('✅') ? 'text-green-600' :
                  result.includes('❌') ? 'text-red-600' :
                  result.includes('Error') ? 'text-orange-600' :
                  'text-gray-700'
                }>
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={testSimpleCookie}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Simple Cookie
          </button>
          
          <button 
            onClick={testSecureCookie}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Secure Cookie
          </button>
          
          <button 
            onClick={testFetchWithCookies}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Test Fetch with Cookies
          </button>
          
          <button 
            onClick={checkBrowserSettings}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Check Browser Settings
          </button>
          
          <button 
            onClick={clearResults}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>
        
        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-bold text-sm mb-2">Posibles Problemas:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Navegador bloqueando cookies de terceros</li>
            <li>Extensiones del navegador (AdBlocker, Privacy Badger, etc.)</li>
            <li>Modo incógnito con restricciones</li>
            <li>Configuración de cookies en Safari/iOS</li>
            <li>CSP (Content Security Policy) restrictiva</li>
          </ul>
        </div>
      </div>
    </div>
  )
}