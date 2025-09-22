import { NextRequest, NextResponse } from 'next/server'
import { lucia } from '@/lib/auth/lucia'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ valid: false, error: 'No session ID provided' })
    }

    // Verificar sesión con Lucia
    const { session, user } = await lucia.validateSession(sessionId)

    if (session && user) {
      return NextResponse.json({
        valid: true,
        session: {
          id: session.id,
          userId: user.id,
          expiresAt: session.expiresAt
        },
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          clubId: user.clubId
        }
      })
    } else {
      return NextResponse.json({ valid: false, error: 'Invalid session' })
    }

  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json({ valid: false, error: 'Server error' })
  }
}