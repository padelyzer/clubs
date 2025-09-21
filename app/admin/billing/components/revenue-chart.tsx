'use client'

import { useState } from 'react'
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react'

interface RevenueData {
  month: string
  revenue: number
  invoices: number
  date: Date
}

interface RevenueChartProps {
  data: RevenueData[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [viewMode, setViewMode] = useState<'revenue' | 'invoices'>('revenue')
  const [periodView, setPeriodView] = useState<'6months' | '12months'>('12months')

  const formatPrice = (price: number, currency: string = 'MXN') => {
    return price.toLocaleString('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  // Filter data based on period view
  const filteredData = periodView === '6months' ? data.slice(-6) : data

  // Calculate max value for scaling
  const maxRevenue = Math.max(...filteredData.map(d => d.revenue))
  const maxInvoices = Math.max(...filteredData.map(d => d.invoices))
  const maxValue = viewMode === 'revenue' ? maxRevenue : maxInvoices

  // Calculate growth metrics
  const currentMonth = filteredData[filteredData.length - 1]
  const previousMonth = filteredData[filteredData.length - 2]
  const growth = previousMonth && currentMonth ? 
    ((currentMonth[viewMode] - previousMonth[viewMode]) / previousMonth[viewMode] * 100) : 0

  const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0)
  const totalInvoices = filteredData.reduce((sum, item) => sum + item.invoices, 0)
  const averageRevenue = totalRevenue / filteredData.length

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('revenue')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'revenue'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Ingresos
            </button>
            <button
              onClick={() => setViewMode('invoices')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'invoices'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Facturas
            </button>
          </div>
          
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPeriodView('6months')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                periodView === '6months'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              6 meses
            </button>
            <button
              onClick={() => setPeriodView('12months')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                periodView === '12months'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              12 meses
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {viewMode === 'revenue' ? formatPrice(totalRevenue) : totalInvoices}
            </div>
            <div className="text-sm text-gray-500">
              {viewMode === 'revenue' ? 'Total Ingresos' : 'Total Facturas'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {viewMode === 'revenue' ? formatPrice(averageRevenue) : Math.round(totalInvoices / filteredData.length)}
            </div>
            <div className="text-sm text-gray-500">Promedio</div>
          </div>
          
          <div className="text-center">
            <div className={`text-xl font-bold flex items-center gap-1 ${
              growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-5 h-5 ${growth < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(growth).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">vs mes anterior</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {viewMode === 'revenue' ? 'Tendencia de Ingresos' : 'Tendencia de Facturas'}
            </h3>
          </div>
          <div className="text-sm text-gray-500">
            Últimos {periodView === '6months' ? '6' : '12'} meses
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative h-80 overflow-hidden">
          {maxValue === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay datos disponibles</p>
              </div>
            </div>
          ) : (
            <div className="flex items-end justify-between h-full gap-2">
              {filteredData.map((item, index) => {
                const value = item[viewMode]
                const height = Math.max(((value / maxValue) * 100), 2) // Minimum 2% height
                const isCurrentMonth = index === filteredData.length - 1
                
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2 group"
                  >
                    {/* Bar */}
                    <div className="relative w-full flex items-end justify-center">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ease-out transform group-hover:scale-105 ${
                          isCurrentMonth
                            ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg'
                            : value > 0
                            ? 'bg-gradient-to-t from-blue-500 to-blue-300 hover:from-blue-600 hover:to-blue-400'
                            : 'bg-gradient-to-t from-gray-300 to-gray-200'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      
                      {/* Value tooltip on hover */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-2 px-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        {viewMode === 'revenue' ? formatPrice(value) : `${value} facturas`}
                        <div className="text-xs text-gray-300">
                          {item.month}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                    
                    {/* Month label */}
                    <div className={`text-xs text-center font-medium transition-colors ${
                      isCurrentMonth ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {item.month}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Y-axis guidelines */}
          <div className="absolute inset-0 pointer-events-none">
            {[0, 25, 50, 75, 100].map(percent => (
              <div
                key={percent}
                className="absolute left-0 right-0 border-t border-gray-300 border-opacity-30"
                style={{ bottom: `${percent}%` }}
              >
                {percent > 0 && (
                  <div className="absolute -left-16 -top-2 text-xs text-gray-500 bg-white px-2 rounded">
                    {viewMode === 'revenue' 
                      ? formatPrice((maxValue * percent / 100))
                      : Math.round(maxValue * percent / 100)
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-t from-blue-600 to-blue-400 rounded"></div>
                <span className="text-gray-600">Mes actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-300 rounded"></div>
                <span className="text-gray-600">Meses anteriores</span>
              </div>
            </div>
            
            <div className="text-gray-500">
              Promedio: {viewMode === 'revenue' ? formatPrice(averageRevenue) : `${Math.round(totalInvoices / filteredData.length)} facturas`}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-800">Mejor Mes</h4>
          </div>
          <div className="text-green-700">
            {(() => {
              const bestMonth = filteredData.reduce((max, item) => 
                item[viewMode] > max[viewMode] ? item : max
              )
              return (
                <div>
                  <div className="font-bold">
                    {viewMode === 'revenue' ? formatPrice(bestMonth.revenue) : `${bestMonth.invoices} facturas`}
                  </div>
                  <div className="text-sm">{bestMonth.month}</div>
                </div>
              )
            })()}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800">Este Mes</h4>
          </div>
          <div className="text-blue-700">
            <div className="font-bold">
              {viewMode === 'revenue' 
                ? formatPrice(currentMonth?.revenue || 0) 
                : `${currentMonth?.invoices || 0} facturas`
              }
            </div>
            <div className="text-sm">
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs anterior
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-800">Proyección</h4>
          </div>
          <div className="text-purple-700">
            <div className="font-bold">
              {viewMode === 'revenue' 
                ? formatPrice(averageRevenue * 1.1) 
                : `${Math.round(totalInvoices / filteredData.length * 1.1)} facturas`
              }
            </div>
            <div className="text-sm">Próximo mes (est.)</div>
          </div>
        </div>
      </div>
    </div>
  )
}