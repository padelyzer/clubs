'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3 } from 'lucide-react'

interface MonthlyData {
  month: string
  newSubscriptions?: number
  churnedSubscriptions?: number
  revenue?: number
  activeSubscriptions?: number
  netGrowth?: number
}

interface RevenueData {
  month: string
  subscriptionRevenue?: number
  bookingRevenue?: number
  totalRevenue?: number
}

type ChartData = MonthlyData | RevenueData

interface GrowthChartProps {
  data: ChartData[]
  title: string
  type: 'mrr' | 'revenue' | 'growth' | 'subscriptions' | 'revenue_breakdown'
}

export default function GrowthChart({ data, title, type }: GrowthChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getChartConfig = () => {
    switch (type) {
      case 'mrr':
        const mrrData = data as MonthlyData[]
        const maxMRR = Math.max(...mrrData.map(d => d.revenue || 0), 1)
        return {
          primaryColor: 'rgb(59, 130, 246)', // blue-500
          secondaryColor: 'rgb(147, 197, 253)', // blue-300
          maxValue: maxMRR,
          formatValue: formatCurrency,
          dataKey: 'revenue' as keyof MonthlyData,
          showGradient: true
        }
      
      case 'revenue':
      case 'revenue_breakdown':
        const revData = data as RevenueData[]
        const maxRevenue = Math.max(...revData.map(d => d.totalRevenue || 0), 1)
        return {
          primaryColor: 'rgb(16, 185, 129)', // emerald-500
          secondaryColor: 'rgb(110, 231, 183)', // emerald-300
          maxValue: maxRevenue,
          formatValue: formatCurrency,
          dataKey: 'totalRevenue' as keyof RevenueData,
          showGradient: true,
          stackedData: type === 'revenue_breakdown' ? ['subscriptionRevenue', 'bookingRevenue'] : null
        }
      
      case 'growth':
        const growthData = data as MonthlyData[]
        const maxGrowth = Math.max(...growthData.map(d => Math.max(d.newSubscriptions || 0, d.activeSubscriptions || 0)), 1)
        return {
          primaryColor: 'rgb(139, 92, 246)', // violet-500
          secondaryColor: 'rgb(196, 181, 253)', // violet-300
          maxValue: maxGrowth,
          formatValue: (val: number) => val.toString(),
          dataKey: 'activeSubscriptions' as keyof MonthlyData,
          lineChart: true
        }
      
      case 'subscriptions':
        const subData = data as MonthlyData[]
        const maxSubs = Math.max(...subData.map(d => Math.max(d.newSubscriptions || 0, d.churnedSubscriptions || 0)), 1)
        return {
          primaryColor: 'rgb(239, 68, 68)', // red-500
          secondaryColor: 'rgb(34, 197, 94)', // green-500
          maxValue: maxSubs,
          formatValue: (val: number) => val.toString(),
          dataKey: 'newSubscriptions' as keyof MonthlyData,
          dualBars: true
        }
      
      default:
        return {
          primaryColor: 'rgb(99, 102, 241)', // indigo-500
          secondaryColor: 'rgb(165, 180, 252)', // indigo-300
          maxValue: 100,
          formatValue: (val: number) => val.toString(),
          dataKey: 'revenue' as keyof (MonthlyData | RevenueData)
        }
    }
  }

  const config = getChartConfig()
  const chartHeight = 200
  const chartWidth = 600
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  const getBarHeight = (value: number) => {
    if (!value || !config.maxValue || config.maxValue === 0) return 0
    return Math.max(0, (value / config.maxValue) * innerHeight)
  }

  const getX = (index: number) => {
    return (index * innerWidth) / (data.length - 1)
  }

  const getY = (value: number) => {
    const height = getBarHeight(value)
    if (isNaN(height)) return innerHeight
    return innerHeight - height
  }

  // Generate SVG path for line chart
  const generatePath = (dataKey: string) => {
    return data
      .map((item, index) => {
        const value = (item as any)[dataKey] || 0
        const x = getX(index)
        const y = getY(value)
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }

  // Generate gradient path for area chart
  const generateAreaPath = (dataKey: string) => {
    const path = generatePath(dataKey)
    const lastX = getX(data.length - 1)
    const bottomY = innerHeight
    return `${path} L ${lastX} ${bottomY} L 0 ${bottomY} Z`
  }

  const renderBarChart = () => {
    const barWidth = innerWidth / data.length * 0.6

    if (config.dualBars && type === 'subscriptions') {
      return data.map((item, index) => {
        const monthlyItem = item as MonthlyData
        const newSubs = monthlyItem.newSubscriptions || 0
        const churnedSubs = monthlyItem.churnedSubscriptions || 0
        const x = (index * innerWidth) / data.length + (innerWidth / data.length - barWidth) / 2

        return (
          <g key={index}>
            {/* New subscriptions bar */}
            <rect
              x={x}
              y={getY(newSubs)}
              width={barWidth / 2 - 2}
              height={getBarHeight(newSubs)}
              fill={config.secondaryColor}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {/* Churned subscriptions bar */}
            <rect
              x={x + barWidth / 2 + 2}
              y={getY(churnedSubs)}
              width={barWidth / 2 - 2}
              height={getBarHeight(churnedSubs)}
              fill={config.primaryColor}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          </g>
        )
      })
    }

    if (config.stackedData && type === 'revenue_breakdown') {
      return data.map((item, index) => {
        const revenueItem = item as RevenueData
        const subRevenue = revenueItem.subscriptionRevenue || 0
        const bookingRevenue = revenueItem.bookingRevenue || 0
        const x = (index * innerWidth) / data.length + (innerWidth / data.length - barWidth) / 2

        return (
          <g key={index}>
            {/* Subscription revenue */}
            <rect
              x={x}
              y={getY(subRevenue + bookingRevenue)}
              width={barWidth}
              height={getBarHeight(subRevenue)}
              fill={config.primaryColor}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {/* Booking revenue */}
            <rect
              x={x}
              y={getY(bookingRevenue)}
              width={barWidth}
              height={getBarHeight(bookingRevenue)}
              fill={config.secondaryColor}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          </g>
        )
      })
    }

    // Regular bar chart
    return data.map((item, index) => {
      const value = (item as any)[config.dataKey] || 0
      const x = (index * innerWidth) / data.length + (innerWidth / data.length - barWidth) / 2

      return (
        <rect
          key={index}
          x={x}
          y={getY(value)}
          width={barWidth}
          height={getBarHeight(value)}
          fill={index === hoveredIndex ? config.secondaryColor : config.primaryColor}
          className="hover:opacity-80 transition-all duration-200 cursor-pointer"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        />
      )
    })
  }

  const renderLineChart = () => {
    return (
      <g>
        {/* Area gradient */}
        {config.showGradient && (
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={config.primaryColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={config.primaryColor} stopOpacity={0.1} />
            </linearGradient>
          </defs>
        )}
        
        {/* Area fill */}
        {config.showGradient && (
          <path
            d={generateAreaPath(config.dataKey as string)}
            fill={`url(#gradient-${type})`}
            className="transition-all duration-300"
          />
        )}
        
        {/* Line */}
        <path
          d={generatePath(config.dataKey as string)}
          stroke={config.primaryColor}
          strokeWidth="3"
          fill="none"
          className="transition-all duration-300"
        />
        
        {/* Data points */}
        {data.map((item, index) => {
          const value = (item as any)[config.dataKey] || 0
          const x = getX(index)
          const y = getY(value)
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={index === hoveredIndex ? 6 : 4}
              fill={config.primaryColor}
              stroke="white"
              strokeWidth="2"
              className="hover:r-6 transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          )
        })}
      </g>
    )
  }

  const getTooltipContent = (index: number) => {
    const item = data[index]
    
    switch (type) {
      case 'subscriptions':
        const subItem = item as MonthlyData
        return (
          <div className="text-xs">
            <div className="font-semibold">{item.month}</div>
            <div className="text-green-600">Nuevas: {subItem.newSubscriptions || 0}</div>
            <div className="text-red-600">Canceladas: {subItem.churnedSubscriptions || 0}</div>
            <div className="font-medium">Neto: {(subItem.newSubscriptions || 0) - (subItem.churnedSubscriptions || 0)}</div>
          </div>
        )
      
      case 'revenue_breakdown':
        const revItem = item as RevenueData
        return (
          <div className="text-xs">
            <div className="font-semibold">{item.month}</div>
            <div className="text-blue-600">Suscripciones: {formatCurrency(revItem.subscriptionRevenue || 0)}</div>
            <div className="text-green-600">Reservas: {formatCurrency(revItem.bookingRevenue || 0)}</div>
            <div className="font-medium">Total: {formatCurrency(revItem.totalRevenue || 0)}</div>
          </div>
        )
      
      default:
        const value = (item as any)[config.dataKey] || 0
        return (
          <div className="text-xs">
            <div className="font-semibold">{item.month}</div>
            <div>{config.formatValue(value)}</div>
          </div>
        )
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-4">
          {type === 'subscriptions' && (
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-green-500 mr-1" />
                <span>Nuevas</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-red-500 mr-1" />
                <span>Canceladas</span>
              </div>
            </div>
          )}
          {type === 'revenue_breakdown' && (
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-blue-500 mr-1" />
                <span>Suscripciones</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-green-500 mr-1" />
                <span>Reservas</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <svg
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto"
        >
          {/* Chart area */}
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="1" height="20" patternUnits="userSpaceOnUse">
                <path d="M 1 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width={innerWidth} height={innerHeight} fill="url(#grid)" />
            
            {/* Chart content */}
            {config.lineChart ? renderLineChart() : renderBarChart()}
            
            {/* X-axis labels */}
            {data.map((item, index) => (
              <text
                key={index}
                x={getX(index)}
                y={innerHeight + 30}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {item.month}
              </text>
            ))}
            
            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <text
                key={ratio}
                x={-10}
                y={innerHeight - ratio * innerHeight + 5}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {config.formatValue(config.maxValue * ratio)}
              </text>
            ))}
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-10 bg-gray-900 text-white p-3 rounded-lg shadow-lg pointer-events-none"
            style={{
              left: `${((hoveredIndex * innerWidth) / (data.length - 1) + padding.left)}px`,
              top: '10px',
              transform: 'translateX(-50%)'
            }}
          >
            {getTooltipContent(hoveredIndex)}
          </div>
        )}
      </div>
    </div>
  )
}