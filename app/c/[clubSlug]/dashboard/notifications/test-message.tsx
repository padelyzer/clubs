'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

interface TestMessageProps {
  clubId: string
}

export function TestMessage({ clubId }: TestMessageProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('BOOKING_CONFIRMATION')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const templates = [
    { id: 'BOOKING_CONFIRMATION', name: 'Confirmación de Reserva' },
    { id: 'BOOKING_REMINDER', name: 'Recordatorio' },
    { id: 'PAYMENT_PENDING', name: 'Pago Pendiente' },
    { id: 'PAYMENT_COMPLETED', name: 'Pago Completado' },
    { id: 'BOOKING_CANCELLED', name: 'Cancelación' }
  ]

  const getTestData = (templateId: string) => {
    const testData: Record<string, any> = {
      BOOKING_CONFIRMATION: {
        playerName: 'Test Usuario',
        clubName: 'Club Test',
        courtName: 'Cancha Test',
        bookingDate: new Date().toLocaleDateString('es-MX'),
        bookingTime: '18:00',
        totalPrice: '400.00',
        paymentMethod: 'Pago de prueba'
      },
      BOOKING_REMINDER: {
        playerName: 'Test Usuario',
        clubName: 'Club Test',
        courtName: 'Cancha Test',
        timeRemaining: '2 horas',
        clubAddress: 'Dirección de prueba 123'
      },
      PAYMENT_PENDING: {
        playerName: 'Test Usuario',
        organizerName: 'Organizador Test',
        clubName: 'Club Test',
        bookingDate: new Date().toLocaleDateString('es-MX'),
        amount: '100.00',
        paymentLink: 'https://test.com/pay/123'
      },
      PAYMENT_COMPLETED: {
        playerName: 'Test Usuario',
        clubName: 'Club Test',
        bookingDate: new Date().toLocaleDateString('es-MX'),
        bookingTime: '18:00',
        paymentStatus: 'Pagado'
      },
      BOOKING_CANCELLED: {
        playerName: 'Test Usuario',
        clubName: 'Club Test',
        bookingDate: new Date().toLocaleDateString('es-MX'),
        bookingTime: '18:00',
        refundInfo: 'Sin cargo - mensaje de prueba'
      }
    }
    return testData[templateId] || {}
  }

  const sendTestMessage = async () => {
    if (!phoneNumber) {
      setResult({
        success: false,
        error: 'Por favor ingresa un número de teléfono'
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: phoneNumber,
          templateName: selectedTemplate.toLowerCase(),
          templateData: getTestData(selectedTemplate)
        })
      })

      const data = await response.json()
      setResult(data)

    } catch (error) {
      setResult({
        success: false,
        error: 'Error al enviar mensaje de prueba'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '')
    
    // Format as Mexican phone number
    if (cleaned.length === 10) {
      return `+52 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }
    return phone
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Enviar Mensaje de Prueba</h3>
        <p className="text-gray-600">
          Envía un mensaje de prueba a tu teléfono para verificar que la configuración de WhatsApp funciona correctamente.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Teléfono (México)
            </label>
            <Input
              placeholder="2221234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="max-w-sm"
            />
            <p className="text-sm text-gray-500 mt-1">
              Formato: 10 dígitos sin espacios ni guiones
            </p>
            {phoneNumber && (
              <p className="text-sm text-gray-600 mt-1">
                Se enviará a: {formatPhoneNumber(phoneNumber)}
              </p>
            )}
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template de Prueba
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md max-w-sm"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Send Button */}
          <div>
            <Button
              onClick={sendTestMessage}
              disabled={isLoading || !phoneNumber}
            >
              {isLoading ? 'Enviando...' : 'Enviar Mensaje de Prueba'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Result */}
      {result && (
        <Card className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Resultado del Envío</h4>
          
          {result.success ? (
            <div className="space-y-3">
              <Alert className="border-green-200 bg-green-50">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-green-800">
                    Mensaje enviado exitosamente
                  </span>
                </div>
              </Alert>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-2">Detalles:</h5>
                <div className="space-y-1 text-sm">
                  <p><strong>Message SID:</strong> {result.messageSid}</p>
                  <p><strong>Estado:</strong> {result.status}</p>
                  <p><strong>Destinatario:</strong> {formatPhoneNumber(phoneNumber)}</p>
                  <p><strong>Template:</strong> {templates.find(t => t.id === selectedTemplate)?.name}</p>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  ⏱️ El mensaje puede tardar algunos minutos en llegar. 
                  Verifica que el número tenga WhatsApp activo.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Alert className="border-red-200 bg-red-50">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">!</span>
                  <span className="text-red-800">
                    Error al enviar mensaje
                  </span>
                </div>
              </Alert>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-2">Error:</h5>
                <p className="text-sm text-red-600">{result.error}</p>
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>Posibles causas:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Configuración incorrecta de Twilio</li>
                  <li>Número de teléfono inválido</li>
                  <li>Templates no aprobados por WhatsApp</li>
                  <li>Límites de rate limiting alcanzados</li>
                </ul>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Configuration Check */}
      <Card className="p-6">
        <h4 className="font-medium text-gray-900 mb-4">Verificación de Configuración</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Twilio Account SID</span>
            <span className={`text-sm ${process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID ? 'text-green-600' : 'text-red-600'}`}>
              {process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID ? 'Configurado' : 'No configurado'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">WhatsApp Number</span>
            <span className={`text-sm ${process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER ? 'text-green-600' : 'text-red-600'}`}>
              {process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER ? 'Configurado' : 'No configurado'}
            </span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Para que los mensajes funcionen en producción, necesitas:
          </p>
          <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
            <li>Cuenta de Twilio WhatsApp Business aprobada</li>
            <li>Templates pre-aprobados por WhatsApp</li>
            <li>Configuración correcta de webhooks</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}