import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('[Migration Status] Checking database schema...')
    
    // Check if playerId column exists in Booking table
    const checkColumnQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'Booking' 
      AND column_name = 'playerId'
    `
    
    const columnResult = await prisma.$queryRawUnsafe(checkColumnQuery)
    
    // Check migration history
    const migrationsQuery = `
      SELECT migration_name, finished_at, logs
      FROM _prisma_migrations 
      ORDER BY finished_at DESC 
      LIMIT 10
    `
    
    const migrations = await prisma.$queryRawUnsafe(migrationsQuery)
    
    // Test a simple booking query to see if playerId works
    let bookingTestResult = null
    try {
      const testBooking = await prisma.booking.findFirst({
        where: {},
        select: {
          id: true,
          playerId: true,
          playerName: true
        }
      })
      bookingTestResult = { success: true, booking: testBooking }
    } catch (error) {
      bookingTestResult = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        playerIdColumn: columnResult,
        recentMigrations: migrations,
        bookingTest: bookingTestResult,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('[Migration Status] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error checking migration status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}