'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface WidgetConfirmationProps {
  booking: {
    id: string
    playerName: string
    playerPhone: string
    date: string
    startTime: string
    duration: number
    court: {
      name: string
    }
    price: number
  }
  club: {
    name: string
    phone: string
    address: string
  }
  onClose: () => void
}

export function WidgetConfirmation({ booking, club, onClose }: WidgetConfirmationProps) {
  const [showDetails, setShowDetails] = useState(false)

  const bookingDate = new Date(booking.date)
  const endTime = calculateEndTime(booking.startTime, booking.duration)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Success Header */}
        <div className="bg-green-600 text-white p-6 rounded-t-lg text-center">
          <div className="text-4xl mb-3">✓</div>
          <h3 className="text-xl font-semibold">¡Reserva Confirmada!</h3>
          <p className="text-green-100 text-sm">Tu cancha está reservada</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Detalles de tu Reserva</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium">
                  {format(bookingDate, 'EEEE dd \'de\' MMMM', { locale: es })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hora:</span>
                <span className="font-medium">{booking.startTime} - {endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cancha:</span>
                <span className="font-medium">{booking.court.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duración:</span>
                <span className="font-medium">{booking.duration} minutos</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-green-600">${booking.price}</span>
              </div>
            </div>
          </div>

          {/* Player Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Organizador</h4>
            <div className="text-sm text-blue-800">
              <p><strong>Nombre:</strong> {booking.playerName}</p>
              <p><strong>Teléfono:</strong> {booking.playerPhone}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Información de Pago</h4>
            <p className="text-sm text-yellow-800">
              El pago se realiza directamente en el club al momento de llegar.
              Presenta esta confirmación al personal del club.
            </p>
          </div>

          {/* Club Info */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">{club.name}</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{club.address}</p>
              <a 
                href={`tel:${club.phone}`}
                className="text-green-600 hover:underline block"
              >
                {club.phone}
              </a>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Instrucciones</h4>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li>Llega 10 minutos antes de tu hora reservada</li>
              <li>Trae raquetas propias o réntalas en el club</li>
              <li>El pago se realiza en recepción</li>
              <li>Cancela con al menos 2 horas de anticipación</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
            >
              {showDetails ? 'Ocultar' : 'Ver'} código de reserva
            </button>

            {showDetails && (
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 mb-1">Código de reserva:</p>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {booking.id.slice(-8).toUpperCase()}
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function calculateEndTime(startTime: string, duration: number) {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + duration
  const endHours = Math.floor(totalMinutes / 60)
  const endMins = totalMinutes % 60
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
}