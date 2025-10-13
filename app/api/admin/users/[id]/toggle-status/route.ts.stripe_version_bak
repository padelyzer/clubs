import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id } = paramData
    
    const session = await requireSuperAdmin()
    
    const user = await prisma.user.findUnique({
      where: { id: id }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }
    
    // No permitir desactivar super admins
    if (user.role === 'SUPER_ADMIN' && user.active) {
      return NextResponse.json(
        { error: 'No se puede desactivar un super administrador' },
        { status: 400 }
      )
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        active: !user.active
      }
    })
    
    // Si se desactiva, cancelar reservas futuras del usuario
    if (!updatedUser.active) {
      await prisma.booking.updateMany({
        where: {
          playerEmail: user.email,
          date: { gte: new Date() },
          status: { in: ['PENDING', 'CONFIRMED'] }
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      user: updatedUser
    })
    
  } catch (error) {
    console.error('Error toggling user status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}