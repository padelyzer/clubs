import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'
import { addMinutes, format, parse, isAfter, isBefore, parseISO } from 'date-fns'
import { onBookingCreated } from '@/lib/whatsapp/notification-hooks'
import { stripeService } from '@/lib/services/stripe-service'
import {
  getNowInTimezone,
  getDayBoundariesInTimezone
} from '@/lib/utils/timezone'
import { withRateLimit } from '@/lib/rate-limit'
import { findOrCreatePlayer, updatePlayerBookingStats } from '@/lib/services/player-service'

// Validation schemas
const createBookingSchema = z.object({
  courtId: z.string().min(1),
  date: z.string(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().min(30).max(240),
  playerName: z.string().min(1),
  playerEmail: z.string().email().or(z.literal("")).optional().nullable(),
  playerPhone: z.string().min(10),
  totalPlayers: z.number().min(1).max(8).default(4),
  splitPaymentEnabled: z.boolean().default(false),
  splitPaymentCount: z.number().min(2).max(50).default(4),
  notes: z.string().optional().nullable(),
  paymentMethod: z.enum(['stripe', 'onsite']).optional(),
  paymentType: z.enum(['terminal', 'transfer', 'cash']).optional(),
  referenceNumber: z.string().optional(),
  // Additional fields that frontend might send
  courtIds: z.array(z.string()).optional(),
  isMultiCourt: z.boolean().optional(),
  multiCourtCount: z.number().optional(),
  name: z.string().optional(),
  price: z.number().optional(),
  type: z.string().optional()
}).transform((data) => {
  // Clean and normalize data
  console.log('[Booking Schema] Original data:', data)
  
  // Detect if this is really a multi-court booking or frontend confusion
  const isReallyMultiCourt = data.courtIds && data.courtIds.length > 1
  const hasValidCourtId = data.courtId && data.courtId.length > 0
  
  // If marked as MULTI_COURT but only has one courtId and no courtIds array, treat as simple
  const isActuallySimple = (
    data.type === "MULTI_COURT" && 
    hasValidCourtId && 
    (!data.courtIds || data.courtIds.length === 0)
  )
  
  console.log('[Booking Schema] Detection:', {
    originalType: data.type,
    isReallyMultiCourt,
    hasValidCourtId,
    isActuallySimple,
    courtId: data.courtId,
    courtIds: data.courtIds
  })
  
  const cleanedData = {
    courtId: data.courtId,
    date: data.date,
    startTime: data.startTime,
    duration: data.duration,
    playerName: data.playerName.trim(),
    playerEmail: data.playerEmail,
    playerPhone: data.playerPhone,
    totalPlayers: data.totalPlayers > 8 ? 4 : data.totalPlayers, // Fix invalid totalPlayers
    splitPaymentEnabled: data.splitPaymentEnabled || false,
    splitPaymentCount: data.splitPaymentEnabled ? data.splitPaymentCount : 4,
    notes: data.notes,
    paymentMethod: data.paymentMethod,
    paymentType: data.paymentType,
    referenceNumber: data.referenceNumber
  }
  
  console.log('[Booking Schema] Cleaned data:', cleanedData)
  return cleanedData
})

const updateBookingSchema = createBookingSchema.partial().extend({
  id: z.string().min(1)
})

// GET - Retrieve bookings with filters
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    
    const date = searchParams.get('date')
    const courtId = searchParams.get('courtId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Add pagination parameters
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = Math.min(parseInt(searchParams.get('limit') || '30'), 100) // Max 100 per page
    const offset = page * pageSize

    // Get club timezone settings
    const clubSettings = await prisma.clubSettings.findUnique({
      where: { clubId: session.clubId },
      select: { timezone: true }
    })
    const clubTimezone = clubSettings?.timezone || 'America/Mexico_City'
    
    const where: any = {
      clubId: session.clubId
    }

    // Date filtering
    if (date) {
      const { start, end } = getDayBoundariesInTimezone(date, clubTimezone)
      
      where.date = {
        gte: start,
        lt: end
      }
    } else if (startDate && endDate) {
      where.date = {
        gte: parseISO(startDate),
        lte: parseISO(endDate)
      }
    }

    // Court filtering
    if (courtId) {
      where.courtId = courtId
    }

    // Status filtering - exclude cancelled by default
    if (status) {
      where.status = status
    } else {
      // Exclude cancelled bookings by default
      where.status = { not: 'CANCELLED' }
    }

    // Get booking groups first (for the selected date)
    const bookingGroups = await prisma.bookingGroup.findMany({
      where: {
        clubId: session.clubId,
        date: where.date,
        status: where.status || { not: 'CANCELLED' }
      },
      include: {
        bookings: {
          include: {
            Court: true
          }
        },
        splitPayments: {
          include: {
            _count: {
              select: {
                Notification: true
              }
            }
          }
        },
        _count: {
          select: {
            splitPayments: true,
            payments: true,
            bookings: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Get individual bookings (excluding those that are part of a group)
    const individualBookings = await prisma.booking.findMany({
      where: {
        ...where,
        bookingGroupId: null // Only individual bookings
      },
      include: {
        Court: true,
        SplitPayment: {
          include: {
            _count: {
              select: {
                Notification: true
              }
            }
          }
        },
        _count: {
          select: {
            SplitPayment: true,
            Payment: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Add computed fields for booking groups
    const bookingGroupsWithStatus = bookingGroups.map(group => {
      const splitPaymentProgress = group.splitPaymentEnabled 
        ? (group.splitPayments?.filter(sp => sp.status === 'completed').length || 0)
        : 0

      // Determine payment status for group bookings
      const isPaymentComplete = group.splitPaymentEnabled 
        ? splitPaymentProgress === group.splitPaymentCount
        : group.status === 'IN_PROGRESS' || group.status === 'COMPLETED' // If checked in, consider paid

      return {
        ...group,
        splitPayments: group.splitPayments, // Map Prisma's splitPayments to frontend's splitPayments
        isGroup: true, // Flag to identify this as a group
        courtNames: group.bookings.map((b: any) => b.Court.name).join(', '),
        splitPaymentProgress,
        splitPaymentComplete: isPaymentComplete,
        paymentStatus: isPaymentComplete ? 'completed' : 'pending' // Add explicit payment status
      }
    })

    // Add computed fields for individual bookings
    const bookingsWithStatus = individualBookings.map(booking => {
      const splitPaymentProgress = booking.splitPaymentEnabled 
        ? (booking.SplitPayment?.filter(sp => sp.status === 'completed').length || 0)
        : 0

      return {
        ...booking,
        splitPayments: booking.SplitPayment, // Map Prisma's SplitPayment to frontend's splitPayments
        isGroup: false, // Flag to identify this as individual
        splitPaymentProgress,
        splitPaymentComplete: booking.splitPaymentEnabled 
          ? splitPaymentProgress === booking.splitPaymentCount
          : true
      }
    })

    // Get class enrollments for this club and date (if specified)
    let classBookings: any[] = []
    
    // Only fetch classes if we're filtering by date (to avoid fetching all classes)
    if (date) {
      const { start: startOfDay, end: endOfDay } = getDayBoundariesInTimezone(date, clubTimezone)
      
      const classes = await prisma.class.findMany({
        where: {
          clubId: session.clubId,
          date: {
            gte: startOfDay,
            lt: endOfDay
          },
          status: { not: 'CANCELLED' }
        },
        include: {
          Court: true,
          ClassEnrollment: true,
          _count: {
            select: {
              ClassEnrollment: true
            }
          }
        },
        orderBy: [
          { date: 'asc' },
          { startTime: 'asc' }
        ]
      })
      
      // Transform classes to booking-like format for the UI
      classBookings = classes.map(cls => ({
        id: cls.id,
        type: 'class',
        clubId: cls.clubId,
        courtId: cls.courtId,
        courtName: cls.Court?.name || 'Clase grupal',
        date: cls.date,
        startTime: cls.startTime,
        endTime: cls.endTime,
        duration: cls.duration,
        className: cls.name,
        description: cls.description,
        level: cls.level,
        classType: cls.type,
        instructor: cls.instructorName,
        maxStudents: cls.maxStudents,
        enrolledCount: cls._count.ClassEnrollment,
        price: cls.price,
        currency: cls.currency,
        status: cls.status,
        enrollments: cls.ClassEnrollment,
        availableSpots: cls.maxStudents - cls._count.ClassEnrollment,
        isGroup: false,
        splitPaymentEnabled: false,
        splitPaymentProgress: 0,
        splitPaymentComplete: true
      }))
    }

    // Combine and sort by time
    const allBookings = [...bookingGroupsWithStatus, ...bookingsWithStatus, ...classBookings].sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime()
      if (dateCompare !== 0) return dateCompare
      return a.startTime.localeCompare(b.startTime)
    })

    return NextResponse.json({ 
      success: true, 
      bookings: allBookings 
    })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener reservas' },
      { status: 500 }
    )
  }
}

// POST - Create new booking
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for booking creation
    const rateLimitResponse = await withRateLimit(request, 'booking')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const session = await requireAuthAPI()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    
    console.log('📋 Raw request body:', body)
    
    // Clean phone number by removing spaces
    if (body.playerPhone) {
      body.playerPhone = body.playerPhone.replace(/\s/g, '')
    }
    
    console.log('📋 Body after phone cleaning:', body)
    
    const validatedData = createBookingSchema.parse(body)
    
    console.log('✅ Validation successful:', validatedData)
    
    // Calculate end time
    const startTimeDate = parse(validatedData.startTime, 'HH:mm', new Date())
    const endTimeDate = addMinutes(startTimeDate, validatedData.duration)
    const endTime = format(endTimeDate, 'HH:mm')
    
    // Get club timezone settings
    const clubSettings = await prisma.clubSettings.findUnique({
      where: { clubId: session.clubId },
      select: { timezone: true, operatingHours: true }
    })
    const clubTimezone = clubSettings?.timezone || 'America/Mexico_City'
    
    // Parse and validate booking date
    const bookingDate = parseISO(validatedData.date)
    const now = getNowInTimezone(clubTimezone)
    
    // Validación: No permitir reservas en el pasado
    if (bookingDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se pueden crear reservas en fechas pasadas'
        },
        { status: 400 }
      )
    }
    
    // Validación: No permitir reservas más de 90 días en el futuro
    const maxFutureDate = getNowInTimezone(clubTimezone)
    maxFutureDate.setDate(maxFutureDate.getDate() + 90)
    if (bookingDate > maxFutureDate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se pueden crear reservas con más de 90 días de anticipación'
        },
        { status: 400 }
      )
    }
    
    // Validate that booking doesn't exceed club closing time
    if (clubSettings?.operatingHours) {
      const operatingHours = clubSettings.operatingHours as any
      if (operatingHours.end) {
        const [closeHour, closeMinute] = operatingHours.end.split(':').map(Number)
        const closeTotalMinutes = closeHour * 60 + closeMinute
        
        const [endHour, endMinute] = endTime.split(':').map(Number)
        const endTotalMinutes = endHour * 60 + endMinute
        
        if (endTotalMinutes > closeTotalMinutes) {
          return NextResponse.json(
            { 
              success: false, 
              error: `La reserva terminaría a las ${endTime}, pero el club cierra a las ${operatingHours.end}. Por favor selecciona un horario más temprano o reduce la duración.`
            },
            { status: 400 }
          )
        }
      }
    }
    
    // Check for conflicts
    const conflicts = await checkBookingConflicts(
      session.clubId,
      validatedData.courtId,
      bookingDate,
      validatedData.startTime,
      endTime
    )
    
    if (conflicts.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe una reserva en este horario',
          conflicts 
        },
        { status: 409 }
      )
    }

    // Get pricing for this time slot with potential discounts
    const price = await calculateBookingPrice(
      session.clubId,
      bookingDate,
      validatedData.startTime,
      validatedData.duration,
      validatedData.playerPhone
    )

    // Determine payment and booking status based on method
    const paymentMethod = validatedData.paymentMethod || 'onsite'
    const bookingStatus = 'PENDING' // All bookings start as pending
    const paymentStatus = 'pending' // All payments start as pending until explicitly paid
    
    // Create booking with payment information
    const bookingId = `booking_${session.clubId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Debug logging
    console.log('Creating booking with data:', {
      id: bookingId,
      clubId: session.clubId,
      courtId: validatedData.courtId,
      date: bookingDate,
      startTime: validatedData.startTime,
      endTime,
      duration: validatedData.duration,
      playerName: validatedData.playerName,
      playerEmail: validatedData.playerEmail || null,
      playerPhone: validatedData.playerPhone,
      totalPlayers: validatedData.totalPlayers,
      price,
      currency: 'MXN',
      splitPaymentEnabled: validatedData.splitPaymentEnabled,
      splitPaymentCount: validatedData.splitPaymentCount,
      notes: validatedData.notes || null,
      status: bookingStatus,
      paymentStatus: paymentStatus,
      updatedAt: new Date()
    })
    
    // Find or create player (with error handling)
    let playerId = null
    try {
      const player = await findOrCreatePlayer({
        name: validatedData.playerName,
        email: validatedData.playerEmail,
        phone: validatedData.playerPhone,
        clubId: session.clubId
      })
      playerId = player.id
    } catch (error) {
      console.error('Error creating/finding player:', error)
      // Continue without playerId - booking will work without it
    }
    
    const booking = await prisma.booking.create({
      data: {
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
        price,
        currency: 'MXN',
        splitPaymentEnabled: validatedData.splitPaymentEnabled,
        splitPaymentCount: validatedData.splitPaymentCount,
        notes: validatedData.notes || null,
        status: bookingStatus,
        paymentStatus: paymentStatus,
        updatedAt: new Date()
      },
      include: {
        Court: true
      }
    })
    
    // Create payment record
    if (paymentMethod === 'onsite') {
      // Create a payment record for onsite payment
      const paymentId = `payment_${session.clubId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await prisma.payment.create({
        data: {
          id: paymentId,
          bookingId: booking.id,
          amount: price,
          currency: 'MXN',
          method: validatedData.paymentType === 'cash' ? 'CASH' : 
                  validatedData.paymentType === 'terminal' ? 'TERMINAL' : 'SPEI',
          status: 'pending',
          updatedAt: new Date()
        }
      })
    }

    // Create transaction for income tracking if payment is completed
    if (paymentStatus === 'completed') {
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await prisma.transaction.create({
        data: {
          id: transactionId,
          clubId: session.clubId,
          bookingId: booking.id,
          amount: price,
          type: 'INCOME',
          category: 'BOOKING',
          description: `Reserva de cancha - ${validatedData.playerName}`,
          date: bookingDate,
          currency: 'MXN',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log(`✅ Created transaction for completed booking ${booking.id}`)
    }

    // Create split Payment if enabled (regardless of payment method)
    if (validatedData.splitPaymentEnabled) {
      const splitAmount = Math.ceil(price / validatedData.splitPaymentCount)

      for (let i = 0; i < validatedData.splitPaymentCount; i++) {
        const splitPaymentId = `split_payment_${session.clubId}_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`
        await prisma.splitPayment.create({
          data: {
            id: splitPaymentId,
            bookingId: booking.id,
            playerName: i === 0 ? validatedData.playerName : `Jugador ${i + 1}`,
            playerPhone: i === 0 ? validatedData.playerPhone : '',
            playerEmail: i === 0 ? validatedData.playerEmail : '',
            amount: splitAmount,
            status: 'pending',
            updatedAt: new Date()
          }
        })
      }

      console.log(`✅ Created ${validatedData.splitPaymentCount} split payment records for booking ${booking.id}`)
    }
    
    // Generate payment link if using Stripe
    let paymentLink = null
    if (paymentMethod === 'stripe') {
      // Always create payment record for Stripe Payment
      // This is needed for the payment page to work correctly
      const stripePaymentId = `payment_${session.clubId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await prisma.payment.create({
        data: {
          id: stripePaymentId,
          bookingId: booking.id,
          amount: price,
          currency: 'MXN',
          method: 'STRIPE',
          status: 'pending',
          updatedAt: new Date()
        }
      })
      
      // Always use our local payment page which handles both single and split Payment
      // This provides a consistent experience and keeps users in our app
      paymentLink = `/pay/${booking.id}`
    }

    // Update player statistics if player exists
    try {
      const player = await prisma.player.findFirst({
        where: {
          clubId: session.clubId,
          phone: validatedData.playerPhone
        }
      })
      
      if (player) {
        await prisma.player.update({
          where: { id: player.id },
          data: {
            totalBookings: { increment: 1 },
            totalSpent: { increment: price },
            lastBookingAt: new Date()
          }
        })
      }
    } catch (error) {
      console.error('Error updating player statistics:', error)
      // Don't fail the booking if stats update fails
    }

    // Trigger WhatsApp notifications
    try {
      await onBookingCreated(booking.id, paymentLink || undefined)
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error)
      // Don't fail the booking creation if notification fails
    }

    return NextResponse.json({ 
      success: true, 
      booking,
      paymentLink,
      message: paymentMethod === 'stripe' 
        ? 'Reserva creada. Te enviaremos el link de pago por WhatsApp' 
        : 'Reserva creada exitosamente. Recuerda pagar al llegar al club'
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al crear reserva' },
      { status: 500 }
    )
  }
}

// Helper functions
async function checkBookingConflicts(
  clubId: string,
  courtId: string,
  date: Date,
  startTime: string,
  endTime: string
) {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

  return await prisma.booking.findMany({
    where: {
      clubId,
      courtId,
      date: {
        gte: startOfDay,
        lt: endOfDay
      },
      status: {
        not: 'CANCELLED'
      },
      OR: [
        // New booking starts during existing booking
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } }
          ]
        },
        // New booking ends during existing booking
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } }
          ]
        },
        // New booking completely contains existing booking
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } }
          ]
        }
      ]
    },
    include: {
      Court: true
    }
  })
}

async function calculateBookingPrice(
  clubId: string,
  date: Date,
  startTime: string,
  duration: number,
  playerPhone?: string
): Promise<number> {
  const dayOfWeek = date.getDay()
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek]
  
  // Pricing calculation
  console.log(`  Club: ${clubId}`)
  console.log(`  Fecha: ${date.toISOString()}`)
  console.log(`  Día de la semana: ${dayName} (${dayOfWeek})`)
  console.log(`  Hora inicio: ${startTime}`)
  console.log(`  Duración: ${duration} minutos`)
  
  // Get pricing configuration for the club
  const pricing = await prisma.pricing.findFirst({
    where: {
      clubId,
      OR: [
        { dayOfWeek: null }, // Default pricing
        { dayOfWeek }        // Day-specific pricing
      ],
      startTime: { lte: startTime },
      endTime: { gt: startTime }
    },
    orderBy: [
      { dayOfWeek: 'desc' }, // Prefer day-specific over default
      { createdAt: 'desc' }
    ]
  })
  
  // Check if pricing configuration exists
  if (!pricing) {
    throw new Error(`No se encontró configuración de precios para el horario ${startTime} del día ${dayOfWeek}`)
  }
  
  const basePrice = pricing.price // Price in centavos
  
  if (basePrice === 0) {
    console.error(`[PRICING ERROR] Precio configurado como 0 para el horario ${startTime} del día ${dayName}`)
    throw new Error(`Precio no válido configurado. Por favor, contacte al administrador del club.`)
  }
  
  // Calculate price based on duration
  const hours = duration / 60
  let finalPrice = Math.round(basePrice * hours)
  
  console.log(`  Precio base: $${basePrice} centavos/hora`)
  console.log(`  Duración: ${hours} horas`)
  console.log(`  Precio calculado: $${finalPrice} centavos`)
  
  // Apply discount rules if player phone is provided
  if (playerPhone) {
    const discountRules = await prisma.discountRule.findMany({
      where: {
        clubId,
        enabled: true
      },
      orderBy: {
        value: 'desc' // Apply highest discount
      }
    })
    
    for (const discount of discountRules) {
      let eligible = false
      
      // Check eligibility based on discount type
      if (discount.type === 'FREQUENCY') {
        // Count player's Booking in the time window
        const windowStart = new Date()
        windowStart.setDate(windowStart.getDate() - (discount.conditions as any).timeWindowDays)
        
        const bookingCount = await prisma.booking.count({
          where: {
            clubId,
            playerPhone,
            createdAt: { gte: windowStart },
            status: { in: ['CONFIRMED', 'COMPLETED'] }
          }
        })
        
        if (bookingCount >= (discount.conditions as any).minBookings) {
          eligible = true
        }
      } else if (discount.type === 'HAPPY_HOUR') {
        // Check if current time/day matches happy hour
        const conditions = discount.conditions as any
        if (conditions.days?.includes(dayName) && 
            conditions.startTime <= startTime && 
            conditions.endTime > startTime) {
          eligible = true
        }
      } else if (discount.type === 'VOLUME') {
        // Check if duration qualifies for volume discount
        const minHours = (discount.conditions as any).minHours
        if (hours >= minHours) {
          eligible = true
        }
      }
      
      if (eligible) {
        const discountAmount = Math.round(finalPrice * (discount.value / 100))
        finalPrice = finalPrice - discountAmount
        break // Apply only the highest discount
      }
    }
  }
  
  // Pricing calculation
  
  return finalPrice
}