import { NextRequest, NextResponse } from 'next/server'
import { requireClubStaff } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// PATCH - Actualizar cancha
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    
    const session = await requireClubStaff()
    const body = await request.json()
    const { id } = params

    // Verificar que la cancha pertenece al club
    const court = await prisma.court.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!court) {
      return NextResponse.json(
        { error: 'Cancha no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar cancha
    const updatedCourt = await prisma.court.update({
      where: { id },
      data: {
        name: body.name || undefined,
        description: body.description,
        courtType: body.courtType || undefined,
        surface: body.surface || undefined,
        isIndoor: body.isIndoor !== undefined ? body.isIndoor : undefined,
        hasLighting: body.hasLighting !== undefined ? body.hasLighting : undefined,
        basePrice: body.basePrice || undefined,
        peakPrice: body.peakPrice,
        maxPlayers: body.maxPlayers || undefined,
        active: body.active !== undefined ? body.active : undefined
      }
    })

    return NextResponse.json({
      success: true,
      court: updatedCourt
    })
  } catch (error) {
    console.error('Error updating court:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la cancha' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar cancha
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    
    const session = await requireClubStaff()
    const { id } = params

    // Verificar que la cancha pertenece al club
    const court = await prisma.court.findFirst({
      where: {
        id,
        clubId: session.clubId
      }
    })

    if (!court) {
      return NextResponse.json(
        { error: 'Cancha no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si hay reservas activas
    const activeBookings = await prisma.booking.count({
      where: {
        courtId: id,
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        date: {
          gte: new Date()
        }
      }
    })

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la cancha porque tiene reservas activas' },
        { status: 400 }
      )
    }

    // Eliminar cancha
    await prisma.court.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Cancha eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error deleting court:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la cancha' },
      { status: 500 }
    )
  }
}