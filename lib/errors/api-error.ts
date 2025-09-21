import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
    this.name = 'RateLimitError'
  }
}

export class ExternalServiceError extends ApiError {
  constructor(service: string, originalError?: any) {
    super(`External service error: ${service}`, 503, 'EXTERNAL_SERVICE_ERROR', originalError)
    this.name = 'ExternalServiceError'
  }
}

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(error: unknown): NextResponse {
  // Log to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error)
  }
  
  // Handle known API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        }
      },
      { status: error.statusCode }
    )
  }
  
  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any
    
    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        {
          error: {
            message: 'A record with this value already exists',
            code: 'DUPLICATE_ENTRY',
            details: prismaError.meta,
          }
        },
        { status: 409 }
      )
    }
    
    // Record not found
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        {
          error: {
            message: 'Record not found',
            code: 'NOT_FOUND',
          }
        },
        { status: 404 }
      )
    }
    
    // Foreign key constraint
    if (prismaError.code === 'P2003') {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid reference to related record',
            code: 'INVALID_REFERENCE',
          }
        },
        { status: 400 }
      )
    }
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error)
  
  // Return generic error for unknown errors
  return NextResponse.json(
    {
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_SERVER_ERROR',
      }
    },
    { status: 500 }
  )
}

/**
 * Async error handler wrapper for API routes
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
): (...args: T) => Promise<R | NextResponse> {
  return async (...args: T) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  )
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  message: string,
  code?: string,
  status: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      }
    },
    { status }
  )
}