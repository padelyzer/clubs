import { NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
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
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        api: 'operational'
      },
      error: 'Database connection failed'
    }, { status: 503 })
  }
}