import { NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

export async function GET() {
  try {
    // Test basic database connection
    console.log('Testing database connection...')
    
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Database connection successful:', result)
    
    // Test Club query
    const clubCount = await prisma.club.count()
    console.log('Total clubs:', clubCount)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection working',
      clubCount,
      testResult: result
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}