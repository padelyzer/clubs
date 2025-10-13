import { NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

export async function GET() {
  try {
    // Intentar una query simple
    const userCount = await prisma.user.count()

    // Verificar el usuario demo
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@padelyzer.com' },
      select: {
        id: true,
        email: true,
        role: true,
        active: true
      }
    })

    return NextResponse.json({
      success: true,
      database: 'connected',
      userCount,
      demoUser: demoUser ? 'exists' : 'not found',
      demoUserDetails: demoUser,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 })
  }
}