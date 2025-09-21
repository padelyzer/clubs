'use client'

import React, { useState } from 'react'
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { 
  Calendar, Plus, Users, Clock, DollarSign, TrendingUp,
  Search, Filter, ChevronLeft, ChevronRight, MapPin,
  CheckCircle, AlertCircle, Loader2, Eye, Edit
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'

// EJEMPLO: Módulo de Reservas siguiendo el estándar unificado
export default function BookingsUnifiedExample() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  // Mock de datos de reservas
  const bookings = [
    {
      id: '1',
      playerName: 'Juan Pérez',
      court: 'Cancha Central',
      time: '10:00 - 11:00',
      status: 'confirmed',
      amount: 25000
    },
    {
      id: '2',
      playerName: 'María García',
      court: 'Cancha Norte',
      time: '14:00 - 15:00',
      status: 'pending',
      amount: 30000
    },
    {
      id: '3',
      playerName: 'Carlos López',
      court: 'Cancha Sur',
      time: '18:00 - 19:00',
      status: 'confirmed',
      amount: 25000
    }
  ]

  const MetricCard = ({ icon: Icon, label, value, change, trend, color }: any) => (
    <CardModern>
      <CardModernContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-${color}-100 rounded-lg`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          {change && (
            <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </CardModernContent>
    </CardModern>
  )

  return (
    <CleanDashboardLayout
      clubName="Club Pádel México"
      userName="Administrador"
      userRole="Administrador"
    >
      {/* 1. PAGE HEADER - Consistente con el estándar */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Reservas
        </h1>
        <p className="text-gray-600">
          Administra las reservas de canchas y clases del club
        </p>
      </div>

      {/* 2. METRICS ROW - Siempre 4 métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={Calendar}
          label="Reservas Hoy"
          value="24"
          change="+12%"
          trend="up"
          color="blue"
        />
        <MetricCard
          icon={DollarSign}
          label="Ingresos del Día"
          value={formatCurrency(620000)}
          change="+8%"
          trend="up"
          color="green"
        />
        <MetricCard
          icon={Users}
          label="Clientes Únicos"
          value="18"
          change="-5%"
          trend="down"
          color="purple"
        />
        <MetricCard
          icon={Clock}
          label="Ocupación"
          value="75%"
          change="+3%"
          trend="up"
          color="orange"
        />
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="space-y-6">
        {/* View Mode Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <ButtonModern
              variant={viewMode === 'calendar' ? 'primary' : 'outline'}
              onClick={() => setViewMode('calendar')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendario
            </ButtonModern>
            <ButtonModern
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <Users className="w-4 h-4 mr-2" />
              Lista
            </ButtonModern>
          </div>
          <ButtonModern>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Reserva
          </ButtonModern>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar/List View - 2/3 width */}
          <div className="lg:col-span-2">
            <CardModern>
              <CardModernHeader>
                <CardModernTitle>
                  {viewMode === 'calendar' ? 'Vista de Calendario' : 'Lista de Reservas'}
                </CardModernTitle>
                <div className="flex items-center gap-2">
                  <ButtonModern variant="ghost" size="sm">
                    <ChevronLeft className="w-4 h-4" />
                  </ButtonModern>
                  <span className="text-sm font-medium">Hoy</span>
                  <ButtonModern variant="ghost" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </ButtonModern>
                </div>
              </CardModernHeader>
              <CardModernContent>
                {/* Search Bar */}
                <div className="mb-4 flex gap-2">
                  <InputModern
                    type="text"
                    placeholder="Buscar por nombre o teléfono..."
                    className="flex-1"
                  />
                  <ButtonModern variant="secondary">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </ButtonModern>
                </div>

                {/* Bookings List */}
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="font-medium text-gray-900">
                                {booking.playerName}
                              </span>
                              <span className="text-sm text-gray-500">
                                {booking.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {booking.court}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                {formatCurrency(booking.amount)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <ButtonModern variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </ButtonModern>
                            <ButtonModern variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </ButtonModern>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardModernContent>
            </CardModern>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <CardModern>
              <CardModernHeader>
                <CardModernTitle>Resumen del Día</CardModernTitle>
              </CardModernHeader>
              <CardModernContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Reservas</span>
                    <span className="text-sm font-semibold">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confirmadas</span>
                    <span className="text-sm font-semibold text-green-600">20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pendientes</span>
                    <span className="text-sm font-semibold text-yellow-600">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Canceladas</span>
                    <span className="text-sm font-semibold text-red-600">0</span>
                  </div>
                </div>
              </CardModernContent>
            </CardModern>

            {/* Horarios Disponibles */}
            <CardModern>
              <CardModernHeader>
                <CardModernTitle>Horarios Disponibles</CardModernTitle>
              </CardModernHeader>
              <CardModernContent>
                <div className="grid grid-cols-2 gap-2">
                  {['08:00', '09:00', '12:00', '13:00', '16:00', '17:00'].map((time) => (
                    <ButtonModern
                      key={time}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {time}
                    </ButtonModern>
                  ))}
                </div>
              </CardModernContent>
            </CardModern>

            {/* Notificación */}
            <CardModern className="bg-blue-50 border-blue-200">
              <CardModernContent>
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Recordatorio
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Tienes 2 reservas sin confirmar pago
                    </p>
                  </div>
                </div>
              </CardModernContent>
            </CardModern>
          </div>
        </div>
      </div>

      {/* 4. ACTIONS BAR */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Mostrando {bookings.length} reservas para hoy
          </p>
          <div className="flex gap-3">
            <ButtonModern variant="secondary">
              Exportar
            </ButtonModern>
            <ButtonModern>
              Sincronizar
            </ButtonModern>
          </div>
        </div>
      </div>
    </CleanDashboardLayout>
  )
}