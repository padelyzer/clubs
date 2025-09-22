'use client'

import { useEffect, useState } from 'react'
import { Cookie, AlertTriangle, CheckCircle } from 'lucide-react'

export function LoginCookieWarning() {
  const [cookieStatus, setCookieStatus] = useState<'checking' | 'enabled' | 'blocked'>('checking')
  
  useEffect(() => {
    checkCookies()
  }, [])
  
  const checkCookies = () => {
    try {
      // Quick test
      const testName = 'test_' + Date.now()
      document.cookie = `${testName}=1; path=/`
      const cookiesWork = document.cookie.includes(testName)
      
      if (cookiesWork) {
        document.cookie = `${testName}=; path=/; max-age=0`
        setCookieStatus('enabled')
      } else {
        setCookieStatus('blocked')
      }
    } catch {
      setCookieStatus('blocked')
    }
  }
  
  if (cookieStatus === 'checking') {
    return (
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
          <span className="text-sm">Verificando configuración del navegador...</span>
        </div>
      </div>
    )
  }
  
  if (cookieStatus === 'enabled') {
    return (
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Cookies habilitadas - Puedes iniciar sesión</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-900 flex items-center gap-2">
            <Cookie className="w-4 h-4" />
            Cookies Bloqueadas - No Podrás Iniciar Sesión
          </h4>
          <p className="text-sm text-red-700 mt-1">
            Tu navegador está bloqueando las cookies necesarias para el funcionamiento de la aplicación.
          </p>
          
          <div className="mt-3 space-y-2 text-sm text-red-700">
            <p className="font-medium">Soluciones:</p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>
                <strong>Si usas un bloqueador de anuncios:</strong>
                <ul className="list-disc ml-5 mt-1 text-red-600">
                  <li>Desactívalo para este sitio</li>
                  <li>O agrega <code className="bg-red-100 px-1 rounded">pdzr4.vercel.app</code> a la lista blanca</li>
                </ul>
              </li>
              <li>
                <strong>Prueba en modo incógnito</strong> (sin extensiones)
              </li>
              <li>
                <strong>Usa otro navegador</strong> como respaldo
              </li>
            </ol>
          </div>
          
          <button
            onClick={checkCookies}
            className="mt-3 text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Verificar de Nuevo
          </button>
        </div>
      </div>
    </div>
  )
}