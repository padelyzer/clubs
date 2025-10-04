/**
 * Redirección automática al módulo especializado de Torneos V2
 * 
 * Esta página redirige automáticamente a la interfaz avanzada de torneos
 * que se encuentra en /dashboard/tournaments
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TournamentsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir automáticamente al módulo especializado de Torneos V2
    router.replace('/dashboard/tournaments')
  }, [router])

  // Mostrar mensaje de carga mientras redirige
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo al módulo de torneos...</p>
      </div>
    </div>
  )
}