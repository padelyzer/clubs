'use client'

import React, { useState } from 'react'
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { CardModern, CardModernHeader, CardModernTitle, CardModernDescription, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { 
  LayoutDashboard, Calendar, Users, BookOpen, Grid3x3, DollarSign, Settings,
  Plus, Edit, Trash2, Save, X, Check, CheckCircle, AlertTriangle, AlertCircle,
  Info, Loader2, TrendingUp, TrendingDown, Clock, MapPin, Filter, Search,
  Download, ChevronRight, Eye, BarChart3, PieChart, Activity, Award
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/design-system/localization'

// Componente MetricCard estándar
const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  trend, 
  color = 'blue' 
}: {
  icon: any
  label: string
  value: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}) => {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
  const bgColor = `bg-${color}-100`
  const iconColor = `text-${color}-600`
  
  return (
    <CardModern>
      <CardModernContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 ${bgColor} rounded-lg`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          {change && (
            <span className={`text-sm font-semibold ${trendColor}`}>
              {change}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </CardModernContent>
    </CardModern>
  )
}

// Componente EmptyState estándar
const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: {
  icon: any
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) => (
  <div className="text-center py-12">
    <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4">{description}</p>
    {action && (
      <ButtonModern onClick={action.onClick}>
        <Plus className="w-4 h-4 mr-2" />
        {action.label}
      </ButtonModern>
    )}
  </div>
)

// Componente de Tabla estándar
const StandardTable = ({ data }: { data: any[] }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nombre
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Estado
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Fecha
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Monto
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((item, index) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {item.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {item.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.date}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {formatCurrency(item.amount)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <ButtonModern variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </ButtonModern>
              <ButtonModern variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </ButtonModern>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default function UIStandardDemo() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showModal, setShowModal] = useState(false)

  // Mock data
  const mockData = [
    { name: 'Reserva Cancha 1', status: 'Activo', date: '2024-01-15', amount: 25000 },
    { name: 'Clase Grupal', status: 'Completado', date: '2024-01-14', amount: 15000 },
    { name: 'Torneo Mensual', status: 'Pendiente', date: '2024-01-16', amount: 50000 },
  ]

  const tabs = [
    { id: 'overview', label: 'Vista General', icon: LayoutDashboard },
    { id: 'details', label: 'Detalles', icon: Info },
    { id: 'analytics', label: 'Análisis', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ]

  return (
    <CleanDashboardLayout
      clubName="Club Pádel México"
      userName="Administrador"
      userRole="Administrador"
    >
      <div className="px-8">
        {/* 1. PAGE HEADER - Estándar para todas las páginas */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demostración de UI Estándar
          </h1>
          <p className="text-gray-600">
            Esta página muestra todos los componentes y patrones UI estándar del sistema
          </p>
        </div>

        {/* 2. METRICS ROW - Siempre 4 métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={DollarSign}
          label="Ingresos del Mes"
          value={formatCurrency(250000)}
          change="+12%"
          trend="up"
          color="green"
        />
        <MetricCard
          icon={Users}
          label="Clientes Activos"
          value="1,234"
          change="+5%"
          trend="up"
          color="blue"
        />
        <MetricCard
          icon={Calendar}
          label="Reservas Hoy"
          value="42"
          change="-2%"
          trend="down"
          color="purple"
        />
        <MetricCard
          icon={Activity}
          label="Tasa Ocupación"
          value="87%"
          change="+8%"
          trend="up"
          color="orange"
        />
        </div>

        {/* 3. MAIN CONTENT AREA */}
        <div className="space-y-6">
        {/* Tabs Navigation - Cuando hay submódulos */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-2 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Card (2/3 width) */}
          <div className="lg:col-span-2">
            <CardModern>
              <CardModernHeader>
                <CardModernTitle>Contenido Principal</CardModernTitle>
                <div className="flex gap-2">
                  <ButtonModern variant="secondary" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </ButtonModern>
                  <ButtonModern size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo
                  </ButtonModern>
                </div>
              </CardModernHeader>
              <CardModernContent>
                {/* Search Bar */}
                <div className="mb-4">
                  <InputModern
                    type="text"
                    placeholder="Buscar..."
                    icon={<Search className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                {/* Table or List */}
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : mockData.length > 0 ? (
                  <StandardTable data={mockData} />
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title="No hay datos"
                    description="Comienza creando tu primer registro"
                    action={{
                      label: "Crear registro",
                      onClick: () => setShowModal(true)
                    }}
                  />
                )}
              </CardModernContent>
            </CardModern>
          </div>

          {/* Sidebar Cards (1/3 width) */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <CardModern>
              <CardModernHeader>
                <CardModernTitle>Estadísticas Rápidas</CardModernTitle>
              </CardModernHeader>
              <CardModernContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Promedio diario</span>
                    <span className="text-sm font-semibold text-gray-900">$8,333</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Meta mensual</span>
                    <span className="text-sm font-semibold text-green-600">75%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mejor día</span>
                    <span className="text-sm font-semibold text-gray-900">Viernes</span>
                  </div>
                </div>
              </CardModernContent>
            </CardModern>

            {/* Actions Card */}
            <CardModern>
              <CardModernHeader>
                <CardModernTitle>Acciones Rápidas</CardModernTitle>
              </CardModernHeader>
              <CardModernContent>
                <div className="space-y-2">
                  <ButtonModern variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Nueva Reserva
                  </ButtonModern>
                  <ButtonModern variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Agregar Cliente
                  </ButtonModern>
                  <ButtonModern variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Datos
                  </ButtonModern>
                </div>
              </CardModernContent>
            </CardModern>

            {/* Info Card */}
            <CardModern className="bg-blue-50 border-blue-200">
              <CardModernContent>
                <div className="flex">
                  <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Tip del día</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Usa atajos de teclado para navegar más rápido. Presiona '?' para ver todos los atajos.
                    </p>
                  </div>
                </div>
              </CardModernContent>
            </CardModern>
          </div>
        </div>

        {/* Progress Indicators */}
        <CardModern>
          <CardModernHeader>
            <CardModernTitle>Indicadores de Progreso</CardModernTitle>
          </CardModernHeader>
          <CardModernContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Ocupación de Canchas</span>
                  <span className="text-sm text-gray-600">87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Meta de Ingresos</span>
                  <span className="text-sm text-gray-600">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Satisfacción Cliente</span>
                  <span className="text-sm text-gray-600">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </CardModernContent>
        </CardModern>

        {/* Notification Examples */}
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">Éxito</p>
              <p className="text-sm text-green-700">La operación se completó correctamente.</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Advertencia</p>
              <p className="text-sm text-yellow-700">Revisa los datos antes de continuar.</p>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">Ocurrió un problema al procesar la solicitud.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTIONS BAR - Barra de acciones fija al final */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Mostrando 1-10 de 100 resultados
            </div>
            <div className="flex gap-3">
              <ButtonModern variant="outline">
                Cancelar
              </ButtonModern>
              <ButtonModern>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </ButtonModern>
            </div>
          </div>
        </div>
      </div>
    </CleanDashboardLayout>
  )
}