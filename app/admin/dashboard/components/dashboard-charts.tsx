'use client'

import { BarChart3, TrendingUp, Calendar } from 'lucide-react'

interface ChartData {
  bookings: Array<{ date: string; count: number }>
  revenue: Array<{ date: string; amount: number }>
  clubs: Array<{ date: string; count: number }>
}

interface DashboardChartsProps {
  charts: ChartData
}

export default function DashboardCharts({ charts }: DashboardChartsProps) {
  const maxBookings = Math.max(...charts.bookings.map(d => d.count))
  const maxRevenue = Math.max(...charts.revenue.map(d => d.amount))
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfica de Reservas */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Reservas por Día</h3>
            <p className="text-sm text-gray-500">Últimos 7 días</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {charts.bookings.map((day, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-12 text-xs text-gray-500 font-medium">
                {day.date}
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                <div 
                  className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${maxBookings > 0 ? (day.count / maxBookings) * 100 : 0}%` }}
                >
                  {day.count > 0 && (
                    <span className="text-xs text-white font-medium">
                      {day.count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfica de Ingresos */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Ingresos por Día</h3>
            <p className="text-sm text-gray-500">Últimos 7 días</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {charts.revenue.map((day, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-12 text-xs text-gray-500 font-medium">
                {day.date}
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                <div 
                  className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${maxRevenue > 0 ? (day.amount / maxRevenue) * 100 : 0}%` }}
                >
                  {day.amount > 0 && (
                    <span className="text-xs text-white font-medium">
                      ${day.amount.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de Actividad */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 lg:col-span-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Resumen Semanal</h3>
            <p className="text-sm text-gray-500">Comparativa de métricas</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {charts.bookings.reduce((sum, day) => sum + day.count, 0)}
            </div>
            <div className="text-sm text-gray-500">Reservas Totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${charts.revenue.reduce((sum, day) => sum + day.amount, 0).toLocaleString('es-MX')}
            </div>
            <div className="text-sm text-gray-500">Ingresos Totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {charts.clubs.reduce((sum, day) => sum + day.count, 0)}
            </div>
            <div className="text-sm text-gray-500">Clubes Nuevos</div>
          </div>
        </div>
      </div>
    </div>
  )
}