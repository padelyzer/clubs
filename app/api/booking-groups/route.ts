import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'
import { addMinutes, format, parse, parseISO } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

// Validation schema for creating booking groups
const createBookingGroupSchema = z.object({
  name: z.string().min(1, 'Nombre del evento es requerido'),
  type: z.enum(['MULTI_COURT', 'TOURNAMENT', 'CLASS', 'EVENT']).default('MULTI_COURT'),
  courtIds: z.array(z.string()).optional(), // Optional - can be auto-selected
  multiCourtCount: z.number().min(2).max(8).optional(), // Number of courts desired for auto-selection
  date: z.string(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido'),
  duration: z.number().min(30).max(240),
  playerName: z.string().min(1, 'Nombre del organizador requerido'),
  playerEmail: z.string().email().or(z.literal("")).optional(),
  playerPhone: z.string().min(10, 'Teléfono inválido'),
  totalPlayers: z.number().min(4).max(50).default(8),
  splitPaymentEnabled: z.boolean().default(false),
  splitPaymentCount: z.number().min(2).max(50).default(8),
  playersPerCourt: z.number().min(2).max(8).default(4),
  notes: z.string().optional(),
  paymentMethod: z.enum(['stripe', 'onsite']).optional(),
  paymentType: z.enum(['terminal', 'transfer', 'cash']).optional(),
})

// GET - Retrieve booking groups
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = {
      clubId: session.clubId
    }

    // Date filtering
    if (date) {
      const targetDate = parseISO(date)
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
      
      where.date = {
        gte: startOfDay,
        lt: endOfDay
      }
    }

    // Status filtering
    if (status) {
      where.status = status
    } else {
      where.status = { not: 'CANCELLED' }
    }

    // Type filtering
    if (type) {
      where.type = type
    }

    const bookingGroups = await prisma.bookingGroup.findMany({
      where,
      include: {
        bookings: {
          include: {
            Court: true
          }
        },
        splitPayments: true,
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

    // Add computed fields
    const groupsWithStatus = bookingGroups.map(group => {
      // Debug logging to understand the data structure
      console.log('🔍 Group structure debug:', {
        id: group.id,
        splitPaymentEnabled: group.splitPaymentEnabled,
        splitPayments: Array.isArray(group.splitPayments) ? group.splitPayments.length : 'undefined',
        bookings: Array.isArray(group.bookings) ? group.bookings.length : 'undefined'
      })

      const splitPaymentProgress = group.splitPaymentEnabled 
        ? (group.splitPayments?.filter(sp => sp.status === 'completed').length || 0)
        : 0

      return {
        ...group,
        splitPaymentProgress,
        splitPaymentComplete: group.splitPaymentEnabled 
          ? splitPaymentProgress === group.splitPaymentCount
          : true,
        courtNames: Array.isArray(group.bookings) 
          ? group.bookings.map(b => b.Court.name).join(', ') 
          : 'No courts'
      }
    })

    return NextResponse.json({ 
      success: true, 
      bookingGroups: groupsWithStatus 
    })

  } catch (error) {
    console.error('Error fetching booking groups:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener grupos de reservas' },
      { status: 500 }
    )
  }
}

// POST - Create new booking group with availability validation
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const body = await request.json()
    
    console.log('📝 BookingGroup request body:', body)
    
    const validatedData = createBookingGroupSchema.parse(body)
    
    console.log('✅ BookingGroup validated data:', validatedData)
    
    // Validate players per court and total players consistency
    const requiredCourts = Math.ceil(validatedData.totalPlayers / validatedData.playersPerCourt)
    const requestedCourts = validatedData.multiCourtCount || requiredCourts
    
    if (requestedCourts < requiredCourts) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Para ${validatedData.totalPlayers} jugadores con ${validatedData.playersPerCourt} por cancha se necesitan al menos ${requiredCourts} canchas`,
          requiredCourts,
          requestedCourts
        },
        { status: 400 }
      )
    }

    // Auto-select courts if not provided
    let finalCourtIds = validatedData.courtIds || []
    
    if (finalCourtIds.length === 0 || finalCourtIds.length < requestedCourts) {
      console.log('🤖 Auto-selecting courts...')
      
      // Get all active courts
      const allCourts = await prisma.court.findMany({
        where: { 
          clubId: session.clubId,
          active: true 
        },
        orderBy: { order: 'asc' }
      })
      
      // Check availability for all courts
      const availableCourts = []
      for (const court of allCourts) {
        const conflicts = await checkBookingConflicts(
          session.clubId,
          court.id,
          parseISO(validatedData.date),
          validatedData.startTime,
          format(addMinutes(parse(validatedData.startTime, 'HH:mm', new Date()), validatedData.duration), 'HH:mm')
        )
        
        if (conflicts.length === 0) {
          availableCourts.push(court.id)
        }
      }
      
      // Combine manually selected + auto-selected courts
      const needed = requestedCourts - finalCourtIds.length
      const autoSelected = availableCourts.filter(id => !finalCourtIds.includes(id)).slice(0, needed)
      finalCourtIds = [...finalCourtIds, ...autoSelected]
      
      console.log('🎯 Court selection:', {
        requested: requestedCourts,
        required: requiredCourts,
        manual: validatedData.courtIds?.length || 0,
        autoSelected: autoSelected.length,
        final: finalCourtIds.length,
        availableTotal: availableCourts.length
      })
      
      // Verify we have enough courts
      if (finalCourtIds.length < requiredCourts) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Solo ${finalCourtIds.length} canchas disponibles para el horario solicitado. Se necesitan al menos ${requiredCourts} para ${validatedData.totalPlayers} jugadores`,
            availableCourts: finalCourtIds.length,
            requiredCourts,
            totalPlayers: validatedData.totalPlayers,
            playersPerCourt: validatedData.playersPerCourt
          },
          { status: 409 }
        )
      }
    }

    console.log('🏓 Creating BookingGroup with data:', {
      name: validatedData.name,
      type: validatedData.type,
      courts: finalCourtIds,
      date: validatedData.date,
      time: validatedData.startTime,
      duration: validatedData.duration
    })
    
    // Calculate end time
    const startTimeDate = parse(validatedData.startTime, 'HH:mm', new Date())
    const endTimeDate = addMinutes(startTimeDate, validatedData.duration)
    const endTime = format(endTimeDate, 'HH:mm')
    
    // Parse and validate booking date
    const bookingDate = parseISO(validatedData.date)
    const now = new Date()
    
    // Validation: No bookings in the past
    if (bookingDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se pueden crear reservas en fechas pasadas'
        },
        { status: 400 }
      )
    }
    
    // Validation: No bookings more than 90 days in the future
    const maxFutureDate = new Date()
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
    
    // Get club settings to validate operating hours
    const clubSettings = await prisma.clubSettings.findUnique({
      where: { clubId: session.clubId }
    })
    
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

    // 🎯 CRITICAL: Check availability for ALL selected courts (including auto-selected)
    console.log('🔍 Checking availability for courts:', finalCourtIds)
    
    const availabilityResults = await Promise.all(
      finalCourtIds.map(async (courtId) => {
        const conflicts = await checkBookingConflicts(
          session.clubId,
          courtId,
          bookingDate,
          validatedData.startTime,
          endTime
        )
        return {
          courtId,
          conflicts: conflicts.length > 0,
          conflictDetails: conflicts
        }
      })
    )

    // Find courts with conflicts
    const conflictedCourts = availabilityResults.filter(result => result.conflicts)
    
    if (conflictedCourts.length > 0) {
      console.log('❌ Conflicts found:', conflictedCourts)
      
      // Get court names for better error message
      const courts = await prisma.court.findMany({
        where: { 
          id: { in: conflictedCourts.map(c => c.courtId) },
          clubId: session.clubId 
        }
      })
      
      const conflictedCourtNames = courts.map(c => c.name).join(', ')
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Las siguientes canchas no están disponibles: ${conflictedCourtNames}`,
          conflicts: conflictedCourts,
          availableCourts: availabilityResults.filter(r => !r.conflicts).map(r => r.courtId)
        },
        { status: 409 }
      )
    }

    console.log('✅ All courts available, proceeding with booking group creation')

    // Calculate total pricing for all courts (including auto-selected)
    let totalPrice = 0
    const courtPrices: { [courtId: string]: number } = {}
    
    for (const courtId of finalCourtIds) {
      const price = await calculateBookingPrice(
        session.clubId,
        bookingDate,
        validatedData.startTime,
        validatedData.duration
      )
      courtPrices[courtId] = price
      totalPrice += price
    }

    console.log('💰 Pricing calculated:', { courtPrices, totalPrice })

    // Determine payment status based on method
    const paymentMethod = validatedData.paymentMethod || 'onsite'
    const bookingStatus = paymentMethod === 'stripe' ? 'PENDING' : 'PENDING'
    const paymentStatus = paymentMethod === 'stripe' ? 'pending' : 'pending'

    // Start database transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the BookingGroup
      const bookingGroup = await tx.bookingGroup.create({
        data: {
          id: uuidv4(),
          clubId: session.clubId,
          playerName: validatedData.playerName,
          playerEmail: validatedData.playerEmail,
          playerPhone: validatedData.playerPhone,
          totalPlayers: validatedData.totalPlayers,
          date: bookingDate,
          startTime: validatedData.startTime,
          endTime,
          duration: validatedData.duration,
          price: totalPrice,
          currency: 'MXN',
          splitPaymentEnabled: validatedData.splitPaymentEnabled,
          splitPaymentCount: validatedData.splitPaymentCount,
          notes: validatedData.notes,
          status: bookingStatus,
          updatedAt: new Date()
        }
      })

      console.log(`📝 Created BookingGroup: ${bookingGroup.id}`)

      // 2. Create individual Booking records for each court (including auto-selected)
      const individualBookings = []
      for (const courtId of finalCourtIds) {
        const booking = await tx.booking.create({
          data: {
            id: uuidv4(),
            clubId: session.clubId,
            courtId,
            date: bookingDate,
            startTime: validatedData.startTime,
            endTime,
            duration: validatedData.duration,
            playerName: validatedData.playerName,
            playerEmail: validatedData.playerEmail,
            playerPhone: validatedData.playerPhone,
            totalPlayers: validatedData.playersPerCourt, // Use playersPerCourt instead of division
            price: courtPrices[courtId],
            currency: 'MXN',
            status: bookingStatus,
            paymentStatus: paymentStatus,
            bookingGroupId: bookingGroup.id, // Link to group
            splitPaymentEnabled: false, // Individual bookings don't have split payments
            splitPaymentCount: 0,
            updatedAt: new Date()
          }
        })
        
        individualBookings.push(booking)
        console.log(`🏓 Created individual booking for court ${courtId}: ${booking.id}`)
      }

      // 3. Create split payments if enabled (for the GROUP, not individual bookings)
      if (validatedData.splitPaymentEnabled) {
        const splitAmount = Math.ceil(totalPrice / validatedData.splitPaymentCount)
        
        for (let i = 0; i < validatedData.splitPaymentCount; i++) {
          await tx.splitPayment.create({
            data: {
              id: uuidv4(),
              bookingGroupId: bookingGroup.id, // Associate with group
              playerName: i === 0 ? validatedData.playerName : `Jugador ${i + 1}`,
              playerPhone: i === 0 ? validatedData.playerPhone : '',
              playerEmail: i === 0 ? validatedData.playerEmail : '',
              amount: splitAmount,
              status: 'pending',
              updatedAt: new Date()
            }
          })
        }
        
        console.log(`💸 Created ${validatedData.splitPaymentCount} split payment records for group ${bookingGroup.id}`)
      }

      // 4. Create group payment record if needed
      if (paymentMethod === 'onsite' && !validatedData.splitPaymentEnabled) {
        await tx.payment.create({
          data: {
            id: uuidv4(),
            bookingGroupId: bookingGroup.id,
            amount: totalPrice,
            currency: 'MXN',
            method: validatedData.paymentType === 'cash' ? 'CASH' : 
                    validatedData.paymentType === 'terminal' ? 'TERMINAL' : 'SPEI',
            status: 'pending',
            updatedAt: new Date()
          }
        })
        console.log(`💳 Created group payment record`)
      }

      return {
        bookingGroup: {
          ...bookingGroup,
          bookings: individualBookings
        }
      }
    })

    // 5. Generate payment link if using Stripe
    let paymentLink = null
    if (paymentMethod === 'stripe') {
      paymentLink = `/pay/group/${result.bookingGroup.id}`
      console.log(`🔗 Generated payment link: ${paymentLink}`)
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
            totalSpent: { increment: totalPrice },
            lastBookingAt: new Date()
          }
        })
        console.log(`📊 Updated player statistics for ${player.name}`)
      }
    } catch (error) {
      console.error('Error updating player statistics:', error)
      // Don't fail the booking if stats update fails
    }

    console.log('🎉 BookingGroup created successfully!')

    return NextResponse.json({ 
      success: true, 
      bookingGroup: result.bookingGroup,
      paymentLink,
      message: paymentMethod === 'stripe' 
        ? `Grupo "${validatedData.name}" creado. Se enviará el link de pago por WhatsApp` 
        : `Grupo "${validatedData.name}" creado exitosamente. Recuerda realizar el pago al llegar al club`,
      summary: {
        courts: finalCourtIds.length,
        totalPrice: totalPrice / 100, // Convert to MXN
        playersExpected: validatedData.totalPlayers,
        playersPerCourt: validatedData.playersPerCourt,
        splitPayments: validatedData.splitPaymentEnabled ? validatedData.splitPaymentCount : 0,
        autoSelectedCourts: finalCourtIds.length - (validatedData.courtIds?.length || 0)
      }
    })

  } catch (error) {
    console.error('❌ Error creating booking group:', error)
    
    if (error instanceof z.ZodError) {
      console.error('📋 Zod validation errors:', error.issues)
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al crear grupo de reservas' },
      { status: 500 }
    )
  }
}

// Helper function: Check conflicts for a specific court (reused from booking route)
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

// Helper function: Calculate pricing (reused from booking route)
async function calculateBookingPrice(
  clubId: string,
  date: Date,
  startTime: string,
  duration: number
): Promise<number> {
  const dayOfWeek = date.getDay()
  
  // Get applicable pricing
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

  if (!pricing) {
    throw new Error(`No se encontró configuración de precios para el horario ${startTime} del día ${dayOfWeek}`)
  }

  const basePrice = pricing.price
  const hours = duration / 60
  const finalPrice = Math.round(basePrice * hours)
  
  return finalPrice
}