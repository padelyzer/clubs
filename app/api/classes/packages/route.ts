import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// GET - List packages
// Note: ClassPackage and PackagePurchase models don't exist in schema yet
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Return empty array for now - models don't exist yet
    return NextResponse.json({
      success: true,
      packages: []
    })

  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener paquetes' },
      { status: 500 }
    )
  }
}

// POST - Create package
// Note: ClassPackage model doesn't exist in schema yet
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthAPI()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Paquetes no implementados aún' },
      { status: 501 }
    )

  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear paquete' },
      { status: 500 }
    )
  }
}

// PUT - Update package
// Note: ClassPackage model doesn't exist in schema yet
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthAPI()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Paquetes no implementados aún' },
      { status: 501 }
    )

  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar paquete' },
      { status: 500 }
    )
  }
}