import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit'
import { auditSuccess, auditFailure } from '@/lib/security/audit'
import { handleApiError } from '@/lib/errors/api-error'
import { getAvailablePackages } from '@/lib/saas/packages'

// GET /api/admin/packages - Obtener todos los paquetes
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await requireSuperAdmin()
    
    // 2. Rate limiting
    const rateLimitResult = await rateLimit(request, 'admin')
    if (!rateLimitResult.success) {
      return createRateLimitResponse()
    }
    
    // 3. Obtener paquetes con estadísticas
    const packages = await getAvailablePackages()
    
    // 4. Audit log
    await auditSuccess(
      request,
      'admin.packages.list',
      'package',
      'all',
      { count: packages.length },
      session?.userId
    )
    
    return NextResponse.json({
      success: true,
      packages
    })
    
  } catch (error) {
    await auditFailure(
      request,
      'admin.packages.list',
      'package',
      'all',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return handleApiError(error)
  }
}

// POST /api/admin/packages - Crear nuevo paquete
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await requireSuperAdmin()
    
    // 2. Rate limiting
    const rateLimitResult = await rateLimit(request, 'admin')
    if (!rateLimitResult.success) {
      return createRateLimitResponse()
    }
    
    // 3. Parse body
    const body = await request.json()
    const {
      name,
      displayName,
      description,
      basePrice,
      currency = 'MXN',
      maxCourts,
      maxUsers,
      maxBookingsMonth,
      isDefault = false,
      isActive = true,
      sortOrder,
      modules = []
    } = body
    
    // 4. Validaciones
    if (!name || !displayName) {
      return NextResponse.json(
        { error: 'Name and displayName are required' },
        { status: 400 }
      )
    }
    
    // Verificar que el nombre no exista
    const existingPackage = await prisma.saasPackage.findUnique({
      where: { name }
    })
    
    if (existingPackage) {
      return NextResponse.json(
        { error: 'Package name already exists' },
        { status: 400 }
      )
    }
    
    // 5. Crear paquete en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Si este paquete será por defecto, quitar el flag de otros
      if (isDefault) {
        await tx.saasPackage.updateMany({
          where: { isDefault: true },
          data: { isDefault: false }
        })
      }
      
      // Crear el paquete
      const newPackage = await tx.saasPackage.create({
        data: {
          name,
          displayName,
          description,
          basePrice: basePrice || 0,
          currency,
          maxCourts,
          maxUsers,
          maxBookingsMonth,
          isDefault,
          isActive,
          sortOrder: sortOrder || await tx.saasPackage.count() + 1
        }
      })
      
      // Agregar módulos al paquete
      if (modules.length > 0) {
        await tx.packageModule.createMany({
          data: modules.map((module: any) => ({
            packageId: newPackage.id,
            moduleId: module.moduleId,
            isIncluded: module.isIncluded || false,
            isOptional: module.isOptional || false,
            priceOverride: module.priceOverride || null
          }))
        })
      }
      
      return newPackage
    })
    
    // 6. Audit log
    await auditSuccess(
      request,
      'admin.package.create',
      'package',
      result.id,
      { name, displayName },
      session?.userId
    )
    
    return NextResponse.json({
      success: true,
      package: result,
      message: 'Package created successfully'
    })
    
  } catch (error) {
    await auditFailure(
      request,
      'admin.package.create',
      'package',
      'new',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return handleApiError(error)
  }
}