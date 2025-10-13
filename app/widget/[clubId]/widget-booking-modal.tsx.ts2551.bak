'use client'

import { useState } from 'react'
import { createWidgetBooking } from './actions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, Loader2 } from 'lucide-react'
import { notify } from '@/components/ui/notification'
import { WidgetConfirmation } from '@/components/widget/widget-confirmation'

interface WidgetBookingModalProps {
  slot: {
    court: any
    date: Date
    time: string
  }
  club: any
  onClose: () => void
  onSuccess: () => void
  isEmbedded: boolean
}

export function WidgetBookingModal({ 
  slot, 
  club, 
  onClose, 
  onSuccess, 
  isEmbedded 
}: WidgetBookingModalProps) {
  const [loading, setLoading] = useState(false)
  const [confirmation, setConfirmation] = useState<any>(null)
  const [formData, setFormData] = useState({
    playerName: '',
    playerEmail: '',
    playerPhone: '',
    duration: 90,
    paymentType: 'FULL'
  })

  const price = calculatePrice(slot.court, slot.date, slot.time, formData.duration)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const bookingData = {
        clubSlug: club.slug,
        courtId: slot.court.id,
        date: slot.date.toISOString().split('T')[0],
        startTime: slot.time,
        duration: formData.duration,
        playerName: formData.playerName,
        playerEmail: formData.playerEmail,
        playerPhone: formData.playerPhone,
        paymentType: formData.paymentType
      }

      const result = await createWidgetBooking(bookingData)
      
      if (result.success) {
        setConfirmation(result.booking)
        notify.success('Reserva creada exitosamente')
        setLoading(false)
      } else {
        notify.error(result.error || 'Error al crear la reserva')
        setLoading(false)
      }
    } catch (error) {
      notify.error('Error al crear la reserva. Por favor intenta nuevamente.')
      setLoading(false)
    }
  }

  // Show confirmation modal if booking was successful
  if (confirmation) {
    return (
      <WidgetConfirmation
        booking={confirmation}
        club={club}
        onClose={() => {
          setConfirmation(null)
          onSuccess()
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Confirmar Reserva</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm space-y-1">
              <div><strong>Cancha:</strong> {slot.court.name}</div>
              <div><strong>Fecha:</strong> {format(slot.date, 'EEEE dd \'de\' MMMM', { locale: es })}</div>
              <div><strong>Hora:</strong> {slot.time}</div>
              <div><strong>Precio:</strong> <span className="text-green-600">${price}</span></div>
            </div>
          </div>

          {/* Player Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={formData.playerName}
              onChange={(e) => setFormData({...formData, playerName: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              required
              value={formData.playerPhone}
              onChange={(e) => setFormData({...formData, playerPhone: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="222-123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.playerEmail}
              onChange={(e) => setFormData({...formData, playerEmail: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="tu@email.com"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value={60}>1 hora</option>
              <option value={90}>1.5 horas</option>
              <option value={120}>2 horas</option>
            </select>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-2">Información de Pago</p>
              <p className="text-blue-800">
                El pago se realiza directamente en el club al momento de jugar.
                Tu reserva quedará confirmada al enviar este formulario.
              </p>
            </div>
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Cómo van a pagar?
            </label>
            <div className="space-y-2">
              <label className="flex items-start">
                <input
                  type="radio"
                  name="paymentType"
                  value="FULL"
                  checked={formData.paymentType === 'FULL'}
                  onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Una persona paga</div>
                  <div className="text-sm text-gray-600">
                    {formData.playerName || 'El organizador'} paga ${price} en el club
                  </div>
                </div>
              </label>
              
              <label className="flex items-start">
                <input
                  type="radio"
                  name="paymentType"
                  value="SPLIT"
                  checked={formData.paymentType === 'SPLIT'}
                  onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Dividir entre 4 jugadores</div>
                  <div className="text-sm text-gray-600">
                    Cada jugador paga ${Math.round(price / 4)} por separado
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Confirmando...' : 'Confirmar Reserva'}
            </button>
            
            <p className="text-xs text-gray-600 mt-2 text-center">
              Al confirmar aceptas los términos del club
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

function calculatePrice(court: any, date: Date, time: string, duration: number) {
  // Simplified calculation
  const basePrice = 500
  const hours = duration / 60
  return Math.round(basePrice * hours)
}