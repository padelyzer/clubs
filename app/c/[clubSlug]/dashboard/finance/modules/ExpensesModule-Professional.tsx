'use client'

import React, { useState, useEffect } from 'react'
import { CardModern } from '@/components/design-system/CardModern'
import { 
  Plus, Search, Download, TrendingDown,
  Receipt, Home, Zap, Wifi, Wrench, Building2,
  Eye, Edit, ChevronLeft, ChevronRight, FileText,
  DollarSign, Clock, AlertCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import RecurringExpensesModal from './RecurringExpensesModal'
import { FinanceLoader } from '@/components/finance/FinanceLoader'

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  date: string
  vendor?: string
  type: 'fixed' | 'variable'
}

interface RecurringExpense {
  id: string
  category: string
  description: string
  amount: number
  vendor?: string
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  dayOfMonth?: number
  dayOfWeek?: number
  nextDue: string
  isActive: boolean
  lastGenerated?: string
}

export default function ExpensesModuleProfessional() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'all' | 'fixed' | 'variable'>('all')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [categoryBreakdown, setCategoryBreakdown] = useState<{[key: string]: number}>({})
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [newExpense, setNewExpense] = useState({
    category: 'MAINTENANCE',
    description: '',
    amount: '',
    vendor: '',
    date: format(new Date(), 'yyyy-MM-dd')
  })

  useEffect(() => {
    fetchExpenses()
  }, [selectedPeriod])

  const fetchExpenses = async () => {
    try {
      setLoading(true)

      if (initialLoad) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      const response = await fetch('/api/finance/expenses?period=month')
      if (response.ok) {
        const data = await response.json()
        const mappedExpenses: Expense[] = data.expenses?.map((e: any) => ({
          id: e.id,
          category: e.category || 'General',
          description: e.description || '',
          amount: (e.amount || 0) / 100, // Convertir de centavos a pesos
          date: e.date,
          vendor: e.vendor,
          type: ['RENT', 'UTILITIES', 'INSURANCE'].includes(e.category) ? 'fixed' : 'variable'
        })) || []
        setExpenses(mappedExpenses)
        
        // Calculate category breakdown
        if (data.summary?.categoryTotals) {
          const breakdown: {[key: string]: number} = {}
          Object.entries(data.summary.categoryTotals).forEach(([category, amount]) => {
            breakdown[category] = (amount as number) / 100 // Convert from cents to pesos
          })
          setCategoryBreakdown(breakdown)
        }
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const period = format(selectedPeriod, 'yyyy-MM')
      const response = await fetch(`/api/finance/export?type=expenses&format=csv&period=${period}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `gastos-${period}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting expenses:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleCreateExpense = async () => {
    try {
      const expenseData = {
        type: 'EXPENSE',
        category: newExpense.category,
        amount: Math.round(parseFloat(newExpense.amount) * 100), // Convert to cents and ensure integer
        description: newExpense.description,
        date: newExpense.date,
        notes: newExpense.vendor ? `Proveedor: ${newExpense.vendor}` : undefined
      }
      
      console.log('Enviando gasto:', expenseData)
      
      const response = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData)
      })

      let responseData
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json()
          console.log('Response data:', responseData)
        } catch (jsonError) {
          console.error('Error parsing JSON:', jsonError)
          alert('Error al procesar la respuesta del servidor')
          return
        }
      } else {
        const responseText = await response.text()
        console.error('Non-JSON response:', responseText)
        alert('El servidor devolvió una respuesta inesperada')
        return
      }
      
      if (response.ok && responseData.success) {
        console.log('Gasto creado exitosamente:', responseData)
        setShowNewExpenseModal(false)
        setNewExpense({
          category: 'MAINTENANCE',
          description: '',
          amount: '',
          vendor: '',
          date: format(new Date(), 'yyyy-MM-dd')
        })
        fetchExpenses() // Refresh the list
      } else {
        console.error('Error del servidor:', responseData)
        if (responseData && responseData.details) {
          console.error('Detalles de validación:', responseData.details)
        }
        alert((responseData && responseData.error) || 'Error al crear el gasto')
      }
    } catch (error) {
      console.error('Error creating expense:', error)
      alert('Error al conectar con el servidor')
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const fixedExpenses = expenses.filter(e => e.type === 'fixed').reduce((sum, e) => sum + e.amount, 0)
  const variableExpenses = expenses.filter(e => e.type === 'variable').reduce((sum, e) => sum + e.amount, 0)

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'renta': return <Home style={{ width: '20px', height: '20px', color: '#EF4444' }} />
      case 'electricidad': return <Zap style={{ width: '20px', height: '20px', color: '#EF4444' }} />
      case 'internet': return <Wifi style={{ width: '20px', height: '20px', color: '#EF4444' }} />
      case 'mantenimiento': return <Wrench style={{ width: '20px', height: '20px', color: '#EF4444' }} />
      default: return <Receipt style={{ width: '20px', height: '20px', color: '#EF4444' }} />
    }
  }

  const fixedExpensesList = expenses
    .filter(e => e.type === 'fixed')
    .slice(0, 5)
    .map(e => ({
      name: e.description || e.category,
      amount: e.amount,
      dueDay: new Date(e.date).getDate(),
      icon: getCategoryIcon(e.category)
    }))

  const filteredExpenses = activeTab === 'all' 
    ? expenses 
    : expenses.filter(e => e.type === activeTab)

  if (loading) {
    return (
      <FinanceLoader
        title="Gastos"
        subtitle="Control de gastos operativos y administrativos"
        selectedPeriod={selectedPeriod}
        skeletonType="table"
      />
    )
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#182A01',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em'
        }}>
          Gastos
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#516640',
          fontWeight: 400,
          margin: 0
        }}>
          Control y gestión de gastos del club
        </p>
      </div>

      {/* Métricas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingDown style={{ width: '20px', height: '20px', color: '#EF4444' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>+8%</span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Total Gastos</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </CardModern>

        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Home style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#516640', fontWeight: 600 }}>72%</span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Gastos Fijos</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(fixedExpenses)}
            </p>
          </div>
        </CardModern>

        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(147, 51, 234, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Receipt style={{ width: '20px', height: '20px', color: '#9333EA' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#516640', fontWeight: 600 }}>28%</span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Gastos Variables</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(variableExpenses)}
            </p>
          </div>
        </CardModern>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid rgba(164, 223, 78, 0.1)',
        paddingBottom: '2px'
      }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'all' ? '#182A01' : '#516640',
            fontSize: '14px',
            fontWeight: activeTab === 'all' ? 600 : 500,
            cursor: 'pointer',
            borderBottom: activeTab === 'all' ? '2px solid #A4DF4E' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Todos los Gastos
        </button>
        <button
          onClick={() => setActiveTab('fixed')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'fixed' ? '#182A01' : '#516640',
            fontSize: '14px',
            fontWeight: activeTab === 'fixed' ? 600 : 500,
            cursor: 'pointer',
            borderBottom: activeTab === 'fixed' ? '2px solid #A4DF4E' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Gastos Fijos
        </button>
        <button
          onClick={() => setActiveTab('variable')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'variable' ? '#182A01' : '#516640',
            fontSize: '14px',
            fontWeight: activeTab === 'variable' ? 600 : 500,
            cursor: 'pointer',
            borderBottom: activeTab === 'variable' ? '2px solid #A4DF4E' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Gastos Variables
        </button>
      </div>

      {/* Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '24px'
      }}>
        {/* Main Content */}
        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#182A01'
              }}>
                {activeTab === 'all' && 'Lista de Gastos'}
                {activeTab === 'fixed' && 'Gastos Fijos Mensuales'}
                {activeTab === 'variable' && 'Gastos Variables'}
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowRecurringModal(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    background: 'white',
                    color: '#516640',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.2)'
                  }}
                >
                  <Clock style={{ width: '14px', height: '14px' }} />
                  Gastos Recurrentes
                </button>
                <button
                  onClick={() => setShowNewExpenseModal(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #66E7AA 0%, #A4DF4E 100%)',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus style={{ width: '14px', height: '14px' }} />
                  Nuevo Gasto
                </button>
              </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Search style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#516640'
              }} />
              <input
                type="text"
                placeholder="Buscar por concepto, proveedor o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '10px',
                  border: '1px solid rgba(164, 223, 78, 0.2)',
                  background: 'white',
                  fontSize: '14px',
                  color: '#182A01',
                  outline: 'none'
                }}
              />
            </div>

            {/* Content based on tab */}
            {activeTab === 'fixed' ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(148, 208, 52, 0.05))',
                borderRadius: '12px',
                border: '1px dashed rgba(164, 223, 78, 0.3)'
              }}>
                <Clock style={{
                  width: '48px',
                  height: '48px',
                  color: '#A4DF4E',
                  margin: '0 auto 16px'
                }} />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#182A01',
                  margin: '0 0 8px'
                }}>
                  Gastos Recurrentes
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#516640',
                  margin: '0 0 20px'
                }}>
                  Configura gastos que se repiten periódicamente para automatizar tu registro financiero
                </p>
                <button
                  onClick={() => setShowRecurringModal(true)}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #A4DF4E, #94D034)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Gestionar Gastos Recurrentes
                </button>
              </div>
            ) : activeTab === 'fixed-old' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {fixedExpensesList.map((expense, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(164, 223, 78, 0.15)',
                      background: 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.15)'
                      e.currentTarget.style.transform = 'translateX(0)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {React.cloneElement(expense.icon, { 
                            style: { width: '20px', height: '20px', color: '#EF4444' }
                          })}
                        </div>
                        <div>
                          <p style={{ 
                            fontSize: '14px', 
                            fontWeight: 600, 
                            color: '#182A01',
                            marginBottom: '4px'
                          }}>
                            {expense.name}
                          </p>
                          <p style={{ fontSize: '12px', color: '#516640' }}>
                            Vence el día {expense.dueDay} de cada mes
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#EF4444'
                        }}>
                          -{formatCurrency(expense.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {filteredExpenses.map((expense, index) => (
                  <div
                    key={expense.id}
                    style={{
                      padding: '16px 0',
                      borderBottom: index < filteredExpenses.length - 1 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.02)'
                      e.currentTarget.style.paddingLeft = '20px'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.paddingLeft = '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {getCategoryIcon(expense.category)}
                        </div>
                        <div>
                          <p style={{ 
                            fontSize: '14px', 
                            fontWeight: 600, 
                            color: '#182A01',
                            marginBottom: '4px'
                          }}>
                            {expense.description}
                          </p>
                          <p style={{ 
                            fontSize: '12px', 
                            color: '#516640' 
                          }}>
                            {expense.vendor} • {expense.category} • {format(new Date(expense.date), 'dd MMM', { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#EF4444'
                          }}>
                            -{formatCurrency(expense.amount)}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                              e.currentTarget.style.transform = 'scale(1.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                          >
                            <Eye style={{ width: '16px', height: '16px', color: '#516640' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardModern>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Period Selector */}
          <CardModern variant="glass">
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#182A01'
                }}>
                  {format(selectedPeriod, 'MMMM yyyy', { locale: es })}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedPeriod)
                      newDate.setMonth(newDate.getMonth() - 1)
                      setSelectedPeriod(newDate)
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ChevronLeft style={{ width: '16px', height: '16px', color: '#516640' }} />
                  </button>
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedPeriod)
                      newDate.setMonth(newDate.getMonth() + 1)
                      setSelectedPeriod(newDate)
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ChevronRight style={{ width: '16px', height: '16px', color: '#516640' }} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#516640' }}>Gastos Fijos</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#3B82F6' }}>
                    {formatCurrency(fixedExpenses)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#516640' }}>Gastos Variables</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#9333EA' }}>
                    {formatCurrency(variableExpenses)}
                  </span>
                </div>
                <div style={{
                  borderTop: '1px solid rgba(164, 223, 78, 0.1)',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>Total</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#EF4444' }}>
                    -{formatCurrency(totalExpenses)}
                  </span>
                </div>
              </div>
            </div>
          </CardModern>

          {/* Quick Actions */}
          <CardModern variant="glass">
            <div style={{ padding: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#182A01',
                marginBottom: '16px'
              }}>
                Acciones Rápidas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    background: 'white',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  <FileText style={{ width: '16px', height: '16px' }} />
                  Subir Factura
                </button>
                <button
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    background: 'white',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  Exportar
                </button>
              </div>
            </div>
          </CardModern>

          {/* Categorías de Gastos */}
          <CardModern variant="glass">
            <div style={{ padding: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#182A01',
                marginBottom: '16px'
              }}>
                Distribución por Categoría
              </h3>
              {Object.keys(categoryBreakdown).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(() => {
                    // Calculate total for percentages
                    const total = Object.values(categoryBreakdown).reduce((sum, amount) => sum + amount, 0)
                    
                    // Category color mapping
                    const categoryColors: {[key: string]: string} = {
                      'RENT': 'linear-gradient(90deg, #EF4444, #DC2626)',
                      'UTILITIES': 'linear-gradient(90deg, #3B82F6, #2563EB)',
                      'MAINTENANCE': 'linear-gradient(90deg, #9333EA, #7C3AED)',
                      'EQUIPMENT': 'linear-gradient(90deg, #FBBF24, #F59E0B)',
                      'SALARY': 'linear-gradient(90deg, #10B981, #059669)',
                      'MARKETING': 'linear-gradient(90deg, #F97316, #EA580C)',
                      'OTHER': 'linear-gradient(90deg, #6B7280, #4B5563)'
                    }
                    
                    // Category display names in Spanish
                    const categoryNames: {[key: string]: string} = {
                      'RENT': 'Renta',
                      'UTILITIES': 'Servicios',
                      'MAINTENANCE': 'Mantenimiento',
                      'EQUIPMENT': 'Equipamiento',
                      'SALARY': 'Nómina',
                      'MARKETING': 'Marketing',
                      'OTHER': 'Otros'
                    }
                    
                    // Convert breakdown to array and sort by amount
                    return Object.entries(categoryBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5) // Show top 5 categories
                      .map(([category, amount]) => ({
                        name: categoryNames[category] || category,
                        amount: amount,
                        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
                        color: categoryColors[category] || 'linear-gradient(90deg, #A4DF4E, #94D034)'
                      }))
                  })().map((category, index) => (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#516640' }}>{category.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#182A01' }}>
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                    <div style={{
                      height: '6px',
                      background: 'rgba(164, 223, 78, 0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${category.percentage}%`,
                        height: '100%',
                        background: category.color,
                        borderRadius: '3px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                ))}
                </div>
              ) : (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#94A3B8' 
                }}>
                  <p style={{ fontSize: '14px', margin: 0 }}>
                    No hay gastos registrados en este período.
                  </p>
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>
                    Crea tu primer gasto para ver el análisis por categoría.
                  </p>
                </div>
              )}
            </div>
          </CardModern>
        </div>
      </div>

      {/* Modal Nuevo Gasto */}
      {showNewExpenseModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '500px',
            maxWidth: '90vw',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: 600,
              color: '#182A01'
            }}>
              Nuevo Gasto
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Categoría */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#516640' }}>
                  Categoría
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                >
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="UTILITIES">Servicios</option>
                  <option value="RENT">Renta</option>
                  <option value="EQUIPMENT">Equipo</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="OTHER">Otros</option>
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#516640' }}>
                  Descripción
                </label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="Descripción del gasto..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Monto */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#516640' }}>
                  Monto
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Proveedor */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#516640' }}>
                  Proveedor (opcional)
                </label>
                <input
                  type="text"
                  value={newExpense.vendor}
                  onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                  placeholder="Nombre del proveedor..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Fecha */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#516640' }}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Botones */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setShowNewExpenseModal(false)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(164, 223, 78, 0.2)',
                  background: 'white',
                  color: '#516640',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateExpense}
                disabled={!newExpense.description || !newExpense.amount}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: !newExpense.description || !newExpense.amount 
                    ? 'rgba(164, 223, 78, 0.3)'
                    : 'linear-gradient(135deg, #66E7AA 0%, #A4DF4E 100%)',
                  color: '#182A01',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: !newExpense.description || !newExpense.amount ? 'not-allowed' : 'pointer'
                }}
              >
                Crear Gasto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Expenses Modal */}
      <RecurringExpensesModal 
        isOpen={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
      />
    </div>
  )
}