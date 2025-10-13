import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPlayersHistory() {
  console.log('\n📚 PRUEBAS DE HISTORIAL - MÓDULO DE CLIENTES')
  console.log('=' .repeat(50))
  
  try {
    // Get club
    const club = await prisma.club.findFirst()
    if (!club) throw new Error('No club found')
    
    // Get test players
    const players = await prisma.player.findMany({
      where: { 
        clubId: club.id,
        active: true
      },
      take: 5
    })
    
    if (players.length < 3) {
      throw new Error('Se necesitan al menos 3 clientes para las pruebas')
    }
    
    // Get courts
    const courts = await prisma.court.findMany({
      where: { clubId: club.id }
    })
    
    // Test 1: Crear historial de reservas para clientes
    console.log('\n📅 TEST 1: CREAR HISTORIAL DE RESERVAS')
    console.log('-'.repeat(30))
    
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    // Cliente 1: Cliente frecuente
    const frequentPlayer = players[0]
    console.log(`\n  👤 Cliente: ${frequentPlayer.name}`)
    
    const frequentBookings = [
      {
        date: lastMonth,
        startTime: '10:00',
        endTime: '11:00',
        status: 'COMPLETED' as const,
        paymentStatus: 'completed' as const,
        price: 40000
      },
      {
        date: lastWeek,
        startTime: '15:00',
        endTime: '16:00',
        status: 'COMPLETED' as const,
        paymentStatus: 'completed' as const,
        price: 40000
      },
      {
        date: yesterday,
        startTime: '09:00',
        endTime: '10:00',
        status: 'COMPLETED' as const,
        paymentStatus: 'completed' as const,
        price: 40000
      },
      {
        date: today,
        startTime: '18:00',
        endTime: '19:00',
        status: 'CONFIRMED' as const,
        paymentStatus: 'pending' as const,
        price: 40000
      }
    ]
    
    for (const booking of frequentBookings) {
      await prisma.booking.create({
        data: {
          clubId: club.id,
          courtId: courts[0].id,
          playerName: frequentPlayer.name,
          playerPhone: frequentPlayer.phone,
          playerEmail: frequentPlayer.email,
          type: 'REGULAR',
          duration: 60,
          totalPlayers: 2,
          paymentType: 'ONSITE',
          ...booking
        }
      })
    }
    console.log(`     ✅ ${frequentBookings.length} reservas creadas`)
    
    // Cliente 2: Cliente ocasional
    const occasionalPlayer = players[1]
    console.log(`\n  👤 Cliente: ${occasionalPlayer.name}`)
    
    const occasionalBookings = [
      {
        date: lastMonth,
        startTime: '14:00',
        endTime: '15:00',
        status: 'COMPLETED' as const,
        paymentStatus: 'completed' as const,
        price: 40000
      },
      {
        date: new Date(),
        startTime: '20:00',
        endTime: '21:00',
        status: 'CONFIRMED' as const,
        paymentStatus: 'pending' as const,
        price: 40000
      }
    ]
    
    for (const booking of occasionalBookings) {
      await prisma.booking.create({
        data: {
          clubId: club.id,
          courtId: courts[1].id,
          playerName: occasionalPlayer.name,
          playerPhone: occasionalPlayer.phone,
          playerEmail: occasionalPlayer.email,
          type: 'REGULAR',
          duration: 60,
          totalPlayers: 4,
          paymentType: 'ONSITE',
          ...booking
        }
      })
    }
    console.log(`     ✅ ${occasionalBookings.length} reservas creadas`)
    
    // Cliente 3: Cliente con cancelaciones
    const cancellingPlayer = players[2]
    console.log(`\n  👤 Cliente: ${cancellingPlayer.name}`)
    
    const cancelledBookings = [
      {
        date: lastWeek,
        startTime: '11:00',
        endTime: '12:00',
        status: 'CANCELLED' as const,
        paymentStatus: 'cancelled' as const,
        price: 40000,
        cancelledAt: lastWeek
      },
      {
        date: yesterday,
        startTime: '16:00',
        endTime: '17:00',
        status: 'NO_SHOW' as const,
        paymentStatus: 'pending' as const,
        price: 40000
      },
      {
        date: today,
        startTime: '19:00',
        endTime: '20:00',
        status: 'CONFIRMED' as const,
        paymentStatus: 'pending' as const,
        price: 40000
      }
    ]
    
    for (const booking of cancelledBookings) {
      await prisma.booking.create({
        data: {
          clubId: club.id,
          courtId: courts[2].id,
          playerName: cancellingPlayer.name,
          playerPhone: cancellingPlayer.phone,
          playerEmail: cancellingPlayer.email,
          type: 'REGULAR',
          duration: 60,
          totalPlayers: 2,
          paymentType: 'ONSITE',
          ...booking
        }
      })
    }
    console.log(`     ✅ ${cancelledBookings.length} reservas creadas (incluye canceladas)`)
    
    // Test 2: Consultar historial de reservas
    console.log('\n📊 TEST 2: CONSULTAR HISTORIAL DE RESERVAS')
    console.log('-'.repeat(30))
    
    for (const player of [frequentPlayer, occasionalPlayer, cancellingPlayer]) {
      console.log(`\n  👤 Historial de: ${player.name}`)
      
      const bookings = await prisma.booking.findMany({
        where: {
          clubId: club.id,
          playerPhone: player.phone
        },
        orderBy: {
          date: 'desc'
        }
      })
      
      console.log(`     📅 Total de reservas: ${bookings.length}`)
      
      const completed = bookings.filter(b => b.status === 'COMPLETED').length
      const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length
      const cancelled = bookings.filter(b => b.status === 'CANCELLED').length
      const noShow = bookings.filter(b => b.status === 'NO_SHOW').length
      
      console.log(`     ✅ Completadas: ${completed}`)
      console.log(`     📍 Confirmadas: ${confirmed}`)
      console.log(`     ❌ Canceladas: ${cancelled}`)
      console.log(`     ⚠️ No-show: ${noShow}`)
      
      // Calcular gastos totales
      const totalSpent = bookings
        .filter(b => b.paymentStatus === 'completed')
        .reduce((sum, b) => sum + b.price, 0)
      
      console.log(`     💰 Total gastado: $${totalSpent / 100} MXN`)
    }
    
    // Test 3: Análisis de comportamiento
    console.log('\n📈 TEST 3: ANÁLISIS DE COMPORTAMIENTO')
    console.log('-'.repeat(30))
    
    // Cliente más frecuente
    const playerBookingCounts = await prisma.booking.groupBy({
      by: ['playerPhone', 'playerName'],
      where: {
        clubId: club.id,
        status: { in: ['COMPLETED', 'CONFIRMED'] }
      },
      _count: true,
      orderBy: {
        _count: {
          playerPhone: 'desc'
        }
      },
      take: 5
    })
    
    console.log('\n  🏆 Top 5 clientes más frecuentes:')
    playerBookingCounts.forEach((player, index) => {
      console.log(`     ${index + 1}. ${player.playerName}: ${player._count} reservas`)
    })
    
    // Horarios preferidos
    const timePreferences = await prisma.booking.groupBy({
      by: ['startTime'],
      where: {
        clubId: club.id,
        status: { in: ['COMPLETED', 'CONFIRMED'] }
      },
      _count: true,
      orderBy: {
        _count: {
          startTime: 'desc'
        }
      },
      take: 5
    })
    
    console.log('\n  ⏰ Horarios más populares:')
    timePreferences.forEach((time, index) => {
      console.log(`     ${index + 1}. ${time.startTime}: ${time._count} reservas`)
    })
    
    // Test 4: Métricas de retención
    console.log('\n🔄 TEST 4: MÉTRICAS DE RETENCIÓN')
    console.log('-'.repeat(30))
    
    // Clientes que reservaron en el último mes
    const activeLastMonth = await prisma.booking.findMany({
      where: {
        clubId: club.id,
        date: { gte: lastMonth },
        status: { in: ['COMPLETED', 'CONFIRMED'] }
      },
      select: {
        playerPhone: true,
        playerName: true
      },
      distinct: ['playerPhone']
    })
    
    console.log(`  📅 Clientes activos último mes: ${activeLastMonth.length}`)
    
    // Clientes que reservaron la última semana
    const activeLastWeek = await prisma.booking.findMany({
      where: {
        clubId: club.id,
        date: { gte: lastWeek },
        status: { in: ['COMPLETED', 'CONFIRMED'] }
      },
      select: {
        playerPhone: true,
        playerName: true
      },
      distinct: ['playerPhone']
    })
    
    console.log(`  📅 Clientes activos última semana: ${activeLastWeek.length}`)
    
    // Tasa de cancelación
    const totalBookings = await prisma.booking.count({
      where: { clubId: club.id }
    })
    
    const cancelledCount = await prisma.booking.count({
      where: {
        clubId: club.id,
        status: { in: ['CANCELLED', 'NO_SHOW'] }
      }
    })
    
    const cancellationRate = totalBookings > 0 
      ? ((cancelledCount / totalBookings) * 100).toFixed(1)
      : 0
    
    console.log(`  ❌ Tasa de cancelación: ${cancellationRate}%`)
    
    // Test 5: Valor del cliente (Customer Lifetime Value)
    console.log('\n💎 TEST 5: VALOR DEL CLIENTE')
    console.log('-'.repeat(30))
    
    for (const player of players.slice(0, 3)) {
      const playerBookings = await prisma.booking.findMany({
        where: {
          clubId: club.id,
          playerPhone: player.phone,
          paymentStatus: 'completed'
        }
      })
      
      const totalRevenue = playerBookings.reduce((sum, b) => sum + b.price, 0)
      const bookingCount = playerBookings.length
      const avgBookingValue = bookingCount > 0 ? totalRevenue / bookingCount : 0
      
      // Calcular primera y última reserva
      const sortedBookings = playerBookings.sort((a, b) => 
        a.date.getTime() - b.date.getTime()
      )
      
      const firstBooking = sortedBookings[0]
      const lastBooking = sortedBookings[sortedBookings.length - 1]
      
      let customerAge = 0
      if (firstBooking && lastBooking) {
        const daysDiff = Math.floor(
          (lastBooking.date.getTime() - firstBooking.date.getTime()) / 
          (1000 * 60 * 60 * 24)
        )
        customerAge = daysDiff
      }
      
      console.log(`\n  👤 ${player.name}:`)
      console.log(`     💰 Valor total: $${totalRevenue / 100} MXN`)
      console.log(`     📊 Reservas completadas: ${bookingCount}`)
      console.log(`     💵 Ticket promedio: $${Math.round(avgBookingValue / 100)} MXN`)
      console.log(`     📅 Antigüedad: ${customerAge} días`)
    }
    
    // Test 6: Patrones de reserva
    console.log('\n🔍 TEST 6: PATRONES DE RESERVA')
    console.log('-'.repeat(30))
    
    // Días más populares
    const bookingsByDay = await prisma.$queryRaw`
      SELECT 
        EXTRACT(DOW FROM date) as day_of_week,
        COUNT(*) as count
      FROM "Booking"
      WHERE "clubId" = ${club.id}
        AND status IN ('COMPLETED', 'CONFIRMED')
      GROUP BY day_of_week
      ORDER BY count DESC
    ` as any[]
    
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    
    console.log('\n  📅 Días más populares:')
    bookingsByDay.forEach(day => {
      console.log(`     ${dayNames[day.day_of_week]}: ${day.count} reservas`)
    })
    
    // Duración promedio de reservas
    const durationStats = await prisma.booking.aggregate({
      where: {
        clubId: club.id,
        status: { in: ['COMPLETED', 'CONFIRMED'] }
      },
      _avg: {
        duration: true
      },
      _min: {
        duration: true
      },
      _max: {
        duration: true
      }
    })
    
    console.log('\n  ⏱️ Duración de reservas:')
    console.log(`     Promedio: ${durationStats._avg.duration} minutos`)
    console.log(`     Mínima: ${durationStats._min.duration} minutos`)
    console.log(`     Máxima: ${durationStats._max.duration} minutos`)
    
    console.log('\n✅ PRUEBAS DE HISTORIAL COMPLETADAS')
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error)
    throw error
  }
}

testPlayersHistory()
  .catch(console.error)
  .finally(() => prisma.$disconnect())