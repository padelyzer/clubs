'use client'

import React, { forwardRef, useState } from 'react'
import { colors } from '@/lib/design-system/colors'

export interface ButtonModernProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'glow' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

/**
 * ButtonModern Component - Apple-inspired design
 * Ultra minimalist with smooth animations and glassmorphism
 */
export const ButtonModern = forwardRef<HTMLButtonElement, ButtonModernProps>(
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
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isPressed, setIsPressed] = useState(false)

    // Size styles - More padding, fully rounded
    const sizeStyles = {
      xs: { height: '32px', padding: '0 16px', fontSize: '13px', borderRadius: '16px' },
      sm: { height: '38px', padding: '0 20px', fontSize: '14px', borderRadius: '19px' },
      md: { height: '44px', padding: '0 28px', fontSize: '15px', borderRadius: '22px' },
      lg: { height: '52px', padding: '0 36px', fontSize: '16px', borderRadius: '26px' },
      xl: { height: '60px', padding: '0 44px', fontSize: '17px', borderRadius: '30px' },
    }

    // Variant styles - Apple-inspired
    const getVariantStyles = () => {
      const baseTransition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      
      switch (variant) {
        case 'primary':
          return {
            background: isPressed 
              ? 'linear-gradient(145deg, #8bc43f, #A4DF4E)'
              : isHovered 
                ? 'linear-gradient(145deg, #A4DF4E, #b5e65f)' 
                : 'linear-gradient(145deg, #A4DF4E, #93ce3d)',
            color: '#182A01',
            border: 'none',
            boxShadow: isPressed
              ? 'inset 0 2px 8px rgba(24, 42, 1, 0.2)'
              : isHovered
                ? '0 12px 24px rgba(164, 223, 78, 0.35), 0 4px 8px rgba(164, 223, 78, 0.25)'
                : '0 8px 16px rgba(164, 223, 78, 0.25), 0 2px 4px rgba(164, 223, 78, 0.15)',
            transform: isPressed ? 'scale(0.98)' : isHovered ? 'scale(1.02)' : 'scale(1)',
            transition: baseTransition,
          }
        
        case 'secondary':
          return {
            background: isPressed
              ? 'rgba(255, 255, 255, 0.9)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            color: '#182A01',
            border: `1.5px solid ${isHovered ? '#A4DF4E' : 'rgba(164, 223, 78, 0.3)'}`,
            boxShadow: isPressed
              ? 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
              : '0 4px 12px rgba(0, 0, 0, 0.05)',
            transform: isPressed ? 'scale(0.98)' : isHovered ? 'scale(1.01)' : 'scale(1)',
            transition: baseTransition,
          }
        
        case 'outline':
          return {
            background: 'transparent',
            color: '#182A01',
            border: `1.5px solid ${isHovered ? '#A4DF4E' : 'rgba(164, 223, 78, 0.4)'}`,
            boxShadow: 'none',
            transform: isPressed ? 'scale(0.98)' : 'scale(1)',
            transition: baseTransition,
          }
        
        case 'ghost':
          return {
            background: isHovered 
              ? 'rgba(164, 223, 78, 0.08)'
              : 'transparent',
            color: '#3a4d2b',
            border: 'none',
            transform: isPressed ? 'scale(0.96)' : 'scale(1)',
            transition: baseTransition,
          }
        
        case 'glass':
          return {
            background: isHovered
              ? 'rgba(255, 255, 255, 0.15)'
              : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(40px) saturate(180%)',
            color: '#182A01',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: isPressed
              ? 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
              : '0 8px 32px rgba(31, 38, 135, 0.1)',
            transform: isPressed ? 'scale(0.98)' : isHovered ? 'scale(1.02)' : 'scale(1)',
            transition: baseTransition,
          }
        
        case 'glow':
          return {
            background: 'linear-gradient(145deg, #66E7AA, #A4DF4E)',
            color: '#182A01',
            border: 'none',
            boxShadow: isHovered
              ? '0 0 40px rgba(164, 223, 78, 0.6), 0 0 80px rgba(102, 231, 170, 0.4)'
              : '0 0 20px rgba(164, 223, 78, 0.3)',
            transform: isPressed ? 'scale(0.98)' : isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: baseTransition,
            animation: 'pulse 2s infinite',
          }
        
        default:
          return {}
      }
    }

    const isDisabled = disabled || loading

    const buttonStyle = {
      ...sizeStyles[size],
      ...getVariantStyles(),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
      letterSpacing: '-0.01em',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.4 : 1,
      width: fullWidth ? '100%' : 'auto',
      gap: '8px',
      outline: 'none',
      position: 'relative' as const,
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      ...style,
    }

    // Ripple effect styles
    const rippleStyle = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
    `

    return (
      <>
        <style>{rippleStyle}</style>
        <button
          ref={ref}
          className={className}
          style={buttonStyle}
          disabled={isDisabled}
          onMouseEnter={(e) => {
            setIsHovered(true)
            onMouseEnter?.(e)
          }}
          onMouseLeave={(e) => {
            setIsHovered(false)
            setIsPressed(false)
            onMouseLeave?.(e)
          }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          {...props}
        >
          {/* Loading animation */}
          {loading && (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          )}
          
          {/* Icon left */}
          {icon && iconPosition === 'left' && !loading && (
            <span style={{ 
              display: 'flex', 
              alignItems: 'center',
              transition: 'transform 0.3s',
              transform: isHovered ? 'translateX(-2px)' : 'translateX(0)'
            }}>
              {icon}
            </span>
          )}
          
          {/* Children */}
          <span style={{ 
            transition: 'transform 0.3s',
            transform: isHovered && icon && iconPosition === 'left' ? 'translateX(2px)' : 'translateX(0)'
          }}>
            {children}
          </span>
          
          {/* Icon right */}
          {icon && iconPosition === 'right' && !loading && (
            <span style={{ 
              display: 'flex', 
              alignItems: 'center',
              transition: 'transform 0.3s',
              transform: isHovered ? 'translateX(2px)' : 'translateX(0)'
            }}>
              {icon}
            </span>
          )}
        </button>
      </>
    )
  }
)

ButtonModern.displayName = 'ButtonModern'