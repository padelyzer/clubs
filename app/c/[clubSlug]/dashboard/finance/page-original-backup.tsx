'use client'

import React, { useState, useEffect } from 'react'
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { CardModern, CardModernHeader, CardModernTitle, CardModernDescription, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar,
  Plus, Search, Filter, Download, Upload,
  Users, Clock, CreditCard, Banknote,
  PieChart, BarChart3, FileText, AlertCircle,
  Check, X, Edit, Trash2, ArrowUpRight, ArrowDownRight,
  Loader2, Building2, Receipt, Wallet, FileSpreadsheet,
  Target, ChevronRight, ChevronDown, Info, Eye,
  Activity, AlertTriangle, CheckCircle, TrendingDownIcon,
  MapPin, Award, ShoppingBag, Package
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/design-system/localization'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

// Import sub-modules
import IncomeModule from './modules/IncomeModule'
import ExpensesModule from './modules/ExpensesModule'
import PayrollModule from './modules/PayrollModule'
import ReportsModule from './modules/ReportsModule'
import BudgetsModule from './modules/BudgetsModule'

type ModuleView = 'dashboard' | 'income' | 'expenses' | 'payroll' | 'reports' | 'budgets'

interface ExecutiveSummary {
  currentBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  netProfit: number
  profitMargin: number
  incomeChange: number
  expenseChange: number
  profitChange: number
  marginChange: number
  cashFlow: Array<{ date: string; income: number; expense: number; balance: number }>
  alerts: Array<{ type: string; message: string; action: string; count?: number }>
  operationalMetrics: {
    courtRevenue: number
    classRevenue: number
    tournamentRevenue: number
    collectedAmount: number
    pendingAmount: number
    invoiceCount: number
    paidInvoices: number
  }
  topIncomeSource: Array<{ category: string; amount: number; percentage: number }>
  topExpenseCategory: Array<{ category: string; amount: number; percentage: number }>
  monthlyGoals: {
    incomeGoal: number
    expenseGoal: number
    profitGoal: number
    incomeProgress: number
    expenseProgress: number
    profitProgress: number
  }
}

export default function FinancePage() {
  const [activeModule, setActiveModule] = useState<ModuleView>('dashboard')
  const [selectedPeriod, setSelectedPeriod] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary>({
    currentBalance: 450000,
    monthlyIncome: 250000,
    monthlyExpenses: 180000,
    netProfit: 70000,
    profitMargin: 28,
    incomeChange: 12,
    expenseChange: -5,
    profitChange: 15,
    marginChange: 2.5,
    cashFlow: [],
    alerts: [],
    operationalMetrics: {
      courtRevenue: 120000,
      classRevenue: 85000,
      tournamentRevenue: 45000,
      collectedAmount: 235000,
      pendingAmount: 15000,
      invoiceCount: 142,
      paidInvoices: 139
    },
    topIncomeSource: [],
    topExpenseCategory: [],
    monthlyGoals: {
      incomeGoal: 330000,
      expenseGoal: 200000,
      profitGoal: 82000,
      incomeProgress: 75,
      expenseProgress: 90,
      profitProgress: 85
    }
  })

  useEffect(() => {
    if (activeModule === 'dashboard') {
      loadExecutiveSummary()
    }
  }, [activeModule, selectedPeriod])

  const loadExecutiveSummary = async () => {
    setLoading(true)
    try {
      // Generate mock cash flow data for last 30 days
      const cashFlowData = []
      let balance = 350000
      for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i)
        const income = Math.floor(Math.random() * 15000) + 5000
        const expense = Math.floor(Math.random() * 12000) + 3000
        balance += (income - expense)
        cashFlowData.push({
          date: format(date, 'yyyy-MM-dd'),
          income: income * 100,
          expense: expense * 100,
          balance: balance * 100
        })
      }

      // Generate alerts
      const alerts = [
        { type: 'warning', message: 'Gastos pendientes de aprobar', action: '/dashboard/finance/expenses', count: 5 },
        { type: 'urgent', message: 'Nómina por procesar (vence en 3 días)', action: '/dashboard/finance/payroll', count: 1 },
        { type: 'info', message: 'Facturas vencidas por cobrar', action: '/dashboard/finance/income', count: 2 },
        { type: 'alert', message: 'Presupuesto de marketing excedido (115%)', action: '/dashboard/finance/budgets', count: 1 }
      ]

      // Top income sources
      const topIncome = [
        { category: 'Reservas', amount: 12000000, percentage: 48 },
        { category: 'Clases', amount: 8500000, percentage: 34 },
        { category: 'Torneos', amount: 4500000, percentage: 18 },
        { category: 'Membresías', amount: 2500000, percentage: 10 },
        { category: 'Tienda', amount: 1500000, percentage: 6 }
      ]

      // Top expense categories
      const topExpense = [
        { category: 'Nómina', amount: 8000000, percentage: 44 },
        { category: 'Renta', amount: 2500000, percentage: 14 },
        { category: 'Mantenimiento', amount: 1500000, percentage: 8 },
        { category: 'Servicios', amount: 1200000, percentage: 7 },
        { category: 'Marketing', amount: 800000, percentage: 4 }
      ]

      setExecutiveSummary(prev => ({
        ...prev,
        cashFlow: cashFlowData,
        alerts,
        topIncomeSource: topIncome,
        topExpenseCategory: topExpense
      }))
    } catch (error) {
      console.error('Error loading executive summary:', error)
      toast.error('Error al cargar el resumen ejecutivo')
    } finally {
      setLoading(false)
    }
  }

  const renderExecutiveDashboard = () => (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Ejecutivo de Finanzas</h1>
            <p className="text-gray-600 mt-1">Vista general del estado financiero del club</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Balance General</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(executiveSummary.currentBalance / 100)}
              </p>
            </div>
            <InputModern
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardModern className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-green-50 rounded-full -mr-16 -mt-16 opacity-50" />
          <CardModernContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className={`text-sm font-semibold ${executiveSummary.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {executiveSummary.incomeChange >= 0 ? '+' : ''}{executiveSummary.incomeChange}%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Ingresos del Mes</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(executiveSummary.monthlyIncome / 100)}
            </p>
            <p className="text-xs text-gray-500 mt-2">vs mes anterior</p>
          </CardModernContent>
        </CardModern>

        <CardModern className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-red-50 rounded-full -mr-16 -mt-16 opacity-50" />
          <CardModernContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <span className={`text-sm font-semibold ${executiveSummary.expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {executiveSummary.expenseChange}%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Gastos del Mes</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(executiveSummary.monthlyExpenses / 100)}
            </p>
            <p className="text-xs text-gray-500 mt-2">vs mes anterior</p>
          </CardModernContent>
        </CardModern>

        <CardModern className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
          <CardModernContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <span className={`text-sm font-semibold ${executiveSummary.profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {executiveSummary.profitChange >= 0 ? '+' : ''}{executiveSummary.profitChange}%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Utilidad Neta</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(executiveSummary.netProfit / 100)}
            </p>
            <p className="text-xs text-gray-500 mt-2">vs mes anterior</p>
          </CardModernContent>
        </CardModern>

        <CardModern className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full -mr-16 -mt-16 opacity-50" />
          <CardModernContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
              <span className={`text-sm font-semibold ${executiveSummary.marginChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {executiveSummary.marginChange >= 0 ? '+' : ''}{executiveSummary.marginChange}pp
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Margen de Utilidad</p>
            <p className="text-2xl font-bold text-gray-900">
              {executiveSummary.profitMargin}%
            </p>
            <p className="text-xs text-gray-500 mt-2">vs mes anterior</p>
          </CardModernContent>
        </CardModern>
      </div>

      {/* Cash Flow Chart */}
      <CardModern>
        <CardModernHeader>
          <CardModernTitle>Flujo de Efectivo - Últimos 30 días</CardModernTitle>
          <ButtonModern variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Ver detalles
          </ButtonModern>
        </CardModernHeader>
        <CardModernContent>
          <div className="h-64 relative">
            {/* Simple line chart visualization */}
            <div className="absolute inset-0 flex items-end justify-between gap-1">
              {executiveSummary.cashFlow.map((day, index) => {
                const maxBalance = Math.max(...executiveSummary.cashFlow.map(d => d.balance))
                const height = (day.balance / maxBalance) * 100
                return (
                  <div
                    key={index}
                    className="flex-1 bg-gradient-to-t from-green-500 to-green-300 rounded-t hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${format(new Date(day.date), 'dd MMM')}: ${formatCurrency(day.balance / 100)}`}
                  />
                )
              })}
            </div>
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Saldo Actual</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(executiveSummary.cashFlow[executiveSummary.cashFlow.length - 1]?.balance / 100 || 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Proyección Fin de Mes</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency((executiveSummary.cashFlow[executiveSummary.cashFlow.length - 1]?.balance + 50000) / 100 || 0)}
              </p>
            </div>
          </div>
        </CardModernContent>
      </CardModern>

      {/* Alerts Section */}
      {executiveSummary.alerts.length > 0 && (
        <CardModern className="border-yellow-200 bg-yellow-50">
          <CardModernHeader>
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <CardModernTitle>Requiere Atención</CardModernTitle>
            </div>
          </CardModernHeader>
          <CardModernContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {executiveSummary.alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveModule(alert.action.split('/').pop() as ModuleView)}
                >
                  <div className="flex items-center">
                    {alert.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />}
                    {alert.type === 'urgent' && <Clock className="w-4 h-4 text-red-600 mr-2" />}
                    {alert.type === 'info' && <Info className="w-4 h-4 text-blue-600 mr-2" />}
                    {alert.type === 'alert' && <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />}
                    <span className="text-sm font-medium text-gray-700">{alert.message}</span>
                  </div>
                  {alert.count && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                      {alert.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardModernContent>
        </CardModern>
      )}

      {/* Operational Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <CardModern className="hover:shadow-lg transition-shadow">
          <CardModernContent className="p-4">
            <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 text-blue-600 mr-2" />
              <p className="text-xs text-gray-600">Canchas</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(executiveSummary.operationalMetrics.courtRevenue / 100)}
            </p>
            <p className="text-xs text-gray-500">48% del total</p>
          </CardModernContent>
        </CardModern>

        <CardModern className="hover:shadow-lg transition-shadow">
          <CardModernContent className="p-4">
            <div className="flex items-center mb-2">
              <Users className="w-4 h-4 text-purple-600 mr-2" />
              <p className="text-xs text-gray-600">Clases</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(executiveSummary.operationalMetrics.classRevenue / 100)}
            </p>
            <p className="text-xs text-gray-500">34% del total</p>
          </CardModernContent>
        </CardModern>

        <CardModern className="hover:shadow-lg transition-shadow">
          <CardModernContent className="p-4">
            <div className="flex items-center mb-2">
              <Award className="w-4 h-4 text-yellow-600 mr-2" />
              <p className="text-xs text-gray-600">Torneos</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(executiveSummary.operationalMetrics.tournamentRevenue / 100)}
            </p>
            <p className="text-xs text-gray-500">18% del total</p>
          </CardModernContent>
        </CardModern>

        <CardModern className="hover:shadow-lg transition-shadow">
          <CardModernContent className="p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <p className="text-xs text-gray-600">Cobrado</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(executiveSummary.operationalMetrics.collectedAmount / 100)}
            </p>
            <p className="text-xs text-green-600">94% cobrado</p>
          </CardModernContent>
        </CardModern>

        <CardModern className="hover:shadow-lg transition-shadow">
          <CardModernContent className="p-4">
            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 text-orange-600 mr-2" />
              <p className="text-xs text-gray-600">Pendiente</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(executiveSummary.operationalMetrics.pendingAmount / 100)}
            </p>
            <p className="text-xs text-orange-600">6% por cobrar</p>
          </CardModernContent>
        </CardModern>

        <CardModern className="hover:shadow-lg transition-shadow">
          <CardModernContent className="p-4">
            <div className="flex items-center mb-2">
              <FileText className="w-4 h-4 text-indigo-600 mr-2" />
              <p className="text-xs text-gray-600">Facturas</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {executiveSummary.operationalMetrics.invoiceCount}
            </p>
            <p className="text-xs text-green-600">98% pagadas</p>
          </CardModernContent>
        </CardModern>
      </div>

      {/* Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardModern>
          <CardModernHeader>
            <CardModernTitle>Top 5 Fuentes de Ingreso</CardModernTitle>
          </CardModernHeader>
          <CardModernContent>
            <div className="space-y-3">
              {executiveSummary.topIncomeSource.slice(0, 5).map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">{index + 1}.</span>
                    <span className="text-sm text-gray-600">{source.category}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-900 mr-2">
                      {formatCurrency(source.amount / 100)}
                    </span>
                    <span className="text-xs text-gray-500">({source.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardModernContent>
        </CardModern>

        <CardModern>
          <CardModernHeader>
            <CardModernTitle>Top 5 Categorías de Gasto</CardModernTitle>
          </CardModernHeader>
          <CardModernContent>
            <div className="space-y-3">
              {executiveSummary.topExpenseCategory.slice(0, 5).map((expense, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">{index + 1}.</span>
                    <span className="text-sm text-gray-600">{expense.category}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-900 mr-2">
                      {formatCurrency(expense.amount / 100)}
                    </span>
                    <span className="text-xs text-gray-500">({expense.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardModernContent>
        </CardModern>
      </div>

      {/* Monthly Goals Progress */}
      <CardModern>
        <CardModernHeader>
          <CardModernTitle>Progreso hacia Meta Mensual</CardModernTitle>
          <ButtonModern variant="ghost" size="sm" onClick={() => setActiveModule('budgets')}>
            <Target className="w-4 h-4 mr-2" />
            Configurar metas
          </ButtonModern>
        </CardModernHeader>
        <CardModernContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Ingresos</span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(executiveSummary.monthlyIncome / 100)} / {formatCurrency(executiveSummary.monthlyGoals.incomeGoal / 100)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, executiveSummary.monthlyGoals.incomeProgress)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{executiveSummary.monthlyGoals.incomeProgress}% alcanzado</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Gastos (Control)</span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(executiveSummary.monthlyExpenses / 100)} / {formatCurrency(executiveSummary.monthlyGoals.expenseGoal / 100)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    executiveSummary.monthlyGoals.expenseProgress > 100 
                      ? 'bg-gradient-to-r from-red-400 to-red-600' 
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                  }`}
                  style={{ width: `${Math.min(100, executiveSummary.monthlyGoals.expenseProgress)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{executiveSummary.monthlyGoals.expenseProgress}% utilizado</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Utilidad</span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(executiveSummary.netProfit / 100)} / {formatCurrency(executiveSummary.monthlyGoals.profitGoal / 100)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, executiveSummary.monthlyGoals.profitProgress)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{executiveSummary.monthlyGoals.profitProgress}% alcanzado</p>
            </div>
          </div>
        </CardModernContent>
      </CardModern>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <ButtonModern onClick={() => setActiveModule('income')}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Transacción
        </ButtonModern>
        <ButtonModern variant="secondary" onClick={() => setActiveModule('reports')}>
          <BarChart3 className="w-4 h-4 mr-2" />
          Generar Reporte
        </ButtonModern>
        <ButtonModern variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Datos
        </ButtonModern>
        <ButtonModern variant="ghost">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Configuración
        </ButtonModern>
      </div>

      {/* Module Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        <CardModern 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveModule('income')}
        >
          <CardModernContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Ingresos</h3>
            <p className="text-sm text-gray-600">Gestiona transacciones y fuentes de ingreso</p>
          </CardModernContent>
        </CardModern>

        <CardModern 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveModule('expenses')}
        >
          <CardModernContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Receipt className="w-6 h-6 text-red-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Gastos</h3>
            <p className="text-sm text-gray-600">Control de gastos fijos y variables</p>
          </CardModernContent>
        </CardModern>

        <CardModern 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveModule('payroll')}
        >
          <CardModernContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Nómina</h3>
            <p className="text-sm text-gray-600">Gestión de empleados e instructores</p>
          </CardModernContent>
        </CardModern>

        <CardModern 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveModule('reports')}
        >
          <CardModernContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Reportes</h3>
            <p className="text-sm text-gray-600">Análisis y estadísticas financieras</p>
          </CardModernContent>
        </CardModern>

        <CardModern 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveModule('budgets')}
        >
          <CardModernContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Presupuestos</h3>
            <p className="text-sm text-gray-600">Control y planificación presupuestaria</p>
          </CardModernContent>
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
      {loading && activeModule === 'dashboard' ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {activeModule === 'dashboard' && renderExecutiveDashboard()}
          {activeModule === 'income' && <IncomeModule />}
          {activeModule === 'expenses' && <ExpensesModule />}
          {activeModule === 'payroll' && <PayrollModule />}
          {activeModule === 'reports' && <ReportsModule />}
          {activeModule === 'budgets' && <BudgetsModule />}
        </>
      )}
    </CleanDashboardLayout>
  )
}