import React, { useState } from 'react'
import { DollarSign, CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react'
import { AppleModal } from '@/components/design-system/AppleModal'
import { AppleButton } from '@/components/design-system/AppleButton'
import { useNotify } from '@/contexts/NotificationContext'
import { formatCurrency } from '@/lib/design-system/localization'

type PaymentModalProps = {
  bookingId: string
  studentName: string
  dueAmount: number
  className: string
  onClose: () => void
  onSuccess: () => void
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo', icon: Banknote, color: 'green' },
  { value: 'transfer', label: 'Transferencia', icon: Building2, color: 'blue' },
  { value: 'terminal', label: 'Terminal', icon: CreditCard, color: 'purple' },
  { value: 'online', label: 'En línea', icon: Smartphone, color: 'orange' }
]

export function PaymentModal({
  bookingId,
  studentName,
  dueAmount,
  className,
  onClose,
  onSuccess
}: PaymentModalProps) {
  const notify = useNotify()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(dueAmount)
  const [method, setMethod] = useState<'cash' | 'transfer' | 'terminal' | 'online'>('cash')
  const [reference, setReference] = useState('')
  const [sendReceipt, setSendReceipt] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (amount <= 0) {
      notify.error({
        title: 'Error',
        message: 'El monto debe ser mayor a 0',
        duration: 4000
      })
      return
    }

    if (amount > dueAmount) {
      if (!confirm(`El monto (${formatCurrency(amount / 100)}) es mayor al adeudo (${formatCurrency(dueAmount / 100)}). ¿Continuar?`)) {
        return
      }
    }

    try {
      setLoading(true)

      const response = await fetch('/api/classes/pending-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount,
          method,
          reference: reference || undefined,
          sendReceipt
        })
      })

      const data = await response.json()

      if (data.success) {
        notify.success({
          title: 'Pago registrado',
          message: data.paymentComplete
            ? 'Pago completo registrado exitosamente'
            : 'Pago parcial registrado exitosamente',
          duration: 5000
        })
        onSuccess()
        onClose()
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'Error al registrar pago',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error registering payment:', error)
      notify.error({
        title: 'Error',
        message: 'Error al registrar pago',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppleModal
      isOpen={true}
      onClose={onClose}
      title="Registrar Pago"
      subtitle={`${studentName} - ${className}`}
      size="medium"
    >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Class Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700 font-medium">{className}</p>
            <p className="text-xs text-blue-600 mt-1">
              Total adeudado: {formatCurrency(dueAmount / 100)}
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto a pagar *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={amount / 100}
                onChange={(e) => setAmount(Math.round(parseFloat(e.target.value || '0') * 100))}
                step="0.01"
                min="0"
                required
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setAmount(dueAmount)}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Pago completo
              </button>
              <button
                type="button"
                onClick={() => setAmount(Math.round(dueAmount / 2))}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                50%
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Método de pago *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((pm) => {
                const Icon = pm.icon
                const isSelected = method === pm.value
                return (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setMethod(pm.value as any)}
                    className={`p-3 border-2 rounded-lg flex items-center gap-2 transition-all ${
                      isSelected
                        ? `border-${pm.color}-500 bg-${pm.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? `text-${pm.color}-600` : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                      {pm.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Reference */}
          {(method === 'transfer' || method === 'online') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referencia / Folio {method === 'transfer' && '(opcional)'}
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 1234567890"
              />
            </div>
          )}

          {/* Send Receipt */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="sendReceipt"
              checked={sendReceipt}
              onChange={(e) => setSendReceipt(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="sendReceipt" className="text-sm text-gray-700 cursor-pointer">
              Enviar recibo por WhatsApp
            </label>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Adeudo actual:</span>
              <span className="font-medium text-gray-900">{formatCurrency(dueAmount / 100)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pago a registrar:</span>
              <span className="font-medium text-green-600">{formatCurrency(amount / 100)}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 flex justify-between">
              <span className="text-sm font-medium text-gray-700">Saldo restante:</span>
              <span className={`font-bold ${dueAmount - amount <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {formatCurrency(Math.max(0, (dueAmount - amount)) / 100)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <AppleButton
              type="button"
              variant="secondary"
              onClick={onClose}
              fullWidth
            >
              Cancelar
            </AppleButton>
            <AppleButton
              type="submit"
              variant="primary"
              loading={loading}
              fullWidth
            >
              Registrar Pago
            </AppleButton>
          </div>
        </form>
    </AppleModal>
  )
}
