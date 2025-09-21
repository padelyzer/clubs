'use client'

import React, { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

/**
 * Input Component - Minimal Linear Design System
 * 
 * @example
 * <Input label="Email" type="email" placeholder="Enter your email" />
 * <Input error="This field is required" />
 * <Input icon={<SearchIcon />} placeholder="Search..." />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const hasError = !!error

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Icon left */}
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base styles
              'w-full px-3 py-2',
              'text-sm text-gray-900 placeholder-gray-400',
              'bg-white border rounded-lg',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              
              // Normal state
              !hasError && 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/10',
              
              // Error state
              hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
              
              // Disabled state
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              
              // Icon padding
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {/* Icon right */}
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <p id={`${inputId}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Hint message */}
        {hint && !hasError && (
          <p id={`${inputId}-hint`} className="text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

/**
 * Textarea Component - Minimal Linear Design System
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  fullWidth?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      fullWidth = false,
      resize = 'vertical',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const textareaId = id || generatedId
    const hasError = !!error

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            // Base styles
            'w-full px-3 py-2',
            'text-sm text-gray-900 placeholder-gray-400',
            'bg-white border rounded-lg',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            
            // Resize
            resize === 'none' && 'resize-none',
            resize === 'vertical' && 'resize-y',
            resize === 'horizontal' && 'resize-x',
            resize === 'both' && 'resize',
            
            // Normal state
            !hasError && 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/10',
            
            // Error state
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
            
            // Disabled state
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
          }
          {...props}
        />

        {/* Error message */}
        {hasError && (
          <p id={`${textareaId}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Hint message */}
        {hint && !hasError && (
          <p id={`${textareaId}-hint`} className="text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'