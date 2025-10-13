import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// POST - Create new subscription plan
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin()
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.name || !data.displayName) {
      return NextResponse.json(
        { error: 'Name and display name are required' },
        { status: 400 }
      )
    }

    // Check if plan name already exists
    const existingPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: data.name }
    })

    if (existingPlan) {
      return NextResponse.json(
        { error: 'A plan with this name already exists' },
        { status: 400 }
      )
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: data.name.toLowerCase(),
        displayName: data.displayName,
        description: data.description || null,
        price: data.price || 0,
        currency: data.currency || 'MXN',
        interval: data.interval || 'month',
        features: data.features || {},
        maxClubs: data.maxClubs,
        maxUsers: data.maxUsers,
        maxCourts: data.maxCourts,
        maxBookings: data.maxBookings,
        commissionRate: data.commissionRate || 250,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder || 0
      }
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Error creating subscription plan:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription plan' },
      { status: 500 }
    )
  }
}

// GET - List all subscription plans
export async function GET() {
  try {
    await requireSuperAdmin()
    
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            clubSubscriptions: true
          }
        }
      }
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    )
  }
}