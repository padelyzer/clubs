import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

// GET - List packages
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    
    const where: any = {
      clubId: session.clubId
    }
    if (active === 'true') where.active = true
    
    const packages = await prisma.classPackage.findMany({
      where,
      include: {
        _count: {
          select: {
            purchases: true
          }
        }
      },
      orderBy: { classCount: 'asc' }
    })
    
    // Add statistics for each package
    const packagesWithStats = await Promise.all(packages.map(async (pkg) => {
      const activePurchases = await prisma.packagePurchase.count({
        where: {
          packageId: pkg.id,
          status: 'active'
        }
      })
      
      const totalRevenue = await prisma.packagePurchase.aggregate({
        where: {
          packageId: pkg.id,
          paymentStatus: 'completed'
        },
        _sum: { paidAmount: true }
      })
      
      // Calculate savings vs individual classes
      const pricePerClass = pkg.price / pkg.classCount
      const regularPrice = 30000 // $300 MXN default group class price
      const savings = (regularPrice * pkg.classCount) - pkg.price
      const savingsPercent = Math.round((savings / (regularPrice * pkg.classCount)) * 100)
      
      return {
        ...pkg,
        activePurchases,
        totalPurchases: pkg._count.purchases,
        totalRevenue: totalRevenue._sum.paidAmount || 0,
        pricePerClass,
        savings,
        savingsPercent
      }
    }))
    
    return NextResponse.json({
      success: true,
      packages: packagesWithStats
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
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const data = await request.json()
    const {
      name,
      description,
      classCount,
      price,
      validityDays = 30,
      classTypes = ['GROUP', 'CLINIC']
    } = data
    
    if (!name || !classCount || !price) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }
    
    const classPackage = await prisma.classPackage.create({
      data: {
        clubId: session.clubId,
        name,
        description,
        classCount,
        price,
        validityDays,
        classTypes,
        active: true
      }
    })
    
    return NextResponse.json({
      success: true,
      package: classPackage
    })
    
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear paquete' },
      { status: 500 }
    )
  }
}

// PUT - Update package
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const data = await request.json()
    const { id, ...updateData } = data
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de paquete requerido' },
        { status: 400 }
      )
    }
    
    // Verify package belongs to user's club
    const existingPackage = await prisma.classPackage.findFirst({
      where: { 
        id,
        clubId: session.clubId 
      }
    })
    
    if (!existingPackage) {
      return NextResponse.json(
        { success: false, error: 'Paquete no encontrado' },
        { status: 404 }
      )
    }
    
    // Check if there are active purchases before allowing price changes
    if (updateData.price || updateData.classCount) {
      const activeCount = await prisma.packagePurchase.count({
        where: {
          packageId: id,
          status: 'active'
        }
      })
      
      if (activeCount > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'No se puede modificar un paquete con compras activas',
            activePurchases: activeCount
          },
          { status: 400 }
        )
      }
    }
    
    const updatedPackage = await prisma.classPackage.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json({
      success: true,
      package: updatedPackage
    })
    
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar paquete' },
      { status: 500 }
    )
  }
}