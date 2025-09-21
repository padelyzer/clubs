import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { getPendingTransfers } from '@/lib/payments/commission-system'
import { prisma } from '@/lib/config/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Get user and club information using session
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { Club: true }
    })

    if (!user || !user.club || user.club.id !== session.clubId) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      )
    }

    const pendingTransfers = await getPendingTransfers(session.clubId)

    return NextResponse.json({
      success: true,
      clubId: user.club.id,
      ...pendingTransfers,
    })

  } catch (error) {
    console.error('Error getting pending transfers:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}