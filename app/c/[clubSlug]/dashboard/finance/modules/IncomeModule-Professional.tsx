'use client'

import React, { useState, useEffect } from 'react'
import { CardModern } from '@/components/design-system/CardModern'
import { 
  Plus, Search, Filter, Download, TrendingUp,
  CreditCard, Banknote, Building2, Calendar, 
  Eye, Edit, ChevronLeft, ChevronRight, FileText,
  DollarSign, Users, Clock, Loader2, X, Activity,
  Trophy, BookOpen, ArrowRight
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { FinanceLoader } from '@/components/finance/FinanceLoader'

// Import submodules
import BookingsIncomeModule from './BookingsIncomeModule'
import ClassesIncomeModule from './ClassesIncomeModule'
import TournamentsIncomeModule from './TournamentsIncomeModule'

interface TransactionWithBooking {
  id: string
  type: string
  category: string
  description: string
  amount: number
  date: string
  reference?: string
  cleanedReference?: string
  playerName?: string
  courtName?: string
  status: 'completed' | 'pending' | 'processing'
  paymentMethod?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  Booking?: {
    Court?: {
      name: string
    }
    Payment?: Array<{
      method: string
    }>
    playerName?: string
  }
}

interface Transaction {
  id: string
  type: string
  category: string
  description: string
  amount: number
  date: string
  reference?: string
  cleanedReference?: string
  playerName?: string
  courtName?: string
  status: 'completed' | 'pending' | 'processing'
  paymentMethod?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export default function IncomeModuleProfessional() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState(new Date())
  const [activeView, setActiveView] = useState<'general' | 'bookings' | 'classes' | 'tournaments'>('general')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalTransactionsCount, setTotalTransactionsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [forceRefreshKey, setForceRefreshKey] = useState(Date.now())
  const [initialLoad, setInitialLoad] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [tournamentsEnabled, setTournamentsEnabled] = useState(false)
  const [classesEnabled, setClassesEnabled] = useState(true)
  const [editForm, setEditForm] = useState({
    description: '',
    amount: 0,
    category: '',
    paymentMethod: '',
    notes: ''
  })
  
  // Check if tournaments are enabled for this club
  useEffect(() => {
    checkClubModules()
  }, [])

  // Fetch real transactions from API
  useEffect(() => {
    fetchTransactions()
  }, [selectedPeriod])

  // Handle navigation from submodules
  useEffect(() => {
    const handleNavigateToIncome = () => {
      setActiveView('general')
    }
    
    window.addEventListener('navigate-to-income', handleNavigateToIncome)
    
    return () => {
      window.removeEventListener('navigate-to-income', handleNavigateToIncome)
    }
  }, [])
  
  const checkClubModules = async () => {
    try {
      const response = await fetch('/api/club/settings')
      if (response.ok) {
        const data = await response.json()
        console.log('Club settings response:', data)
        console.log('Club modules:', data.clubModules)
        // Check if modules are enabled
        setTournamentsEnabled(data.clubModules?.tournaments === true)
        // Classes should be explicitly true to be enabled
        setClassesEnabled(data.clubModules?.classes === true)
        console.log('Classes enabled:', data.clubModules?.classes === true)
        console.log('Tournaments enabled:', data.clubModules?.tournaments === true)
      }
    } catch (error) {
      console.error('Error checking club modules:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)

      if (initialLoad) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      // Fetch all transactions for the current month to get complete stats
      const response = await fetch('/api/finance/transactions?type=INCOME&period=month&limit=500')
      if (response.ok) {
        const data = await response.json()
        // Set the actual total count from the API
        setTotalTransactionsCount(data.total || data.transactions?.length || 0)
        const mappedTransactions = (data.transactions || []).map((t: TransactionWithBooking) => {
          // Extract payment method from notes if it exists
          let paymentMethod = 'No especificado'

          // First try to get from booking's payment (note: capital B for Booking)
          if (t.Booking?.Payment?.[0]?.method) {
            paymentMethod = t.Booking.Payment[0].method
          }
          // Check reference for payment method (for split payments)
          else if (t.reference) {
            if (t.reference.startsWith('MANUAL_') || t.reference.includes('CASH')) {
              paymentMethod = 'Efectivo'
            } else if (t.reference.startsWith('TERMINAL_')) {
              paymentMethod = 'Terminal'
            } else if (t.reference.startsWith('SPEI_') || t.reference.includes('TRANSFER')) {
              paymentMethod = 'Transferencia'
            } else if (t.reference.startsWith('pi_') || t.reference.includes('STRIPE')) {
              paymentMethod = 'Stripe'
            }
          }
          // Otherwise try to extract from notes
          else if (t.notes) {
            const match = t.notes.match(/Método de pago:\s*([^|]+)/i)
            if (match && match[1]) {
              paymentMethod = match[1].trim()
            }
          }
          
          // Map category to Spanish
          const categoryMap: Record<string, string> = {
            'BOOKING': 'Reservas',
            'CLASS': 'Clases',
            'TOURNAMENT': 'Torneos',
            'MEMBERSHIP': 'Membresías',
            'EQUIPMENT': 'Equipamiento',
            'OTHER': 'Otros'
          }
          
          return {
            id: t.id,
            type: 'income',
            category: categoryMap[t.category] || t.category || 'Reservas',
            description: t.description || 'Transacción',
            amount: t.amount || 0,
            date: t.date,
            status: 'completed' as const,
            playerName: (() => {
              // Extract player name from either Booking or description
              if (t.Booking?.playerName) {
                return t.Booking.playerName
              }
              // Try to extract from description
              if (t.description && t.description.includes(' - ')) {
                const parts = t.description.split(' - ')
                const lastPart = parts[parts.length - 1].trim()
                // Check if last part is a time (HH:MM) or a name
                if (!lastPart.match(/^\d{1,2}:\d{2}$/)) {
                  return lastPart
                }
              }
              return 'Cliente'
            })(),
            courtName: t.Booking?.Court?.name || '',
            paymentMethod: paymentMethod,
            reference: t.reference || t.id.substring(0, 8).toUpperCase(),
            cleanedReference: cleanReference(t.reference || t.id.substring(0, 8).toUpperCase()),
            notes: t.notes || '',
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
          }
        })
        setTransactions(mappedTransactions)
        // Force refresh key update to trigger re-render
        setForceRefreshKey(Date.now())
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }

  // Helper function to check if transaction was edited
  const isEdited = (transaction: Transaction) => {
    if (!transaction.createdAt || !transaction.updatedAt) return false
    const created = new Date(transaction.createdAt)
    const updated = new Date(transaction.updatedAt)
    // Consider edited if updated more than 1 minute after creation
    return (updated.getTime() - created.getTime()) > 60000
  }

  // Helper function to clean reference display (remove prefixes)
  // Function to export transactions to CSV
  const exportTransactions = () => {
    console.log('🔄 Iniciando exportación de transacciones...')
    console.log('📊 Número de transacciones:', transactions.length)
    console.log('🔍 Primera transacción raw:', transactions[0] ? {
      id: transactions[0].id,
      description: transactions[0].description,
      courtName: transactions[0].courtName,
      fullStructure: transactions[0]
    } : 'No hay transacciones')
    
    if (transactions.length === 0) {
      alert('No hay transacciones para exportar')
      return
    }

    try {
      const csvHeaders = [
        'Fecha',
        'Hora',
        'Descripción',
        'Cliente',
        'Cancha',
        'Categoría',
        'Método de Pago',
        'Referencia',
        'Monto',
        'Estado'
      ]

      const csvData = transactions.map(t => {
        // Debug logging para cada transacción
        console.log('🔍 DEBUG transacción:', {
          id: t.id.substring(0, 8),
          description: t.description,
          courtName: t.courtName,
        })
        
        const dateObj = new Date(t.createdAt || t.date)
        return [
          format(dateObj, 'dd/MM/yyyy', { locale: es }),
          format(dateObj, 'HH:mm', { locale: es }),
          `"${(t.description || '').replace(/"/g, '""')}"`,
          `"${(t.playerName || 'N/A').replace(/"/g, '""')}"`,
          `"${(t.courtName || 'N/A').replace(/"/g, '""')}"`,
          `"${(t.category || 'N/A').replace(/"/g, '""')}"`,
          `"${(t.paymentMethod || 'N/A').replace(/"/g, '""')}"`,
          `"${(t.cleanedReference || t.reference || 'N/A').replace(/"/g, '""')}"`,
          `$${(t.amount / 100).toFixed(2)}`,
          t.status === 'completed' ? 'Completado' : t.status
        ]
      })

      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n')

      console.log('📝 CSV content preview:', csvContent.substring(0, 200) + '...')

      // Create and download the file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      
      const fileName = `ingresos_${format(selectedPeriod, 'yyyy_MM', { locale: es })}.csv`
      console.log('📁 Archivo a descargar:', fileName)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.style.display = 'none'
      
      // Add to DOM, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up URL
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 100)
      
      console.log('✅ Exportación completada exitosamente')
      
    } catch (error) {
      console.error('❌ Error en exportación:', error)
      alert(`Error al exportar: ${(error as Error).message}`)
    }
  }

  const cleanReference = (reference?: string) => {
    if (!reference) return ''
    
    console.log('🔧 Cleaning reference:', reference)
    
    // Remove common prefixes - be explicit about TERMINAL_
    if (reference.startsWith('TERMINAL_')) {
      const cleaned = reference.replace('TERMINAL_', '')
      console.log(`🔧 Cleaned TERMINAL_: ${reference} → ${cleaned}`)
      return cleaned
    }
    if (reference.startsWith('TRANSFER_')) {
      const cleaned = reference.replace('TRANSFER_', '')
      console.log(`🔧 Cleaned TRANSFER_: ${reference} → ${cleaned}`)
      return cleaned
    }
    if (reference.startsWith('MANUAL_')) {
      const cleaned = reference.replace('MANUAL_', '')
      console.log(`🔧 Cleaned MANUAL_: ${reference} → ${cleaned}`)
      return cleaned
    }
    if (reference.startsWith('SPEI_')) {
      const cleaned = reference.replace('SPEI_', '')
      console.log(`🔧 Cleaned SPEI_: ${reference} → ${cleaned}`)
      return cleaned
    }
    if (reference.startsWith('OXXO_')) {
      return reference.replace('OXXO_', '')
    }
    if (reference.startsWith('stripe_')) {
      return reference.replace('stripe_', '')
    }
    if (reference.startsWith('split-')) {
      return reference.replace('split-', '')
    }
    
    return reference
  }

  const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0)
  const completedIncome = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
  const pendingIncome = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)

  // Calculate payment methods for the 4 main types
  const paymentMethodsStats = React.useMemo(() => {
    const methods = {
      'Efectivo': { count: 0, amount: 0 },
      'Transferencia': { count: 0, amount: 0 },
      'Terminal': { count: 0, amount: 0 },
      'Stripe': { count: 0, amount: 0 }
    }
    
    transactions.forEach(t => {
      let method = t.paymentMethod || ''
      // Map variations to standard names
      if (method.toLowerCase().includes('efectivo') || method.toLowerCase().includes('cash')) {
        methods['Efectivo'].count++
        methods['Efectivo'].amount += t.amount
      } else if (method.toLowerCase().includes('transfer') || method.toLowerCase().includes('spei')) {
        methods['Transferencia'].count++
        methods['Transferencia'].amount += t.amount
      } else if (method.toLowerCase().includes('terminal') || method.toLowerCase().includes('tarjeta')) {
        methods['Terminal'].count++
        methods['Terminal'].amount += t.amount
      } else if (method.toLowerCase().includes('stripe') || method.toLowerCase().includes('online')) {
        methods['Stripe'].count++
        methods['Stripe'].amount += t.amount
      } else {
        // Default to cash if not specified
        methods['Efectivo'].count++
        methods['Efectivo'].amount += t.amount
      }
    })
    
    return methods
  }, [transactions])

  // Calculate income sources from real data
  const incomeSources = React.useMemo(() => {
    const sources = transactions.reduce((acc, t) => {
      const source = t.category || 'Otros'
      if (!acc[source]) {
        acc[source] = 0
      }
      acc[source] += t.amount
      return acc
    }, {} as Record<string, number>)
    
    const total = Object.values(sources).reduce((sum, amount) => sum + amount, 0)
    return Object.entries(sources).map(([source, amount]) => ({
      source,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      trend: 'stable' as const
    }))
  }, [transactions])

  if (loading && activeView === 'general') {
    return (
      <div style={{ 
        padding: '32px',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <div style={{ textAlign: 'center', color: '#516640' }}>
          <Loader2 size={24} className="animate-spin" style={{ marginBottom: '16px' }} />
          <p>Cargando datos de ingresos...</p>
        </div>
      </div>
    )
  }

  // Render submodules
  if (activeView === 'bookings') {
    return <BookingsIncomeModule />
  }

  if (activeView === 'classes') {
    return <ClassesIncomeModule />
  }

  if (activeView === 'tournaments') {
    return <TournamentsIncomeModule />
  }

  // Type assertion needed after early returns to help TypeScript understand activeView can still be any of the union values
  const view = activeView as 'general' | 'bookings' | 'classes' | 'tournaments'

  if (loading) {
    return (
      <FinanceLoader
        title="Ingresos"
        subtitle="Análisis de ingresos por reservas, clases y torneos"
        selectedPeriod={selectedPeriod}
        skeletonType="table"
      />
    )
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Header - Exactamente como Dashboard de Finanzas */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#182A01',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em'
        }}>
          Ingresos
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#516640',
          fontWeight: 400,
          margin: 0
        }}>
          Gestión de ingresos y cobros del club
        </p>
      </div>

      {/* Métodos de Pago - 4 Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Efectivo */}
        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(34, 197, 94, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign style={{ width: '20px', height: '20px', color: '#22C55E' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#22C55E', fontWeight: 600 }}>
                {paymentMethodsStats['Efectivo'].count}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Efectivo</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(paymentMethodsStats['Efectivo'].amount / 100)}
            </p>
          </div>
        </CardModern>

        {/* Transferencia */}
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
                <TrendingUp style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 600 }}>
                {paymentMethodsStats['Transferencia'].count}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Transferencia</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(paymentMethodsStats['Transferencia'].amount / 100)}
            </p>
          </div>
        </CardModern>

        {/* Terminal */}
        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(251, 191, 36, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CreditCard style={{ width: '20px', height: '20px', color: '#FBBF24' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#FBBF24', fontWeight: 600 }}>
                {paymentMethodsStats['Terminal'].count}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Terminal</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(paymentMethodsStats['Terminal'].amount / 100)}
            </p>
          </div>
        </CardModern>

        {/* Stripe */}
        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(164, 223, 78, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity style={{ width: '20px', height: '20px', color: '#A4DF4E' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#A4DF4E', fontWeight: 600 }}>
                {paymentMethodsStats['Stripe'].count}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Stripe</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(paymentMethodsStats['Stripe'].amount / 100)}
            </p>
          </div>
        </CardModern>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '2px solid rgba(164, 223, 78, 0.1)',
        paddingBottom: '12px'
      }}>
        <button
          onClick={() => setActiveView('general')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeView === 'general' ? '#E8F7DC' : 'transparent',
            color: activeView === 'general' ? '#182A01' : '#516640',
            fontSize: '14px',
            fontWeight: activeView === 'general' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <TrendingUp style={{ width: '16px', height: '16px' }} />
          Vista General
        </button>
        
        <button
          onClick={() => setActiveView('bookings')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: view === 'bookings' ? '#E8F7DC' : 'transparent',
            color: view === 'bookings' ? '#182A01' : '#516640',
            fontSize: '14px',
            fontWeight: view === 'bookings' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <Calendar style={{ width: '16px', height: '16px' }} />
          Reservas
        </button>
        
        {classesEnabled && (
          <button
            onClick={() => setActiveView('classes')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px 10px 0 0',
              border: 'none',
              background: view === 'classes' ? '#E8F7DC' : 'transparent',
              color: view === 'classes' ? '#182A01' : '#516640',
              fontSize: '14px',
              fontWeight: view === 'classes' ? 600 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <BookOpen style={{ width: '16px', height: '16px' }} />
            Clases
          </button>
        )}
        
        {tournamentsEnabled && (
          <button
            onClick={() => setActiveView('tournaments')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px 10px 0 0',
              border: 'none',
              background: view === 'tournaments' ? '#E8F7DC' : 'transparent',
              color: view === 'tournaments' ? '#182A01' : '#516640',
              fontSize: '14px',
              fontWeight: view === 'tournaments' ? 600 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Trophy style={{ width: '16px', height: '16px' }} />
            Torneos
          </button>
        )}
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            onClick={exportTransactions}
            style={{
              padding: '10px 20px',
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
              e.currentTarget.style.borderColor = '#A4DF4E'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.2)'
            }}
          >
            <FileText style={{ width: '16px', height: '16px' }} />
            Exportar CSV
          </button>
          
          <button
            style={{
              padding: '10px 20px',
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
              e.currentTarget.style.borderColor = '#A4DF4E'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.2)'
            }}
          >
            <Download style={{ width: '16px', height: '16px' }} />
            Exportar
          </button>
        </div>
      </div>

      {/* Main Grid Layout - EXACTAMENTE como Dashboard de Finanzas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '24px',
        height: 'calc(100vh - 450px)'
      }}>
        {/* Panel Lateral Izquierdo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Selector de Periodo */}
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
                  <span style={{ fontSize: '14px', color: '#516640' }}>Cobrado</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#22C55E' }}>
                    {formatCurrency(completedIncome / 100)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#516640' }}>Pendiente</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#FBBF24' }}>
                    {formatCurrency(pendingIncome / 100)}
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
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#182A01' }}>
                    {formatCurrency(totalIncome / 100)}
                  </span>
                </div>
              </div>
            </div>
          </CardModern>

          {/* Nueva Transacción */}
          <CardModern variant="glass">
            <div style={{ padding: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#182A01',
                marginBottom: '16px'
              }}>
                Nueva Transacción
              </h3>
              <button
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  color: '#182A01',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Registrar Ingreso
              </button>
            </div>
          </CardModern>
        </div>

        {/* Panel Principal - Lista */}
        <CardModern variant="glass">
          <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header con búsqueda */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#182A01'
                }}>
                  Últimas 20 Transacciones
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
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
                      gap: '6px'
                    }}
                  >
                    <Filter style={{ width: '14px', height: '14px' }} />
                    Filtrar
                  </button>
                  <button
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
                    Nuevo Ingreso
                  </button>
                </div>
              </div>

              {/* Barra de búsqueda */}
              <div style={{
                position: 'relative'
              }}>
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
                  placeholder="Buscar por concepto, cliente o referencia..."
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
            </div>

            {/* Lista de transacciones */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {transactions.length === 0 ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '200px',
                  color: '#516640',
                  textAlign: 'center'
                }}>
                  <DollarSign style={{ width: '48px', height: '48px', opacity: 0.5, marginBottom: '16px' }} />
                  <p>No hay transacciones de ingresos</p>
                  <p style={{ fontSize: '12px' }}>Las transacciones aparecerán aquí cuando se generen</p>
                </div>
              ) : (() => {
                const filteredTransactions = transactions.filter(transaction => {
                  if (!searchQuery) return true
                  const query = searchQuery.toLowerCase()

                  return (
                    transaction.description.toLowerCase().includes(query) ||
                    transaction.playerName?.toLowerCase().includes(query) ||
                    transaction.reference?.toLowerCase().includes(query) ||
                    transaction.category.toLowerCase().includes(query)
                  )
                })

                if (filteredTransactions.length === 0 && searchQuery) {
                  return (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '200px',
                      color: '#516640',
                      textAlign: 'center'
                    }}>
                      <Search style={{ width: '48px', height: '48px', opacity: 0.5, marginBottom: '16px' }} />
                      <p>No se encontraron transacciones para "{searchQuery}"</p>
                      <p style={{ fontSize: '12px' }}>Intenta con otro término de búsqueda</p>
                    </div>
                  )
                }

                return filteredTransactions
                  .slice(0, 20)
                  .map((transaction, index) => (
                <div
                  key={`${forceRefreshKey}-${transaction.id}-${transaction.cleanedReference}`}
                  style={{
                    padding: '16px 0',
                    borderBottom: index < transactions.length - 1 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.02)'
                    e.currentTarget.style.marginLeft = '4px'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.marginLeft = '0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(164, 223, 78, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <DollarSign style={{ width: '20px', height: '20px', color: '#A4DF4E' }} />
                      </div>
                      
                      <div>
                        <p style={{ 
                          fontSize: '14px', 
                          fontWeight: 600, 
                          color: '#182A01',
                          marginBottom: '4px'
                        }}>
                          {transaction.description}
                        </p>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#516640',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span key={`${transaction.id}-${transaction.cleanedReference}`}>
                            {(() => {
                              console.log(`🎯 FINAL UI RENDER: ID=${transaction.id}, Original="${transaction.reference}", Cleaned="${transaction.cleanedReference}"`);
                              return `${transaction.playerName} • ${transaction.category} • ${transaction.cleanedReference}`;
                            })()}
                          </span>
                          {isEdited(transaction) && (
                            <span style={{
                              background: 'rgba(251, 191, 36, 0.1)',
                              color: '#F59E0B',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 600
                            }}>
                              EDITADO
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#A4DF4E'
                        }}>
                          +{formatCurrency(transaction.amount / 100)}
                        </p>
                        <p style={{ fontSize: '11px', color: '#516640' }}>
                          {format(new Date(transaction.createdAt || transaction.date), 'dd MMM HH:mm', { locale: es })}
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
                          onClick={() => setSelectedTransaction(transaction)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <Eye style={{ width: '16px', height: '16px', color: '#516640' }} />
                        </button>
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
                            e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <Edit style={{ width: '16px', height: '16px', color: '#516640' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
              })()}
            </div>
          </div>
        </CardModern>
      </div>
      
      {/* Modal de Detalles de Transacción */}
      {selectedTransaction && (
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
        }}
        onClick={() => setSelectedTransaction(null)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#182A01',
                margin: 0
              }}>
                Detalles de Transacción
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(164, 223, 78, 0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <X style={{ width: '16px', height: '16px', color: '#516640' }} />
              </button>
            </div>

            {/* Transaction Details */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Amount */}
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.1))',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#A4DF4E',
                  margin: '0 0 8px 0'
                }}>
                  +{formatCurrency(selectedTransaction.amount / 100)}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#516640',
                  margin: 0
                }}>
                  {selectedTransaction.status === 'completed' ? 'Completado' : 'Pendiente'}
                </p>
              </div>

              {/* Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(164, 223, 78, 0.1)'
                }}>
                  <span style={{ fontSize: '14px', color: '#829F65' }}>Referencia</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                    {selectedTransaction.reference}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(164, 223, 78, 0.1)'
                }}>
                  <span style={{ fontSize: '14px', color: '#829F65' }}>Fecha</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                    {format(new Date(selectedTransaction.date), "d 'de' MMMM, yyyy", { locale: es })}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(164, 223, 78, 0.1)'
                }}>
                  <span style={{ fontSize: '14px', color: '#829F65' }}>Categoría</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                    {selectedTransaction.category}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(164, 223, 78, 0.1)'
                }}>
                  <span style={{ fontSize: '14px', color: '#829F65' }}>Cliente</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                    {selectedTransaction.playerName || 'No especificado'}
                  </span>
                </div>

                {selectedTransaction.courtName && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(164, 223, 78, 0.1)'
                  }}>
                    <span style={{ fontSize: '14px', color: '#829F65' }}>Cancha</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                      {selectedTransaction.courtName}
                    </span>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(164, 223, 78, 0.1)'
                }}>
                  <span style={{ fontSize: '14px', color: '#829F65' }}>Método de Pago</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                    {selectedTransaction.paymentMethod || 'Efectivo'}
                  </span>
                </div>

                <div style={{
                  padding: '12px 0'
                }}>
                  <span style={{ fontSize: '14px', color: '#829F65', display: 'block', marginBottom: '8px' }}>
                    Descripción
                  </span>
                  <span style={{ fontSize: '14px', color: '#182A01' }}>
                    {selectedTransaction.description}
                  </span>
                </div>

                {isEdited(selectedTransaction) && selectedTransaction.updatedAt && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(251, 191, 36, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(251, 191, 36, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Edit style={{ width: '14px', height: '14px', color: '#F59E0B' }} />
                      <span style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600 }}>
                        Transacción Editada
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#92400E', marginTop: '4px' }}>
                      Última modificación: {format(new Date(selectedTransaction.updatedAt), "dd 'de' MMMM 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '20px'
              }}>
                <button
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(164, 223, 78, 0.3)',
                    background: 'white',
                    color: '#516640',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    setEditingTransaction(selectedTransaction)
                    setEditForm({
                      description: selectedTransaction.description,
                      amount: selectedTransaction.amount / 100, // Convert from cents to pesos
                      category: selectedTransaction.category,
                      paymentMethod: selectedTransaction.paymentMethod || '',
                      notes: selectedTransaction.notes || ''
                    })
                    setSelectedTransaction(null)
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(102, 231, 170, 0.15)'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
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
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{ padding: '32px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#182A01',
                  margin: 0
                }}>
                  Editar Transacción
                </h3>
                <button
                  onClick={() => setEditingTransaction(null)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(164, 223, 78, 0.1)',
                    color: '#516640',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Edit Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '14px', color: '#516640', marginBottom: '8px', display: 'block' }}>
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '14px', color: '#516640', marginBottom: '8px', display: 'block' }}>
                    Monto (MXN)
                  </label>
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '14px', color: '#516640', marginBottom: '8px', display: 'block' }}>
                    Categoría
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      fontSize: '14px',
                      outline: 'none',
                      background: 'white'
                    }}
                  >
                    <option value="BOOKING">Reservas</option>
                    <option value="CLASS">Clases</option>
                    <option value="TOURNAMENT">Torneo</option>
                    <option value="MEMBERSHIP">Membresía</option>
                    <option value="OTHER">Otros</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '14px', color: '#516640', marginBottom: '8px', display: 'block' }}>
                    Método de pago
                  </label>
                  <select
                    value={editForm.paymentMethod}
                    onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      fontSize: '14px',
                      outline: 'none',
                      background: 'white'
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia bancaria">Transferencia bancaria</option>
                    <option value="Tarjeta de débito">Tarjeta de débito</option>
                    <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                    <option value="OXXO">OXXO</option>
                    <option value="SPEI">SPEI</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '14px', color: '#516640', marginBottom: '8px', display: 'block' }}>
                    Notas
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px'
              }}>
                <button
                  onClick={() => setEditingTransaction(null)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(164, 223, 78, 0.3)',
                    background: 'white',
                    color: '#516640',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Update notes with payment method
                      const updatedNotes = editForm.paymentMethod 
                        ? `${editForm.notes}${editForm.notes ? ' | ' : ''}Método de pago: ${editForm.paymentMethod}`
                        : editForm.notes
                      
                      const response = await fetch(`/api/finance/transactions/${editingTransaction.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          description: editForm.description,
                          amount: Math.round(editForm.amount * 100), // Convert to cents
                          category: editForm.category,
                          notes: updatedNotes
                        })
                      })
                      
                      if (response.ok) {
                        // Refresh transactions
                        await fetchTransactions()
                        setEditingTransaction(null)
                      } else {
                        console.error('Error updating transaction')
                      }
                    } catch (error) {
                      console.error('Error updating transaction:', error)
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(102, 231, 170, 0.15)'
                  }}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}