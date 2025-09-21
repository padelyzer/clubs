'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { colors } from '@/lib/design-system/colors'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

/**
 * Button Component - Minimal Linear Design System
 * 
 * @example
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="secondary" icon={<Icon />}>With Icon</Button>
 * <Button loading>Loading...</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      icon,
      iconPosition = 'left',
      children,
      style,
      ...props
    },
    ref
  ) => {
    // Size styles
    const sizeStyles = {
      xs: { height: '24px', padding: '0 8px', fontSize: '12px' },
      sm: { height: '32px', padding: '0 12px', fontSize: '14px' },
      md: { height: '40px', padding: '0 16px', fontSize: '14px' },
      lg: { height: '44px', padding: '0 24px', fontSize: '16px' },
      xl: { height: '48px', padding: '0 32px', fontSize: '16px' },
    }

    // Variant styles - Using inline styles for reliability with new color palette
    const variantStyles = {
      primary: {
        backgroundColor: '#A4DF4E', // Lime green
        color: '#182A01', // Dark green text for contrast
        border: 'none',
        fontWeight: 600,
      },
      secondary: {
        backgroundColor: colors.neutral[0],
        color: colors.text.primary,
        border: `2px solid #A4DF4E`,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: colors.text.secondary,
        border: 'none',
      },
      danger: {
        backgroundColor: colors.danger[600],
        color: colors.neutral[0],
        border: 'none',
      },
      success: {
        backgroundColor: '#66E7AA', // Turquoise
        color: '#182A01', // Dark green text
        border: 'none',
        fontWeight: 600,
      },
    }

    // Hover styles
    const hoverStyles = {
      primary: '#7cb342', // Darker lime
      secondary: '#f0f4ed',
      ghost: colors.neutral[100],
      danger: colors.danger[700],
      success: '#33dd8a', // Darker turquoise
    }

    const isDisabled = disabled || loading

    const buttonStyle = {
      ...sizeStyles[size],
      ...variantStyles[variant],
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
      borderRadius: '8px',
      transition: 'all 0.2s',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      width: fullWidth ? '100%' : 'auto',
      gap: '8px',
      outline: 'none',
      ...style,
    }

    return (
      <button
        ref={ref}
        className={className}
        style={buttonStyle}
        disabled={isDisabled}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = hoverStyles[variant]
            if (variant === 'secondary') {
              e.currentTarget.style.borderColor = colors.border.dark
            }
          }
          props.onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = variantStyles[variant].backgroundColor
            if (variant === 'secondary') {
              e.currentTarget.style.borderColor = colors.border.default
            }
          }
          props.onMouseLeave?.(e)
        }}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <svg
            className="animate-spin"
            style={{ width: '16px', height: '16px' }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              style={{ opacity: 0.25 }}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              style={{ opacity: 0.75 }}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {/* Icon left */}
        {icon && iconPosition === 'left' && !loading && icon}
        
        {/* Children */}
        {children}
        
        {/* Icon right */}
        {icon && iconPosition === 'right' && !loading && icon}
      </button>
    )
  }
)

Button.displayName = 'Button'