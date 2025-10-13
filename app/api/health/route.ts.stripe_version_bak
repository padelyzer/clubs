import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { headers } from 'next/headers'

// Simple API key para proteger el endpoint en producción
const HEALTH_CHECK_API_KEY = process.env.HEALTH_CHECK_API_KEY

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  // En producción, requerir API key
  if (process.env.NODE_ENV === 'production' && HEALTH_CHECK_API_KEY) {
    const apiKey = request.headers.get('x-api-key')
    
    if (apiKey !== HEALTH_CHECK_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }
  
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    // En producción, devolver información mínima
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          api: 'operational'
        }
      })
    }
    
    // En desarrollo, devolver información completa
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'operational'
      },
      performance: {
        responseTimeMs: responseTime,
        uptime: process.uptime()
      },
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    // Log interno sin exponer detalles
    if (process.env.NODE_ENV === 'development') {
      console.error('Health check failed:', error)
    }
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        api: 'operational'
      },
      error: process.env.NODE_ENV === 'development' ? 'Database connection failed' : 'Service unavailable'
    }, { status: 503 })
  }
}