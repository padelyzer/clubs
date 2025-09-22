import { NextRequest, NextResponse } from 'next/server'
import { verifyFallbackToken, getFallbackTokenFromHeader } from '@/lib/auth/fallback-auth'

export async function GET(request: NextRequest) {
  try {
    const token = getFallbackTokenFromHeader(request)
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      )
    }

    const session = await verifyFallbackToken(token)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      session
    })

  } catch (error) {
    console.error('Verify fallback error:', error)
    return NextResponse.json(
      { success: false, error: 'Error verifying token' },
      { status: 500 }
    )
  }
}