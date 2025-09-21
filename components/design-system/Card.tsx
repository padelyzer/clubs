'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
}

/**
 * Card Component - Minimal Linear Design System
 * 
 * @example
 * <Card variant="elevated" padding="lg">
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content here</CardContent>
 *   <CardFooter>Footer content</CardFooter>
 * </Card>
 */
export function Card({
  className,
  variant = 'default',
  padding = 'md',
  interactive = false,
  children,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-white border border-gray-200',
    bordered: 'bg-white border-2 border-gray-900',
    elevated: 'bg-white border border-gray-100 shadow-md',
    ghost: 'bg-gray-50',
  }

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }

  return (
    <div
      className={cn(
        // Base styles
        'rounded-lg',
        'transition-all duration-200',
        
        // Variant
        variants[variant],
        
        // Padding
        paddings[padding],
        
        // Interactive
        interactive && [
          'cursor-pointer',
          'hover:shadow-lg hover:scale-[1.02]',
          'active:scale-[0.98]',
        ],
        
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * CardHeader Component
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  noBorder?: boolean
}

export function CardHeader({
  className,
  noBorder = false,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col space-y-1.5',
        !noBorder && 'pb-4 border-b border-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * CardTitle Component
 */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function CardTitle({
  className,
  as: Component = 'h3',
  children,
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={cn(
        'text-lg font-semibold text-gray-900',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

/**
 * CardDescription Component
 */
export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-sm text-gray-500',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

/**
 * CardContent Component
 */
export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'py-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * CardFooter Component
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  noBorder?: boolean
}

export function CardFooter({
  className,
  noBorder = false,
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center',
        !noBorder && 'pt-4 border-t border-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}