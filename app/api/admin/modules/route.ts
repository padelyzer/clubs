import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/actions'
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit'
import { auditSuccess, auditFailure } from '@/lib/security/audit'
import { handleApiError } from '@/lib/errors/api-error'
import { prisma } from '@/lib/config/prisma'

// GET /api/admin/modules - Obtener todos los módulos disponibles
export async function GET(request: NextRequest) {
  try {
    const session = await requireSuperAdmin()
    
    const rateLimitResult = await rateLimit(request, 'admin')
    if (!rateLimitResult.success) {
      return createRateLimitResponse()
    }
    
    const modules = await prisma.saasModule.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })
    
    await auditSuccess(
      request,
      'admin.modules.list',
      'saas_module',
      null,
      null,
      session?.user?.id
    )
    
    return NextResponse.json({
      success: true,
      modules
    })
    
  } catch (error) {
    await auditFailure(
      request,
      'admin.modules.list',
      'saas_module',
      null,
      error instanceof Error ? error.message : 'Unknown error'
    )
    return handleApiError(error)
  }
}