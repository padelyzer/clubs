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
    
    const club = await prisma.club.findUnique({
      where: { id: id }
    })
    
    if (!club) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      )
    }
    
    if (club.status !== 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Solo se pueden reactivar clubes suspendidos' },
        { status: 400 }
      )
    }
    
    const updatedClub = await prisma.club.update({
      where: { id: id },
      data: {
        status: 'APPROVED',
        active: true
      }
    })
    
    // TODO: Enviar notificación al club de reactivación
    
    return NextResponse.json({
      success: true,
      club: updatedClub
    })
    
  } catch (error) {
    console.error('Error reactivating club:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}