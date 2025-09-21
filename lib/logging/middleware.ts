import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

export function withRequestLogging(middleware?: (request: NextRequest) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest) => {
    const startTime = performance.now()
    const context = logger.extractRequestContext(request)

    // Skip logging for static assets and internal calls
    const shouldSkipLogging = request.nextUrl.pathname.match(
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$|^\/_next\/|^\/api\/health$/
    )

    if (!shouldSkipLogging) {
      logger.info('Incoming request', context)
    }

    let response: NextResponse

    try {
      // Call the original middleware if provided
      if (middleware) {
        response = await middleware(request)
      } else {
        response = NextResponse.next()
      }

      const duration = performance.now() - startTime

      if (!shouldSkipLogging) {
        logger.apiRequest(
          request.method,
          request.nextUrl.pathname,
          response.status,
          duration,
          context
        )
      }

      // Add request ID to response headers for debugging
      response.headers.set('x-request-id', context.requestId || '')

      return response
    } catch (error) {
      const duration = performance.now() - startTime
      logger.error('Middleware error', error as Error, {
        ...context,
        duration,
      })
      throw error
    }
  }
}

// Helper for API error handling
export function logAPIError(
  request: NextRequest,
  error: Error,
  operation: string,
  statusCode: number = 500
) {
  const context = logger.extractRequestContext(request, { operation })

  logger.error(`API Error: ${operation}`, error, {
    ...context,
    statusCode,
    category: 'api-error',
  })

  return NextResponse.json(
    {
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      requestId: context.requestId,
    },
    { status: statusCode }
  )
}

// Helper for database operation logging
export async function withDatabaseLogging<T>(
  operation: string,
  dbOperation: () => Promise<T>,
  context?: any
): Promise<T> {
  const timer = logger.startTimer(`DB: ${operation}`)

  try {
    const result = await dbOperation()
    timer()

    logger.database(operation, 0, context) // Timer already logged the duration
    return result
  } catch (error) {
    timer()
    logger.error(`Database error: ${operation}`, error as Error, context)
    throw error
  }
}

// Security event logging
export function logSecurityEvent(
  event: string,
  request: NextRequest,
  details?: Record<string, any>
) {
  const context = logger.extractRequestContext(request, {
    securityEvent: event,
    ...details,
  })

  logger.security(event, context)
}

// Performance monitoring
export function monitorPerformance(
  operation: string,
  threshold: number = 1000 // ms
) {
  return function<T extends any[], R>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>
  ) {
    const method = descriptor.value!

    descriptor.value = async function(...args: T): Promise<R> {
      const startTime = performance.now()
      const result = await method.apply(this, args)
      const duration = performance.now() - startTime

      if (duration > threshold) {
        logger.warn(`Slow operation: ${operation}`, {
          operation,
          duration: Math.round(duration * 100) / 100,
          threshold,
          category: 'performance',
        })
      }

      return result
    }

    return descriptor
  }
}