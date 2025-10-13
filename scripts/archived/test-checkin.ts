import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCheckIn() {
  console.log('\n✅ ESCENARIO 5: CHECK-IN Y ESTADOS')
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
      throw new Error('Se necesitan al menos 4 jugadores')
    }
    
    // Get court
    const court = await prisma.court.findFirst({
      where: { clubId: club.id }
    })
    
    if (!court) {
      throw new Error('No hay canchas disponibles')
    }
    
    // Test 5.1: Crear reservas para hoy
    console.log('\n5.1 Creando reservas para check-in (hoy)...')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Reserva 1: Pendiente de pago
    const pendingBooking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: court.id,
        date: today,
        startTime: '09:00',
        endTime: '10:00',
        playerName: players[0].name,
        playerPhone: players[0].phone,
        playerEmail: players[0].email,
        status: 'CONFIRMED',
        paymentStatus: 'pending',
        paymentType: 'ONSITE',
        price: 40000,
        type: 'REGULAR',
        duration: 60,
        totalPlayers: 2,
        checkedIn: false
      }
    })
    console.log(`  ✅ Reserva pendiente creada: ${pendingBooking.id}`)
    
    // Reserva 2: Pagada pero sin check-in
    const paidNoCheckin = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: court.id,
        date: today,
        startTime: '10:00',
        endTime: '11:00',
        playerName: players[1].name,
        playerPhone: players[1].phone,
        playerEmail: players[1].email,
        status: 'CONFIRMED',
        paymentStatus: 'completed',
        paymentType: 'ONLINE_FULL',
        price: 40000,
        type: 'REGULAR',
        duration: 60,
        totalPlayers: 2,
        checkedIn: false
      }
    })
    console.log(`  ✅ Reserva pagada sin check-in: ${paidNoCheckin.id}`)
    
    // Reserva 3: Con check-in completo
    const checkedInBooking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: court.id,
        date: today,
        startTime: '11:00',
        endTime: '12:00',
        playerName: players[2].name,
        playerPhone: players[2].phone,
        playerEmail: players[2].email,
        status: 'CONFIRMED',
        paymentStatus: 'completed',
        paymentType: 'ONSITE',
        price: 40000,
        type: 'REGULAR',
        duration: 60,
        totalPlayers: 2,
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: 'admin@test.com'
      }
    })
    console.log(`  ✅ Reserva con check-in completo: ${checkedInBooking.id}`)
    
    // Test 5.2: Simular proceso de check-in
    console.log('\n5.2 Procesando check-in de reserva pendiente...')
    console.log(`  📋 Reserva: ${pendingBooking.playerName}`)
    console.log(`  💰 Procesando pago en efectivo...`)
    
    const checkedIn1 = await prisma.booking.update({
      where: { id: pendingBooking.id },
      data: {
        paymentStatus: 'completed',
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: 'receptionist@test.com'
      }
    })
    
    console.log(`  ✅ Check-in completado:`)
    console.log(`     - Pago: ${checkedIn1.paymentStatus}`)
    console.log(`     - Check-in: ${checkedIn1.checkedIn ? 'Sí' : 'No'}`)
    console.log(`     - Por: ${checkedIn1.checkedInBy}`)
    
    // Test 5.3: Check-in de reserva ya pagada
    console.log('\n5.3 Check-in de reserva pre-pagada...')
    console.log(`  📋 Reserva: ${paidNoCheckin.playerName}`)
    console.log(`  💳 Ya pagado online`)
    
    const checkedIn2 = await prisma.booking.update({
      where: { id: paidNoCheckin.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: 'receptionist@test.com'
      }
    })
    
    console.log(`  ✅ Check-in registrado:`)
    console.log(`     - No requiere pago adicional`)
    console.log(`     - Check-in: ${checkedIn2.checkedIn ? 'Sí' : 'No'}`)
    
    // Test 5.4: Verificar estado de todas las reservas del día
    console.log('\n5.4 Estado de reservas del día...')
    const todayBookings = await prisma.booking.findMany({
      where: {
        clubId: club.id,
        date: today,
        status: 'CONFIRMED'
      },
      orderBy: {
        startTime: 'asc'
      }
    })
    
    console.log(`  📊 Resumen del día:`)
    todayBookings.forEach(booking => {
      const checkInStatus = booking.checkedIn ? '✅' : '⏳'
      const paymentStatus = booking.paymentStatus === 'completed' ? '💵' : '❌'
      console.log(`     ${checkInStatus} ${paymentStatus} ${booking.startTime} - ${booking.playerName}`)
    })
    
    // Test 5.5: Estadísticas de check-in
    console.log('\n5.5 Estadísticas de check-in...')
    const checkedInCount = todayBookings.filter(b => b.checkedIn).length
    const paidCount = todayBookings.filter(b => b.paymentStatus === 'completed').length
    const totalRevenue = todayBookings
      .filter(b => b.paymentStatus === 'completed')
      .reduce((sum, b) => sum + b.price, 0)
    
    console.log(`  📈 Métricas:`)
    console.log(`     - Check-ins realizados: ${checkedInCount}/${todayBookings.length}`)
    console.log(`     - Pagos completados: ${paidCount}/${todayBookings.length}`)
    console.log(`     - Ingresos del día: $${totalRevenue / 100} MXN`)
    
    // Test 5.6: Simular no-show (no se presentó)
    console.log('\n5.6 Creando reserva no-show...')
    const noShowBooking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: court.id,
        date: new Date('2025-08-24'), // Ayer
        startTime: '15:00',
        endTime: '16:00',
        playerName: players[3].name,
        playerPhone: players[3].phone,
        playerEmail: players[3].email,
        status: 'CONFIRMED',
        paymentStatus: 'pending',
        paymentType: 'ONSITE',
        price: 40000,
        type: 'REGULAR',
        duration: 60,
        totalPlayers: 2,
        checkedIn: false
      }
    })
    
    // Marcar como no-show
    const markedNoShow = await prisma.booking.update({
      where: { id: noShowBooking.id },
      data: {
        status: 'NO_SHOW',
        notes: 'Cliente no se presentó'
      }
    })
    
    console.log(`  ✅ Reserva marcada como no-show:`)
    console.log(`     - Cliente: ${markedNoShow.playerName}`)
    console.log(`     - Estado: ${markedNoShow.status}`)
    console.log(`     - Notas: ${markedNoShow.notes}`)
    
    // Test 5.7: Reporte de ocupación
    console.log('\n5.7 Reporte de ocupación del día...')
    const totalHours = 12 // 8am a 8pm
    const occupiedHours = todayBookings.reduce((sum, b) => sum + b.duration / 60, 0)
    const occupancyRate = (occupiedHours / totalHours) * 100
    
    console.log(`  📊 Ocupación:`)
    console.log(`     - Horas disponibles: ${totalHours}`)
    console.log(`     - Horas ocupadas: ${occupiedHours}`)
    console.log(`     - Tasa de ocupación: ${occupancyRate.toFixed(1)}%`)
    
    console.log('\n✅ PRUEBAS DE CHECK-IN COMPLETADAS')
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error)
    throw error
  }
}

testCheckIn()
  .catch(console.error)
  .finally(() => prisma.$disconnect())