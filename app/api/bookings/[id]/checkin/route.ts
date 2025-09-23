import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const { id: bookingId } = await params
    console.log('📋 Booking ID from params:', bookingId)
    console.log('   ID type:', typeof bookingId)
    console.log('   ID length:', bookingId?.length)
    
    const body = await request.json()
    console.log('📦 Request body:', JSON.stringify(body, null, 2))
    
    const { 
      playersArrived, 
      paymentMethod, 
      referenceNumber,
      timestamp 
    } = body

    // First, let's check if ANY booking exists with this ID
    console.log('\n🔎 STEP 1: Check if booking exists at all...')
    let anyBooking = null
    try {
      anyBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { id: true, clubId: true }
      })
      console.log('   Booking exists in DB?', anyBooking ? `YES (clubId: ${anyBooking.clubId})` : 'NO')
      
      if (anyBooking && anyBooking.clubId !== session.clubId) {
        console.log(`   ⚠️  Club mismatch! Booking clubId: ${anyBooking.clubId}, Session clubId: ${session.clubId}`)
      }
    } catch (e) {
      console.log('   Error checking booking existence:', e)
    }

    // Now try to get with the correct clubId
    console.log('\n🔎 STEP 2: Get booking with correct clubId...')
    let booking = null
    
    try {
      console.log('   Query params:', { 
        id: bookingId, 
        clubId: session.clubId,
        idStartsWith: bookingId.substring(0, 20) + '...'
      })
      
      console.log('   About to execute findFirst query...')
      booking = await prisma.booking.findFirst({
        where: { 
          id: bookingId,
          clubId: session.clubId 
        },
        include: {
          Payment: true,
          Court: true
        }
      })
      console.log('   Query executed, result:', booking ? 'Found booking' : 'null')
      
      console.log('   Booking found?', booking ? 'YES' : 'NO')
      if (booking) {
        console.log('   Booking details:', {
          id: booking.id,
          playerName: booking.playerName,
          courtName: booking.Court?.name,
          status: booking.status,
          paymentStatus: booking.paymentStatus
        })
      } else {
        // Try with just the ID to debug
        console.log('   Trying with just ID to debug...')
        const debugBooking = await prisma.booking.findUnique({
          where: { id: bookingId },
          select: { id: true, clubId: true, status: true }
        })
        console.log('   Debug result:', debugBooking)
      }
    } catch (e: any) {
      console.log('   ❌ Error finding booking:', e.message || e)
      console.log('   Full error:', JSON.stringify(e, null, 2))
      console.log('   Stack trace:', e.stack)
    }

    let isGroup = false
    let bookingGroup = null

    // If not found, try as a bookingGroup
    if (!booking) {
      console.log('\n🔎 STEP 3: Not found as Booking, trying as BookingGroup...')
      
      // First check if ANY bookingGroup exists with this ID
      let anyBookingGroup = null
      try {
        anyBookingGroup = await prisma.bookingGroup.findUnique({
          where: { id: bookingId },
          select: { id: true, clubId: true }
        })
        console.log('   BookingGroup exists in DB?', anyBookingGroup ? `YES (clubId: ${anyBookingGroup.clubId})` : 'NO')
        
        if (anyBookingGroup && anyBookingGroup.clubId !== session.clubId) {
          console.log(`   ⚠️  Club mismatch! BookingGroup clubId: ${anyBookingGroup.clubId}, Session clubId: ${session.clubId}`)
        }
      } catch (e) {
        console.log('   Error checking bookingGroup existence:', e)
      }
      
      // Now try to get with correct clubId
      try {
        bookingGroup = await prisma.bookingGroup.findFirst({
          where: { 
            id: bookingId,
            clubId: session.clubId 
          },
          include: {
            payments: true,
            bookings: {
              include: {
                Court: true
              }
            }
          }
        })
        
        console.log('   BookingGroup found?', bookingGroup ? 'YES' : 'NO')
        if (bookingGroup) {
          console.log('   BookingGroup details:', {
            id: bookingGroup.id,
            playerName: bookingGroup.playerName,
            bookingsCount: bookingGroup.bookings?.length,
            status: bookingGroup.status
          })
        }
      } catch (e) {
        console.log('   ❌ Error finding bookingGroup:', e)
      }
      
      if (bookingGroup) {
        isGroup = true
        // Create a booking-like object for compatibility
        booking = {
          ...bookingGroup,
          court: { 
            id: 'multiple', 
            name: bookingGroup.bookings.map(b => b.Court.name).join(', ') 
          },
          Court: { 
            id: 'multiple', 
            name: bookingGroup.bookings.map(b => b.Court.name).join(', ') 
          },
          playerName: bookingGroup.playerName,
          price: bookingGroup.price,
          checkedIn: false, // BookingGroup doesn't have checkedIn field
          date: bookingGroup.date,
          startTime: bookingGroup.startTime,
          paymentStatus: 'pending' // For groups, we'll check individual booking payments
        }
        console.log('   ✅ Created booking-like object from bookingGroup')
      }
    }

    if (!booking) {
      console.log('\n❌ FINAL: Neither booking nor bookingGroup found')
      console.log('   Searched ID:', bookingId)
      console.log('   Session clubId:', session.clubId)
      
      // Let's also check if there are ANY recent bookings to verify DB connection
      try {
        const recentCount = await prisma.booking.count({
          where: { clubId: session.clubId },
          take: 1
        })
        console.log('   DB connection test - bookings in club:', recentCount)
      } catch (e) {
        console.log('   DB connection test failed:', e)
      }
      
      console.log('🔍 Check-in API DEBUG END (NOT FOUND) ===============\n')
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Reserva no encontrada. Es posible que haya sido cancelada o eliminada. Por favor, actualiza la lista de reservas.',
          debug: {
            searchedId: bookingId,
            clubId: session.clubId,
            message: 'La reserva no existe en la base de datos. Puede haber sido eliminada o no pertenece a este club.'
          }
        },
        { status: 404 }
      )
    }
    
    console.log('\n✅ Entity found:', isGroup ? 'BookingGroup' : 'Booking')

    // Check if already checked in
    // For groups, use status IN_PROGRESS or COMPLETED; for regular bookings, use checkedIn
    const alreadyCheckedIn = isGroup 
      ? (booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED')
      : booking.checkedIn
      
    if (alreadyCheckedIn) {
      return NextResponse.json(
        { success: false, error: 'Esta reserva ya tiene check-in' },
        { status: 400 }
      )
    }

    // Handle payment if needed OR create missing transaction for completed payments
    const shouldProcessPayment = booking.paymentStatus === 'pending' && paymentMethod
    const shouldCreateMissingTransaction = booking.paymentStatus === 'completed' && !isGroup

    if (shouldProcessPayment) {
      // Create or update payment record
      const existingPayment = (isGroup ? booking.payments : booking.Payment) ? (isGroup ? booking.payments[0] : booking.Payment[0]) : null
      
      if (existingPayment) {
        // Update existing payment
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            method: paymentMethod === 'cash' ? 'CASH' : 
                   paymentMethod === 'terminal' ? 'TERMINAL' : 
                   paymentMethod === 'transfer' ? 'SPEI' : 'CASH',
            status: 'completed',
            completedAt: new Date(),
            ...(referenceNumber && { 
              stripeChargeId: referenceNumber // Using this field for reference
            })
          }
        })
      } else {
        // Create new payment record
        try {
          const paymentData = {
            id: uuidv4(),
            ...(isGroup 
              ? { bookingGroupId: bookingId }
              : { bookingId: bookingId }),
            amount: booking.price,
            currency: 'MXN',
            method: paymentMethod === 'cash' ? 'CASH' : 
                   paymentMethod === 'terminal' ? 'TERMINAL' : 
                   paymentMethod === 'transfer' ? 'SPEI' : 'CASH',
            status: 'completed' as const,
            completedAt: new Date(),
            ...(referenceNumber && { 
              stripeChargeId: referenceNumber // Using this field for reference
            })
          }
          
          console.log('Creating payment with data:', JSON.stringify(paymentData, null, 2))
          
          await prisma.payment.create({
            data: paymentData
          })
        } catch (paymentError) {
          console.error('Error creating payment:', paymentError)
          // Continue without creating payment record
        }
      }

      // Update booking or bookingGroup payment status
      if (isGroup) {
        await prisma.bookingGroup.update({
          where: { id: bookingId },
          data: {
            status: 'CONFIRMED' // Keep as CONFIRMED until check-in
          }
        })
      } else {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'completed',
            paymentType: 'ONSITE' // All on-site payments use ONSITE type
          }
        })
      }

      // Create transaction in finance module for on-site payment
      const transactionReference = referenceNumber 
        ? `${paymentMethod.toUpperCase()}-${referenceNumber}`
        : `${paymentMethod.toUpperCase()}-${bookingId}`
      
      try {
        const transactionData = {
          id: uuidv4(),
          clubId: session.clubId,
          type: 'INCOME' as const,
          category: 'BOOKING',
          amount: booking.price,
          currency: 'MXN',
          description: `Pago de reserva${isGroup ? ' grupal' : ''} - ${booking.playerName} - ${
            isGroup 
              ? booking.court?.name || 'Múltiples canchas' 
              : booking.Court?.name || 'Sin cancha'
          }`,
          reference: transactionReference,
          ...(isGroup 
            ? { bookingGroupId: bookingId }
            : { bookingId: bookingId }),
          date: new Date(),
          createdBy: session.userId,
          notes: `Pago en sitio vía ${
            paymentMethod === 'cash' ? 'efectivo' : 
            paymentMethod === 'terminal' ? 'terminal' : 'transferencia'
          }. Fecha: ${new Date(booking.date).toLocaleDateString('es-MX')} Hora: ${booking.startTime}`
        }
        
        console.log('Creating transaction with data:', JSON.stringify(transactionData, null, 2))
        
        await prisma.transaction.create({
          data: transactionData
        })
      } catch (transactionError) {
        console.error('Error creating transaction:', transactionError)
        // Continue without creating transaction - don't fail the check-in
      }
    }

    // Create missing transaction for completed bookings that don't have one
    if (shouldCreateMissingTransaction) {
      try {
        // Check if transaction already exists
        const existingTransaction = await prisma.transaction.findFirst({
          where: { bookingId: bookingId }
        })

        if (!existingTransaction) {
          // Get payment method from existing payment record
          const existingPayment = booking.Payment?.[0]
          const paymentMethodFromRecord = existingPayment?.method || 'CASH'

          const transactionData = {
            id: uuidv4(),
            clubId: session.clubId,
            type: 'INCOME' as const,
            category: 'BOOKING',
            amount: booking.price,
            currency: 'MXN',
            description: `Pago de reserva - ${booking.playerName} - ${booking.Court?.name || 'Sin cancha'}`,
            reference: `${paymentMethodFromRecord}-${bookingId}`,
            bookingId: bookingId,
            date: new Date(),
            createdBy: session.userId,
            notes: `Transacción creada automáticamente durante check-in. Pago: ${paymentMethodFromRecord}. Fecha reserva: ${new Date(booking.date).toLocaleDateString('es-MX')} Hora: ${booking.startTime}`
          }

          console.log('Creating missing transaction for completed booking:', JSON.stringify(transactionData, null, 2))

          await prisma.transaction.create({
            data: transactionData
          })

          console.log('✅ Created missing transaction for completed booking:', bookingId)
        }
      } catch (transactionError) {
        console.error('Error creating missing transaction:', transactionError)
        // Continue without creating transaction - don't fail the check-in
      }
    }

    // Perform check-in
    let updatedBooking
    
    if (isGroup) {
      // For booking groups, we mark the status as IN_PROGRESS to indicate check-in
      // and optionally update totalPlayers if provided
      updatedBooking = await prisma.bookingGroup.update({
        where: { id: bookingId },
        data: {
          status: 'IN_PROGRESS',
          ...(playersArrived && { 
            totalPlayers: playersArrived 
          }),
          updatedAt: new Date(timestamp || new Date())
        },
        include: {
          bookings: {
            include: {
              Court: true
            }
          },
          payments: true
        }
      })
      
      // Format as booking-like object for response
      updatedBooking = {
        ...updatedBooking,
        court: { 
          id: 'multiple', 
          name: updatedBooking.bookings.map(b => b.Court.name).join(', ') 
        },
        Court: { 
          id: 'multiple', 
          name: updatedBooking.bookings.map(b => b.Court.name).join(', ') 
        },
        playerName: updatedBooking.playerName,
        price: updatedBooking.price,
        checkedIn: updatedBooking.status === 'IN_PROGRESS', // Simulate checkedIn based on status
        checkedInAt: updatedBooking.updatedAt, // Use updatedAt as proxy for checkedInAt
        checkedInBy: session.userId, // Set current user as checker
        paymentStatus: updatedBooking.status === 'IN_PROGRESS' ? 'completed' : 'pending'
      }
    } else {
      updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          checkedIn: true,
          checkedInAt: new Date(timestamp || new Date()),
          checkedInBy: session.userId,
          status: 'CONFIRMED',
          ...(playersArrived && { 
            totalPlayers: playersArrived 
          })
        },
        include: {
          Court: true,
          Payment: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Check-in realizado exitosamente'
    })

  } catch (error) {
    console.error('Error in check-in:', error)
    return NextResponse.json(
      { success: false, error: 'Error al realizar check-in' },
      { status: 500 }
    )
  }
}

// GET - Get check-in status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { id: bookingId } = await params

    let booking = await prisma.booking.findFirst({
      where: { 
        id: bookingId,
        clubId: session.clubId 
      },
      select: {
        id: true,
        checkedIn: true,
        checkedInAt: true,
        checkedInBy: true,
        paymentStatus: true,
        status: true,
        totalPlayers: true
      }
    })

    // If not found, try as a bookingGroup
    if (!booking) {
      const bookingGroup = await prisma.bookingGroup.findFirst({
        where: { 
          id: bookingId,
          clubId: session.clubId 
        },
        select: {
          id: true,
          status: true,
          totalPlayers: true,
          updatedAt: true
        }
      })
      
      if (bookingGroup) {
        // Convert BookingGroup to booking-like object for consistency
        booking = {
          ...bookingGroup,
          checkedIn: (bookingGroup.status === 'IN_PROGRESS' || bookingGroup.status === 'COMPLETED'),
          checkedInAt: bookingGroup.updatedAt,
          checkedInBy: null, // We don't track this for BookingGroups
          paymentStatus: (bookingGroup.status === 'IN_PROGRESS' || bookingGroup.status === 'COMPLETED') ? 'completed' : 'pending'
        }
      }
    }

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      checkinStatus: {
        isCheckedIn: booking.checkedIn,
        checkedInAt: booking.checkedInAt,
        isPaid: (booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED'),
        playersArrived: booking.totalPlayers,
        bookingStatus: booking.status
      }
    })

  } catch (error) {
    console.error('Error getting check-in status:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener estado de check-in' },
      { status: 500 }
    )
  }
}