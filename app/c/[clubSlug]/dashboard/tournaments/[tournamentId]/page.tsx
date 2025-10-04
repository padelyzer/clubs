/**
 * DEBUG: Componente temporal para diagnosticar el problema de redirección
 * 
 * Esta página debería redirigir automáticamente al torneo específico en la interfaz avanzada
 * que se encuentra en /dashboard/tournaments/[id]
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface TournamentPageProps {
  params: Promise<{
    clubSlug: string
    tournamentId: string
  }>
}

export default function TournamentDebugPage({ params }: TournamentPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [redirectExecuted, setRedirectExecuted] = useState(false)

  useEffect(() => {
    const debugRedirect = async () => {
      console.log('🔍 DEBUG: TournamentDebugPage mounted')
      console.log('🔍 DEBUG: Current pathname:', pathname)
      
      const resolvedParams = await params
      const { clubSlug, tournamentId } = resolvedParams
      
      const debugData = {
        currentPath: pathname,
        clubSlug,
        tournamentId,
        targetUrl: `/dashboard/tournaments/${tournamentId}`,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
      
      console.log('🔍 DEBUG: Resolved params:', debugData)
      setDebugInfo(debugData)
      
      // Esperar 2 segundos para que el usuario pueda ver el debug
      setTimeout(() => {
        console.log('🔍 DEBUG: Executing redirect to:', `/dashboard/tournaments/${tournamentId}`)
        setRedirectExecuted(true)
        router.replace(`/dashboard/tournaments/${tournamentId}`)
      }, 2000)
    }
    
    debugRedirect()
  }, [params, router, pathname])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-red-500 border border-red-600 rounded-lg p-6 mb-6">
        <h1 className="text-4xl font-bold text-white mb-4">🚨🚨🚨 ARCHIVO DEBUG SE ESTÁ EJECUTANDO 🚨🚨🚨</h1>
        <p className="text-white text-xl">Si ves este mensaje rojo, significa que mi archivo debug SÍ se está cargando</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Debug Information:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          {!redirectExecuted ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-blue-700">Esperando 2 segundos antes de redirigir...</p>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-blue-700">Redirigiendo al módulo V2... Si no redirige, hay un problema.</p>
            </>
          )}
        </div>
        
        {debugInfo.targetUrl && (
          <div className="mt-4">
            <p className="text-sm text-blue-600">Target URL: {debugInfo.targetUrl}</p>
            <button 
              onClick={() => {
                console.log('🔍 DEBUG: Manual redirect triggered')
                router.push(debugInfo.targetUrl)
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Manual Redirect (Click si no redirige automáticamente)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}