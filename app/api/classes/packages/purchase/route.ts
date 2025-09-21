import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { addDays } from 'date-fns'

// POST - Purchase a package
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
      packageId,
      studentName,
      studentEmail,
      studentPhone,
      paymentMethod = 'onsite'
    } = data
    
    if (!packageId || !studentName || !studentPhone) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }
    
    // Get package details and verify it belongs to the user's club
    const classPackage = await prisma.classPackage.findFirst({
      where: { 
        id: packageId,
        clubId: session.clubId 
      }
    })
    
    if (!classPackage) {
      return NextResponse.json(
        { success: false, error: 'Paquete no encontrado' },
        { status: 404 }
      )
    }
    
    // Create purchase
    const purchase = await prisma.packagePurchase.create({
      data: {
        packageId,
        studentId: studentPhone, // Using phone as ID for simplicity
        studentName,
        studentEmail,
        studentPhone,
        purchaseDate: new Date(),
        expirationDate: addDays(new Date(), classPackage.validityDays),
        classesUsed: 0,
        classesRemaining: classPackage.classCount,
        status: 'active',
        paymentStatus: paymentMethod === 'online' ? 'completed' : 'pending',
        paidAmount: classPackage.price,
        notes: `Paquete de ${classPackage.classCount} clases`
      },
      include: {
        package: true
      }
    })
    
    return NextResponse.json({
      success: true,
      purchase,
      message: `Paquete comprado: ${classPackage.classCount} clases disponibles`
    })
    
  } catch (error) {
    console.error('Error purchasing package:', error)
    return NextResponse.json(
      { success: false, error: 'Error al comprar paquete' },
      { status: 500 }
    )
  }
}

// GET - Get student's active packages
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
    const studentPhone = searchParams.get('studentPhone')
    const status = searchParams.get('status') || 'active'
    
    if (!studentPhone) {
      return NextResponse.json(
        { success: false, error: 'Teléfono del estudiante requerido' },
        { status: 400 }
      )
    }
    
    const purchases = await prisma.packagePurchase.findMany({
      where: {
        studentPhone,
        status,
        package: {
          clubId: session.clubId
        }
      },
      include: {
        package: true
      },
      orderBy: { purchaseDate: 'desc' }
    })
    
    // Check and update expired packages
    const now = new Date()
    const updatedPurchases = await Promise.all(purchases.map(async (purchase) => {
      if (purchase.status === 'active' && purchase.expirationDate < now) {
        // Update to expired
        return await prisma.packagePurchase.update({
          where: { id: purchase.id },
          data: { status: 'expired' },
          include: { Package: true }
        })
      }
      return purchase
    }))
    
    return NextResponse.json({
      success: true,
      purchases: updatedPurchases
    })
    
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener compras' },
      { status: 500 }
    )
  }
}

// PUT - Use a class from package
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
    const { purchaseId, classId, action = 'use' } = data
    
    if (!purchaseId) {
      return NextResponse.json(
        { success: false, error: 'ID de compra requerido' },
        { status: 400 }
      )
    }
    
    const purchase = await prisma.packagePurchase.findFirst({
      where: { 
        id: purchaseId,
        package: {
          clubId: session.clubId
        }
      },
      include: { package: true }
    })
    
    if (!purchase) {
      return NextResponse.json(
        { success: false, error: 'Compra no encontrada' },
        { status: 404 }
      )
    }
    
    if (action === 'use') {
      // Use a class from the package
      if (purchase.classesRemaining <= 0) {
        return NextResponse.json(
          { success: false, error: 'No quedan clases disponibles en el paquete' },
          { status: 400 }
        )
      }
      
      if (purchase.status !== 'active') {
        return NextResponse.json(
          { success: false, error: `Paquete ${purchase.status}` },
          { status: 400 }
        )
      }
      
      // Update package usage
      const updatedPurchase = await prisma.packagePurchase.update({
        where: { id: purchaseId },
        data: {
          classesUsed: purchase.classesUsed + 1,
          classesRemaining: purchase.classesRemaining - 1,
          status: purchase.classesRemaining === 1 ? 'completed' : 'active'
        },
        include: { Package: true }
      })
      
      return NextResponse.json({
        success: true,
        purchase: updatedPurchase,
        message: `Clase aplicada. Quedan ${updatedPurchase.classesRemaining} clases`
      })
      
    } else if (action === 'return') {
      // Return a class to the package (in case of cancellation)
      const updatedPurchase = await prisma.packagePurchase.update({
        where: { id: purchaseId },
        data: {
          classesUsed: Math.max(0, purchase.classesUsed - 1),
          classesRemaining: Math.min(purchase.package.classCount, purchase.classesRemaining + 1),
          status: purchase.classesRemaining === 0 ? 'active' : purchase.status
        },
        include: { Package: true }
      })
      
      return NextResponse.json({
        success: true,
        purchase: updatedPurchase,
        message: `Clase devuelta. Quedan ${updatedPurchase.classesRemaining} clases`
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Acción inválida' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Error updating package usage:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar uso del paquete' },
      { status: 500 }
    )
  }
}