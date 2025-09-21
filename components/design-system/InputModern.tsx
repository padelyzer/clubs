'use client'

import React, { forwardRef, useState, useId } from 'react'
import { colors } from '@/lib/design-system/colors'

export interface InputModernProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  variant?: 'default' | 'floating' | 'minimal' | 'glass'
}

/**
 * InputModern Component - Apple-inspired design
 * Ultra minimalist with smooth animations
 */
export const InputModern = forwardRef<HTMLInputElement, InputModernProps>(
  (
    {
      className,
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      variant = 'default',
      style,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)
    const generatedId = useId()
    const inputId = props.id || generatedId

    const getVariantStyles = () => {
      const baseTransition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      
      switch (variant) {
        case 'default':
          return {
            container: {
              position: 'relative' as const,
              width: '100%',
            },
            input: {
              width: '100%',
              height: '42px',
              padding: icon 
                ? iconPosition === 'left' ? '0 16px 0 40px' : '0 40px 0 16px'
                : '0 16px',
              fontSize: '15px',
              fontWeight: 400,
              color: colors.text.primary,
              background: isFocused 
                ? 'rgba(255, 255, 255, 1)'
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: `2px solid ${
                error 
                  ? colors.danger[500]
                  : isFocused 
                    ? '#A4DF4E'
                    : 'rgba(164, 223, 78, 0.15)'
              }`,
              borderRadius: '16px',
              outline: 'none',
              boxShadow: isFocused
                ? '0 0 0 4px rgba(164, 223, 78, 0.1), 0 8px 24px rgba(0, 0, 0, 0.05)'
                : '0 2px 8px rgba(0, 0, 0, 0.02)',
              transform: isFocused ? 'translateY(-1px)' : 'translateY(0)',
              transition: baseTransition,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
            },
          }
        
        case 'floating':
          return {
            container: {
              position: 'relative' as const,
              width: '100%',
              marginTop: '20px',
            },
            input: {
              width: '100%',
              height: '52px',
              padding: '20px 20px 6px 20px',
              fontSize: '15px',
              fontWeight: 400,
              color: colors.text.primary,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `2px solid ${
                error 
                  ? colors.danger[500]
                  : isFocused 
                    ? '#A4DF4E'
                    : 'rgba(164, 223, 78, 0.15)'
              }`,
              borderRadius: '16px',
              outline: 'none',
              boxShadow: isFocused
                ? '0 0 0 4px rgba(164, 223, 78, 0.1), 0 8px 24px rgba(0, 0, 0, 0.05)'
                : '0 2px 8px rgba(0, 0, 0, 0.02)',
              transition: baseTransition,
            },
            label: {
              position: 'absolute' as const,
              left: '20px',
              top: isFocused || hasValue ? '8px' : '16px',
              fontSize: isFocused || hasValue ? '11px' : '15px',
              color: isFocused 
                ? '#A4DF4E'
                : hasValue 
                  ? colors.text.secondary
                  : colors.text.tertiary,
              fontWeight: isFocused || hasValue ? 600 : 400,
              pointerEvents: 'none' as const,
              transition: baseTransition,
              letterSpacing: isFocused || hasValue ? '0.5px' : '0',
            },
          }
        
        case 'minimal':
          return {
            container: {
              position: 'relative' as const,
              width: '100%',
            },
            input: {
              width: '100%',
              height: '48px',
              padding: '0 4px',
              fontSize: '15px',
              fontWeight: 400,
              color: colors.text.primary,
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${
                error 
                  ? colors.danger[500]
                  : isFocused 
                    ? '#A4DF4E'
                    : 'rgba(164, 223, 78, 0.2)'
              }`,
              borderRadius: '0',
              outline: 'none',
              transition: baseTransition,
            },
          }
        
        case 'glass':
          return {
            container: {
              position: 'relative' as const,
              width: '100%',
            },
            input: {
              width: '100%',
              height: '42px',
              padding: icon 
                ? iconPosition === 'left' ? '0 16px 0 40px' : '0 40px 0 16px'
                : '0 16px',
              fontSize: '15px',
              fontWeight: 400,
              color: colors.text.primary,
              background: isFocused
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(40px) saturate(200%)',
              border: `1px solid ${
                isFocused 
                  ? 'rgba(255, 255, 255, 0.3)'
                  : 'rgba(255, 255, 255, 0.15)'
              }`,
              borderRadius: '16px',
              outline: 'none',
              boxShadow: isFocused
                ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.2), 0 8px 32px rgba(31, 38, 135, 0.15)'
                : '0 8px 32px rgba(31, 38, 135, 0.08)',
              transition: baseTransition,
            },
          }
        
        default:
          return {}
      }
    }

    const styles = getVariantStyles() as any

    return (
      <div style={styles.container}>
        {/* Standard label */}
        {label && variant !== 'floating' && (
          <label
            htmlFor={inputId}
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: colors.text.secondary,
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </label>
        )}

        {/* Input container */}
        <div style={{ position: 'relative', width: '100%' }}>
          {/* Icon */}
          {icon && (
            <div
              style={{
                position: 'absolute',
                [iconPosition]: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: isFocused ? '#A4DF4E' : colors.text.tertiary,
                transition: 'color 0.3s',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={className}
            style={{
              ...styles.input,
              ...style,
            }}
            onFocus={(e) => {
              setIsFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              setHasValue(!!e.target.value)
              onBlur?.(e)
            }}
            {...props}
          />

          {/* Floating label */}
          {label && variant === 'floating' && (
            <label
              htmlFor={inputId}
              style={styles.label}
            >
              {label}
            </label>
          )}
        </div>

        {/* Hint or Error */}
        {(hint || error) && (
          <div
            style={{
              marginTop: '6px',
              fontSize: '12px',
              color: error ? colors.danger[500] : colors.text.tertiary,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {error || hint}
          </div>
        )}
      </div>
    )
  }
)

InputModern.displayName = 'InputModern'