import React, { useState } from 'react'

interface AppleInputProps {
  label?: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  type?: string
  placeholder?: string
  helper?: string
  error?: string
  disabled?: boolean
  required?: boolean
  icon?: React.ReactNode
  suffix?: React.ReactNode
  multiline?: boolean
  rows?: number
  maxLength?: number
}

export function AppleInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  helper,
  error,
  disabled = false,
  required = false,
  icon,
  suffix,
  multiline = false,
  rows = 3,
  maxLength
}: AppleInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const hasError = !!error
  const hasValue = value !== '' && value !== null && value !== undefined

  const inputStyles = {
    width: '100%',
    padding: icon ? '12px 14px 12px 40px' : '12px 14px',
    paddingRight: suffix ? '40px' : '14px',
    fontSize: '15px',
    letterSpacing: '-0.24px', // More precise Apple spacing
    color: disabled ? '#8E8E93' : '#1C1C1E',
    backgroundColor: disabled ? '#F2F2F7' : 'white',
    border: `1px solid ${
      hasError ? '#FF3B30' : 
      isFocused ? '#007AFF' : 
      '#D1D1D6' // More Apple-like border color
    }`,
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isFocused 
      ? hasError 
        ? '0 0 0 4px rgba(255, 59, 48, 0.1)' 
        : '0 0 0 4px rgba(0, 122, 255, 0.1)'
      : hasValue 
        ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    cursor: disabled ? 'not-allowed' : 'text',
    resize: multiline ? 'vertical' as const : 'none' as const,
    minHeight: multiline ? `${rows * 20 + 24}px` : '44px', // Standard Apple input height
    lineHeight: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif',
    WebkitAppearance: 'none',
    MozAppearance: 'none'
  }

  const InputComponent = multiline ? 'textarea' : 'input'

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 500,
          color: hasError ? '#FF3B30' : '#1C1C1E',
          letterSpacing: '-0.01em',
          marginBottom: '6px'
        }}>
          {label}
          {required && (
            <span style={{ color: '#FF3B30', marginLeft: '2px' }}>*</span>
          )}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#8E8E93',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            {icon}
          </div>
        )}
        
        <InputComponent
          {...(multiline ? {} : { type })}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          {...(multiline ? { rows } : {})}
          style={inputStyles}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {suffix && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#8E8E93',
            fontSize: '15px',
            pointerEvents: 'none'
          }}>
            {suffix}
          </div>
        )}
        
        {maxLength && (
          <div style={{
            position: 'absolute',
            right: '12px',
            bottom: multiline ? '8px' : 'auto',
            top: multiline ? 'auto' : '50%',
            transform: multiline ? 'none' : 'translateY(-50%)',
            fontSize: '11px',
            color: value.toString().length > maxLength * 0.9 ? '#FF9500' : '#8E8E93',
            pointerEvents: 'none'
          }}>
            {value.toString().length}/{maxLength}
          </div>
        )}
      </div>
      
      {(helper || error) && (
        <div style={{
          marginTop: '4px',
          fontSize: '12px',
          color: hasError ? '#FF3B30' : '#8E8E93',
          letterSpacing: '-0.01em'
        }}>
          {error || helper}
        </div>
      )}
    </div>
  )
}

interface AppleSelectProps {
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  helper?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

export function AppleSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  helper,
  error,
  disabled = false,
  required = false
}: AppleSelectProps) {
  const [isFocused, setIsFocused] = useState(false)
  const hasError = !!error

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 500,
          color: hasError ? '#FF3B30' : '#1C1C1E',
          letterSpacing: '-0.01em',
          marginBottom: '6px'
        }}>
          {label}
          {required && (
            <span style={{ color: '#FF3B30', marginLeft: '2px' }}>*</span>
          )}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          style={{
            width: '100%',
            padding: '11px 36px 11px 14px',
            fontSize: '15px',
            letterSpacing: '-0.01em',
            color: disabled ? '#8E8E93' : (value ? '#1C1C1E' : '#8E8E93'),
            backgroundColor: disabled ? '#F2F2F7' : 'white',
            border: `1px solid ${
              hasError ? '#FF3B30' : 
              isFocused ? '#007AFF' : 
              '#E5E5EA'
            }`,
            borderRadius: '10px',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: isFocused 
              ? hasError 
                ? '0 0 0 3px rgba(255, 59, 48, 0.1)' 
                : '0 0 0 3px rgba(0, 122, 255, 0.1)'
              : 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none'
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="#8E8E93"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {(helper || error) && (
        <div style={{
          marginTop: '4px',
          fontSize: '12px',
          color: hasError ? '#FF3B30' : '#8E8E93',
          letterSpacing: '-0.01em'
        }}>
          {error || helper}
        </div>
      )}
    </div>
  )
}