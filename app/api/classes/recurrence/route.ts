import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { addDays, addWeeks, addMonths, format, startOfWeek } from 'date-fns'

// POST - Create recurring classes
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      classData,
      recurrencePattern,
      interval = 1,
      daysOfWeek = [],
      endDate,
      occurrences
    } = data

    // Validate input
    if (!classData || !recurrencePattern) {
      return NextResponse.json(
        { success: false, error: 'Datos de clase y patrón de recurrencia requeridos' },
        { status: 400 }
      )
    }

    // Calculate recurrence dates
    const dates: Date[] = []
    let currentDate = new Date(classData.date)
    const end = endDate ? new Date(endDate) : addMonths(currentDate, 3) // Default 3 months
    let count = 0
    const maxOccurrences = occurrences || 52 // Default max 52 occurrences (1 year weekly)

    switch (recurrencePattern) {
      case 'DAILY':
        while (currentDate <= end && count < maxOccurrences) {
          dates.push(new Date(currentDate))
          currentDate = addDays(currentDate, interval)
          count++
        }
        break

      case 'WEEKLY':
        if (daysOfWeek.length === 0) {
          // Use same day of week as original
          while (currentDate <= end && count < maxOccurrences) {
            dates.push(new Date(currentDate))
            currentDate = addWeeks(currentDate, interval)
            count++
          }
        } else {
          // Specific days of week
          const startWeek = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday start
          currentDate = startWeek
          
          while (currentDate <= end && count < maxOccurrences) {
            for (let i = 0; i < 7; i++) {
              const checkDate = addDays(startWeek, i)
              if (daysOfWeek.includes(checkDate.getDay()) && checkDate >= classData.date && checkDate <= end) {
                dates.push(new Date(checkDate))
                count++
                if (count >= maxOccurrences) break
              }
            }
            startWeek.setDate(startWeek.getDate() + (7 * interval))
            currentDate = startWeek
          }
        }
        break

      case 'MONTHLY':
        while (currentDate <= end && count < maxOccurrences) {
          dates.push(new Date(currentDate))
          currentDate = addMonths(currentDate, interval)
          count++
        }
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Patrón de recurrencia no válido' },
          { status: 400 }
        )
    }

    // Create all classes in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const classes = []
      
      // Create first class with recurrence info
      const firstClass = await tx.class.create({
        data: {
          ...classData,
          recurring: true,
          recurringDays: daysOfWeek || []
        }
      })
      classes.push(firstClass)

      // Create remaining classes
      for (let i = 1; i < dates.length; i++) {
        const recurringClass = await tx.class.create({
          data: {
            ...classData,
            date: dates[i],
            recurring: true,
            recurringDays: daysOfWeek || []
          }
        })
        classes.push(recurringClass)
      }

      return classes
    })

    return NextResponse.json({
      success: true,
      message: `${result.length} clases creadas exitosamente`,
      classes: result,
      dates: dates.map(d => format(d, 'yyyy-MM-dd'))
    })

  } catch (error) {
    console.error('Error creating recurring classes:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear clases recurrentes' },
      { status: 500 }
    )
  }
}

// GET - Get recurrence info for a class
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    
    if (!classId) {
      return NextResponse.json(
        { success: false, error: 'ID de clase requerido' },
        { status: 400 }
      )
    }

    // Note: ClassRecurrence model doesn't exist in schema
    // Recurrence is handled via Class.recurring and Class.recurringDays fields
    const classItem = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!classItem) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    if (!classItem.recurring) {
      return NextResponse.json(
        { success: false, error: 'Esta clase no es recurrente' },
        { status: 400 }
      )
    }

    // Get all classes with same instructor, time, and recurring days
    const relatedClasses = await prisma.class.findMany({
      where: {
        clubId: classItem.clubId,
        instructorId: classItem.instructorId,
        startTime: classItem.startTime,
        endTime: classItem.endTime,
        recurring: true,
        date: {
          gte: classItem.date
        }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({
      success: true,
      class: classItem,
      relatedClasses,
      totalOccurrences: relatedClasses.length
    })

  } catch (error) {
    console.error('Error fetching recurrence info:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener información de recurrencia' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel recurring classes
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const cancelAll = searchParams.get('cancelAll') === 'true'
    
    if (!classId) {
      return NextResponse.json(
        { success: false, error: 'ID de clase requerido' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      if (cancelAll) {
        // Get class info
        const classItem = await tx.class.findUnique({
          where: { id: classId }
        })

        if (classItem && classItem.recurring) {
          // Cancel all related future recurring classes
          const cancelled = await tx.class.updateMany({
            where: {
              clubId: classItem.clubId,
              instructorId: classItem.instructorId,
              startTime: classItem.startTime,
              endTime: classItem.endTime,
              recurring: true,
              date: { gte: new Date() } // Only future classes
            },
            data: {
              status: 'CANCELLED',
              cancelledAt: new Date()
            }
          })

          return { cancelledCount: cancelled.count }
        }
      }

      // Cancel single class
      await tx.class.update({
        where: { id: classId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      })

      return { cancelledCount: 1 }
    })

    return NextResponse.json({
      success: true,
      message: `${result.cancelledCount} clase(s) cancelada(s) exitosamente`,
      ...result
    })

  } catch (error) {
    console.error('Error cancelling recurring classes:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cancelar clases' },
      { status: 500 }
    )
  }
}