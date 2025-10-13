'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { BookingClientType } from '@/lib/types/booking'

// Use BookingClientType directly
type Booking = BookingClientType

interface BookingCardProps {
  booking: BookingClientType
  onCheckIn?: (bookingId: string) => void
  onEdit?: (booking: Booking) => void
  onCancel?: (bookingId: string) => void
  showActions?: boolean
  compact?: boolean
}

export function BookingCard({ 
  booking, 
  onCheckIn, 
  onEdit, 
  onCancel, 
  showActions = true,
  compact = false 
}: BookingCardProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckIn = async () => {
    if (!onCheckIn) return
    setLoading(true)
    try {
      await onCheckIn(booking.id)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: 'Pend', text: 'Pendiente' },
      CONFIRMED: { color: 'bg-green-100 text-green-800', icon: 'OK', text: 'Confirmada' },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', icon: 'Play', text: 'En Juego' },
      COMPLETED: { color: 'bg-gray-100 text-gray-800', icon: 'Done', text: 'Completada' },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: 'X', text: 'Cancelada' },
      NO_SHOW: { color: 'bg-orange-100 text-orange-800', icon: '?', text: 'No Show' }
    }

    const config = statusConfig[booking.status]
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    )
  }

  const getPaymentStatusBadge = () => {
    if (!booking.splitPaymentEnabled) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Pago en sitio
        </span>
      )
    }

    const progress = booking.splitPaymentProgress || 0
    const total = booking.splitPaymentCount
    const isComplete = booking.splitPaymentComplete

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        <span className="mr-1">{isComplete ? 'OK:' : 'Pago:'}</span>
        {progress}/{total} pagado
      </span>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price / 100)
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-gray-900">{booking.playerName}</span>
              {getStatusBadge()}
            </div>
            <div className="text-sm text-gray-600">
              {booking.court.name} • {booking.startTime} - {booking.endTime}
            </div>
          </div>
          
          {showActions && !booking.checkedIn && booking.status !== 'CANCELLED' && (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="btn-primary btn-sm"
            >
              {loading ? '...' : 'Check-in'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{booking.playerName}</h3>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              Cancha: {booking.court.name}
            </span>
            <span className="flex items-center">
              Fecha: {format(new Date(booking.date), 'eeee d MMMM', { locale: es })}
            </span>
            <span className="flex items-center">
              Hora: {booking.startTime} - {booking.endTime}
            </span>
          </div>
        </div>

        {booking.checkedIn && (
          <div className="text-right">
            <div className="text-sm font-medium text-green-600">Checked In</div>
            <div className="text-xs text-gray-500">
              {booking.checkedInAt && format(new Date(booking.checkedInAt), 'HH:mm')}
            </div>
          </div>
        )}
      </div>

      {/* Player Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono</label>
          <div className="text-sm text-gray-900">{booking.playerPhone}</div>
        </div>
        {booking.playerEmail && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
            <div className="text-sm text-gray-900">{booking.playerEmail}</div>
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Jugadores</label>
          <div className="text-sm text-gray-900">{booking.totalPlayers} personas</div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duración</label>
          <div className="text-sm text-gray-900">{booking.duration} min</div>
        </div>
      </div>

      {/* Payment & Price */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Precio</label>
          <div className="text-lg font-bold text-gray-900">{formatPrice(booking.price)}</div>
        </div>
        <div>
          {getPaymentStatusBadge()}
        </div>
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notas</label>
          <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mt-1">
            {booking.notes}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
          {!booking.checkedIn && booking.status !== 'CANCELLED' && (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Procesando...' : 'Check-in'}
            </button>
          )}
          
          {onEdit && booking.status !== 'CANCELLED' && (
            <button
              onClick={() => onEdit(booking)}
              className="btn-secondary"
            >
              Editar
            </button>
          )}
          
          {onCancel && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
            <button
              onClick={() => onCancel(booking.id)}
              className="btn-danger"
            >
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  )
}