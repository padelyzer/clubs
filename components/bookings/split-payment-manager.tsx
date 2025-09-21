'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface SplitPayment {
  id: string
  playerName: string
  playerEmail: string
  playerPhone: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  completedAt?: string
  stripeChargeId?: string
  paymentLink?: string
}

interface SplitPaymentStatus {
  booking: {
    id: string
    date: string
    startTime: string
    endTime: string
    club: {
      name: string
    }
    court: {
      name: string
    }
    playerName: string
    totalPlayers: number
    price: number
    paymentStatus: string
  }
  splitPayments: SplitPayment[]
  totalPayments: number
  completedPayments: number
  pendingPayments: number
  totalAmount: number
  completedAmount: number
  pendingAmount: number
}

interface SplitPaymentManagerProps {
  bookingId: string
  onClose?: () => void
}

export function SplitPaymentManager({ bookingId, onClose }: SplitPaymentManagerProps) {
  const [status, setStatus] = useState<SplitPaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showGenerateLinks, setShowGenerateLinks] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [bookingId])

  async function fetchStatus() {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/split-payments`)
      const data = await response.json()

      if (data.success) {
        setStatus(data.status)
        setShowGenerateLinks(data.status.splitPayments.length === 0)
      } else {
        setError(data.error || 'Error al cargar datos')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function generateSplitPayments() {
    setActionLoading('generate')
    setError(null)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/split-payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        await fetchStatus()
        setShowGenerateLinks(false)
      } else {
        setError(data.error || 'Error al generar pagos divididos')
      }
    } catch (err) {
      setError('Error al generar pagos divididos')
    } finally {
      setActionLoading(null)
    }
  }

  async function resendNotification(splitPaymentId: string) {
    setActionLoading(`resend-${splitPaymentId}`)
    setError(null)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/split-payments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          splitPaymentId,
          action: 'resend'
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Mostrar confirmación temporal
        setTimeout(() => {
          setActionLoading(null)
        }, 2000)
      } else {
        setError(data.error || 'Error al reenviar notificación')
        setActionLoading(null)
      }
    } catch (err) {
      setError('Error al reenviar notificación')
      setActionLoading(null)
    }
  }

  async function markAsCompleted(splitPaymentId: string, paymentMethod: string = 'manual') {
    setActionLoading(`complete-${splitPaymentId}`)
    setError(null)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/split-payments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          splitPaymentId,
          action: 'complete',
          paymentMethod,
          referenceNumber: `MANUAL_${Date.now().toString().slice(-6)}`
        }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchStatus()
      } else {
        setError(data.error || 'Error al marcar como completado')
      }
    } catch (err) {
      setError('Error al marcar como completado')
    } finally {
      setActionLoading(null)
    }
  }

  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'processing': return '⏳'
      case 'failed': return '❌'
      default: return '⏸️'
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
          <div className="text-center text-red-600 mb-4">
            {error || 'Error al cargar información'}
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pagos Divididos</h2>
              <p className="text-sm text-gray-500">
                {status.booking.club.name} • {status.booking.court.name} • {' '}
                {format(new Date(status.booking.date), 'PPP', { locale: es })} {status.booking.startTime} - {status.booking.endTime}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progreso de pagos: {status.completedPayments}/{status.totalPayments}
            </span>
            <span className="text-sm text-gray-500">
              ${formatAmount(status.completedAmount)} / ${formatAmount(status.totalAmount)} MXN
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${status.totalPayments > 0 ? (status.completedPayments / status.totalPayments) * 100 : 0}%`
              }}
            ></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {showGenerateLinks ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Generar Pagos Divididos
                </h3>
                <p className="text-gray-600 mb-4">
                  Esta reserva será dividida en 4 pagos iguales de ${formatAmount(status.booking.price / 4)} MXN cada uno.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">¿Cómo funciona?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Se generan 4 links de pago únicos</li>
                    <li>• Cada jugador paga su parte por separado</li>
                    <li>• La reserva se confirma cuando todos paguen</li>
                    <li>• Se envían notificaciones automáticas por WhatsApp</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={generateSplitPayments}
                disabled={actionLoading === 'generate'}
                className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'generate' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generando...
                  </span>
                ) : (
                  '🚀 Generar Pagos Divididos'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {status.splitPayments.map((payment, index) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{payment.playerName}</h4>
                        <div className="text-xs text-gray-500">
                          {payment.playerEmail && <div>{payment.playerEmail}</div>}
                          {payment.playerPhone && <div>{payment.playerPhone}</div>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${formatAmount(payment.amount)} MXN
                        </div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)} {payment.status === 'completed' ? 'Pagado' : payment.status === 'processing' ? 'Procesando' : payment.status === 'failed' ? 'Falló' : 'Pendiente'}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => resendNotification(payment.id)}
                              disabled={actionLoading === `resend-${payment.id}`}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                            >
                              {actionLoading === `resend-${payment.id}` ? '⏳' : '📧'} Reenviar
                            </button>
                            <button
                              onClick={() => markAsCompleted(payment.id)}
                              disabled={actionLoading === `complete-${payment.id}`}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50"
                            >
                              {actionLoading === `complete-${payment.id}` ? '⏳' : '✅'} Marcar Pagado
                            </button>
                          </>
                        )}
                        {payment.status === 'completed' && payment.completedAt && (
                          <div className="text-xs text-gray-500">
                            {format(new Date(payment.completedAt), 'dd/MM/yy HH:mm')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {payment.paymentLink && payment.status === 'pending' && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium text-gray-700 mb-1">Link de pago:</div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={payment.paymentLink}
                          readOnly
                          className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(payment.paymentLink!)}
                          className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-xs"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {status.completedPayments === status.totalPayments ? (
                <span className="text-green-600 font-medium">✅ Todos los pagos completados</span>
              ) : (
                <span>
                  Faltan {status.totalPayments - status.completedPayments} pagos por completar
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}