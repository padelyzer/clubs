import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'
import { addMinutes, format, parse, parseISO } from 'date-fns'
import { findOrCreatePlayer } from '@/lib/services/player-service'

const createBookingSchema = z.object({
  courtId: z.string().min(1),
  date: z.string(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().min(30).max(240),
  playerName: z.string().min(1),
  playerEmail: z.string().email().or(z.literal("")).optional().nullable(),
  playerPhone: z.string().min(10),
  totalPlayers: z.number().min(1).max(8).default(4),
  notes: z.string().optional().nullable(),
})

// Debug endpoint that captures exactly where the booking creation fails
export async function POST(request: NextRequest) {
  const debugLog: any[] = []
  
  try {
    debugLog.push({ step: 'START', message: 'Debug booking creation started' })
    
    // Step 1: Authentication
    debugLog.push({ step: 'AUTH_START', message: 'Checking authentication' })
    const session = await requireAuthAPI()
    
    if (!session) {
      debugLog.push({ step: 'AUTH_FAIL', message: 'No session found' })
      return NextResponse.json({
        success: false,
        error: 'No autorizado',
        debug: debugLog
      }, { status: 401 })
    }
    
    debugLog.push({ 
      step: 'AUTH_SUCCESS', 
      message: 'Authentication successful',
      session: {
        userId: session.userId,
        clubId: session.clubId,
        role: session.role
      }
    })
    
    // Step 2: Parse request body
    debugLog.push({ step: 'BODY_PARSE_START', message: 'Parsing request body' })
    const body = await request.json()
    debugLog.push({ step: 'BODY_PARSE_SUCCESS', message: 'Body parsed', body })
    
    // Step 3: Validate data
    debugLog.push({ step: 'VALIDATION_START', message: 'Validating data' })
    
    // Clean phone number
    if (body.playerPhone) {
      body.playerPhone = body.playerPhone.replace(/\s/g, '')
    }
    
    const validatedData = createBookingSchema.parse(body)
    debugLog.push({ step: 'VALIDATION_SUCCESS', message: 'Data validated', validatedData })
    
    // Step 4: Calculate times
    debugLog.push({ step: 'TIME_CALC_START', message: 'Calculating times' })
    const startTimeDate = parse(validatedData.startTime, 'HH:mm', new Date())
    const endTimeDate = addMinutes(startTimeDate, validatedData.duration)
    const endTime = format(endTimeDate, 'HH:mm')
    const bookingDate = parseISO(validatedData.date)
    debugLog.push({ step: 'TIME_CALC_SUCCESS', message: 'Times calculated', endTime, bookingDate })
    
    // Step 5: Test database connection
    debugLog.push({ step: 'DB_TEST_START', message: 'Testing database connection' })
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    debugLog.push({ step: 'DB_TEST_SUCCESS', message: 'Database connected', dbTest })
    
    // Step 6: Test player creation
    debugLog.push({ step: 'PLAYER_START', message: 'Testing player creation' })
    let playerId = null
    try {
      const player = await findOrCreatePlayer({
        name: validatedData.playerName,
        email: validatedData.playerEmail,
        phone: validatedData.playerPhone,
        clubId: session.clubId
      })
      playerId = player.id
      debugLog.push({ step: 'PLAYER_SUCCESS', message: 'Player created/found', playerId })
    } catch (playerError) {
      debugLog.push({ 
        step: 'PLAYER_ERROR', 
        message: 'Player creation failed', 
        error: playerError instanceof Error ? playerError.message : String(playerError)
      })
    }
    
    // Step 7: Generate booking ID
    debugLog.push({ step: 'BOOKING_ID_START', message: 'Generating booking ID' })
    const bookingId = `booking_debug_${session.clubId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    debugLog.push({ step: 'BOOKING_ID_SUCCESS', message: 'Booking ID generated', bookingId })
    
    // Step 8: Test booking creation (without actually creating)
    debugLog.push({ step: 'BOOKING_TEST_START', message: 'Testing booking data structure' })
    const bookingData = {
      id: bookingId,
      clubId: session.clubId,
      courtId: validatedData.courtId,
      date: bookingDate,
      startTime: validatedData.startTime,
      endTime,
      duration: validatedData.duration,
      playerId: playerId,
      playerName: validatedData.playerName,
      playerEmail: validatedData.playerEmail || null,
      playerPhone: validatedData.playerPhone,
      totalPlayers: validatedData.totalPlayers,
      price: 50000, // Simple price
      currency: 'MXN',
      splitPaymentEnabled: false,
      splitPaymentCount: 4,
      notes: validatedData.notes || null,
      status: 'PENDING',
      paymentStatus: 'pending',
      updatedAt: new Date()
    }
    debugLog.push({ step: 'BOOKING_TEST_SUCCESS', message: 'Booking data prepared', bookingData })
    
    return NextResponse.json({
      success: true,
      message: 'Debug completed successfully - no actual booking created',
      debug: debugLog,
      wouldCreateBooking: bookingData
    })
    
  } catch (error) {
    debugLog.push({ 
      step: 'ERROR', 
      message: 'Error occurred',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      debug: debugLog,
      errorDetails: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 })
  }
}