import { NextRequest, NextResponse } from 'next/server'
import { getApiSession } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  console.log('[Test Auth] Request received')
  
  try {
    // Log headers
    const authHeader = request.headers.get('authorization')
    console.log('[Test Auth] Auth header exists:', !!authHeader)
    console.log('[Test Auth] Auth header length:', authHeader?.length)
    
    // Try to get session
    const session = await getApiSession(request)
    console.log('[Test Auth] Session result:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role
    })
    
    if (!session) {
      return NextResponse.json({
        error: 'No session found'
      }, { status: 401 })
    }
    
    return NextResponse.json({
      success: true,
      user: session.user,
      message: `Authenticated as ${session.user.email} with role ${session.user.role}`
    })
    
  } catch (error: any) {
    console.error('[Test Auth] Error:', error)
    return NextResponse.json({
      error: error.message || 'Unknown error',
      details: error.stack?.split('\n').slice(0, 5)
    }, { status: 500 })
  }
}