'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Club {
  id: string
  name: string
  email: string
  stripeAccountId: string | null
}

interface StripeOnboardingProps {
  club: Club
}

export function StripeOnboarding({ club }: StripeOnboardingProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleCreateAccount() {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear cuenta Stripe')
      }

      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  async function handleRefreshOnboarding() {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al refrescar onboarding')
      }

      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const hasAccount = !!club.stripeAccountId

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            💳
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {hasAccount ? 'Completar configuración' : 'Configura tu cuenta de pagos'}
          </h3>
          <p className="text-gray-600 mb-6">
            {hasAccount 
              ? 'Tu cuenta Stripe está creada pero necesita completar la configuración'
              : 'Para recibir reservas con pago, necesitas una cuenta Stripe Connect'
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!hasAccount ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">¿Qué es Stripe Connect?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Procesamiento seguro de pagos con tarjeta</li>
                <li>• Los pagos van directamente a tu cuenta bancaria</li>
                <li>• Comisión: 3.6% + $3 MXN por transacción</li>
                <li>• Padelyzer no toca tu dinero, solo conecta</li>
                <li>• Compatible con OXXO y SPEI para clientes sin tarjeta</li>
              </ul>
            </div>

            <button
              onClick={handleCreateAccount}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                '🚀 Crear cuenta Stripe'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⏳ Configuración Pendiente</h4>
              <p className="text-sm text-yellow-800">
                Tu cuenta Stripe está creada pero necesita completar la configuración. 
                Stripe requiere información adicional para habilitar los pagos.
              </p>
            </div>

            <button
              onClick={handleRefreshOnboarding}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </span>
              ) : (
                '✅ Completar configuración'
              )}
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Powered by Stripe • Seguro y certificado PCI DSS
          </p>
        </div>
      </div>
    </div>
  )
}