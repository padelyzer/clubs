import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await requireSuperAdmin()
    const { reason } = await request.json()
    
    const club = await prisma.club.findUnique({
      where: { id: id }
    })
    
    if (!club) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      )
    }
    
    if (club.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Solo se pueden rechazar clubes pendientes' },
        { status: 400 }
      )
    }
    
    const updatedClub = await prisma.club.update({
      where: { id: id },
      data: {
        status: 'REJECTED',
        active: false,
        approvedBy: session.userId
      }
    })
    
    // TODO: Enviar notificación al club de rechazo con razón
    
    return NextResponse.json({
      success: true,
      club: updatedClub
    })
    
  } catch (error) {
    console.error('Error rejecting club:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}