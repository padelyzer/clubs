import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { requireAuthAPI } from '@/lib/auth/actions'

// GET - Obtener configuración de precios
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    // Obtener configuración desde ClubSettings
    const clubSettings = await prisma.clubSettings.findFirst({
      where: { clubId: session.clubId }
    })
    
    if (!clubSettings) {
      return NextResponse.json(
        { success: false, error: 'Configuración del club no encontrada' },
        { status: 404 }
      )
    }
    
    // Mapear los campos de ClubSettings al formato esperado
    const pricing = {
      clubId: session.clubId,
      groupPrice: clubSettings.groupClassPrice,
      privatePrice: clubSettings.privateClassPrice,
      semiPrivatePrice: clubSettings.semiPrivateClassPrice,
      defaultClassDuration: clubSettings.defaultClassDuration,
      defaultMaxStudents: clubSettings.defaultMaxStudents,
      defaultCourtCostPerHour: clubSettings.defaultCourtCostPerHour,
      allowOnlineClassBooking: clubSettings.allowOnlineClassBooking,
      requirePaymentUpfront: clubSettings.requirePaymentUpfront,
      classBookingAdvanceDays: clubSettings.classBookingAdvanceDays,
      classCancellationHours: clubSettings.classCancellationHours
    }
    
    return NextResponse.json({
      success: true,
      pricing
    })
    
  } catch (error) {
    console.error('Error fetching class pricing:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración de precios' },
      { status: 500 }
    )
  }
}

// POST - Actualizar configuración de precios
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    
    // Actualizar ClubSettings con los nuevos precios
    const clubSettings = await prisma.clubSettings.update({
      where: { clubId: session.clubId },
      data: {
        groupClassPrice: body.groupPrice || body.groupClassPrice,
        privateClassPrice: body.privatePrice || body.privateClassPrice, 
        semiPrivateClassPrice: body.semiPrivatePrice || body.semiPrivateClassPrice,
        defaultClassDuration: body.defaultClassDuration,
        defaultMaxStudents: body.defaultMaxStudents,
        defaultCourtCostPerHour: body.defaultCourtCostPerHour,
        allowOnlineClassBooking: body.allowOnlineClassBooking,
        requirePaymentUpfront: body.requirePaymentUpfront,
        classBookingAdvanceDays: body.classBookingAdvanceDays,
        classCancellationHours: body.classCancellationHours
      }
    })
    
    // Mapear la respuesta al formato esperado
    const pricing = {
      clubId: session.clubId,
      groupPrice: clubSettings.groupClassPrice,
      privatePrice: clubSettings.privateClassPrice,
      semiPrivatePrice: clubSettings.semiPrivateClassPrice,
      defaultClassDuration: clubSettings.defaultClassDuration,
      defaultMaxStudents: clubSettings.defaultMaxStudents,
      defaultCourtCostPerHour: clubSettings.defaultCourtCostPerHour,
      allowOnlineClassBooking: clubSettings.allowOnlineClassBooking,
      requirePaymentUpfront: clubSettings.requirePaymentUpfront,
      classBookingAdvanceDays: clubSettings.classBookingAdvanceDays,
      classCancellationHours: clubSettings.classCancellationHours
    }
    
    return NextResponse.json({
      success: true,
      pricing,
      message: 'Configuración de precios actualizada exitosamente'
    })
    
  } catch (error) {
    console.error('Error updating class pricing:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar configuración de precios' },
      { status: 500 }
    )
  }
}