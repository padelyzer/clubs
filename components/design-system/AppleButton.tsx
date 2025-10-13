import React from 'react'

interface AppleButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'small' | 'medium' | 'large'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  style?: React.CSSProperties
}

export function AppleButton({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  style
}: AppleButtonProps) {
  const isDisabled = disabled || loading

  const sizeStyles = {
    small: {
      padding: '6px 14px',
      fontSize: '13px',
      borderRadius: '8px',
      gap: '6px'
    },
    medium: {
      padding: '10px 20px',
      fontSize: '15px',
      borderRadius: '10px',
      gap: '8px'
    },
    large: {
      padding: '14px 28px',
      fontSize: '17px',
      borderRadius: '12px',
      gap: '10px'
    }
  }

  const variantStyles = {
    primary: {
      background: isDisabled 
        ? '#D1D1D6' 
        : '#007AFF',
      color: isDisabled ? '#8E8E93' : 'white',
      border: 'none',
      boxShadow: isDisabled 
        ? 'none' 
        : '0 2px 8px rgba(0, 122, 255, 0.25)'
    },
    secondary: {
      background: isDisabled ? '#F2F2F7' : 'white',
      color: isDisabled ? '#C7C7CC' : '#007AFF',
      border: `1px solid ${isDisabled ? '#E5E5EA' : '#007AFF'}`,
      boxShadow: 'none'
    },
    ghost: {
      background: 'transparent',
      color: isDisabled ? '#C7C7CC' : '#007AFF',
      border: 'none',
      boxShadow: 'none'
    },
    danger: {
      background: isDisabled ? '#FFEBE9' : '#FF3B30',
      color: 'white',
      border: 'none',
      boxShadow: isDisabled 
        ? 'none' 
        : '0 2px 8px rgba(255, 59, 48, 0.25)'
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        ...sizeStyles[size],
        ...variantStyles[variant],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 590,
        letterSpacing: '-0.24px', // More precise Apple spacing
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        width: fullWidth ? '100%' : 'auto',
        opacity: isDisabled ? 0.6 : 1,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif',
        ...style
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(-1px)'
          if (variant === 'primary') {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.35)'
            e.currentTarget.style.backgroundColor = '#0056CC' // Darker blue on hover
          } else if (variant === 'danger') {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 59, 48, 0.35)'
          }
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = '#007AFF' // Reset to original blue
        }
      }}
      onMouseDown={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'scale(0.98)'
        }
      }}
      onMouseUp={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
    >
      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: sizeStyles[size].gap
        }}>
          <svg 
            className="animate-spin" 
            width={size === 'small' ? 14 : size === 'medium' ? 16 : 18}
            height={size === 'small' ? 14 : size === 'medium' ? 16 : 18}
            viewBox="0 0 24 24" 
            fill="none"
          >
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeOpacity="0.25"
            />
            <path 
              d="M12 2a10 10 0 0 1 10 10" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round"
            />
          </svg>
          <span>Cargando...</span>
        </div>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  )
}

interface AppleIconButtonProps {
  icon: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  onClick?: () => void
  tooltip?: string
}

export function AppleIconButton({
  icon,
  variant = 'ghost',
  size = 'medium',
  disabled = false,
  onClick,
  tooltip
}: AppleIconButtonProps) {
  const sizeStyles = {
    small: {
      width: '28px',
      height: '28px',
      borderRadius: '8px'
    },
    medium: {
      width: '36px',
      height: '36px',
      borderRadius: '10px'
    },
    large: {
      width: '44px',
      height: '44px',
      borderRadius: '12px'
    }
  }

  const variantStyles = {
    primary: {
      background: disabled 
        ? 'rgba(52, 199, 89, 0.3)' 
        : 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
      color: '#182A01', // Changed to dark green/black for better contrast
      border: 'none'
    },
    secondary: {
      background: disabled ? '#F2F2F7' : 'white',
      color: disabled ? '#C7C7CC' : '#007AFF',
      border: `1px solid ${disabled ? '#E5E5EA' : '#E5E5EA'}`
    },
    ghost: {
      background: 'transparent',
      color: disabled ? '#C7C7CC' : '#8E8E93',
      border: 'none'
    },
    danger: {
      background: disabled ? '#FFEBE9' : 'transparent',
      color: disabled ? '#F4A0A0' : '#FF3B30',
      border: 'none'
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      style={{
        ...sizeStyles[size],
        ...variantStyles[variant],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === 'ghost') {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = '#F2F2F7'
          }
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = variantStyles[variant].background
      }}
    >
      {icon}
    </button>
  )
}