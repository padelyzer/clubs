import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

/**
 * Endpoint para crear el paquete demo directamente en producción
 * TODO: Solo usar para setup inicial, eliminar después
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[SETUP-PACKAGE] Creating demo package in production...')
    
    // Verificar autenticación (opcional para setup)
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No autorizado para setup'
        },
        { status: 401 }
      )
    }

    // 1. Crear o encontrar paquete 'Todo Incluido'
    let packageRecord = await prisma.saasPackage.findFirst({
      where: { name: 'todo-incluido' }
    })
    
    if (!packageRecord) {
      packageRecord = await prisma.saasPackage.create({
        data: {
          name: 'todo-incluido',
          displayName: 'Todo Incluido - Demo',
          description: 'Paquete completo con todos los módulos habilitados para testing',
          isActive: true,
          isDefault: true,
          basePrice: 0, // Gratis para demo
          currency: 'MXN',
          sortOrder: 1
        }
      })
      console.log('[SETUP-PACKAGE] Package created:', packageRecord.name)
    } else {
      console.log('[SETUP-PACKAGE] Package exists:', packageRecord.name)
    }
    
    // 2. Obtener todos los módulos disponibles
    const modules = await prisma.saasModule.findMany({
      where: { isActive: true }
    })
    
    console.log('[SETUP-PACKAGE] Available modules:', modules.map(m => m.code))
    
    // 3. Asociar el paquete al club demo
    const clubPackage = await prisma.clubPackage.upsert({
      where: { clubId: 'club-demo-001' },
      update: {
        packageId: packageRecord.id,
        isActive: true,
        notes: 'Paquete demo creado via API en producción'
      },
      create: {
        clubId: 'club-demo-001',
        packageId: packageRecord.id,
        isActive: true,
        notes: 'Paquete demo creado via API en producción'
      }
    })
    
    console.log('[SETUP-PACKAGE] Club package created/updated:', clubPackage.id)
    
    // 4. Verificar resultado
    const result = await prisma.club.findFirst({
      where: { id: 'club-demo-001' },
      include: {
        clubPackage: {
          include: { package: true }
        },
        clubModules: {
          include: { module: true }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Paquete demo configurado exitosamente',
      data: {
        package: {
          id: packageRecord.id,
          name: packageRecord.name,
          displayName: packageRecord.displayName,
          isActive: packageRecord.isActive
        },
        clubPackage: {
          id: clubPackage.id,
          isActive: clubPackage.isActive,
          notes: clubPackage.notes
        },
        clubModules: result?.clubModules?.map(cm => ({
          code: cm.module.code,
          enabled: cm.isEnabled
        }))
      }
    })

  } catch (error) {
    console.error('[SETUP-PACKAGE] Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error creando paquete',
        details: error?.message || 'Error desconocido'
      },
      { status: 500 }
    )
  }
}