'use client'

import React, { useState, useEffect } from 'react'
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { 
  DollarSign, TrendingUp, Receipt, Users,
  Plus, Search, Filter, Download, Calendar,
  Eye, Edit, MoreVertical, ChevronLeft, ChevronRight,
  BarChart3, FileText, Target, Wallet
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Import sub-modules
import IncomeModule from './modules/IncomeModule'
import ExpensesModule from './modules/ExpensesModule'
import PayrollModule from './modules/PayrollModule'
import ReportsModule from './modules/ReportsModule'
import BudgetsModule from './modules/BudgetsModule'

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

export default function FinancePageClean() {
  const [activeModule, setActiveModule] = useState<ModuleView>('dashboard')
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data más simple
  const [transactions] = useState<Transaction[]>([
    { id: '1', concept: 'Reserva Cancha 1', category: 'Reservas', amount: 25000, date: '2024-01-15', type: 'income', status: 'completed' },
    { id: '2', concept: 'Clase Grupal', category: 'Clases', amount: 15000, date: '2024-01-14', type: 'income', status: 'completed' },
    { id: '3', concept: 'Nómina Instructor', category: 'Nómina', amount: -50000, date: '2024-01-14', type: 'expense', status: 'pending' },
    { id: '4', concept: 'Torneo Mensual', category: 'Torneos', amount: 120000, date: '2024-01-13', type: 'income', status: 'completed' },
    { id: '5', concept: 'Mantenimiento', category: 'Servicios', amount: -15000, date: '2024-01-12', type: 'expense', status: 'completed' },
  ])

  const totalIncome = 250000
  const totalExpenses = 180000
  const netProfit = totalIncome - totalExpenses
  const profitMargin = ((netProfit / totalIncome) * 100).toFixed(0)

  const renderDashboard = () => (
    <>
      {/* Header simple */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Finanzas</h1>
        <p className="text-sm text-gray-600 mt-1">Gestión financiera del club</p>
      </div>

      {/* Métricas simplificadas - sin decoración excesiva */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600">+12%</span>
            </div>
            <p className="text-xs text-gray-600">Ingresos del Mes</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              {formatCurrency(totalIncome)}
            </p>
          </CardModernContent>
        </CardModern>

        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Receipt className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm font-medium text-red-600">-5%</span>
            </div>
            <p className="text-xs text-gray-600">Gastos del Mes</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              {formatCurrency(totalExpenses)}
            </p>
          </CardModernContent>
        </CardModern>

        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-green-600">+15%</span>
            </div>
            <p className="text-xs text-gray-600">Utilidad Neta</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              {formatCurrency(netProfit)}
            </p>
          </CardModernContent>
        </CardModern>

        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">{profitMargin}%</span>
            </div>
            <p className="text-xs text-gray-600">Margen</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              Saludable
            </p>
          </CardModernContent>
        </CardModern>
      </div>

      {/* Tabs de navegación estilo Reservas */}
      <div className="flex items-center gap-2 mb-6">
        <ButtonModern 
          variant={activeModule === 'dashboard' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveModule('dashboard')}
        >
          Vista General
        </ButtonModern>
        <ButtonModern 
          variant={activeModule === 'income' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveModule('income')}
        >
          Ingresos
        </ButtonModern>
        <ButtonModern 
          variant={activeModule === 'expenses' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveModule('expenses')}
        >
          Gastos
        </ButtonModern>
        <ButtonModern 
          variant={activeModule === 'payroll' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveModule('payroll')}
        >
          Nómina
        </ButtonModern>
        <ButtonModern 
          variant={activeModule === 'reports' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveModule('reports')}
        >
          Reportes
        </ButtonModern>
      </div>

      {/* Contenido principal estilo Reservas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de transacciones - 2/3 del ancho */}
        <div className="lg:col-span-2">
          <CardModern>
            <CardModernHeader>
              <div className="flex items-center justify-between w-full">
                <CardModernTitle>Transacciones Recientes</CardModernTitle>
                <div className="flex items-center gap-2">
                  <ButtonModern variant="ghost" size="sm">
                    <Filter className="w-4 h-4" />
                  </ButtonModern>
                  <ButtonModern size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Nueva
                  </ButtonModern>
                </div>
              </div>
            </CardModernHeader>
            <CardModernContent>
              {/* Buscador */}
              <div className="mb-4">
                <InputModern
                  type="text"
                  placeholder="Buscar transacción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="w-4 h-4 text-gray-400" />}
                />
              </div>

              {/* Tabla simple */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Concepto</th>
                      <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Monto</th>
                      <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.concept}</p>
                            <p className="text-xs text-gray-500">{transaction.category}</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <p className="text-sm text-gray-600">
                            {format(new Date(transaction.date), 'dd MMM', { locale: es })}
                          </p>
                        </td>
                        <td className="py-3">
                          <p className={`text-sm font-medium ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(Math.abs(transaction.amount))}
                          </p>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {transaction.status === 'completed' ? 'Completado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <ButtonModern variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </ButtonModern>
                            <ButtonModern variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </ButtonModern>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardModernContent>
          </CardModern>
        </div>

        {/* Panel lateral - 1/3 del ancho */}
        <div className="space-y-4">
          {/* Resumen del mes */}
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>Resumen del Mes</CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Ingresos</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Gastos</span>
                  <span className="text-sm font-semibold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Balance</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(netProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Acciones rápidas */}
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>Acciones Rápidas</CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div className="space-y-2">
                <ButtonModern variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generar Reporte
                </ButtonModern>
                <ButtonModern variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Datos
                </ButtonModern>
                <ButtonModern variant="outline" size="sm" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Ver Análisis
                </ButtonModern>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Selector de periodo */}
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>Periodo</CardModernTitle>
            </CardModernHeader>
            <CardModernContent>
              <div className="flex items-center justify-between">
                <ButtonModern variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4" />
                </ButtonModern>
                <span className="text-sm font-medium">
                  {format(selectedMonth, 'MMMM yyyy', { locale: es })}
                </span>
                <ButtonModern variant="ghost" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </ButtonModern>
              </div>
            </CardModernContent>
          </CardModern>
        </div>
      </div>
    </>
  )

  return (
    <CleanDashboardLayout
      clubName="Club Pádel México"
      userName="Administrador del Club"
      userRole="Administrador"
    >
      <div className="px-8">
        {activeModule === 'dashboard' && renderDashboard()}
        {activeModule === 'income' && <IncomeModule />}
        {activeModule === 'expenses' && <ExpensesModule />}
        {activeModule === 'payroll' && <PayrollModule />}
        {activeModule === 'reports' && <ReportsModule />}
        {activeModule === 'budgets' && <BudgetsModule />}
      </div>
    </CleanDashboardLayout>
  )
}