import { NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth/lucia'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    const { user, session } = await validateRequest()
    
    return NextResponse.json({
      authenticated: !!session,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      } : null,
      session: session ? {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt
      } : null,
      cookies: allCookies.map(c => ({
        name: c.name,
        value: c.value.substring(0, 20) + '...',
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite
      })),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        url: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}