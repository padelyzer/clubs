import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
    }
  }
})

async function checkClubAvailability() {
  console.log('🔍 Verificando disponibilidad del Club Demo Padelyzer...\n')
  
  try {
    // 1. Find club
    const club = await prisma.club.findFirst({
      where: { slug: 'club-demo-padelyzer' },
      include: {
        Court: true,
        ClubSettings: true,
        ScheduleRule: true
      }
    })
    
    if (!club) {
      console.log('❌ Club no encontrado')
      return
    }
    
    console.log('✅ Club encontrado:', club.name)
    console.log('   ID:', club.id)
    console.log('   Canchas:', club.Court.length)
    
    // 2. Check club settings
    console.log('\n📋 Configuración del club:')
    if (club.ClubSettings) {
      console.log('   Duración slot:', club.ClubSettings.slotDuration, 'minutos')
      console.log('   Buffer time:', club.ClubSettings.bufferTime, 'minutos')
      console.log('   Días anticipación:', club.ClubSettings.advanceBookingDays)
      console.log('   Reservas mismo día:', club.ClubSettings.allowSameDayBooking)
      console.log('   Timezone:', club.ClubSettings.timezone)
      console.log('   Horario operación:', club.ClubSettings.operatingHours)
    } else {
      console.log('   ❌ Sin configuración')
    }
    
    // 3. Check schedule rules
    console.log('\n⏰ Reglas de horario:')
    if (club.ScheduleRule.length > 0) {
      club.ScheduleRule.forEach(rule => {
        console.log(`   ${rule.name}:`)
        console.log(`     Día: ${rule.dayOfWeek}`)
        console.log(`     Horario: ${rule.startTime} - ${rule.endTime}`)
        console.log(`     Activo: ${rule.enabled}`)
      })
    } else {
      console.log('   ❌ Sin reglas de horario definidas')
    }
    
    // 4. Check courts
    console.log('\n🎾 Canchas:')
    club.Court.forEach(court => {
      console.log(`   ${court.name}:`)
      console.log(`     ID: ${court.id}`)
      console.log(`     Tipo: ${court.type}`)
      console.log(`     Activa: ${court.active ?? true}`)
    })
    
    // 5. Check today's bookings
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))
    
    console.log('\n📅 Reservas de hoy:')
    const bookings = await prisma.booking.findMany({
      where: {
        clubId: club.id,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['CONFIRMED', 'PENDING', 'CHECKED_IN']
        }
      },
      include: {
        court: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })
    
    if (bookings.length > 0) {
      bookings.forEach(booking => {
        console.log(`   ${booking.court.name}: ${booking.startTime} - ${booking.endTime}`)
        console.log(`     Estado: ${booking.status}`)
      })
    } else {
      console.log('   Sin reservas para hoy')
    }
    
    // 6. Check court schedules
    console.log('\n📊 Horarios de canchas:')
    const schedules = await prisma.schedule.findMany({
      where: { clubId: club.id }
    })
    
    if (schedules.length > 0) {
      schedules.forEach(schedule => {
        console.log(`   Cancha ID: ${schedule.courtId}`)
        console.log(`   Día: ${schedule.dayOfWeek}`)
        console.log(`   Horario: ${schedule.startTime} - ${schedule.endTime}`)
        console.log(`   Activo: ${schedule.enabled}`)
      })
    } else {
      console.log('   ❌ Sin horarios específicos por cancha')
    }
    
    // 7. Calculate available slots for today
    console.log('\n🕐 Calculando slots disponibles para hoy...')
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    console.log(`   Hora actual: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`)
    
    // Default operating hours if not configured
    const defaultStartHour = 7
    const defaultEndHour = 23
    const slotDuration = club.ClubSettings?.slotDuration || 90
    
    console.log(`   Horario operación: ${defaultStartHour}:00 - ${defaultEndHour}:00`)
    console.log(`   Duración slot: ${slotDuration} minutos`)
    
    // Calculate possible slots
    const possibleSlots = []
    for (let hour = defaultStartHour; hour < defaultEndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === defaultEndHour - 1 && minute + slotDuration > 60) {
          continue // Skip if slot would go past closing time
        }
        
        // Skip past slots
        if (hour < currentHour || (hour === currentHour && minute < currentMinute)) {
          continue
        }
        
        possibleSlots.push(`${hour}:${minute.toString().padStart(2, '0')}`)
      }
    }
    
    console.log(`\n   Total slots posibles desde ahora: ${possibleSlots.length}`)
    console.log('   Primeros 10 slots:', possibleSlots.slice(0, 10))
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkClubAvailability()