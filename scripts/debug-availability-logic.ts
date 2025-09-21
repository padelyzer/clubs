import { prisma } from '../lib/config/prisma'
import { format, parse, addMinutes } from 'date-fns'
import { 
  getNowInTimezone, 
  getDayBoundariesInTimezone, 
  isTimeInPast 
} from '../lib/utils/timezone'

async function debugAvailabilityLogic() {
  try {
    console.log('🔍 Depurando lógica de disponibilidad...\n')
    
    const courtId = 'cmej0zrz40007r431rz6d79md' // Cancha 1
    const date = '2025-08-20'
    const duration = 90
    
    // Obtener configuración del club
    const club = await prisma.club.findFirst()
    if (!club) {
      console.log('❌ No se encontró club')
      return
    }
    
    const clubSettings = await prisma.clubSettings.findUnique({
      where: { clubId: club.id }
    })
    
    const timezone = clubSettings?.timezone || 'America/Mexico_City'
    
    console.log(`🏢 Club: ${club.name}`)
    console.log(`🌍 Timezone: ${timezone}`)
    console.log(`📅 Fecha: ${date}`)
    console.log(`🏸 Cancha ID: ${courtId}\n`)
    console.log('═'.repeat(80))
    
    // Obtener límites del día en la zona horaria del club
    const { start: startOfDay, end: endOfDay } = getDayBoundariesInTimezone(date, timezone)
    
    console.log(`\n📆 Límites del día en ${timezone}:`)
    console.log(`   Inicio: ${startOfDay.toISOString()}`)
    console.log(`   Fin: ${endOfDay.toISOString()}\n`)
    
    // Buscar reservas existentes
    const existingBookings = await prisma.booking.findMany({
      where: {
        clubId: club.id,
        courtId,
        date: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: {
          not: 'CANCELLED'
        }
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        playerName: true,
        date: true,
        status: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })
    
    console.log(`📚 Reservas existentes: ${existingBookings.length}`)
    
    if (existingBookings.length > 0) {
      console.log('\nDetalle de reservas:')
      existingBookings.forEach(b => {
        console.log(`   - ${b.playerName}: ${b.startTime} - ${b.endTime} (${b.status})`)
        console.log(`     Fecha en DB: ${b.date.toISOString()}`)
      })
    } else {
      console.log('   ✅ No hay reservas para esta cancha hoy')
    }
    
    // Generar slots de 17:00 a 21:00
    console.log('\n' + '═'.repeat(80))
    console.log('\n🕐 Analizando slots de 17:00 a 21:00:\n')
    
    const testSlots = [
      '17:00', '17:30', '18:00', '18:30',
      '19:00', '19:30', '20:00', '20:30'
    ]
    
    const bookingDate = new Date(date)
    const nowInClubTz = getNowInTimezone(timezone)
    const isToday = bookingDate.toDateString() === nowInClubTz.toDateString()
    
    console.log(`   Hora actual en ${timezone}: ${nowInClubTz.toLocaleString('es-MX')}`)
    console.log(`   ¿Es hoy?: ${isToday}\n`)
    
    testSlots.forEach(slotStart => {
      // Calcular endTime
      const [hour, minute] = slotStart.split(':').map(Number)
      const startDate = new Date(bookingDate)
      startDate.setHours(hour, minute, 0, 0)
      const endDate = addMinutes(startDate, duration)
      const slotEnd = format(endDate, 'HH:mm')
      
      // Verificar conflictos con reservas existentes
      const hasConflict = existingBookings.some(booking => {
        return (
          (slotStart >= booking.startTime && slotStart < booking.endTime) ||
          (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
          (slotStart <= booking.startTime && slotEnd >= booking.endTime)
        )
      })
      
      // Verificar si es horario pasado
      const isPast = isToday && isTimeInPast(slotStart, bookingDate, timezone, 15)
      
      let status = '✅ DISPONIBLE'
      let reason = ''
      
      if (hasConflict) {
        status = '❌ OCUPADO'
        const conflictingBooking = existingBookings.find(booking => {
          return (
            (slotStart >= booking.startTime && slotStart < booking.endTime) ||
            (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
            (slotStart <= booking.startTime && slotEnd >= booking.endTime)
          )
        })
        reason = ` (Conflicto con: ${conflictingBooking?.playerName})`
      } else if (isPast) {
        status = '⏰ PASADO'
        reason = ' (Horario ya pasó)'
      }
      
      console.log(`   ${slotStart} - ${slotEnd}: ${status}${reason}`)
      
      // Depuración adicional para slots problemáticos
      if (slotStart === '17:00' || slotStart === '18:00' || slotStart === '19:00' || slotStart === '20:00') {
        console.log(`      → isPast: ${isPast}`)
        console.log(`      → hasConflict: ${hasConflict}`)
        if (hasConflict) {
          console.log(`      → Conflictos encontrados:`)
          existingBookings.forEach(b => {
            const conflicts = (
              (slotStart >= b.startTime && slotStart < b.endTime) ||
              (slotEnd > b.startTime && slotEnd <= b.endTime) ||
              (slotStart <= b.startTime && slotEnd >= b.endTime)
            )
            if (conflicts) {
              console.log(`         - ${b.playerName}: ${b.startTime}-${b.endTime}`)
            }
          })
        }
      }
    })
    
    // Verificar si hay algo raro con las fechas
    console.log('\n' + '═'.repeat(80))
    console.log('\n🔎 Verificación adicional de fechas:\n')
    
    const allBookings = await prisma.booking.findMany({
      where: {
        courtId,
        status: {
          not: 'CANCELLED'
        }
      },
      select: {
        id: true,
        playerName: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 10
    })
    
    console.log('Últimas 10 reservas para esta cancha (cualquier fecha):')
    allBookings.forEach(b => {
      const dateStr = format(b.date, 'yyyy-MM-dd')
      const isTargetDate = dateStr === date
      const marker = isTargetDate ? ' ⚠️' : ''
      console.log(`   ${dateStr} ${b.startTime}-${b.endTime}: ${b.playerName} (${b.status})${marker}`)
    })
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

debugAvailabilityLogic()