import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

/**
 * Endpoint temporal para verificar que el fix de paquetes funciona
 * TODO: Eliminar cuando el deploy principal funcione
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[TEST-FIX] Testing package-based access...')
    
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No autorizado',
          test: 'session-check-failed'
        },
        { status: 401 }
      )
    }

    console.log('[TEST-FIX] Session:', {
      userId: session.userId,
      clubId: session.clubId,
      role: session.role
    })

    if (!session.clubId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Club no encontrado',
          test: 'no-club-id'
        },
        { status: 400 }
      )
    }

    // Verificar módulo habilitado
    const clubModule = await prisma.clubModule.findFirst({
      where: {
        clubId: session.clubId,
        module: { 
          code: {
            in: ['tournaments', 'TOURNAMENTS']
          }
        }
      },
      include: {
        module: true
      }
    })

    if (!clubModule || !clubModule.isEnabled) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Módulo no habilitado',
          test: 'module-not-enabled'
        },
        { status: 402 }
      )
    }

    // Verificar paquete activo
    const clubPackage = await prisma.clubPackage.findFirst({
      where: {
        clubId: session.clubId,
        isActive: true
      },
      include: {
        package: true
      }
    })

    console.log('[TEST-FIX] Package check:', {
      hasPackage: !!clubPackage,
      packageName: clubPackage?.package?.name,
      packageActive: clubPackage?.package?.isActive
    })

    if (!clubPackage || !clubPackage.package.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No hay paquete activo',
          test: 'no-active-package',
          debug: {
            hasPackage: !!clubPackage,
            packageName: clubPackage?.package?.name,
            packageActive: clubPackage?.package?.isActive
          }
        },
        { status: 402 }
      )
    }

    // Si llegamos aquí, todo está bien. Obtener torneos.
    const tournaments = await prisma.tournament.findMany({
      where: {
        clubId: session.clubId
      },
      include: {
        _count: {
          select: {
            TournamentRegistration: true,
            TournamentMatch: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json({
      success: true,
      tournaments,
      test: 'package-access-success',
      debug: {
        clubId: session.clubId,
        moduleCode: clubModule.module.code,
        packageName: clubPackage.package.displayName,
        tournamentsCount: tournaments.length
      }
    })

  } catch (error) {
    console.error('[TEST-FIX] Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno',
        test: 'exception-caught',
        debug: {
          errorType: (error as any)?.constructor?.name || 'Unknown',
          errorMessage: (error as Error)?.message || 'Error desconocido'
        }
      },
      { status: 500 }
    )
  }
}