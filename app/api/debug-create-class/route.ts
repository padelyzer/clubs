import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function POST(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    steps: [],
    body: null,
    error: null
  }

  try {
    // Step 1: Get body
    const body = await request.json()
    diagnostics.body = body
    diagnostics.steps.push({ step: 'parse_body', status: 'success' })

    // Step 2: Check auth
    const session = await requireAuthAPI()
    if (!session) {
      diagnostics.steps.push({ step: 'auth', status: 'failed' })
      return NextResponse.json({ success: false, diagnostics }, { status: 401 })
    }
    diagnostics.steps.push({ step: 'auth', status: 'success', clubId: session.clubId })

    // Step 3: Validate instructor
    diagnostics.steps.push({ step: 'validate_instructor', status: 'attempting' })
    const instructor = await prisma.instructor.findFirst({
      where: {
        id: body.instructorId,
        clubId: session.clubId,
        active: true
      }
    })

    if (!instructor) {
      diagnostics.steps.push({ step: 'validate_instructor', status: 'failed', error: 'Instructor not found' })
      return NextResponse.json({ success: false, diagnostics }, { status: 404 })
    }
    diagnostics.steps.push({ step: 'validate_instructor', status: 'success', instructor: { id: instructor.id, name: instructor.name } })

    // Step 4: Validate court
    diagnostics.steps.push({ step: 'validate_court', status: 'attempting' })
    const court = await prisma.court.findFirst({
      where: {
        id: body.courtId,
        clubId: session.clubId,
        active: true
      }
    })

    if (!court) {
      diagnostics.steps.push({ step: 'validate_court', status: 'failed', error: 'Court not found' })
      return NextResponse.json({ success: false, diagnostics }, { status: 404 })
    }
    diagnostics.steps.push({ step: 'validate_court', status: 'success', court: { id: court.id, name: court.name } })

    // Step 5: Parse date
    diagnostics.steps.push({ step: 'parse_date', status: 'attempting' })
    const [year, month, day] = body.date.split('-').map(Number)
    const classDate = new Date(year, month - 1, day)
    diagnostics.steps.push({ step: 'parse_date', status: 'success', date: classDate.toISOString() })

    // Step 6: Calculate price in cents
    const priceInCents = Math.round(body.price * 100)
    diagnostics.steps.push({ step: 'calculate_price', status: 'success', priceInCents })

    // Step 7: Calculate duration
    const [startHour, startMin] = body.startTime.split(':').map(Number)
    const [endHour, endMin] = body.endTime.split(':').map(Number)
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
    diagnostics.steps.push({ step: 'calculate_duration', status: 'success', duration })

    // Step 8: Try to create class
    diagnostics.steps.push({ step: 'create_class', status: 'attempting' })

    const classData = {
      id: 'class_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      clubId: session.clubId,
      instructorId: body.instructorId,
      instructorName: instructor.name,
      name: body.name,
      description: body.description || null,
      type: body.type || 'GROUP',
      level: body.level || 'BEGINNER',
      startTime: body.startTime,
      endTime: body.endTime,
      duration,
      courtId: body.courtId,
      maxStudents: body.maxStudents || 8,
      enrolledCount: 0,
      price: priceInCents,
      courtCost: 0,
      instructorCost: 0,
      currency: 'MXN',
      status: 'SCHEDULED',
      notes: body.notes || null,
      date: classDate,
      recurring: false,
      recurringDays: [],
      updatedAt: new Date()
    }

    diagnostics.steps.push({ step: 'class_data_prepared', status: 'success', data: classData })

    const createdClass = await prisma.class.create({
      data: classData
    })

    diagnostics.steps.push({ step: 'create_class', status: 'success', classId: createdClass.id })

    return NextResponse.json({
      success: true,
      message: 'Clase creada exitosamente (DEBUG MODE)',
      class: createdClass,
      diagnostics
    })

  } catch (error) {
    diagnostics.error = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      cause: error instanceof Error ? (error as any).cause : undefined
    }

    diagnostics.steps.push({
      step: 'error',
      status: 'failed',
      error: diagnostics.error
    })

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      diagnostics
    }, { status: 500 })
  }
}
