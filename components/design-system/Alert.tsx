'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertTriangle, Info, Lightbulb, X } from 'lucide-react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error'
  title?: string
  icon?: React.ReactNode | boolean
  closable?: boolean
  onClose?: () => void
}

/**
 * Alert Component - Minimal Linear Design System
 * 
 * @example
 * <Alert variant="success" title="Success!">
 *   Your changes have been saved successfully.
 * </Alert>
 * 
 * <Alert variant="error" closable onClose={() => console.log('closed')}>
 *   There was an error processing your request.
 * </Alert>
 */
export function Alert({
  className,
  variant = 'default',
  title,
  icon = true,
  closable = false,
  onClose,
  children,
  ...props
}: AlertProps) {
  const variants = {
    default: {
      container: 'bg-gray-50 border-gray-200 text-gray-800',
      Icon: Lightbulb,
      iconColor: 'text-gray-500',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      Icon: Info,
      iconColor: 'text-blue-500',
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      Icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800',
      Icon: AlertTriangle,
      iconColor: 'text-amber-500',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      Icon: XCircle,
      iconColor: 'text-red-500',
    },
  }

  const config = variants[variant]
  const showIcon = icon !== false

  return (
    <div
      role="alert"
      className={cn(
        // Base styles
        'relative flex gap-3 p-4',
        'border rounded-lg',
        
        // Variant styles
        config.container,
        
        className
      )}
      {...props}
    >
      {/* Icon */}
      {showIcon && (
        <div className={cn('flex-shrink-0', config.iconColor)}>
          {icon === true ? (
            <config.Icon className="w-5 h-5" />
          ) : (
            icon
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        {title && (
          <h4 className="font-semibold mb-1">
            {title}
          </h4>
        )}
        <div className="text-sm">
          {children}
        </div>
      </div>

      {/* Close button */}
      {closable && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'flex-shrink-0',
            'w-6 h-6',
            'flex items-center justify-center',
            'rounded-lg',
            'hover:bg-black/5',
            'transition-colors'
          )}
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

/**
 * AlertTitle Component
 */
export function AlertTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn(
        'font-semibold mb-1',
        className
      )}
      {...props}
    >
      {children}
    </h5>
  )
}

/**
 * AlertDescription Component
 */
export function AlertDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'text-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}