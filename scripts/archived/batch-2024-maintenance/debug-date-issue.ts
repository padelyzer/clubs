import { prisma } from '../lib/config/prisma'

async function debugDateIssue() {
  try {
    console.log('🔍 Investigando problema de fechas...\n')
    
    // Obtener la reserva de María
    const mariaBooking = await prisma.booking.findFirst({
      where: {
        playerName: 'María González'
      }
    })
    
    if (mariaBooking) {
      console.log('📅 Reserva de María González:')
      console.log(`   ID: ${mariaBooking.id}`)
      console.log(`   Fecha en DB (raw): ${mariaBooking.date}`)
      console.log(`   Fecha ISO: ${mariaBooking.date.toISOString()}`)
      console.log(`   Fecha local: ${mariaBooking.date.toLocaleString('es-MX')}`)
      
      const date = mariaBooking.date
      console.log(`\n   Componentes de fecha:`)
      console.log(`   - Año: ${date.getFullYear()}`)
      console.log(`   - Mes: ${date.getMonth() + 1}`)
      console.log(`   - Día: ${date.getDate()}`)
      console.log(`   - Hora: ${date.getHours()}`)
      console.log(`   - Minutos: ${date.getMinutes()}`)
      
      // Crear fecha para comparación (21 de agosto)
      const targetDate = new Date(2025, 7, 21) // Mes 7 = Agosto (0-indexed)
      console.log(`\n📆 Fecha objetivo (21 agosto):`)
      console.log(`   ISO: ${targetDate.toISOString()}`)
      console.log(`   Local: ${targetDate.toLocaleString('es-MX')}`)
      
      // Buscar todas las reservas del 21 de agosto
      const startOfDay = new Date(2025, 7, 21, 0, 0, 0, 0)
      const endOfDay = new Date(2025, 7, 21, 23, 59, 59, 999)
      
      console.log(`\n🔍 Buscando reservas entre:`)
      console.log(`   Inicio: ${startOfDay.toISOString()}`)
      console.log(`   Fin: ${endOfDay.toISOString()}`)
      
      const bookingsOn21 = await prisma.booking.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })
      
      console.log(`\n📚 Reservas encontradas el 21 de agosto: ${bookingsOn21.length}`)
      bookingsOn21.forEach((b, i) => {
        console.log(`   ${i + 1}. ${b.playerName} - ${b.startTime} - ${b.date.toISOString()}`)
      })
      
      // Verificar qué fecha está usando el API
      console.log('\n🔧 Para el API de bookings, usar fecha:')
      const apiDateStr = '2025-08-21'
      console.log(`   String de fecha: ${apiDateStr}`)
      console.log(`   URL del API: /api/bookings?date=${apiDateStr}`)
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

debugDateIssue()