'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Icon } from './Icon'
import { CheckCircle, XCircle, AlertTriangle, Info, MessageSquare, X } from 'lucide-react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

/**
 * ToastProvider - Wrap your app with this provider
 * 
 * @example
 * // In your root layout or _app.tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [toastCounter, setToastCounter] = useState(0)

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    setToastCounter(prev => {
      const newCounter = prev + 1
      const id = `toast-${Date.now()}-${newCounter}`
      const newToast = { ...toast, id }
      
      setToasts((prevToasts) => [...prevToasts, newToast])

      // Auto remove after duration
      if (toast.duration !== 0) {
        setTimeout(() => {
          removeToast(id)
        }, toast.duration || 5000)
      }
      
      return newCounter
    })
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

/**
 * useToast Hook - Use this to show toasts
 * 
 * @example
 * const { toast } = useToast()
 * 
 * toast({
 *   title: "Success!",
 *   description: "Your changes have been saved.",
 *   variant: "success"
 * })
 */
export function useToast() {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return {
    toast: context.addToast,
    dismiss: context.removeToast,
    toasts: context.toasts,
  }
}

/**
 * ToastContainer - Internal component that renders toasts
 */
function ToastContainer() {
  const context = useContext(ToastContext)
  
  if (!context || context.toasts.length === 0) {
    return null
  }

  const content = (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-3 pointer-events-none">
      {context.toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => context.removeToast(toast.id)}
        />
      ))}
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body)
  }

  return null
}

/**
 * ToastItem - Individual toast component
 */
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const variants = {
    default: {
      container: 'bg-white border-gray-200',
      Icon: MessageSquare,
      iconColor: 'text-gray-500',
    },
    success: {
      container: 'bg-white border-green-200',
      Icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    error: {
      container: 'bg-white border-red-200',
      Icon: XCircle,
      iconColor: 'text-red-500',
    },
    warning: {
      container: 'bg-white border-amber-200',
      Icon: AlertTriangle,
      iconColor: 'text-amber-500',
    },
    info: {
      container: 'bg-white border-blue-200',
      Icon: Info,
      iconColor: 'text-blue-500',
    },
  }

  const config = variants[toast.variant || 'default']

  return (
    <div
      className={cn(
        // Base styles
        'pointer-events-auto',
        'flex items-start gap-3',
        'min-w-[300px] max-w-md',
        'p-4 pr-8',
        'border rounded-lg shadow-lg',
        'animate-in slide-in-from-right fade-in duration-200',
        
        // Variant styles
        config.container
      )}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0', config.iconColor)}>
        <config.Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1">
        {toast.title && (
          <p className="font-semibold text-gray-900">
            {toast.title}
          </p>
        )}
        {toast.description && (
          <p className="text-sm text-gray-500 mt-1">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 mt-2"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-3 h-3 text-gray-400" />
      </button>
    </div>
  )
}

/**
 * Standalone toast function for simple use cases
 * Note: Requires ToastProvider to be set up
 */
export function showToast(options: Omit<Toast, 'id'>) {
  // This would need to be connected to the ToastProvider
  // For now, it's a placeholder
  console.log('Toast:', options)
}