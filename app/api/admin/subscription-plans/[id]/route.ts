import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// PUT - Update subscription plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await requireSuperAdmin()
    
    const data = await request.json()
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

    // If name is being changed, check for conflicts
    if (data.name && data.name !== existingPlan.name) {
      const conflictingPlan = await prisma.subscriptionPlan.findFirst({
        where: { 
          name: data.name,
          id: { not: planId }
        }
      })

      if (conflictingPlan) {
        return NextResponse.json(
          { error: 'A plan with this name already exists' },
          { status: 400 }
        )
      }
    }

    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        name: data.name ? data.name.toLowerCase() : existingPlan.name,
        displayName: data.displayName || existingPlan.displayName,
        description: data.description !== undefined ? data.description : existingPlan.description,
        price: data.price !== undefined ? data.price : existingPlan.price,
        currency: data.currency || existingPlan.currency,
        interval: data.interval || existingPlan.interval,
        features: data.features || existingPlan.features,
        maxClubs: data.maxClubs !== undefined ? data.maxClubs : existingPlan.maxClubs,
        maxUsers: data.maxUsers !== undefined ? data.maxUsers : existingPlan.maxUsers,
        maxCourts: data.maxCourts !== undefined ? data.maxCourts : existingPlan.maxCourts,
        maxBookings: data.maxBookings !== undefined ? data.maxBookings : existingPlan.maxBookings,
        commissionRate: data.commissionRate !== undefined ? data.commissionRate : existingPlan.commissionRate,
        isActive: data.isActive !== undefined ? data.isActive : existingPlan.isActive,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : existingPlan.sortOrder,
      }
    })

    return NextResponse.json(updatedPlan)
  } catch (error) {
    console.error('Error updating subscription plan:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription plan' },
      { status: 500 }
    )
  }
}

// DELETE - Delete subscription plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await requireSuperAdmin()
    
    const planId = id

    // Check if plan exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: {
        _count: {
          select: {
            clubSubscriptions: true
          }
        }
      }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      )
    }

    // Check if plan has active subscriptions
    if (existingPlan._count.clubSubscriptions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete plan with active subscriptions. Deactivate it instead.' },
        { status: 400 }
      )
    }

    await prisma.subscriptionPlan.delete({
      where: { id: planId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subscription plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscription plan' },
      { status: 500 }
    )
  }
}