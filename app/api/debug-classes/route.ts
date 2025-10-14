import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    steps: []
  }

  try {
    // Step 1: Check auth
    diagnostics.steps.push({ step: 'auth_start', status: 'attempting' })
    const session = await requireAuthAPI()
    
    if (!session) {
      diagnostics.steps.push({ step: 'auth', status: 'failed', error: 'No session' })
      return NextResponse.json({ success: false, diagnostics }, { status: 401 })
    }
    
    diagnostics.steps.push({ 
      step: 'auth', 
      status: 'success',
      session: {
        userId: session.userId,
        clubId: session.clubId,
        role: session.role
      }
    })

    // Step 2: Check database connection
    diagnostics.steps.push({ step: 'db_connection', status: 'attempting' })
    await prisma.$queryRaw`SELECT 1`
    diagnostics.steps.push({ step: 'db_connection', status: 'success' })

    // Step 3: Try to query classes
    diagnostics.steps.push({ step: 'query_classes', status: 'attempting' })
    const classes = await prisma.class.findMany({
      where: { clubId: session.clubId },
      take: 1
    })
    diagnostics.steps.push({ 
      step: 'query_classes', 
      status: 'success',
      count: classes.length
    })

    // Step 4: Try with includes
    diagnostics.steps.push({ step: 'query_with_includes', status: 'attempting' })
    const classesWithIncludes = await prisma.class.findMany({
      where: { clubId: session.clubId },
      include: {
        Instructor: true,
        Court: true,
        ClassBooking: true,
        _count: {
          select: {
            ClassBooking: true
          }
        }
      },
      take: 1
    })
    diagnostics.steps.push({ 
      step: 'query_with_includes', 
      status: 'success',
      count: classesWithIncludes.length
    })

    return NextResponse.json({
      success: true,
      message: 'All diagnostics passed',
      diagnostics
    })

  } catch (error) {
    diagnostics.steps.push({
      step: 'error',
      status: 'failed',
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      }
    })

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      diagnostics
    }, { status: 500 })
  }
}
