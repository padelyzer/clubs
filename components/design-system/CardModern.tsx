'use client'

import React from 'react'
import { colors } from '@/lib/design-system/colors'

export interface CardModernProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'glow' | 'elevated'
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * CardModern Component - Apple-inspired design
 * Ultra minimalist with glassmorphism and smooth animations
 */
export function CardModern({
  className,
  variant = 'default',
  interactive = false,
  padding = 'lg',
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: CardModernProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const paddingStyles = {
    none: '0',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '40px',
  }

  const getVariantStyles = () => {
    const baseTransition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    
    switch (variant) {
      case 'default':
        return {
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(164, 223, 78, 0.08)',
          boxShadow: isHovered && interactive
            ? '0 20px 40px rgba(164, 223, 78, 0.15), 0 8px 16px rgba(0, 0, 0, 0.05)'
            : '0 10px 20px rgba(0, 0, 0, 0.03), 0 2px 8px rgba(0, 0, 0, 0.02)',
          transform: isHovered && interactive ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
          transition: baseTransition,
        }
      
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: isHovered && interactive
            ? '0 30px 60px rgba(31, 38, 135, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.5)'
            : '0 8px 32px rgba(31, 38, 135, 0.08)',
          transform: isHovered && interactive ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
          transition: baseTransition,
        }
      
      case 'gradient':
        return {
          background: isHovered && interactive
            ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.1) 0%, rgba(102, 231, 170, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(164, 223, 78, 0.05) 0%, rgba(102, 231, 170, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(164, 223, 78, 0.15)',
          boxShadow: isHovered && interactive
            ? '0 20px 40px rgba(164, 223, 78, 0.2)'
            : '0 4px 16px rgba(164, 223, 78, 0.08)',
          transform: isHovered && interactive ? 'translateY(-4px)' : 'translateY(0)',
          transition: baseTransition,
        }
      
      case 'glow':
        return {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(164, 223, 78, 0.2)',
          boxShadow: isHovered
            ? '0 0 60px rgba(164, 223, 78, 0.4), 0 0 120px rgba(102, 231, 170, 0.2), 0 20px 40px rgba(0, 0, 0, 0.1)'
            : '0 0 30px rgba(164, 223, 78, 0.15), 0 10px 20px rgba(0, 0, 0, 0.05)',
          transform: isHovered && interactive ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
          transition: baseTransition,
        }
      
      case 'elevated':
        return {
          background: 'white',
          border: 'none',
          boxShadow: isHovered && interactive
            ? '0 50px 100px rgba(0, 0, 0, 0.12), 0 20px 40px rgba(0, 0, 0, 0.08)'
            : '0 20px 40px rgba(0, 0, 0, 0.04), 0 8px 16px rgba(0, 0, 0, 0.03)',
          transform: isHovered && interactive ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
          transition: baseTransition,
        }
      
      default:
        return {}
    }
  }

  const cardStyle = {
    padding: paddingStyles[padding],
    borderRadius: '24px',
    overflow: 'hidden',
    position: 'relative' as const,
    ...getVariantStyles(),
    ...style,
  }

  return (
    <div
      className={className}
      style={cardStyle}
      onMouseEnter={(e) => {
        setIsHovered(true)
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        setIsHovered(false)
        onMouseLeave?.(e)
      }}
      {...props}
    >
      {/* Shimmer effect for glass variant */}
      {variant === 'glass' && isHovered && (
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
            transform: 'rotate(45deg)',
            animation: 'shimmer 0.6s',
            pointerEvents: 'none',
          }}
        />
      )}
      
      {children}
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
      `}</style>
    </div>
  )
}

/**
 * CardModernHeader Component
 */
export function CardModernHeader({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        marginBottom: '20px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * CardModernTitle Component
 */
export function CardModernTitle({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={className}
      style={{
        fontSize: '20px',
        fontWeight: 600,
        color: colors.text.primary,
        letterSpacing: '-0.02em',
        lineHeight: 1.3,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
        ...style,
      }}
      {...props}
    >
      {children}
    </h3>
  )
}

/**
 * CardModernDescription Component
 */
export function CardModernDescription({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={className}
      style={{
        fontSize: '14px',
        color: colors.text.secondary,
        marginTop: '4px',
        lineHeight: 1.5,
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  )
}

/**
 * CardModernContent Component
 */
export function CardModernContent({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        fontSize: '15px',
        lineHeight: 1.6,
        color: colors.text.primary,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}