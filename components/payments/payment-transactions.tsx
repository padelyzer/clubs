'use client'

import { useEffect, useState } from 'react'

interface Transaction {
  id: string
  bookingId: string
  playerName: string
  amount: number
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  method: 'STRIPE' | 'OXXO' | 'SPEI'
  applicationFee: number
  netAmount: number
  createdAt: string
  completedAt?: string
  courtName: string
  stripeChargeId?: string
}

interface PaymentTransactionsProps {
  clubId: string
}

const statusColors = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

const methodIcons = {
  STRIPE: '💳',
  OXXO: '🏪',
  SPEI: '🏦',
}

export default function PaymentTransactions({ clubId }: PaymentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')

  useEffect(() => {
    fetchTransactions()
  }, [clubId, filter, sortBy])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      // Mock data for now - in real implementation, fetch from API
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          bookingId: 'book_123',
          playerName: 'Juan Pérez',
          amount: 40000, // $400 MXN in cents
          status: 'completed',
          method: 'STRIPE',
          applicationFee: 1000, // $10 MXN commission
          netAmount: 39000,
          createdAt: '2024-01-15T10:30:00Z',
          completedAt: '2024-01-15T10:31:15Z',
          courtName: 'Cancha 1',
          stripeChargeId: 'ch_123abc',
        },
        {
          id: '2',
          bookingId: 'book_124',
          playerName: 'María González',
          amount: 35000,
          status: 'pending',
          method: 'OXXO',
          applicationFee: 875,
          netAmount: 34125,
          createdAt: '2024-01-15T08:15:00Z',
          courtName: 'Cancha 2',
        },
        {
          id: '3',
          bookingId: 'book_125',
          playerName: 'Carlos López',
          amount: 45000,
          status: 'completed',
          method: 'STRIPE',
          applicationFee: 1125,
          netAmount: 43875,
          createdAt: '2024-01-14T16:45:00Z',
          completedAt: '2024-01-14T16:46:22Z',
          courtName: 'Cancha 1',
          stripeChargeId: 'ch_456def',
        },
        {
          id: '4',
          bookingId: 'book_126',
          playerName: 'Ana Martínez',
          amount: 38000,
          status: 'failed',
          method: 'STRIPE',
          applicationFee: 950,
          netAmount: 37050,
          createdAt: '2024-01-14T12:20:00Z',
          courtName: 'Cancha 3',
        },
        {
          id: '5',
          bookingId: 'book_127',
          playerName: 'Roberto Silva',
          amount: 42000,
          status: 'completed',
          method: 'SPEI',
          applicationFee: 1050,
          netAmount: 40950,
          createdAt: '2024-01-13T14:30:00Z',
          completedAt: '2024-01-13T15:45:18Z',
          courtName: 'Cancha 2',
        },
      ]

      // Apply filters
      let filteredTransactions = mockTransactions
      if (filter !== 'all') {
        filteredTransactions = mockTransactions.filter(t => t.status === filter)
      }

      // Apply sorting
      if (sortBy === 'date') {
        filteredTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      } else {
        filteredTransactions.sort((a, b) => b.amount - a.amount)
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setTransactions(filteredTransactions)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      completed: 'Completado',
      pending: 'Pendiente',
      failed: 'Fallido',
      refunded: 'Reembolsado',
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const exportTransactions = () => {
    // In real implementation, this would generate and download a CSV/Excel file
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Fecha,Jugador,Cancha,Monto,Comisión,Neto,Estado,Método\n" +
      transactions.map(t => 
        `${t.id},${formatDate(t.createdAt)},${t.playerName},${t.courtName},${formatCurrency(t.amount)},${formatCurrency(t.applicationFee)},${formatCurrency(t.netAmount)},${getStatusText(t.status)},${t.method}`
      ).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `transacciones_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Transacciones Recientes</h2>
          <button
            onClick={exportTransactions}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
          >
            Exportar
          </button>
        </div>
        
        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Estado:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="all">Todos</option>
              <option value="completed">Completados</option>
              <option value="pending">Pendientes</option>
              <option value="failed">Fallidos</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="date">Fecha</option>
              <option value="amount">Monto</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transacción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jugador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cancha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comisión
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Neto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      #{transaction.id.substring(0, 8)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.playerName}
                  </div>
                  <div className="text-sm text-gray-500">
                    Reserva #{transaction.bookingId.substring(5, 13)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.courtName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(transaction.applicationFee)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {formatCurrency(transaction.netAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[transaction.status]}`}>
                    {getStatusText(transaction.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-2">{methodIcons[transaction.method]}</span>
                    <span className="text-sm text-gray-900">{transaction.method}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay transacciones</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? 'No se han encontrado transacciones.' 
              : `No hay transacciones con estado "${getStatusText(filter)}".`
            }
          </p>
        </div>
      )}
    </div>
  )
}