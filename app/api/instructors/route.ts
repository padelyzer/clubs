import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// GET - Retrieve instructors
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
    const active = searchParams.get('active')
    
    const where: any = {
      clubId: session.clubId
    }
    
    // Only filter by active if specified
    if (active === 'true') {
      where.active = true
    } else if (active === 'false') {
      where.active = false
    }
    
    const instructors = await prisma.classInstructor.findMany({
      where,
      orderBy: [
        { active: 'desc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: {
            classes: true
          }
        }
      }
    })
    
    // Transform for frontend
    const formattedInstructors = instructors.map(instructor => ({
      ...instructor,
      hourlyRate: instructor.hourlyRate / 100, // Convert from cents to pesos
      monthlyRate: instructor.monthlyRate / 100, // Convert from cents to pesos
      totalClasses: instructor._count.classes,
      upcomingClasses: 0 // TODO: Calculate from classes
    }))
    
    return NextResponse.json({
      success: true,
      instructors: formattedInstructors
    })

  } catch (error) {
    console.error('Error fetching instructors:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener instructores' },
      { status: 500 }
    )
  }
}

// POST - Create instructor
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
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Nombre y teléfono son requeridos' },
        { status: 400 }
      )
    }
    
    // Convert rates from pesos to cents
    const hourlyRateInCents = Math.round((body.hourlyRate || 0) * 100)
    const monthlyRateInCents = Math.round((body.monthlyRate || 0) * 100)
    
    const instructor = await prisma.classInstructor.create({
      data: {
        clubId: session.clubId,
        name: body.name,
        email: body.email || null,
        phone: body.phone,
        bio: body.bio || null,
        specialties: body.specialties || [],
        hourlyRate: hourlyRateInCents,
        paymentType: body.paymentType || 'HOURLY',
        monthlyRate: monthlyRateInCents,
        active: true
      },
      include: {
        _count: {
          select: {
            classes: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      instructor: {
        ...instructor,
        hourlyRate: instructor.hourlyRate / 100,
        monthlyRate: instructor.monthlyRate / 100,
        totalClasses: instructor._count.classes,
        upcomingClasses: 0
      }
    })

  } catch (error) {
    console.error('Error creating instructor:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear instructor' },
      { status: 500 }
    )
  }
}

// PUT - Update instructor
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
        { success: false, error: 'ID del instructor es requerido' },
        { status: 400 }
      )
    }
    
    // Check if instructor exists and belongs to the user's club
    const existingInstructor = await prisma.classInstructor.findFirst({
      where: { 
        id: body.id,
        clubId: session.clubId 
      }
    })
    
    if (!existingInstructor) {
      return NextResponse.json(
        { success: false, error: 'Instructor no encontrado' },
        { status: 404 }
      )
    }
    
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.email !== undefined) updateData.email = body.email || null
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.bio !== undefined) updateData.bio = body.bio || null
    if (body.specialties !== undefined) updateData.specialties = body.specialties
    if (body.hourlyRate !== undefined) {
      updateData.hourlyRate = Math.round(body.hourlyRate * 100)
    }
    if (body.paymentType !== undefined) updateData.paymentType = body.paymentType
    if (body.monthlyRate !== undefined) {
      updateData.monthlyRate = Math.round(body.monthlyRate * 100)
    }
    if (body.active !== undefined) updateData.active = body.active
    
    const instructor = await prisma.classInstructor.update({
      where: { id: body.id },
      data: updateData,
      include: {
        _count: {
          select: {
            classes: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      instructor: {
        ...instructor,
        hourlyRate: instructor.hourlyRate / 100,
        monthlyRate: instructor.monthlyRate / 100,
        totalClasses: instructor._count.classes,
        upcomingClasses: 0
      }
    })

  } catch (error) {
    console.error('Error updating instructor:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar instructor' },
      { status: 500 }
    )
  }
}

// DELETE - Delete instructor
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
        { success: false, error: 'ID del instructor es requerido' },
        { status: 400 }
      )
    }
    
    // Check if instructor exists and belongs to the user's club
    const instructor = await prisma.classInstructor.findFirst({
      where: { 
        id,
        clubId: session.clubId 
      },
      include: {
        _count: {
          select: {
            classes: true
          }
        }
      }
    })
    
    if (!instructor) {
      return NextResponse.json(
        { success: false, error: 'Instructor no encontrado' },
        { status: 404 }
      )
    }
    
    // Don't delete if instructor has classes
    if (instructor._count.classes > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar un instructor con clases asignadas' },
        { status: 400 }
      )
    }
    
    await prisma.classInstructor.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Instructor eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting instructor:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar instructor' },
      { status: 500 }
    )
  }
}