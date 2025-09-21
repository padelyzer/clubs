'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

const templates = [
  {
    id: 'BOOKING_CONFIRMATION',
    name: 'Confirmación de Reserva',
    variables: ['playerName', 'clubName', 'courtName', 'bookingDate', 'bookingTime', 'totalPrice', 'paymentMethod']
  },
  {
    id: 'BOOKING_REMINDER',
    name: 'Recordatorio',
    variables: ['playerName', 'clubName', 'courtName', 'timeRemaining', 'clubAddress']
  },
  {
    id: 'PAYMENT_PENDING',
    name: 'Pago Pendiente',
    variables: ['playerName', 'organizerName', 'clubName', 'bookingDate', 'amount', 'paymentLink']
  },
  {
    id: 'PAYMENT_COMPLETED',
    name: 'Pago Completado',
    variables: ['playerName', 'clubName', 'bookingDate', 'bookingTime', 'paymentStatus']
  },
  {
    id: 'BOOKING_CANCELLED',
    name: 'Cancelación',
    variables: ['playerName', 'clubName', 'bookingDate', 'bookingTime', 'refundInfo']
  }
]

export function TemplatePreview() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [templateData, setTemplateData] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleVariableChange = (variable: string, value: string) => {
    setTemplateData(prev => ({
      ...prev,
      [variable]: value
    }))
  }

  const generatePreview = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/whatsapp/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateType: selectedTemplate.id,
          data: templateData
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setPreview(result.preview)
      } else {
        setPreview(`Error: ${result.error}`)
      }
    } catch (error) {
      setPreview('Error al generar preview')
    } finally {
      setIsLoading(false)
    }
  }

  const getPlaceholderValue = (variable: string) => {
    const placeholders: Record<string, string> = {
      playerName: 'Juan Pérez',
      clubName: 'Club Padel Elite',
      courtName: 'Cancha 1',
      bookingDate: '15/12/2024',
      bookingTime: '18:00',
      totalPrice: '400.00',
      paymentMethod: 'Pago dividido',
      timeRemaining: '2 horas',
      clubAddress: 'Av. Juárez 123, Puebla',
      organizerName: 'María González',
      amount: '100.00',
      paymentLink: 'https://padelyzer.com/pay/abc123',
      paymentStatus: 'Pagado',
      refundInfo: 'Reembolso procesándose en 3-5 días'
    }
    return placeholders[variable] || ''
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview de Templates</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Selection and Variables */}
        <Card className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Configuración</h4>
          
          {/* Template Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Template
            </label>
            <select
              value={selectedTemplate.id}
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value)!
                setSelectedTemplate(template)
                setTemplateData({})
                setPreview('')
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Variables */}
          <div className="space-y-4 mb-6">
            <h5 className="font-medium text-gray-700">Variables del Template</h5>
            {selectedTemplate.variables.map((variable) => (
              <div key={variable}>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {variable}
                </label>
                <Input
                  placeholder={getPlaceholderValue(variable)}
                  value={templateData[variable] || ''}
                  onChange={(e) => handleVariableChange(variable, e.target.value)}
                />
              </div>
            ))}
          </div>

          <Button 
            onClick={generatePreview}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Generando...' : 'Generar Preview'}
          </Button>
        </Card>

        {/* Preview */}
        <Card className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Preview del Mensaje</h4>
          
          <div className="bg-gray-50 rounded-lg p-4 min-h-[300px]">
            {preview ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-green-600">•</span>
                  <span className="text-sm text-gray-600">WhatsApp Business</span>
                </div>
                
                <div className="bg-white rounded-lg p-3 shadow-sm max-w-sm">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-medium">
                    {preview}
                  </pre>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  Este es un preview del mensaje. El formato real puede variar en WhatsApp.
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">•</span>
                  <p>Selecciona un template y completa las variables para ver el preview</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}