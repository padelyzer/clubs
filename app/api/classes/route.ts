import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { addWeeks, addMonths, format } from 'date-fns'

// GET - Retrieve classes
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
    
    const instructorId = searchParams.get('instructorId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const level = searchParams.get('level')
    const date = searchParams.get('date')
    const upcoming = searchParams.get('upcoming')
    
    // Build where clause - ALWAYS filter by club
    const where: any = {
      clubId: session.clubId
    }
    
    if (instructorId && instructorId !== 'all') {
      where.instructorId = instructorId
    }
    
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.type = type
    }
    
    if (level && level !== 'all') {
      where.level = level
    }
    
    if (date) {
      // Parse date properly to avoid UTC issues
      const [year, month, day] = date.split('-').map(Number)
      const targetDate = new Date(year, month - 1, day)
      const nextDay = new Date(year, month - 1, day + 1)
      
      where.date = {
        gte: targetDate,
        lt: nextDay
      }
    }
    
    if (upcoming === 'true') {
      where.date = {
        gte: new Date()
      }
      where.status = {
        in: ['SCHEDULED', 'IN_PROGRESS']
      }
    }
    
    const classes = await prisma.class.findMany({
      where,
      include: {
        instructor: true,
        court: true,
        bookings: {
          include: {
            player: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })
    
    // Transform for frontend
    const formattedClasses = classes.map(classItem => ({
      ...classItem,
      availableSpots: classItem.maxStudents - classItem.currentStudents,
      enrolledStudents: classItem._count.bookings,
      revenue: classItem.bookings
        .filter(b => b.paymentStatus === 'completed')
        .reduce((sum, b) => sum + b.paidAmount, 0)
    }))
    
    return NextResponse.json({
      success: true,
      classes: formattedClasses
    })

  } catch (error) {
    console.error('Error fetching classes:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener clases',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

// POST - Create class (with recurrence support)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    
    // Validate required fields
    if (!body.instructorId || !body.name || !body.date || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }
    
    // Validate court is required for classes
    if (!body.courtId) {
      return NextResponse.json(
        { success: false, error: 'La cancha es requerida para crear una clase' },
        { status: 400 }
      )
    }
    
    // Use authenticated user's club
    const clubId = session.clubId
    
    // Verify instructor exists and belongs to the club
    const instructor = await prisma.instructor.findFirst({
      where: {
        id: body.instructorId,
        clubId: clubId,
        active: true
      }
    })
    
    if (!instructor) {
      return NextResponse.json(
        { success: false, error: 'Instructor no encontrado' },
        { status: 404 }
      )
    }
    
    // Verify court exists if provided
    if (body.courtId) {
      // First check if any courts exist, if not create defaults
      const courtCount = await prisma.court.count()
      
      if (courtCount === 0) {
        // Create default courts
        const defaultCourts = [
          { id: 'court-1', name: 'Cancha 1', type: 'PADEL' },
          { id: 'court-2', name: 'Cancha 2', type: 'PADEL' },
          { id: 'court-3', name: 'Cancha 3', type: 'PADEL' }
        ]
        
        for (const courtData of defaultCourts) {
          await prisma.court.create({
            data: {
              id: courtData.id,
              clubId,
              name: courtData.name,
              type: courtData.type,
              active: true,
              settings: {}
            }
          })
        }
      }
      
      const court = await prisma.court.findFirst({
        where: {
          id: body.courtId,
          clubId: clubId,
          active: true
        }
      })
      
      if (!court) {
        return NextResponse.json(
          { success: false, error: 'Cancha no encontrada' },
          { status: 404 }
        )
      }
    }
    
    // Get club settings for default pricing and costs
    const clubSettings = await prisma.clubSettings.findFirst({
      where: { clubId }
    })
    
    // Convert price from pesos to cents (use default if not provided)
    let priceInCents = 0
    if (body.price !== undefined) {
      priceInCents = Math.round(body.price * 100)
    } else if (clubSettings) {
      // Use default price based on class type
      switch (body.type || 'GROUP') {
        case 'GROUP':
          priceInCents = clubSettings.groupClassPrice
          break
        case 'PRIVATE':
          priceInCents = clubSettings.privateClassPrice
          break
        case 'SEMI_PRIVATE':
          priceInCents = clubSettings.semiPrivateClassPrice
          break
      }
    }
    
    // Calculate duration in minutes
    const [startHour, startMin] = body.startTime.split(':').map(Number)
    const [endHour, endMin] = body.endTime.split(':').map(Number)
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
    
    // Calculate court cost
    const courtCostPerHour = clubSettings?.defaultCourtCostPerHour || 30000 // Default 300 pesos
    const courtCost = Math.round((courtCostPerHour * duration) / 60)
    
    // Calculate instructor cost based on payment type
    let instructorCost = 0
    const durationInHours = duration / 60
    
    switch (instructor.paymentType) {
      case 'HOURLY':
        instructorCost = Math.round(instructor.hourlyRate * durationInHours)
        break
      case 'COMMISSION':
        instructorCost = Math.round((priceInCents * instructor.commissionPercent) / 100)
        break
      case 'MIXED':
        // For mixed, we'll calculate the commission part only (fixed salary is handled separately)
        instructorCost = Math.round((priceInCents * instructor.commissionPercent) / 100)
        break
      case 'FIXED':
        // Fixed salary doesn't add per-class cost
        instructorCost = 0
        break
    }
    
    // Function to check availability for a specific date
    const checkAvailability = async (date: Date, courtId: string) => {
      // Ensure we're working with a date at midnight local time
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      // Check for conflicting bookings
      const conflictingBookings = await prisma.booking.findFirst({
        where: {
          courtId,
          date: checkDate,
          status: { not: 'CANCELLED' as any },
          OR: [
            {
              AND: [
                { startTime: { lte: body.startTime } },
                { endTime: { gt: body.startTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: body.endTime } },
                { endTime: { gte: body.endTime } }
              ]
            },
            {
              AND: [
                { startTime: { gte: body.startTime } },
                { endTime: { lte: body.endTime } }
              ]
            }
          ]
        }
      })
      
      // Check for conflicting classes
      const conflictingClasses = await prisma.class.findFirst({
        where: {
          courtId,
          date: checkDate,
          status: 'SCHEDULED',
          OR: [
            {
              AND: [
                { startTime: { lte: body.startTime } },
                { endTime: { gt: body.startTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: body.endTime } },
                { endTime: { gte: body.endTime } }
              ]
            },
            {
              AND: [
                { startTime: { gte: body.startTime } },
                { endTime: { lte: body.endTime } }
              ]
            }
          ]
        }
      })
      
      return !conflictingBookings && !conflictingClasses
    }
    
    // Create base class data
    const baseClassData = {
      clubId,
      instructorId: body.instructorId,
      instructorName: instructor.name,
      name: body.name,
      description: body.description || null,
      type: body.type || 'GROUP',
      level: body.level || 'BEGINNER',
      startTime: body.startTime,
      endTime: body.endTime,
      duration,
      courtId: body.courtId || null,
      maxStudents: body.maxStudents || 8,
      currentStudents: 0,
      price: priceInCents,
      courtCost,
      instructorCost,
      currency: 'MXN',
      status: 'SCHEDULED',
      notes: body.notes || null,
      requirements: body.requirements || null,
      materials: body.materials || null,
      createdBy: 'system'
    }
    
    const createdClasses = []
    const unavailableDates = []
    
    // Handle recurrence
    if (body.isRecurring && body.recurrencePattern) {
      const pattern = body.recurrencePattern
      // Parse date properly to avoid UTC issues
      const [year, month, day] = body.date.split('-').map(Number)
      const startDate = new Date(year, month - 1, day)
      const endDate = pattern.endDate ? (() => {
        const [y, m, d] = pattern.endDate.split('-').map(Number)
        return new Date(y, m - 1, d)
      })() : null
      const occurrences = pattern.occurrences || 12 // Default 12 occurrences
      
      let currentDate = startDate
      let count = 0
      
      while (count < occurrences && (!endDate || currentDate <= endDate)) {
        // Check availability for this date
        const isAvailable = await checkAvailability(currentDate, body.courtId)
        
        if (isAvailable) {
          // Create class for this date
          const classItem = await prisma.class.create({
            data: {
              ...baseClassData,
              date: currentDate,
              isRecurring: true,
              recurrencePattern: JSON.stringify(pattern)
            },
            include: {
              instructor: true,
              court: true,
              _count: {
                select: {
                  bookings: true
                }
              }
            }
          })
          
          createdClasses.push(classItem)
        } else {
          unavailableDates.push(currentDate.toISOString().split('T')[0])
        }
        
        count++
        
        // Calculate next date based on frequency
        if (pattern.frequency === 'WEEKLY') {
          currentDate = addWeeks(currentDate, pattern.interval || 1)
        } else if (pattern.frequency === 'MONTHLY') {
          currentDate = addMonths(currentDate, pattern.interval || 1)
        } else {
          break // Only handle weekly and monthly for now
        }
      }
    } else {
      // Check availability for single class
      // Parse date properly to avoid UTC issues
      const [year, month, day] = body.date.split('-').map(Number)
      const classDate = new Date(year, month - 1, day)
      const isAvailable = await checkAvailability(classDate, body.courtId)
      
      if (!isAvailable) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'El horario seleccionado no está disponible. Ya existe una reserva o clase en ese horario.' 
          },
          { status: 409 }
        )
      }
      
      // Create single class
      const classItem = await prisma.class.create({
        data: {
          ...baseClassData,
          date: classDate,
          isRecurring: false
        },
        include: {
          instructor: true,
          court: true,
          _count: {
            select: {
              bookings: true
            }
          }
        }
      })
      
      createdClasses.push(classItem)
    }
    
    let message = body.isRecurring 
      ? `Se crearon ${createdClasses.length} clases recurrentes`
      : 'Clase creada exitosamente'
    
    if (unavailableDates.length > 0) {
      message += `. ${unavailableDates.length} fecha(s) no disponible(s): ${unavailableDates.join(', ')}`
    }
    
    return NextResponse.json({
      success: true,
      message,
      classes: createdClasses.map(c => ({
        ...c,
        availableSpots: c.maxStudents - c.currentStudents,
        enrolledStudents: c._count.bookings,
        revenue: 0
      })),
      unavailableDates
    })

  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear clase' },
      { status: 500 }
    )
  }
}

// PUT - Update class
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'ID de clase es requerido' },
        { status: 400 }
      )
    }
    
    // Check if class exists and belongs to the club
    const existingClass = await prisma.class.findFirst({
      where: { 
        id: body.id,
        clubId: session.clubId 
      }
    })
    
    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }
    
    // Get club settings and instructor if needed
    let instructor = null
    let clubSettings = null
    
    if (body.instructorId !== undefined || body.price !== undefined || body.type !== undefined || 
        body.startTime !== undefined || body.endTime !== undefined) {
      clubSettings = await prisma.clubSettings.findFirst({
        where: { clubId: session.clubId }
      })
    }
    
    const updateData: any = {}
    
    // Handle instructor change
    if (body.instructorId !== undefined) {
      instructor = await prisma.instructor.findFirst({
        where: {
          id: body.instructorId,
          clubId: session.clubId,
          active: true
        }
      })
      
      if (!instructor) {
        return NextResponse.json(
          { success: false, error: 'Instructor no encontrado' },
          { status: 404 }
        )
      }
      
      updateData.instructorId = body.instructorId
      updateData.instructorName = instructor.name
    }
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.type !== undefined) updateData.type = body.type
    if (body.level !== undefined) updateData.level = body.level
    if (body.status !== undefined) updateData.status = body.status
    if (body.date !== undefined) updateData.date = new Date(body.date)
    if (body.startTime !== undefined) updateData.startTime = body.startTime
    if (body.endTime !== undefined) updateData.endTime = body.endTime
    if (body.courtId !== undefined) updateData.courtId = body.courtId || null
    if (body.maxStudents !== undefined) updateData.maxStudents = body.maxStudents
    
    // Handle price update and cost calculations
    if (body.price !== undefined || body.type !== undefined || 
        body.instructorId !== undefined || body.startTime !== undefined || body.endTime !== undefined) {
      
      // Determine price
      let priceInCents = 0
      if (body.price !== undefined) {
        priceInCents = Math.round(body.price * 100)
      } else if (body.type !== undefined && clubSettings) {
        // Use new type's default price
        switch (body.type) {
          case 'GROUP':
            priceInCents = clubSettings.groupClassPrice
            break
          case 'PRIVATE':
            priceInCents = clubSettings.privateClassPrice
            break
          case 'SEMI_PRIVATE':
            priceInCents = clubSettings.semiPrivateClassPrice
            break
        }
      } else {
        // Keep existing price
        priceInCents = existingClass.price
      }
      
      updateData.price = priceInCents
      
      // Calculate duration
      const startTime = body.startTime || existingClass.startTime
      const endTime = body.endTime || existingClass.endTime
      const [startHour, startMin] = startTime.split(':').map(Number)
      const [endHour, endMin] = endTime.split(':').map(Number)
      const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
      updateData.duration = duration
      
      // Calculate court cost
      const courtCostPerHour = clubSettings?.defaultCourtCostPerHour || 30000
      updateData.courtCost = Math.round((courtCostPerHour * duration) / 60)
      
      // Calculate instructor cost if instructor changed
      if (instructor || body.startTime !== undefined || body.endTime !== undefined) {
        // Get instructor info if not already fetched
        if (!instructor && existingClass.instructorId) {
          instructor = await prisma.instructor.findFirst({
            where: { id: existingClass.instructorId }
          })
        }
        
        if (instructor) {
          let instructorCost = 0
          const durationInHours = duration / 60
          
          switch (instructor.paymentType) {
            case 'HOURLY':
              instructorCost = Math.round(instructor.hourlyRate * durationInHours)
              break
            case 'COMMISSION':
              instructorCost = Math.round((priceInCents * instructor.commissionPercent) / 100)
              break
            case 'MIXED':
              instructorCost = Math.round((priceInCents * instructor.commissionPercent) / 100)
              break
            case 'FIXED':
              instructorCost = 0
              break
          }
          
          updateData.instructorCost = instructorCost
        }
      }
    }
    
    if (body.notes !== undefined) updateData.notes = body.notes || null
    if (body.requirements !== undefined) updateData.requirements = body.requirements || null
    if (body.materials !== undefined) updateData.materials = body.materials || null
    
    // Calculate duration if times changed
    if (body.startTime && body.endTime) {
      const [startHour, startMin] = body.startTime.split(':').map(Number)
      const [endHour, endMin] = body.endTime.split(':').map(Number)
      updateData.duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
    }
    
    const classItem = await prisma.class.update({
      where: { id: body.id },
      data: updateData,
      include: {
        instructor: true,
        court: true,
        bookings: {
          include: {
            player: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      class: {
        ...classItem,
        availableSpots: classItem.maxStudents - classItem.currentStudents,
        enrolledStudents: classItem._count.bookings,
        revenue: classItem.bookings
          .filter(b => b.paymentStatus === 'completed')
          .reduce((sum, b) => sum + b.paidAmount, 0)
      }
    })

  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar clase' },
      { status: 500 }
    )
  }
}

// DELETE - Delete class
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de clase es requerido' },
        { status: 400 }
      )
    }
    
    // Check if class exists and belongs to the club
    const classItem = await prisma.class.findFirst({
      where: { 
        id,
        clubId: session.clubId 
      },
      include: {
        bookings: true
      }
    })
    
    if (!classItem) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }
    
    // Can only delete if class hasn't started and has no bookings
    if (classItem.status === 'IN_PROGRESS' || classItem.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar una clase en progreso o completada' },
        { status: 400 }
      )
    }
    
    if (classItem.bookings.length > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar una clase con estudiantes inscritos' },
        { status: 400 }
      )
    }
    
    await prisma.class.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Clase eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar clase' },
      { status: 500 }
    )
  }
}