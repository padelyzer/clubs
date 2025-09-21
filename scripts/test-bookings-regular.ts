import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testRegularBookings() {
  console.log('\n📋 ESCENARIO 1: RESERVAS REGULARES')
  console.log('=' .repeat(50))
  
  try {
    // Get club and players
    const club = await prisma.club.findFirst()
    if (!club) throw new Error('No club found')
    
    const players = await prisma.player.findMany({
      where: { clubId: club.id },
      take: 4
    })
    
    if (players.length < 4) {
      throw new Error('Se necesitan al menos 4 jugadores para las pruebas')
    }
    
    // Get courts
    const courts = await prisma.court.findMany({
      where: { clubId: club.id }
    })
    
    if (courts.length === 0) {
      throw new Error('No hay canchas disponibles')
    }
    
    // Test 1.1: Reserva simple (1 jugador)
    console.log('\n1.1 Creando reserva simple (1 jugador)...')
    const simpleBooking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: courts[0].id,
        date: new Date('2025-08-26'),
        startTime: '10:00',
        endTime: '11:00',
        playerName: players[0].name,
        playerPhone: players[0].phone,
        playerEmail: players[0].email,
        status: 'CONFIRMED',
        paymentStatus: 'pending',
        paymentType: 'ONSITE',
        price: 40000,
        type: 'REGULAR',
        duration: 60,
        totalPlayers: 1
      }
    })
    console.log(`  ✅ Reserva creada: ${simpleBooking.id}`)
    console.log(`     - Jugador: ${players[0].name}`)
    console.log(`     - Cancha: ${courts[0].name}`)
    console.log(`     - Horario: 10:00 - 11:00`)
    console.log(`     - Precio: $${simpleBooking.price / 100} MXN`)
    
    // Test 1.2: Reserva con invitados (4 jugadores)
    console.log('\n1.2 Creando reserva con invitados (4 jugadores)...')
    const groupBooking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: courts[1].id,
        date: new Date('2025-08-26'),
        startTime: '11:00',
        endTime: '12:00',
        playerName: players[1].name,
        playerPhone: players[1].phone,
        playerEmail: players[1].email,
        status: 'CONFIRMED',
        paymentStatus: 'pending',
        paymentType: 'ONSITE',
        price: 40000,
        type: 'REGULAR',
        duration: 60,
        totalPlayers: 4
      }
    })
    console.log(`  ✅ Reserva grupal creada: ${groupBooking.id}`)
    console.log(`     - Organizador: ${players[1].name}`)
    console.log(`     - Invitados: 3`)
    console.log(`     - Total jugadores: 4`)
    
    // Test 1.3: Reserva con horario extendido (2 horas)
    console.log('\n1.3 Creando reserva de 2 horas...')
    const extendedBooking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: courts[2].id,
        date: new Date('2025-08-26'),
        startTime: '14:00',
        endTime: '16:00',
        playerName: players[0].name,
        playerPhone: players[0].phone,
        playerEmail: players[0].email,
        status: 'CONFIRMED',
        paymentStatus: 'pending',
        paymentType: 'ONLINE_FULL',
        price: 80000, // 2 hours
        type: 'REGULAR',
        duration: 120,
        totalPlayers: 2
      }
    })
    console.log(`  ✅ Reserva extendida creada: ${extendedBooking.id}`)
    console.log(`     - Duración: 2 horas`)
    console.log(`     - Precio: $${extendedBooking.price / 100} MXN`)
    
    // Test 1.4: Verificar disponibilidad
    console.log('\n1.4 Verificando disponibilidad de canchas...')
    const bookings = await prisma.booking.findMany({
      where: {
        clubId: club.id,
        date: new Date('2025-08-26'),
        status: 'CONFIRMED'
      },
      include: {
        court: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })
    
    console.log(`  📊 Total de reservas para 26/08: ${bookings.length}`)
    bookings.forEach(b => {
      console.log(`     - ${b.court.name}: ${b.startTime} - ${b.endTime} (${b.playerName})`)
    })
    
    // Test 1.5: Calcular ingresos del día
    const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0)
    console.log(`\n  💰 Ingresos proyectados: $${totalRevenue / 100} MXN`)
    
    console.log('\n✅ PRUEBAS DE RESERVAS REGULARES COMPLETADAS')
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error)
    throw error
  }
}

testRegularBookings()
  .catch(console.error)
  .finally(() => prisma.$disconnect())