import { format } from 'date-fns'

async function testAvailabilityEndpoint() {
  try {
    const today = format(new Date(), 'yyyy-MM-dd')
    const courtId = 'cmej0zrz40007r431rz6d79md' // Cancha 1
    
    console.log('🔍 Probando endpoint de disponibilidad...\n')
    console.log(`📅 Fecha: ${today}`)
    console.log(`🏸 Cancha ID: ${courtId}\n`)
    
    // Simular el request que haría el frontend
    const params = new URLSearchParams({
      date: today,
      courtId: courtId,
      duration: '90'
    })
    
    console.log(`🌐 URL: /api/bookings/availability?${params.toString()}\n`)
    console.log('═'.repeat(80))
    
    // Hacer el request real usando el API interno
    const { prisma } = await import('../lib/config/prisma')
    
    // Obtener club ID
    const club = await prisma.club.findFirst()
    if (!club) {
      console.log('❌ No se encontró ningún club')
      return
    }
    
    console.log(`\n🏢 Club ID: ${club.id}`)
    console.log(`🏢 Club Name: ${club.name}\n`)
    
    // Verificar las reservas directamente
    const [year, month, day] = today.split('-').map(Number)
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)
    
    console.log('📊 Buscando reservas con estos parámetros:')
    console.log(`   - clubId: ${club.id}`)
    console.log(`   - courtId: ${courtId}`)
    console.log(`   - date: ${startOfDay} a ${endOfDay}`)
    console.log(`   - status: not CANCELLED\n`)
    
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
    
    console.log(`✅ Reservas encontradas: ${existingBookings.length}\n`)
    
    if (existingBookings.length > 0) {
      console.log('📋 Detalle de reservas:')
      existingBookings.forEach(booking => {
        console.log(`\n   📌 ${booking.playerName}`)
        console.log(`      Fecha: ${format(booking.date, 'yyyy-MM-dd')}`)
        console.log(`      Horario: ${booking.startTime} - ${booking.endTime}`)
        console.log(`      Estado: ${booking.status}`)
        console.log(`      ID: ${booking.id}`)
      })
    } else {
      console.log('   ✨ No hay reservas para esta cancha hoy')
    }
    
    // Generar slots y verificar conflictos
    console.log('\n' + '═'.repeat(80))
    console.log('\n🕐 Verificando slots de 17:00 a 21:00:\n')
    
    const testSlots = [
      '17:00', '17:30', '18:00', '18:30', 
      '19:00', '19:30', '20:00', '20:30'
    ]
    
    const now = new Date()
    const isToday = true // Asumiendo que estamos verificando hoy
    
    testSlots.forEach(startTime => {
      // Calcular endTime (90 minutos después)
      const [hour, minute] = startTime.split(':').map(Number)
      const endHour = Math.floor((hour * 60 + minute + 90) / 60)
      const endMinute = (hour * 60 + minute + 90) % 60
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
      
      // Check for conflicts
      const hasConflict = existingBookings.some(booking => {
        return (
          (startTime >= booking.startTime && startTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime) ||
          (startTime <= booking.startTime && endTime >= booking.endTime)
        )
      })
      
      // Check if in past
      const [slotHour, slotMinute] = startTime.split(':').map(Number)
      const slotDateTime = new Date(year, month - 1, day, slotHour, slotMinute, 0, 0)
      const isPast = slotDateTime < now
      
      console.log(`      Debug: slot ${startTime} = ${slotDateTime.toLocaleString('es-MX')}`)
      console.log(`      Debug: now = ${now.toLocaleString('es-MX')}`)
      console.log(`      Debug: isPast = ${isPast}`)
      
      let status = '✅ DISPONIBLE'
      let reason = ''
      
      if (hasConflict) {
        status = '❌ OCUPADO'
        const conflictingBooking = existingBookings.find(booking => {
          return (
            (startTime >= booking.startTime && startTime < booking.endTime) ||
            (endTime > booking.startTime && endTime <= booking.endTime) ||
            (startTime <= booking.startTime && endTime >= booking.endTime)
          )
        })
        reason = ` (Conflicto con: ${conflictingBooking?.playerName})`
      } else if (isPast) {
        status = '⏰ PASADO'
        reason = ' (Horario ya pasó)'
      }
      
      console.log(`   ${startTime}: ${status}${reason}`)
    })
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testAvailabilityEndpoint()