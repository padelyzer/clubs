'use client'

import { useState, useCallback, useEffect } from 'react'

export type ValidationRule = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  message?: string
}

export type ValidationRules = {
  [field: string]: ValidationRule
}

export type FieldErrors = {
  [field: string]: string | null
}

export type TouchedFields = {
  [field: string]: boolean
}

interface UseFormValidationProps {
  rules: ValidationRules
  mode?: 'onChange' | 'onBlur' | 'onSubmit'
}

export function useFormValidation({ 
  rules, 
  mode = 'onChange' 
}: UseFormValidationProps) {
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<TouchedFields>({})
  const [isValidating, setIsValidating] = useState(false)

  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = rules[field]
    if (!rule) return null

    // Required validation
    if (rule.required && (!value || value === '')) {
      return rule.message || `Este campo es requerido`
    }

    // Min length validation
    if (rule.minLength && value && value.length < rule.minLength) {
      return rule.message || `Mínimo ${rule.minLength} caracteres`
    }

    // Max length validation
    if (rule.maxLength && value && value.length > rule.maxLength) {
      return rule.message || `Máximo ${rule.maxLength} caracteres`
    }

    // Pattern validation
    if (rule.pattern && value && !rule.pattern.test(value)) {
      return rule.message || `Formato inválido`
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value)
      if (customError) return customError
    }

    return null
  }, [rules])

  const validateAllFields = useCallback((data: any): FieldErrors => {
    const newErrors: FieldErrors = {}
    
    Object.keys(rules).forEach(field => {
      const error = validateField(field, data[field])
      if (error) {
        newErrors[field] = error
      }
    })
    
    return newErrors
  }, [rules, validateField])

  const handleFieldChange = useCallback((field: string, value: any) => {
    if (mode === 'onChange' || touched[field]) {
      const error = validateField(field, value)
      setErrors(prev => ({
        ...prev,
        [field]: error
      }))
    }
  }, [mode, touched, validateField])

  const handleFieldBlur = useCallback((field: string, value: any) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    if (mode === 'onBlur' || mode === 'onChange') {
      const error = validateField(field, value)
      setErrors(prev => ({
        ...prev,
        [field]: error
      }))
    }
  }, [mode, validateField])

  const validateForm = useCallback((data: any): boolean => {
    setIsValidating(true)
    const newErrors = validateAllFields(data)
    setErrors(newErrors)
    setIsValidating(false)
    
    // Mark all fields as touched
    const allTouched: TouchedFields = {}
    Object.keys(rules).forEach(field => {
      allTouched[field] = true
    })
    setTouched(allTouched)
    
    return Object.keys(newErrors).length === 0
  }, [validateAllFields, rules])

  const clearErrors = useCallback(() => {
    setErrors({})
    setTouched({})
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const getFieldError = useCallback((field: string): string | null => {
    return errors[field] || null
  }, [errors])

  const hasErrors = Object.keys(errors).length > 0

  return {
    errors,
    touched,
    isValidating,
    hasErrors,
    validateField,
    validateForm,
    handleFieldChange,
    handleFieldBlur,
    clearErrors,
    clearFieldError,
    getFieldError
  }
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-\+\(\)]+$/,
  url: /^https?:\/\/.+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d+)?$/,
}

// Common validation rules
export const CommonRules = {
  email: {
    required: true,
    pattern: ValidationPatterns.email,
    message: 'Email inválido'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'La contraseña debe tener al menos 6 caracteres'
  },
  phone: {
    required: true,
    pattern: ValidationPatterns.phone,
    minLength: 10,
    message: 'Teléfono inválido'
  },
  required: {
    required: true
  }
}