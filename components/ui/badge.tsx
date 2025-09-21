import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  secondary: 'bg-gray-50 text-gray-600 border-gray-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200'
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium border transition-colors',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

// Padelyzer specific badges with improved styling
export interface ClubStatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  size?: BadgeSize
  className?: string
}

export function ClubStatusBadge({ status, size = 'md', className }: ClubStatusBadgeProps) {
  const statusConfig = {
    PENDING: { variant: 'warning' as BadgeVariant, label: 'Pendiente' },
    APPROVED: { variant: 'success' as BadgeVariant, label: 'Aprobado' },
    REJECTED: { variant: 'error' as BadgeVariant, label: 'Rechazado' },
    SUSPENDED: { variant: 'error' as BadgeVariant, label: 'Suspendido' }
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  )
}

export interface BookingStatusBadgeProps {
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  size?: BadgeSize
  className?: string
}

export function BookingStatusBadge({ status, size = 'md', className }: BookingStatusBadgeProps) {
  const statusConfig = {
    PENDING: { variant: 'warning' as BadgeVariant, label: 'Pendiente' },
    CONFIRMED: { variant: 'success' as BadgeVariant, label: 'Confirmado' },
    IN_PROGRESS: { variant: 'info' as BadgeVariant, label: 'En Juego' },
    COMPLETED: { variant: 'secondary' as BadgeVariant, label: 'Completado' },
    CANCELLED: { variant: 'error' as BadgeVariant, label: 'Cancelado' },
    NO_SHOW: { variant: 'error' as BadgeVariant, label: 'No Show' }
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  )
}

// Payment Status Badge
export interface PaymentStatusBadgeProps {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  size?: BadgeSize
  className?: string
}

export function PaymentStatusBadge({ status, size = 'md', className }: PaymentStatusBadgeProps) {
  const statusConfig = {
    PENDING: { variant: 'warning' as BadgeVariant, label: 'Pendiente' },
    PROCESSING: { variant: 'info' as BadgeVariant, label: 'Procesando' },
    COMPLETED: { variant: 'success' as BadgeVariant, label: 'Completado' },
    FAILED: { variant: 'error' as BadgeVariant, label: 'Fallido' },
    REFUNDED: { variant: 'secondary' as BadgeVariant, label: 'Reembolsado' }
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  )
}

// Count Badge Component for notifications/counts
interface CountBadgeProps {
  count: number
  max?: number
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
}

export function CountBadge({ 
  count, 
  max = 99, 
  variant = 'error', 
  size = 'sm', 
  className 
}: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString()
  
  if (count === 0) return null
  
  return (
    <Badge 
      variant={variant} 
      size={size} 
      className={cn('min-w-[20px] justify-center tabular-nums', className)}
    >
      {displayCount}
    </Badge>
  )
}

export { Badge }