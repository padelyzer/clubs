import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/actions'
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit'
import { auditSuccess, auditFailure } from '@/lib/security/audit'
import { handleApiError } from '@/lib/errors/api-error'
import { prisma } from '@/lib/config/prisma'

// GET /api/admin/packages/[id] - Obtener un paquete específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id } = paramData
    
    const session = await requireSuperAdmin()
    
    const rateLimitResult = await rateLimit(request, 'admin')
    if (!rateLimitResult.success) {
      return createRateLimitResponse()
    }
    
    const packageData = await prisma.saasPackage.findUnique({
      where: { id: id },
      include: {
        modules: {
          include: {
            module: true
          }
        },
        _count: {
          select: {
            clubPackages: true
          }
        }
      }
    })
    
    if (!packageData) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }
    
    await auditSuccess(
      request,
      'admin.package.view',
      'saas_package',
      id,
      null,
      session?.user?.id
    )
    
    return NextResponse.json({
      success: true,
      package: packageData
    })
    
  } catch (error) {
    await auditFailure(
      request,
      'admin.package.view',
      'saas_package',
      id,
      error instanceof Error ? error.message : 'Unknown error'
    )
    return handleApiError(error)
  }
}

// PUT /api/admin/packages/[id] - Actualizar un paquete
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id } = paramData
    
    const session = await requireSuperAdmin()
    
    const rateLimitResult = await rateLimit(request, 'admin')
    if (!rateLimitResult.success) {
      return createRateLimitResponse()
    }
    
    const body = await request.json()
    const { 
      displayName, 
      description, 
      basePrice, 
      maxCourts, 
      maxUsers, 
      maxBookingsMonth,
      isActive,
      modules 
    } = body
    
    // Usar transacción para actualizar paquete y módulos
    const updatedPackage = await prisma.$transaction(async (tx) => {
      // Actualizar información del paquete
      const pkg = await tx.saasPackage.update({
        where: { id: id },
        data: {
          displayName,
          description,
          basePrice: parseInt(basePrice),
          maxCourts: maxCourts ? parseInt(maxCourts) : null,
          maxUsers: maxUsers ? parseInt(maxUsers) : null,
          maxBookingsMonth: maxBookingsMonth ? parseInt(maxBookingsMonth) : null,
          isActive
        }
      })
      
      // Si se proporcionan módulos, actualizar relaciones
      if (modules && Array.isArray(modules)) {
        // Eliminar relaciones existentes
        await tx.packageModule.deleteMany({
          where: { packageId: id }
        })
        
        // Crear nuevas relaciones
        for (const module of modules) {
          await tx.packageModule.create({
            data: {
              packageId: id,
              moduleId: module.moduleId,
              isIncluded: module.isIncluded,
              isOptional: module.isOptional,
              priceOverride: module.priceOverride ? parseInt(module.priceOverride) : null
            }
          })
        }
      }
      
      // Obtener el paquete actualizado con relaciones
      return await tx.saasPackage.findUnique({
        where: { id: id },
        include: {
          modules: {
            include: {
              module: true
            }
          },
          _count: {
            select: {
              clubPackages: true
            }
          }
        }
      })
    })
    
    await auditSuccess(
      request,
      'admin.package.update',
      'saas_package',
      id,
      body,
      session?.user?.id
    )
    
    return NextResponse.json({
      success: true,
      package: updatedPackage,
      message: 'Paquete actualizado exitosamente'
    })
    
  } catch (error) {
    await auditFailure(
      request,
      'admin.package.update',
      'saas_package',
      id,
      error instanceof Error ? error.message : 'Unknown error'
    )
    return handleApiError(error)
  }
}

// DELETE /api/admin/packages/[id] - Eliminar un paquete (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramData = await params
    const { id } = paramData
    
    const session = await requireSuperAdmin()
    
    const rateLimitResult = await rateLimit(request, 'admin')
    if (!rateLimitResult.success) {
      return createRateLimitResponse()
    }
    
    // Verificar si el paquete tiene clubs asignados
    const clubsCount = await prisma.clubPackage.count({
      where: { 
        packageId: id,
        isActive: true 
      }
    })
    
    if (clubsCount > 0) {
      return NextResponse.json(
        { error: `Este paquete está asignado a ${clubsCount} club(es) activos y no puede ser eliminado` },
        { status: 400 }
      )
    }
    
    // Soft delete: solo desactivar
    await prisma.saasPackage.update({
      where: { id: id },
      data: { isActive: false }
    })
    
    await auditSuccess(
      request,
      'admin.package.delete',
      'saas_package',
      id,
      null,
      session?.user?.id
    )
    
    return NextResponse.json({
      success: true,
      message: 'Paquete desactivado exitosamente'
    })
    
  } catch (error) {
    await auditFailure(
      request,
      'admin.package.delete',
      'saas_package',
      id,
      error instanceof Error ? error.message : 'Unknown error'
    )
    return handleApiError(error)
  }
}