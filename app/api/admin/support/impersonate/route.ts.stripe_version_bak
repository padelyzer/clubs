import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/actions'

/**
 * NOTA: La funcionalidad de impersonación ha sido deshabilitada temporalmente
 * porque no es compatible con Lucia Auth de forma directa.
 * 
 * Para implementar impersonación con Lucia Auth se necesitaría:
 * 1. Crear un sistema de sesiones secundarias
 * 2. Almacenar metadata adicional en la sesión
 * 3. Implementar lógica de auditoría
 * 
 * Si esta funcionalidad es crítica, considerar:
 * - Usar un sistema de roles y permisos más granular
 * - Implementar un sistema de "vista como" sin cambiar la sesión
 * - Crear un sistema de logs de acceso para auditoría
 */

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin()
    
    return NextResponse.json(
      { 
        error: 'Funcionalidad de impersonación temporalmente deshabilitada',
        message: 'Esta característica necesita ser reimplementada para Lucia Auth'
      },
      { status: 501 } // Not Implemented
    )
    
  } catch (error) {
    console.error('Error in impersonate route:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para terminar impersonación (placeholder)
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Funcionalidad de impersonación temporalmente deshabilitada',
      message: 'Esta característica necesita ser reimplementada para Lucia Auth'
    },
    { status: 501 }
  )
}