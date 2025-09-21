'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  change?: {
    value: string | number
    trend: 'up' | 'down' | 'neutral'
  }
  icon?: React.ReactNode
  variant?: 'default' | 'bordered' | 'elevated'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * StatCard Component - Minimal Linear Design System
 * 
 * @example
 * <StatCard
 *   label="Total Revenue"
 *   value="$12,450"
 *   change={{ value: "+12%", trend: "up" }}
 *   icon={<DollarIcon />}
 * />
 */
export function StatCard({
  className,
  label,
  value,
  change,
  icon,
  variant = 'default',
  size = 'md',
  ...props
}: StatCardProps) {
  const variants = {
    default: 'bg-white border border-gray-200',
    bordered: 'bg-white border-2 border-gray-900',
    elevated: 'bg-white border border-gray-100 shadow-md',
  }

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }

  return (
    <div
      className={cn(
        // Base styles
        'rounded-lg',
        'transition-all duration-200',
        
        // Variant
        variants[variant],
        
        // Size
        sizes[size],
        
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>
          
          <p className={cn(
            'font-bold text-gray-900',
            size === 'sm' && 'text-2xl mt-1',
            size === 'md' && 'text-3xl mt-2',
            size === 'lg' && 'text-4xl mt-3',
          )}>
            {value}
          </p>
          
          {change && (
            <div className={cn(
              'flex items-center gap-1',
              size === 'sm' && 'mt-2 text-xs',
              size === 'md' && 'mt-3 text-sm',
              size === 'lg' && 'mt-4 text-base',
              trendColors[change.trend]
            )}>
              <span>{trendIcons[change.trend]}</span>
              <span className="font-medium">{change.value}</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={cn(
            'flex-shrink-0',
            'text-gray-400',
            size === 'sm' && 'w-8 h-8',
            size === 'md' && 'w-10 h-10',
            size === 'lg' && 'w-12 h-12',
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * StatsGrid Component - Container for multiple StatCards
 */
export interface StatsGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4
}

export function StatsGrid({
  className,
  columns = 4,
  children,
  ...props
}: StatsGridProps) {
  const gridColumns = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div
      className={cn(
        'grid gap-4',
        gridColumns[columns],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * MiniStat Component - Compact stat display
 */
export interface MiniStatProps {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
}

export function MiniStat({ label, value, trend }: MiniStatProps) {
  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
      
      {trend && (
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          trendColors[trend]
        )}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trend === 'neutral' && '→'}
        </div>
      )}
    </div>
  )
}

/**
 * StatGroup Component - Group related stats together
 */
export interface StatGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

export function StatGroup({
  className,
  title,
  description,
  children,
  ...props
}: StatGroupProps) {
  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg p-6',
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}