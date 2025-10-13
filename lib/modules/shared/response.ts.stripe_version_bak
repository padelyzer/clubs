// Unified response utilities for API endpoints

import { NextResponse } from 'next/server'
import { ApiResponse, PaginatedResponse } from './types'
import { ZodError } from 'zod'

export class ResponseBuilder {
  /**
   * Success response with data
   */
  static success<T = any>(data?: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message
    })
  }

  /**
   * Error response with error message
   */
  static error(error: string, status: number = 400, details?: any): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error,
        details
      },
      { status }
    )
  }

  /**
   * Validation error response from Zod
   */
  static validationError(error: ZodError): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: 'Datos inválidos',
        details: error.issues
      },
      { status: 400 }
    )
  }

  /**
   * Not found response
   */
  static notFound(resource: string = 'Recurso'): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: `${resource} no encontrado`
      },
      { status: 404 }
    )
  }

  /**
   * Unauthorized response
   */
  static unauthorized(): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: 'No autorizado'
      },
      { status: 401 }
    )
  }

  /**
   * Forbidden response
   */
  static forbidden(): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: 'Acceso denegado'
      },
      { status: 403 }
    )
  }

  /**
   * Internal server error response
   */
  static serverError(error?: any): NextResponse<ApiResponse> {
    console.error('Server error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }

  /**
   * Paginated response with data
   */
  static paginated<T = any>(
    data: T,
    page: number,
    pageSize: number,
    totalItems: number,
    message?: string
  ): NextResponse<PaginatedResponse<T>> {
    const totalPages = Math.ceil(totalItems / pageSize)
    
    return NextResponse.json({
      success: true,
      data,
      message,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems
      }
    })
  }
}