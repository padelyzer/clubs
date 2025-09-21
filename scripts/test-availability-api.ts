import { format } from 'date-fns'

async function testAvailabilityAPI() {
  try {
    console.log('🔍 Probando API de disponibilidad directamente...\n')
    
    // Simular el request real
    const today = format(new Date(), 'yyyy-MM-dd')
    const courtId = 'cmej0zrz40007r431rz6d79md' // Cancha 1
    
    console.log(`📅 Fecha: ${today}`)
    console.log(`🏸 Cancha: Cancha 1 (${courtId})\n`)
    console.log('═'.repeat(80))
    
    // Hacer request al endpoint local
    const url = `http://localhost:3000/api/bookings/availability?date=${today}&courtId=${courtId}&duration=90`
    
    console.log(`\n🌐 Llamando: ${url}\n`)
    
    const response = await fetch(url, {
      headers: {
        // Simular autenticación con cookie de sesión
        'Cookie': 'auth_session=cmej0zry2000cr431a9l07g7p' // Session ID del sistema
      }
    })
    
    if (!response.ok) {
      console.error(`❌ Error HTTP: ${response.status} ${response.statusText}`)
      const text = await response.text()
      console.error('Response:', text)
      return
    }
    
    const data = await response.json()
    
    if (!data.success) {
      console.error('❌ Error en la respuesta:', data.error)
      return
    }
    
    console.log(`✅ Respuesta exitosa\n`)
    console.log(`📊 Resumen:`)
    console.log(`   - Total slots: ${data.summary.total}`)
    console.log(`   - Disponibles: ${data.summary.available}`)
    console.log(`   - Ocupados: ${data.summary.occupied}\n`)
    
    console.log('═'.repeat(80))
    console.log('\n🕐 Detalle de horarios (17:00 - 21:00):\n')
    
    // Filtrar y mostrar slots de 17:00 a 21:00
    const relevantSlots = data.slots.filter((slot: any) => {
      const hour = parseInt(slot.startTime.split(':')[0])
      return hour >= 17 && hour <= 21
    })
    
    relevantSlots.forEach((slot: any) => {
      const status = slot.available ? '✅ DISPONIBLE' : '❌ OCUPADO'
      let reason = ''
      
      if (!slot.available && slot.conflict) {
        if (slot.conflict.reason === 'past_time') {
          reason = ' (Horario pasado)'
        } else if (slot.conflict.playerName) {
          reason = ` (${slot.conflict.playerName})`
        } else {
          reason = ' (Conflicto desconocido)'
        }
      }
      
      console.log(`   ${slot.startTime} - ${slot.endTime}: ${status}${reason}`)
    })
    
    // Mostrar todos los conflictos encontrados
    console.log('\n' + '═'.repeat(80))
    console.log('\n⚠️  Conflictos detectados:\n')
    
    const conflicts = data.slots.filter((slot: any) => !slot.available && slot.conflict)
    
    if (conflicts.length === 0) {
      console.log('   No hay conflictos reales de reservas')
    } else {
      conflicts.forEach((slot: any) => {
        console.log(`\n   Slot: ${slot.startTime} - ${slot.endTime}`)
        console.log(`   Conflicto:`, JSON.stringify(slot.conflict, null, 2))
      })
    }
    
    // Verificar directamente en la base de datos
    console.log('\n' + '═'.repeat(80))
    console.log('\n🔎 Verificando directamente en la base de datos:\n')
    
    const { prisma } = await import('../lib/config/prisma')
    
    // Buscar reservas para esta cancha
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)
    
    const bookings = await prisma.booking.findMany({
      where: {
        courtId: courtId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: 'CANCELLED'
        }
      },
      select: {
        id: true,
        playerName: true,
        startTime: true,
        endTime: true,
        status: true,
        paymentStatus: true,
        date: true
      }
    })
    
    console.log(`📚 Reservas en DB para hoy: ${bookings.length}`)
    
    if (bookings.length > 0) {
      bookings.forEach(b => {
        console.log(`\n   ${b.playerName}:`)
        console.log(`      Fecha: ${format(b.date, 'yyyy-MM-dd')}`)
        console.log(`      Horario: ${b.startTime} - ${b.endTime}`)
        console.log(`      Estado: ${b.status}`)
      })
    } else {
      console.log('   ✅ No hay reservas para esta cancha hoy')
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testAvailabilityAPI()