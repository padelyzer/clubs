'use client'

import { useState } from 'react'
import {
  DollarSign,
  CreditCard,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  Send,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Plus,
  Filter,
  Search,
  Calendar
} from 'lucide-react'
import InvoiceModal from './invoice-modal'
import RevenueChart from './revenue-chart'

interface BillingStats {
  totalRevenue: number
  monthRevenue: number
  lastMonthRevenue: number
  yearRevenue: number
  pendingPayments: number
  averageTransaction: number
  growthRate: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  invoicesThisMonth: number
  invoicesLastMonth: number
}

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

interface RevenueData {
  month: string
  revenue: number
  invoices: number
  date: Date
}

interface PaymentBreakdown {
  paid: { count: number; percentage: number }
  pending: { count: number; percentage: number }
  failed: { count: number; percentage: number }
  cancelled: { count: number; percentage: number }
}

interface BillingDashboardProps {
  stats: BillingStats
  invoices: Invoice[]
  revenueData: RevenueData[]
  paymentBreakdown: PaymentBreakdown
}

export default function BillingDashboard({
  stats,
  invoices,
  revenueData,
  paymentBreakdown
}: BillingDashboardProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<string>('all')

  const formatPrice = (price: number, currency: string = 'MXN') => {
    return (price).toLocaleString('es-MX', {
      style: 'currency',
      currency: currency
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-gray-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
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

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsModalOpen(true)
  }

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/send`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Error al enviar la factura')
      }

      alert('Factura enviada exitosamente')
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al enviar la factura')
    }
  }

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/mark-paid`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Error al marcar como pagado')
      }

      alert('Factura marcada como pagada')
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al marcar la factura como pagada')
    }
  }

  const handleExportInvoices = async () => {
    try {
      const response = await fetch('/api/admin/invoices/export', {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Error al exportar facturas')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facturas_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al exportar facturas')
    }
  }

  // Filter invoices based on search and filters
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || invoice.status.toLowerCase() === filterStatus.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Revenue Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Ingresos Totales',
            value: formatPrice(stats.totalRevenue),
            icon: <DollarSign className="w-5 h-5" />,
            bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
            iconColor: 'text-green-600',
            borderColor: 'border-green-300 shadow-lg shadow-green-100'
          },
          {
            label: 'Ingresos del Mes',
            value: formatPrice(stats.monthRevenue),
            subtitle: `${stats.growthRate >= 0 ? '+' : ''}${stats.growthRate.toFixed(1)}% vs mes anterior`,
            icon: stats.growthRate >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />,
            bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
            iconColor: stats.growthRate >= 0 ? 'text-blue-600' : 'text-red-600',
            borderColor: 'border-blue-300 shadow-lg shadow-blue-100'
          },
          {
            label: 'Pagos Pendientes',
            value: formatPrice(stats.pendingPayments),
            subtitle: `${stats.pendingInvoices} facturas`,
            icon: <Clock className="w-5 h-5" />,
            bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
            iconColor: 'text-yellow-600',
            borderColor: 'border-yellow-300 shadow-lg shadow-yellow-100'
          },
          {
            label: 'Transacción Promedio',
            value: formatPrice(stats.averageTransaction),
            subtitle: `${stats.totalInvoices} facturas totales`,
            icon: <CreditCard className="w-5 h-5" />,
            bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
            iconColor: 'text-purple-600',
            borderColor: 'border-purple-300 shadow-lg shadow-purple-100'
          }
        ].map((metric, index) => (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
              metric.borderColor
            } ${metric.bgColor}`}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-white/80 ${metric.iconColor}`}>
                  {metric.icon}
                </div>
                <div className="text-2xl font-bold text-gray-800">{metric.value}</div>
              </div>
              <div className="text-sm font-medium text-gray-600 mb-1">{metric.label}</div>
              {metric.subtitle && (
                <div className="text-xs text-gray-500">{metric.subtitle}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Tendencia de Ingresos</h2>
        </div>
        <RevenueChart data={revenueData} />
      </div>

      {/* Payment Status Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-green-600">{paymentBreakdown.paid.count}</div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-sm font-medium text-gray-600">Pagadas</div>
          <div className="text-xs text-gray-500">{paymentBreakdown.paid.percentage}% del total</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-yellow-600">{paymentBreakdown.pending.count}</div>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-sm font-medium text-gray-600">Pendientes</div>
          <div className="text-xs text-gray-500">{paymentBreakdown.pending.percentage}% del total</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-red-600">{paymentBreakdown.failed.count}</div>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-sm font-medium text-gray-600">Fallidas</div>
          <div className="text-xs text-gray-500">{paymentBreakdown.failed.percentage}% del total</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-gray-600">{paymentBreakdown.cancelled.count}</div>
            <XCircle className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-sm font-medium text-gray-600">Canceladas</div>
          <div className="text-xs text-gray-500">{paymentBreakdown.cancelled.percentage}% del total</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Facturas Recientes</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportInvoices}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nueva Factura
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar facturas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="paid">Pagadas</option>
              <option value="pending">Pendientes</option>
              <option value="failed">Fallidas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wider">Factura</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wider">Club</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wider">Estado</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wider">Monto</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wider">Vencimiento</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.slice(0, 20).map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group">
                  <td className="py-5 px-6">
                    <div>
                      <div className="font-semibold text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(invoice.createdAt).toLocaleDateString('es-MX')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {invoice.subscription.plan.displayName}
                      </div>
                    </div>
                  </td>

                  <td className="py-5 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{invoice.club.name}</div>
                      <div className="text-sm text-gray-600">{invoice.club.email}</div>
                      <div className="text-xs text-gray-500">{invoice.club.city}, {invoice.club.state}</div>
                    </div>
                  </td>

                  <td className="py-5 px-6 text-center">
                    <span className={getStatusBadge(invoice.status)}>
                      {getStatusIcon(invoice.status)}
                      {invoice.status}
                    </span>
                  </td>

                  <td className="py-5 px-6 text-center">
                    <div>
                      <div className="font-bold text-gray-900">
                        {formatPrice(invoice.total / 100, invoice.currency)}
                      </div>
                      {invoice.tax > 0 && (
                        <div className="text-xs text-gray-500">
                          + {formatPrice(invoice.tax / 100, invoice.currency)} IVA
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-5 px-6 text-center">
                    <div className="text-sm">
                      <div className={`font-medium ${
                        new Date(invoice.dueDate) < new Date() && invoice.status === 'PENDING' 
                          ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {new Date(invoice.dueDate).toLocaleDateString('es-MX')}
                      </div>
                      {new Date(invoice.dueDate) < new Date() && invoice.status === 'PENDING' && (
                        <div className="text-xs text-red-500">Vencida</div>
                      )}
                    </div>
                  </td>

                  <td className="py-5 px-6">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => handleViewInvoice(invoice)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group relative"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Ver detalles</span>
                      </button>
                      
                      <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer">
                          <MoreHorizontal className="w-4 h-4" />
                        </label>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-white border border-gray-100 rounded-xl w-52">
                          <li>
                            <button 
                              onClick={() => handleSendInvoice(invoice.id)}
                              className="flex items-center gap-3 px-4 py-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            >
                              <Send className="w-4 h-4" />
                              <span className="font-medium">Enviar factura</span>
                            </button>
                          </li>
                          {invoice.status === 'PENDING' && (
                            <li>
                              <button 
                                onClick={() => handleMarkAsPaid(invoice.id)}
                                className="flex items-center gap-3 px-4 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span className="font-medium">Marcar como pagado</span>
                              </button>
                            </li>
                          )}
                          <li>
                            <button className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200">
                              <Download className="w-4 h-4" />
                              <span className="font-medium">Descargar PDF</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron facturas</p>
          </div>
        )}

        {filteredInvoices.length > 20 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Ver todas las facturas ({filteredInvoices.length})
            </button>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {isModalOpen && selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedInvoice(null)
          }}
          onSend={() => handleSendInvoice(selectedInvoice.id)}
          onMarkPaid={() => handleMarkAsPaid(selectedInvoice.id)}
        />
      )}
    </div>
  )
}