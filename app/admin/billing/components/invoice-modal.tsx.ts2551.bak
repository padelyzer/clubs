'use client'

import { useState } from 'react'
import {
  X,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Download,
  Clock,
  Building2,
  Calendar,
  DollarSign,
  Info,
  AlertCircle,
  CreditCard,
  Eye
} from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  tax: number
  total: number
  currency: string
  status: string
  dueDate: Date
  paidAt: Date | null
  billingPeriodStart: Date
  billingPeriodEnd: Date
  createdAt: Date
  items?: any
  club: {
    id: string
    name: string
    email: string
    city: string
    state: string
    status: string
  }
  subscription: {
    id: string
    status: string
    plan: {
      name: string
      displayName: string
      price: number
    }
  }
}

interface InvoiceModalProps {
  invoice: Invoice
  onClose: () => void
  onSend: () => void
  onMarkPaid: () => void
}

export default function InvoiceModal({ invoice, onClose, onSend, onMarkPaid }: InvoiceModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const formatPrice = (price: number, currency: string = 'MXN') => {
    return (price).toLocaleString('es-MX', {
      style: 'currency',
      currency: currency
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-gray-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2"
    switch (status.toUpperCase()) {
      case 'PAID':
        return `${baseClasses} bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300`
      case 'PENDING':
        return `${baseClasses} bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300`
      case 'FAILED':
        return `${baseClasses} bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300`
      case 'CANCELLED':
        return `${baseClasses} bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300`
      default:
        return `${baseClasses} bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300`
    }
  }

  const handleSend = async () => {
    setIsProcessing(true)
    try {
      await onSend()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMarkPaid = async () => {
    setIsProcessing(true)
    try {
      await onMarkPaid()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadPDF = () => {
    // Generate PDF functionality
    alert('Funcionalidad de PDF en desarrollo')
  }

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status === 'PENDING'

  // Parse items or create default structure
  const invoiceItems = invoice.items ? 
    (Array.isArray(invoice.items) ? invoice.items : [invoice.items]) : 
    [{
      description: `Plan ${invoice.subscription.plan.displayName}`,
      quantity: 1,
      price: invoice.amount,
      total: invoice.amount
    }]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Factura {invoice.invoiceNumber}
                </h2>
                <p className="text-gray-600">
                  Creada el {new Date(invoice.createdAt).toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-all duration-200"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <span className={getStatusBadge(invoice.status)}>
                {getStatusIcon(invoice.status)}
                {invoice.status}
              </span>
              {isOverdue && (
                <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Vencida
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
              {invoice.status === 'PENDING' && (
                <>
                  <button
                    onClick={handleSend}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {isProcessing ? 'Enviando...' : 'Enviar'}
                  </button>
                  <button
                    onClick={handleMarkPaid}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isProcessing ? 'Procesando...' : 'Marcar como Pagado'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Club Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Información del Club</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Nombre</div>
                  <div className="font-medium text-gray-900">{invoice.club.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium text-gray-900">{invoice.club.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Ubicación</div>
                  <div className="font-medium text-gray-900">{invoice.club.city}, {invoice.club.state}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Estado del Club</div>
                  <div className="font-medium text-gray-900">{invoice.club.status}</div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Información de Pago</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Fecha de Vencimiento</div>
                  <div className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                    {new Date(invoice.dueDate).toLocaleDateString('es-MX')}
                  </div>
                </div>
                {invoice.paidAt && (
                  <div>
                    <div className="text-sm text-gray-500">Fecha de Pago</div>
                    <div className="font-medium text-green-600">
                      {new Date(invoice.paidAt).toLocaleDateString('es-MX')}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">Período de Facturación</div>
                  <div className="font-medium text-gray-900">
                    {new Date(invoice.billingPeriodStart).toLocaleDateString('es-MX')} - {' '}
                    {new Date(invoice.billingPeriodEnd).toLocaleDateString('es-MX')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Info className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Detalles de la Factura</h3>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800 text-sm">Descripción</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-800 text-sm">Cantidad</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-800 text-sm">Precio Unitario</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-800 text-sm">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoiceItems.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {item.description || `Plan ${invoice.subscription.plan.displayName}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          Suscripción mensual
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="font-medium text-gray-900">{item.quantity || 1}</div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="font-medium text-gray-900">
                          {formatPrice((item.price || invoice.amount) / 100, invoice.currency)}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="font-bold text-gray-900">
                          {formatPrice((item.total || invoice.amount) / 100, invoice.currency)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-80 bg-gray-50 rounded-xl p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(invoice.amount / 100, invoice.currency)}
                    </span>
                  </div>
                  {invoice.tax > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">IVA (16%)</span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(invoice.tax / 100, invoice.currency)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(invoice.total / 100, invoice.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Detalles de la Suscripción</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Plan</div>
                <div className="font-medium text-gray-900">{invoice.subscription.plan.displayName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Estado</div>
                <div className="font-medium text-gray-900">{invoice.subscription.status}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Precio del Plan</div>
                <div className="font-medium text-gray-900">
                  {formatPrice(invoice.subscription.plan.price / 100, invoice.currency)}/mes
                </div>
              </div>
            </div>
          </div>

          {/* Payment History Note */}
          {invoice.status === 'PAID' && invoice.paidAt && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-semibold text-green-800">Factura Pagada</div>
                  <div className="text-sm text-green-600">
                    Pago procesado el {new Date(invoice.paidAt).toLocaleDateString('es-MX')} a las {' '}
                    {new Date(invoice.paidAt).toLocaleTimeString('es-MX')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}