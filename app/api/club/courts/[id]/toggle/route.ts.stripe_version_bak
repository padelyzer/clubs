import { NextRequest, NextResponse } from 'next/server'
import { requireClubStaff } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// PATCH - Toggle estado activo/inactivo de cancha
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    
    const session = await requireClubStaff()
    const body = await request.json()
    const { id } = params
    const { active } = body

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

    // Actualizar estado
    const updatedCourt = await prisma.court.update({
      where: { id },
      data: { active }
    })

    return NextResponse.json({
      success: true,
      court: updatedCourt
    })
  } catch (error) {
    console.error('Error toggling court status:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el estado de la cancha' },
      { status: 500 }
    )
  }
}