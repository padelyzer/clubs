'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Cookie, Shield } from 'lucide-react'

export function CookieBlockerDetector() {
  const [cookiesBlocked, setCookiesBlocked] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    checkCookieSupport()
  }, [])
  
  const checkCookieSupport = async () => {
    try {
      // Test 1: Check if cookies are enabled
      if (!navigator.cookieEnabled) {
        setCookiesBlocked(true)
        setIsChecking(false)
        return
      }
      
      // Test 2: Try to set a test cookie
      const testCookieName = 'padelyzer-test-' + Date.now()
      document.cookie = `${testCookieName}=test; path=/; max-age=10`
      
      // Check if the cookie was set
      const cookieSet = document.cookie.includes(testCookieName)
      
      // Clean up test cookie
      if (cookieSet) {
        document.cookie = `${testCookieName}=; path=/; max-age=0`
      }
      
      // Test 3: Try to fetch with credentials
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          credentials: 'include'
        })
        
        // If we can't set cookies but fetch works, likely a blocker
        if (!cookieSet && response.ok) {
          setCookiesBlocked(true)
        } else {
          setCookiesBlocked(!cookieSet)
        }
      } catch {
        // If fetch fails, check cookie test result
        setCookiesBlocked(!cookieSet)
      }
    } catch (error) {
      console.error('Cookie detection error:', error)
      setCookiesBlocked(true)
    } finally {
      setIsChecking(false)
    }
  }
  
  if (isChecking) {
    return null
  }
  
  if (!cookiesBlocked) {
    return null
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Shield className="w-6 h-6 mt-0.5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Cookies Bloqueadas - La Aplicación No Funcionará Correctamente
            </h3>
            <p className="text-sm mt-1 text-white/90">
              Tu navegador o una extensión está bloqueando las cookies necesarias para iniciar sesión.
            </p>
            <div className="mt-2 space-y-2">
              <p className="text-sm font-medium">Para solucionar:</p>
              <ol className="text-sm space-y-1 ml-4 list-decimal text-white/90">
                <li>Desactiva el bloqueador de anuncios para este sitio</li>
                <li>O agrega <code className="bg-black/20 px-1 rounded">pdzr4.vercel.app</code> a la lista blanca</li>
                <li>O usa el navegador en modo incógnito sin extensiones</li>
                <li>Recarga la página después de hacer cambios</li>
              </ol>
            </div>
          </div>
          <button
            onClick={() => setCookiesBlocked(false)}
            className="flex-shrink-0 text-white/70 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}