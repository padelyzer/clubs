import { NextRequest, NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    if (!session?.clubId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const dayOfWeek = searchParams.get('dayOfWeek') // 0=Sunday, 1=Monday, etc.

    // Buscar horarios del club
    const schedules = await prisma.schedule.findMany({
      where: {
        clubId: session.clubId,
        ...(dayOfWeek && { dayOfWeek: parseInt(dayOfWeek) })
      },
      orderBy: {
        dayOfWeek: 'asc'
      }
    })

    if (schedules.length === 0) {
      // Si no hay horarios configurados, usar horarios por defecto
      const defaultSchedule = {
        dayOfWeek: dayOfWeek ? parseInt(dayOfWeek) : 0,
        openTime: '08:00',
        closeTime: '22:00'
      }
      
      return NextResponse.json({
        success: true,
        schedules: [defaultSchedule],
        timeSlots: generateTimeSlots(defaultSchedule.openTime, defaultSchedule.closeTime)
      })
    }

    // Si se pidió un día específico, devolver solo ese
    if (dayOfWeek) {
      const daySchedule = schedules.find(s => s.dayOfWeek === parseInt(dayOfWeek))
      if (daySchedule) {
        return NextResponse.json({
          success: true,
          schedule: daySchedule,
          timeSlots: generateTimeSlots(daySchedule.openTime, daySchedule.closeTime)
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'No hay horario configurado para este día'
        }, { status: 404 })
      }
    }

    // Devolver todos los horarios con slots generados
    const schedulesWithSlots = schedules.map(schedule => ({
      ...schedule,
      timeSlots: generateTimeSlots(schedule.openTime, schedule.closeTime)
    }))

    return NextResponse.json({
      success: true,
      schedules: schedulesWithSlots
    })

  } catch (error) {
    console.error('Error fetching club schedule:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al obtener horarios' 
      },
      { status: 500 }
    )
  }
}

// Función auxiliar para generar slots de tiempo
function generateTimeSlots(openTime: string, closeTime: string): string[] {
  const slots: string[] = []
  
  // Parsear hora de apertura y cierre
  const [openHour, openMinute] = openTime.split(':').map(Number)
  const [closeHour, closeMinute] = closeTime.split(':').map(Number)
  
  // Crear fecha base para cálculos
  const startDate = new Date()
  startDate.setHours(openHour, openMinute, 0, 0)
  
  const endDate = new Date()
  endDate.setHours(closeHour, closeMinute, 0, 0)
  
  // Generar slots cada 30 minutos
  const current = new Date(startDate)
  
  while (current < endDate) {
    const hours = current.getHours().toString().padStart(2, '0')
    const minutes = current.getMinutes().toString().padStart(2, '0')
    slots.push(`${hours}:${minutes}`)
    
    // Avanzar 30 minutos
    current.setMinutes(current.getMinutes() + 30)
  }
  
  return slots
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await requireAuthAPI()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    if (!session?.clubId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { schedules } = body

    if (!schedules || !Array.isArray(schedules)) {
      return NextResponse.json(
        { success: false, error: 'Datos de horarios inválidos' },
        { status: 400 }
      )
    }

    // Eliminar horarios existentes del club
    await prisma.schedule.deleteMany({
      where: { clubId: session.clubId }
    })

    // Crear nuevos horarios
    const createdSchedules = await prisma.schedule.createMany({
      data: schedules.map(schedule => ({
        clubId: session.clubId,
        dayOfWeek: schedule.dayOfWeek,
        openTime: schedule.openTime,
        closeTime: schedule.closeTime,
        isOpen: schedule.isOpen
      }))
    })

    // Recuperar los horarios creados
    const newSchedules = await prisma.schedule.findMany({
      where: { clubId: session.clubId },
      orderBy: { dayOfWeek: 'asc' }
    })

    return NextResponse.json({
      success: true,
      schedules: newSchedules,
      message: 'Horarios actualizados exitosamente'
    })

  } catch (error) {
    console.error('Error saving club schedules:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al guardar horarios' 
      },
      { status: 500 }
    )
  }
}