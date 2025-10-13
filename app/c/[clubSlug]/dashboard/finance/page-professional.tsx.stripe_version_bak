'use client'

import React, { useState } from 'react'
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { CardModern } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { 
  DollarSign, TrendingUp, Receipt, Wallet,
  Plus, Search, Filter, Download, Calendar,
  Eye, Edit, ChevronLeft, ChevronRight,
  BarChart3, FileText, Target, Users, PieChart,
  Home, ArrowLeft
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Import sub-modules
import IncomeModule from './modules/IncomeModule-Professional'
import ExpensesModule from './modules/ExpensesModule-Professional'
import PayrollModule from './modules/PayrollModule-Professional'
import ReportsModule from './modules/ReportsModule-Professional'
import BudgetsModule from './modules/BudgetsModule-Professional'

type ModuleView = 'dashboard' | 'income' | 'expenses' | 'payroll' | 'reports' | 'budgets'

interface Transaction {
  id: string
  concept: string
  category: string
  amount: number
  date: string
  type: 'income' | 'expense'
  status: 'completed' | 'pending'
}

export default function FinancePageProfessional() {
  const [activeModule, setActiveModule] = useState<ModuleView>('dashboard')
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data
  const [transactions] = useState<Transaction[]>([
    { id: '1', concept: 'Reserva Cancha 1', category: 'Reservas', amount: 25000, date: '2024-01-15', type: 'income', status: 'completed' },
    { id: '2', concept: 'Clase Grupal', category: 'Clases', amount: 15000, date: '2024-01-14', type: 'income', status: 'completed' },
    { id: '3', concept: 'Nómina Instructor', category: 'Nómina', amount: 50000, date: '2024-01-14', type: 'expense', status: 'pending' },
    { id: '4', concept: 'Torneo Mensual', category: 'Torneos', amount: 120000, date: '2024-01-13', type: 'income', status: 'completed' },
    { id: '5', concept: 'Mantenimiento', category: 'Servicios', amount: 15000, date: '2024-01-12', type: 'expense', status: 'completed' },
  ])

  const totalIncome = 160000
  const totalExpenses = 65000
  const netProfit = totalIncome - totalExpenses
  const profitMargin = ((netProfit / totalIncome) * 100).toFixed(0)

  const navigationItems = [
    { id: 'dashboard', label: 'Panel General', icon: <Home className="w-4 h-4" />, description: 'Vista general y métricas' },
    { id: 'income', label: 'Ingresos', icon: <TrendingUp className="w-4 h-4" />, description: 'Gestión de ingresos' },
    { id: 'expenses', label: 'Gastos', icon: <Receipt className="w-4 h-4" />, description: 'Control de gastos' },
    { id: 'payroll', label: 'Nómina', icon: <Users className="w-4 h-4" />, description: 'Gestión de personal' },
    { id: 'reports', label: 'Reportes', icon: <BarChart3 className="w-4 h-4" />, description: 'Análisis y reportes' },
    { id: 'budgets', label: 'Presupuestos', icon: <Target className="w-4 h-4" />, description: 'Control presupuestario' }
  ]

  const renderDashboard = () => (
    <div style={{ padding: '32px' }}>
      {/* Header - Exactamente como Reservas */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#182A01',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em'
        }}>
          Finanzas
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#516640',
          fontWeight: 400,
          margin: 0
        }}>
          Gestión financiera del club
        </p>
      </div>

      {/* Métricas - 4 Cards glass style */}
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
                background: 'rgba(164, 223, 78, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp style={{ width: '20px', height: '20px', color: '#A4DF4E' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#A4DF4E', fontWeight: 600 }}>+12%</span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Ingresos del Mes</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(totalIncome)}
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
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Receipt style={{ width: '20px', height: '20px', color: '#EF4444' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>-5%</span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Gastos del Mes</p>
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
                <DollarSign style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 600 }}>+18%</span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Utilidad Neta</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(netProfit)}
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
                <Wallet style={{ width: '20px', height: '20px', color: '#9333EA' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#516640', fontWeight: 600 }}>{profitMargin}%</span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Margen de Utilidad</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>Saludable</p>
          </div>
        </CardModern>
      </div>

      {/* Main Grid Layout - Como Reservas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '24px',
        height: 'calc(100vh - 380px)'
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
                  {format(selectedMonth, 'MMMM yyyy', { locale: es })}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedMonth)
                      newDate.setMonth(newDate.getMonth() - 1)
                      setSelectedMonth(newDate)
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
                      const newDate = new Date(selectedMonth)
                      newDate.setMonth(newDate.getMonth() + 1)
                      setSelectedMonth(newDate)
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

              {/* Resumen del Mes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#516640' }}>Total Ingresos</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#A4DF4E' }}>
                    +{formatCurrency(totalIncome)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#516640' }}>Total Gastos</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>
                    -{formatCurrency(totalExpenses)}
                  </span>
                </div>
                <div style={{
                  borderTop: '1px solid rgba(164, 223, 78, 0.1)',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>Balance</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#182A01' }}>
                    {formatCurrency(netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </CardModern>

          {/* Acciones Rápidas */}
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
                  onClick={() => setActiveModule('income')}
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
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Nueva Transacción
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
                  <FileText style={{ width: '16px', height: '16px' }} />
                  Generar Reporte
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
                  Exportar Datos
                </button>
              </div>
            </div>
          </CardModern>
        </div>

        {/* Panel Principal - Lista de Transacciones */}
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
                  Transacciones Recientes
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
                    onClick={() => setActiveModule('income')}
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
                    Nueva
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
                  placeholder="Buscar transacción..."
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
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.id}
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
                      {/* Icono de tipo */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: transaction.type === 'income' 
                          ? 'rgba(164, 223, 78, 0.1)' 
                          : 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {transaction.type === 'income' ? (
                          <TrendingUp style={{ 
                            width: '20px', 
                            height: '20px', 
                            color: '#A4DF4E' 
                          }} />
                        ) : (
                          <Receipt style={{ 
                            width: '20px', 
                            height: '20px', 
                            color: '#EF4444' 
                          }} />
                        )}
                      </div>
                      
                      {/* Información */}
                      <div>
                        <p style={{ 
                          fontSize: '14px', 
                          fontWeight: 600, 
                          color: '#182A01',
                          marginBottom: '2px'
                        }}>
                          {transaction.concept}
                        </p>
                        <p style={{ 
                          fontSize: '12px', 
                          color: '#516640' 
                        }}>
                          {transaction.category} • {format(new Date(transaction.date), 'dd MMM', { locale: es })}
                        </p>
                      </div>
                    </div>

                    {/* Monto y acciones */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: transaction.type === 'income' ? '#A4DF4E' : '#EF4444'
                        }}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: transaction.status === 'completed' 
                            ? 'rgba(164, 223, 78, 0.1)' 
                            : 'rgba(251, 191, 36, 0.1)',
                          color: transaction.status === 'completed' ? '#A4DF4E' : '#FBBF24'
                        }}>
                          {transaction.status === 'completed' ? 'Completado' : 'Pendiente'}
                        </span>
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
              ))}
            </div>
          </div>
        </CardModern>
      </div>
    </div>
  )

  return (
    <CleanDashboardLayout
      clubName="Club Pádel México"
      userName="Administrador del Club"
      userRole="Administrador"
    >
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar de Navegación */}
        <div style={{
          width: '280px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(24, 42, 1, 0.1)',
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          position: 'fixed',
          left: '240px', // Offset for main sidebar
          top: '64px', // Offset for header
          bottom: '0',
          zIndex: 10,
          overflowY: 'auto'
        }}>
          {/* Header del Sidebar */}
          <div style={{ padding: '0 24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #A4DF4E 0%, #516640 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign style={{ width: '18px', height: '18px', color: 'white' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#182A01', margin: 0 }}>
                  Finanzas
                </h2>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  Gestión financiera
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id as ModuleView)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeModule === item.id 
                    ? 'linear-gradient(135deg, #A4DF4E 0%, #516640 100%)' 
                    : 'transparent',
                  color: activeModule === item.id ? 'white' : '#374151',
                  fontSize: '14px',
                  fontWeight: activeModule === item.id ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  boxShadow: activeModule === item.id ? '0 2px 8px rgba(164, 223, 78, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeModule !== item.id) {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeModule !== item.id) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'inherit' }}>
                    {item.label}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: activeModule === item.id ? 'rgba(255, 255, 255, 0.8)' : '#6b7280',
                    marginTop: '2px'
                  }}>
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Summary Stats in Sidebar */}
          <div style={{ 
            marginTop: 'auto', 
            padding: '16px 24px',
            borderTop: '1px solid rgba(24, 42, 1, 0.1)'
          }}>
            <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase' }}>
              Resumen del Mes
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Ingresos</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>
                  ${totalIncome.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Gastos</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444' }}>
                  ${totalExpenses.toLocaleString()}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderTop: '1px solid rgba(24, 42, 1, 0.1)',
                paddingTop: '8px'
              }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#182A01' }}>Balance</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#182A01' }}>
                  ${netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ 
          marginLeft: '280px', // Width of sidebar
          flex: 1,
          overflowY: 'auto',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}>
          {activeModule === 'dashboard' && renderDashboard()}
          {activeModule === 'income' && <IncomeModule />}
          {activeModule === 'expenses' && <ExpensesModule />}
          {activeModule === 'payroll' && <PayrollModule />}
          {activeModule === 'reports' && <ReportsModule />}
          {activeModule === 'budgets' && <BudgetsModule />}
        </div>
      </div>
    </CleanDashboardLayout>
  )
}