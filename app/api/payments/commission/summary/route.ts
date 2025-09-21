import { NextRequest, NextResponse } from 'next/server'
import { getClubCommissionSummary } from '@/lib/payments/commission-system'
import { prisma } from '@/lib/config/prisma'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Get user and club information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { Club: true }
    })

    if (!user || !user.club) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    let dateRange
    if (fromParam && toParam) {
      dateRange = {
        from: new Date(fromParam),
        to: new Date(toParam),
      }
    }

    const summary = await getClubCommissionSummary(user.club.id, dateRange)

    return NextResponse.json({
      success: true,
      clubId: user.club.id,
      clubName: user.club.name,
      summary,
      dateRange,
    })

  } catch (error) {
    console.error('Error getting commission summary:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}