import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info'
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', children, ...props }, ref) => {
    const variants = {
      success: 'alert-success',
      warning: 'alert-warning', 
      error: 'alert-error',
      info: 'alert-info'
    }

    const icons = {
      success: 'OK',
      warning: 'Aviso',
      error: 'Error',
      info: 'Info'
    }

    return (
      <div
        ref={ref}
        className={cn('alert', variants[variant], className)}
        {...props}
      >
        <div className="flex items-start">
          <span className="text-sm font-bold mr-3 mt-0.5">{icons[variant]}:</span>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    )
  }
)

Alert.displayName = 'Alert'

export { Alert }