'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

export function OptOutForm() {
  const searchParams = useSearchParams()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [messageType, setMessageType] = useState('')
  const [preferences, setPreferences] = useState({
    bookingConfirmations: true,
    paymentReminders: true,
    bookingReminders: true,
    promotionalMessages: false,
    generalUpdates: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    // Pre-fill from URL parameters
    const phone = searchParams.get('phone')
    const type = searchParams.get('type')
    
    if (phone) {
      setPhoneNumber(decodeURIComponent(phone))
    }
    if (type) {
      setMessageType(type)
    }
  }, [searchParams])

  const handleOptOut = async () => {
    if (!phoneNumber) {
      setResult({
        success: false,
        error: 'Por favor ingresa tu número de teléfono'
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/whatsapp/opt-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          messageType,
          preferences
        })
      })

      const data = await response.json()
      setResult(data)

    } catch (error) {
      setResult({
        success: false,
        error: 'Error al procesar la solicitud'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `+52 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }
    return phone
  }

  if (result?.success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-600 text-4xl mb-4">✓</div>
        <h2 className="text-xl font-semibold text-gray-900">
          Preferencias Actualizadas
        </h2>
        <p className="text-gray-600">
          Tus preferencias de notificaciones han sido actualizadas exitosamente.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-green-800">
            <strong>Número:</strong> {formatPhoneNumber(phoneNumber)}
          </p>
          <p className="text-sm text-green-800 mt-1">
            Los cambios entrarán en efecto inmediatamente.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Teléfono
        </label>
        <Input
          placeholder="2221234567"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <p className="text-sm text-gray-500 mt-1">
          Ingresa el número registrado en tu cuenta
        </p>
      </div>

      {/* Current Message Type (if specified) */}
      {messageType && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Tipo de mensaje:</strong> {messageType}
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Puedes cancelar este tipo específico de notificación o todas las notificaciones.
          </p>
        </div>
      )}

      {/* Notification Preferences */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Preferencias de Notificaciones
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Confirmaciones de Reserva
              </h4>
              <p className="text-sm text-gray-500">
                Mensajes cuando confirmes una reserva
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.bookingConfirmations}
                onChange={(e) => handlePreferenceChange('bookingConfirmations', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Recordatorios de Pago
              </h4>
              <p className="text-sm text-gray-500">
                Notificaciones sobre pagos pendientes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.paymentReminders}
                onChange={(e) => handlePreferenceChange('paymentReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Recordatorios de Juego
              </h4>
              <p className="text-sm text-gray-500">
                Recordatorios 2 horas antes de tu juego
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.bookingReminders}
                onChange={(e) => handlePreferenceChange('bookingReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Promociones y Ofertas
              </h4>
              <p className="text-sm text-gray-500">
                Mensajes sobre descuentos y promociones especiales
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.promotionalMessages}
                onChange={(e) => handlePreferenceChange('promotionalMessages', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Actualizaciones Generales
              </h4>
              <p className="text-sm text-gray-500">
                Noticias y actualizaciones del club
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.generalUpdates}
                onChange={(e) => handlePreferenceChange('generalUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {result && !result.success && (
        <Alert className="border-red-200 bg-red-50">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">!</span>
            <span className="text-red-800">{result.error}</span>
          </div>
        </Alert>
      )}

      {/* Update Button */}
      <Button
        onClick={handleOptOut}
        disabled={isLoading || !phoneNumber}
        className="w-full"
      >
        {isLoading ? 'Actualizando...' : 'Actualizar Preferencias'}
      </Button>

      {/* Legal Notice */}
      <div className="text-xs text-gray-500 space-y-2">
        <p>
          <strong>Nota:</strong> Las notificaciones esenciales como confirmaciones de reserva 
          y recordatorios de pago pueden seguir enviándose por razones de servicio.
        </p>
        <p>
          Para cancelar completamente todas las notificaciones, responde "BAJA" a cualquier 
          mensaje de WhatsApp que recibas de nosotros.
        </p>
      </div>
    </div>
  )
}