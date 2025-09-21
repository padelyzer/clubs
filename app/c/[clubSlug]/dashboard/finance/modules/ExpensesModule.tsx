'use client'

import React, { useState, useEffect } from 'react'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { 
  Plus, Search, Filter, Upload, Receipt,
  Building2, Zap, Wifi, Home, Wrench,
  AlertCircle, Check, X, Eye, Edit,
  Clock, DollarSign, TrendingDown, FileText, ChevronLeft
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface Expense {
  id: string
  category: string
  subcategory?: string
  description: string
  amount: number
  date: string
  vendor?: string
  invoiceNumber?: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  attachmentUrl?: string
  notes?: string
}

type ExpenseType = 'fixed' | 'variable' | 'pending'

interface ExpensesModuleProps {
  activeTab?: string
}

export default function ExpensesModule({ activeTab: initialTab }: ExpensesModuleProps) {
  const getTabFromProp = (tab?: string) => {
    if (tab === 'expenses-fixed') return 'fixed'
    if (tab === 'expenses-variable') return 'variable'
    if (tab === 'expenses-pending') return 'pending'
    return 'fixed'
  }
  
  const [activeTab, setActiveTab] = useState<ExpenseType>(
    getTabFromProp(initialTab)
  )
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  
  // Summary data
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    fixedExpenses: 0,
    variableExpenses: 0,
    pendingApproval: 0,
    monthlyAverage: 0
  })

  // Fixed expenses configuration
  const [fixedExpenses] = useState([
    { id: '1', name: 'Renta', amount: 2500000, dueDay: 1, category: 'RENT', icon: <Home className="w-4 h-4" /> },
    { id: '2', name: 'Electricidad', amount: 350000, dueDay: 15, category: 'UTILITIES', icon: <Zap className="w-4 h-4" /> },
    { id: '3', name: 'Internet', amount: 120000, dueDay: 10, category: 'UTILITIES', icon: <Wifi className="w-4 h-4" /> },
    { id: '4', name: 'Agua', amount: 80000, dueDay: 20, category: 'UTILITIES', icon: <Building2 className="w-4 h-4" /> },
    { id: '5', name: 'Mantenimiento', amount: 500000, dueDay: 25, category: 'MAINTENANCE', icon: <Wrench className="w-4 h-4" /> }
  ])

  // Form for new expense
  const [newExpense, setNewExpense] = useState({
    category: 'UTILITIES',
    subcategory: '',
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    vendor: '',
    invoiceNumber: '',
    notes: ''
  })

  useEffect(() => {
    loadExpensesData()
  }, [selectedPeriod, activeTab])

  const loadExpensesData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        period: selectedPeriod
      })

      if (activeTab === 'pending') {
        params.append('status', 'pending')
      }

      const response = await fetch(`/api/finance/expenses?${params}`)
      const data = await response.json()

      if (data.success) {
        setExpenses(data.expenses)
        setSummary(prev => ({
          ...prev,
          totalExpenses: data.summary.grandTotal,
          pendingApproval: data.summary.pendingCount,
          fixedExpenses: fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0),
          variableExpenses: data.summary.grandTotal - fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        }))
      }
    } catch (error) {
      console.error('Error loading expenses:', error)
      toast.error('Error al cargar gastos')
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async () => {
    try {
      const response = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          amount: parseInt(newExpense.amount) * 100 // Convert to cents
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Gasto registrado exitosamente')
        setShowAddModal(false)
        setNewExpense({
          category: 'UTILITIES',
          subcategory: '',
          description: '',
          amount: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          vendor: '',
          invoiceNumber: '',
          notes: ''
        })
        loadExpensesData()
      } else {
        toast.error(data.error || 'Error al registrar gasto')
      }
    } catch (error) {
      console.error('Error adding expense:', error)
      toast.error('Error al registrar gasto')
    }
  }

  const handleApproveExpense = async (expenseId: string) => {
    try {
      const response = await fetch('/api/finance/expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: expenseId,
          status: 'approved'
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Gasto aprobado')
        loadExpensesData()
      } else {
        toast.error(data.error || 'Error al aprobar gasto')
      }
    } catch (error) {
      console.error('Error approving expense:', error)
      toast.error('Error al aprobar gasto')
    }
  }

  const handleRejectExpense = async (expenseId: string) => {
    try {
      const response = await fetch('/api/finance/expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: expenseId,
          status: 'rejected'
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Gasto rechazado')
        loadExpensesData()
      } else {
        toast.error(data.error || 'Error al rechazar gasto')
      }
    } catch (error) {
      console.error('Error rejecting expense:', error)
      toast.error('Error al rechazar gasto')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'RENT': return <Home className="w-4 h-4" />
      case 'UTILITIES': return <Zap className="w-4 h-4" />
      case 'MAINTENANCE': return <Wrench className="w-4 h-4" />
      case 'SALARY': return <DollarSign className="w-4 h-4" />
      case 'MARKETING': return <TrendingDown className="w-4 h-4" />
      default: return <Receipt className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'paid': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'approved': return 'Aprobado'
      case 'rejected': return 'Rechazado'
      case 'paid': return 'Pagado'
      default: return status
    }
  }

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Gastos</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalExpenses / 100)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-200" />
            </div>
          </CardModernContent>
        </CardModern>

        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gastos Fijos</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.fixedExpenses / 100)}</p>
              </div>
              <Home className="w-8 h-8 text-gray-200" />
            </div>
          </CardModernContent>
        </CardModern>

        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gastos Variables</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.variableExpenses / 100)}
                </p>
              </div>
              <Receipt className="w-8 h-8 text-blue-200" />
            </div>
          </CardModernContent>
        </CardModern>

        <CardModern className="border-yellow-200 bg-yellow-50">
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Por Aprobar</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {summary.pendingApproval}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardModernContent>
        </CardModern>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <ButtonModern
          variant={activeTab === 'fixed' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('fixed')}
          className="flex-1"
        >
          Gastos Fijos
        </ButtonModern>
        <ButtonModern
          variant={activeTab === 'variable' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('variable')}
          className="flex-1"
        >
          Gastos Variables
        </ButtonModern>
        <ButtonModern
          variant={activeTab === 'pending' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('pending')}
          className="flex-1 relative"
        >
          Aprobaciones Pendientes
          {summary.pendingApproval > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {summary.pendingApproval}
            </span>
          )}
        </ButtonModern>
      </div>

      {/* Tab Content */}
      {activeTab === 'fixed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>Gastos Fijos Mensuales</CardModernTitle>
              <ButtonModern size="sm" variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Configurar
              </ButtonModern>
            </CardModernHeader>
            <CardModernContent>
              <div className="space-y-3">
                {fixedExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-white rounded-lg mr-3">
                        {expense.icon}
                      </div>
                      <div>
                        <p className="font-medium">{expense.name}</p>
                        <p className="text-xs text-gray-500">Vence el día {expense.dueDay}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(expense.amount / 100)}</p>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Activo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="font-medium">Total Mensual</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0) / 100)}
                  </span>
                </div>
              </div>
            </CardModernContent>
          </CardModern>

          <CardModern>
            <CardModernHeader>
              <CardModernTitle>Próximos Vencimientos</CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div className="space-y-3">
                {fixedExpenses
                  .sort((a, b) => a.dueDay - b.dueDay)
                  .slice(0, 3)
                  .map((expense) => {
                    const today = new Date().getDate()
                    const daysUntilDue = expense.dueDay - today
                    const isOverdue = daysUntilDue < 0
                    const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0
                    
                    return (
                      <div key={expense.id} className={`p-3 rounded-lg ${
                        isOverdue ? 'bg-red-50 border border-red-200' :
                        isDueSoon ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg mr-3 ${
                              isOverdue ? 'bg-red-100' :
                              isDueSoon ? 'bg-yellow-100' :
                              'bg-white'
                            }`}>
                              {expense.icon}
                            </div>
                            <div>
                              <p className="font-medium">{expense.name}</p>
                              <p className={`text-xs ${
                                isOverdue ? 'text-red-600' :
                                isDueSoon ? 'text-yellow-600' :
                                'text-gray-500'
                              }`}>
                                {isOverdue ? `Vencido hace ${Math.abs(daysUntilDue)} días` :
                                 daysUntilDue === 0 ? 'Vence hoy' :
                                 `Vence en ${daysUntilDue} días`}
                              </p>
                            </div>
                          </div>
                          <ButtonModern size="sm" variant={isOverdue ? 'primary' : 'outline'}>
                            Pagar
                          </ButtonModern>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardModernContent>
          </CardModern>
        </div>
      )}

      {activeTab === 'variable' && (
        <CardModern>
          <CardModernHeader>
            <CardModernTitle>Gastos Variables</CardModernTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <InputModern
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <ButtonModern onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Gasto
              </ButtonModern>
            </div>
          </CardModernHeader>
          <CardModernContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Fecha</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Descripción</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Proveedor</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Categoría</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-700">Monto</th>
                    <th className="text-center p-4 text-sm font-medium text-gray-700">Estado</th>
                    <th className="text-center p-4 text-sm font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses
                    .filter(e => e.status !== 'pending')
                    .map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <p className="text-sm">
                          {format(new Date(expense.date), 'dd MMM', { locale: es })}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium">{expense.description}</p>
                        {expense.invoiceNumber && (
                          <p className="text-xs text-gray-500">Factura: {expense.invoiceNumber}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{expense.vendor || '-'}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          {getCategoryIcon(expense.category)}
                          <span className="ml-2 text-sm">{expense.category}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-sm font-semibold text-red-600">
                          -{formatCurrency(expense.amount / 100)}
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                          {getStatusText(expense.status)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <ButtonModern
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedExpense(expense)}
                          >
                            <Eye className="w-4 h-4" />
                          </ButtonModern>
                          {expense.attachmentUrl && (
                            <ButtonModern
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(expense.attachmentUrl, '_blank')}
                            >
                              <FileText className="w-4 h-4" />
                            </ButtonModern>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardModernContent>
        </CardModern>
      )}

      {activeTab === 'pending' && (
        <div className="space-y-4">
          {filteredExpenses
            .filter(e => e.status === 'pending')
            .map((expense) => (
            <CardModern key={expense.id} className="border-yellow-200">
              <CardModernContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <h3 className="font-semibold text-lg">{expense.description}</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Fecha</p>
                        <p className="font-medium">
                          {format(new Date(expense.date), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Proveedor</p>
                        <p className="font-medium">{expense.vendor || 'No especificado'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Factura</p>
                        <p className="font-medium">{expense.invoiceNumber || 'Sin factura'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Monto</p>
                        <p className="font-bold text-lg text-red-600">
                          {formatCurrency(expense.amount / 100)}
                        </p>
                      </div>
                    </div>
                    {expense.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{expense.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <ButtonModern
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectExpense(expense.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rechazar
                    </ButtonModern>
                    <ButtonModern
                      size="sm"
                      onClick={() => handleApproveExpense(expense.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprobar
                    </ButtonModern>
                  </div>
                </div>
              </CardModernContent>
            </CardModern>
          ))}
          
          {filteredExpenses.filter(e => e.status === 'pending').length === 0 && (
            <CardModern>
              <CardModernContent className="p-12 text-center">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No hay gastos pendientes</h3>
                <p className="text-sm text-gray-500 mt-1">Todos los gastos han sido procesados</p>
              </CardModernContent>
            </CardModern>
          )}
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Registrar Nuevo Gasto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                >
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="UTILITIES">Servicios</option>
                  <option value="RENT">Renta</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="EQUIPMENT">Equipamiento</option>
                  <option value="OTHER">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <InputModern
                  type="text"
                  placeholder="Descripción del gasto"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto (MXN)
                </label>
                <InputModern
                  type="number"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <InputModern
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor (opcional)
                </label>
                <InputModern
                  type="text"
                  placeholder="Nombre del proveedor"
                  value={newExpense.vendor}
                  onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Factura (opcional)
                </label>
                <InputModern
                  type="text"
                  placeholder="Número de factura"
                  value={newExpense.invoiceNumber}
                  onChange={(e) => setNewExpense({...newExpense, invoiceNumber: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Notas adicionales"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjuntar Comprobante
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Arrastra un archivo aquí o haz clic para seleccionar
                  </p>
                  <input type="file" className="hidden" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <ButtonModern
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancelar
              </ButtonModern>
              <ButtonModern
                onClick={handleAddExpense}
                disabled={!newExpense.amount || !newExpense.description}
              >
                Registrar Gasto
              </ButtonModern>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}