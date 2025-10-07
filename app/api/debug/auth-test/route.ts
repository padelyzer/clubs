import { NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'

export async function GET() {
  try {
    console.log('Testing auth...')
    
    const session = await requireAuthAPI()
    console.log('Auth test result:', session)
    
    return NextResponse.json({ 
      success: true, 
      hasSession: !!session,
      session: session ? {
        userId: session.userId,
        userEmail: session.userEmail,
        role: session.role,
        clubId: session.clubId,
        active: session.active
      } : null
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Auth test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}