'use client'

interface SplitPayment {
  id: string
  playerName: string
  playerEmail?: string
  playerPhone: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  completedAt?: Date
}

interface PaymentStatusProps {
  booking: {
    id: string
    price: number
    currency: string
    splitPaymentEnabled: boolean
    splitPaymentCount: number
    paymentType: 'ONSITE' | 'ONLINE_FULL' | 'ONLINE_SPLIT'
    paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  }
  splitPayments?: SplitPayment[]
  onGeneratePaymentLinks?: (bookingId: string) => void
  onResendNotification?: (splitPaymentId: string) => void
  onMarkAsPaid?: (splitPaymentId: string) => void
  compact?: boolean
}

export function PaymentStatus({
  booking,
  splitPayments = [],
  onGeneratePaymentLinks,
  onResendNotification,
  onMarkAsPaid,
  compact = false
}: PaymentStatusProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price / 100)
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: 'Pend',
      processing: 'Proc',
      completed: 'OK',
      failed: 'X',
      cancelled: 'Canc'
    }
    return icons[status as keyof typeof icons] || '?'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      processing: 'text-blue-600 bg-blue-50 border-blue-200',
      completed: 'text-green-600 bg-green-50 border-green-200',
      failed: 'text-red-600 bg-red-50 border-red-200',
      cancelled: 'text-gray-600 bg-gray-50 border-gray-200'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      failed: 'Falló',
      cancelled: 'Cancelado'
    }
    return texts[status as keyof typeof texts] || 'Desconocido'
  }

  if (!booking.splitPaymentEnabled) {
    // Single payment display
    return (
      <div className={`${compact ? 'p-3' : 'p-4'} bg-white rounded-lg border border-gray-200`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">Pago Total</div>
            <div className="text-lg font-bold text-gray-900">{formatPrice(booking.price)}</div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.paymentStatus)}`}>
            <span className="mr-1">{getStatusIcon(booking.paymentStatus)}</span>
            {booking.paymentType === 'ONSITE' ? 'En sitio' : getStatusText(booking.paymentStatus)}
          </div>
        </div>
      </div>
    )
  }

  // Split payment display
  const completedPayments = splitPayments.filter(sp => sp.status === 'completed').length
  const totalAmount = booking.price
  const amountPerPlayer = Math.ceil(totalAmount / booking.splitPaymentCount)
  const isFullyPaid = completedPayments === booking.splitPaymentCount

  if (compact) {
    return (
      <div className="p-3 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">Pago Dividido</div>
            <div className="text-lg font-bold text-gray-900">
              {completedPayments}/{booking.splitPaymentCount} pagado
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
            isFullyPaid ? getStatusColor('completed') : getStatusColor('pending')
          }`}>
            <span className="mr-1">{isFullyPaid ? 'OK:' : 'Pago:'}</span>
            {isFullyPaid ? 'Completo' : 'Parcial'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pago Dividido</h3>
            <p className="text-sm text-gray-600">
              Total: {formatPrice(totalAmount)} • {formatPrice(amountPerPlayer)} por jugador
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full font-medium border ${
            isFullyPaid ? getStatusColor('completed') : getStatusColor('pending')
          }`}>
            <span className="mr-2">{isFullyPaid ? 'OK:' : 'Pago:'}</span>
            {completedPayments}/{booking.splitPaymentCount} pagado
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso de pago</span>
          <span className="text-sm text-gray-600">
            {Math.round((completedPayments / booking.splitPaymentCount) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isFullyPaid ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${(completedPayments / booking.splitPaymentCount) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Split Payments List */}
      <div className="divide-y divide-gray-200">
        {splitPayments.map((payment, index) => (
          <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      payment.status === 'completed' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {payment.playerName || `Jugador ${index + 1}`}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)} {getStatusText(payment.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      {payment.playerPhone && (
                        <span>Tel: {payment.playerPhone}</span>
                      )}
                      {payment.playerEmail && (
                        <span>Email: {payment.playerEmail}</span>
                      )}
                    </div>
                    
                    {payment.completedAt && (
                      <div className="text-xs text-green-600 mt-1">
                        Pagado el {new Date(payment.completedAt).toLocaleDateString('es-MX')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatPrice(payment.amount)}
                  </div>
                </div>
                
                {payment.status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    {onMarkAsPaid && (
                      <button
                        onClick={() => onMarkAsPaid(payment.id)}
                        className="btn-primary btn-sm"
                        title="Marcar como pagado"
                      >
                        Pagado
                      </button>
                    )}
                    {onResendNotification && (
                      <button
                        onClick={() => onResendNotification(payment.id)}
                        className="btn-secondary btn-sm"
                        title="Reenviar notificación de pago"
                      >
                        Reenviar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {!isFullyPaid && splitPayments.length === 0 && onGeneratePaymentLinks && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => onGeneratePaymentLinks(booking.id)}
            className="btn-primary w-full"
          >
            Generar Links de Pago
          </button>
          <p className="text-xs text-gray-600 mt-2 text-center">
            Se enviarán notificaciones por WhatsApp a cada jugador
          </p>
        </div>
      )}

      {isFullyPaid && (
        <div className="p-4 border-t border-gray-200 bg-green-50">
          <div className="text-center">
            <div className="text-green-600 font-medium">¡Pago completo!</div>
            <div className="text-sm text-green-700 mt-1">
              Todos los jugadores han completado su pago
            </div>
          </div>
        </div>
      )}
    </div>
  )
}