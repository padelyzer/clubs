import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// POST - Toggle subscription plan active status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await requireSuperAdmin()
    
    const planId = id

    // Check if plan exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      )
    }

    // Toggle the active status
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        isActive: !existingPlan.isActive
      }
    })

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
      message: `Plan ${updatedPlan.isActive ? 'activated' : 'deactivated'} successfully`
    })
  } catch (error) {
    console.error('Error toggling subscription plan:', error)
    return NextResponse.json(
      { error: 'Failed to toggle subscription plan status' },
      { status: 500 }
    )
  }
}