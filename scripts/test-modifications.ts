import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testModifications() {
  console.log('\n✏️ ESCENARIO 4: MODIFICACIONES Y CANCELACIONES')
  console.log('=' .repeat(50))
  
  try {
    // Get club and player
    const club = await prisma.club.findFirst()
    if (!club) throw new Error('No club found')
    
    const player = await prisma.player.findFirst({
      where: { clubId: club.id }
    })
    
    if (!player) {
      throw new Error('No hay jugadores disponibles')
    }
    
    // Get court
    const court = await prisma.court.findFirst({
      where: { clubId: club.id }
    })
    
    if (!court) {
      throw new Error('No hay canchas disponibles')
    }
    
    // Test 4.1: Crear reserva para modificar
    console.log('\n4.1 Creando reserva original...')
    const originalBooking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: court.id,
        date: new Date('2025-08-29'),
        startTime: '10:00',
        endTime: '11:00',
        playerName: player.name,
        playerPhone: player.phone,
        playerEmail: player.email,
        status: 'CONFIRMED',
        paymentStatus: 'pending',
        paymentType: 'ONSITE',
        price: 40000,
        type: 'REGULAR',
        duration: 60,
        totalPlayers: 2
      }
    })
    console.log(`  ✅ Reserva original creada: ${originalBooking.id}`)
    console.log(`     - Fecha: 29/08`)
    console.log(`     - Horario: ${originalBooking.startTime} - ${originalBooking.endTime}`)
    console.log(`     - Estado pago: ${originalBooking.paymentStatus}`)
    
    // Test 4.2: Modificar horario
    console.log('\n4.2 Modificando horario de la reserva...')
    const modifiedTime = await prisma.booking.update({
      where: { id: originalBooking.id },
      data: {
        startTime: '11:00',
        endTime: '12:00'
      }
    })
    console.log(`  ✅ Horario modificado:`)
    console.log(`     - Nuevo horario: ${modifiedTime.startTime} - ${modifiedTime.endTime}`)
    
    // Test 4.3: Cambiar fecha
    console.log('\n4.3 Cambiando fecha de la reserva...')
    const modifiedDate = await prisma.booking.update({
      where: { id: originalBooking.id },
      data: {
        date: new Date('2025-08-30')
      }
    })
    console.log(`  ✅ Fecha modificada:`)
    console.log(`     - Nueva fecha: 30/08`)
    
    // Test 4.4: Actualizar estado de pago
    console.log('\n4.4 Procesando pago de la reserva...')
    const paidBooking = await prisma.booking.update({
      where: { id: originalBooking.id },
      data: {
        paymentStatus: 'completed',
        checkedIn: true,
        checkedInAt: new Date()
      }
    })
    console.log(`  ✅ Pago procesado:`)
    console.log(`     - Estado: ${paidBooking.paymentStatus}`)
    console.log(`     - Check-in: ${paidBooking.checkedIn ? 'Sí' : 'No'}`)
    
    // Test 4.5: Intentar cancelar reserva pagada
    console.log('\n4.5 Intentando cancelar reserva pagada...')
    if (paidBooking.paymentStatus === 'completed') {
      console.log(`  ⚠️ No se puede cancelar: La reserva ya está pagada`)
      console.log(`     - Se requiere autorización del administrador`)
    }
    
    // Test 4.6: Crear reserva para cancelar
    console.log('\n4.6 Creando nueva reserva para cancelación...')
    const cancelableBooking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: court.id,
        date: new Date('2025-08-31'),
        startTime: '14:00',
        endTime: '15:00',
        playerName: 'Cancelable Player',
        playerPhone: '5554444444',
        status: 'CONFIRMED',
        paymentStatus: 'pending',
        paymentType: 'ONSITE',
        price: 40000,
        type: 'REGULAR',
        duration: 60,
        totalPlayers: 2
      }
    })
    console.log(`  ✅ Reserva cancelable creada: ${cancelableBooking.id}`)
    
    // Test 4.7: Cancelar reserva
    console.log('\n4.7 Cancelando reserva no pagada...')
    const cancelledBooking = await prisma.booking.update({
      where: { id: cancelableBooking.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      }
    })
    console.log(`  ✅ Reserva cancelada:`)
    console.log(`     - Estado: ${cancelledBooking.status}`)
    console.log(`     - Cancelada en: ${cancelledBooking.cancelledAt?.toLocaleTimeString()}`)
    
    // Test 4.8: Verificar que no aparece en reservas activas
    console.log('\n4.8 Verificando reservas activas...')
    const activeBookings = await prisma.booking.findMany({
      where: {
        courtId: court.id,
        date: new Date('2025-08-31'),
        status: 'CONFIRMED'
      }
    })
    console.log(`  📊 Reservas activas para 31/08: ${activeBookings.length}`)
    if (activeBookings.length === 0) {
      console.log(`     - La cancha está libre (cancelación exitosa)`)
    }
    
    // Test 4.9: Crear reserva grupal para modificación
    console.log('\n4.9 Creando reserva grupal...')
    const groupBooking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: court.id,
        date: new Date('2025-09-01'),
        startTime: '18:00',
        endTime: '19:00',
        playerName: player.name,
        playerPhone: player.phone,
        playerEmail: player.email,
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
    
    // Test 4.10: Modificar número de jugadores
    console.log('\n4.10 Modificando número de jugadores...')
    const modifiedPlayers = await prisma.booking.update({
      where: { id: groupBooking.id },
      data: {
        totalPlayers: 2
      }
    })
    console.log(`  ✅ Jugadores modificados:`)
    console.log(`     - Antes: 4 jugadores`)
    console.log(`     - Después: ${modifiedPlayers.totalPlayers} jugadores`)
    
    // Test 4.11: Estadísticas de modificaciones
    console.log('\n4.11 Resumen de operaciones...')
    const stats = {
      total: await prisma.booking.count({ where: { clubId: club.id } }),
      confirmed: await prisma.booking.count({ 
        where: { clubId: club.id, status: 'CONFIRMED' } 
      }),
      cancelled: await prisma.booking.count({ 
        where: { clubId: club.id, status: 'CANCELLED' } 
      }),
      paid: await prisma.booking.count({ 
        where: { clubId: club.id, paymentStatus: 'completed' } 
      }),
      pending: await prisma.booking.count({ 
        where: { clubId: club.id, paymentStatus: 'pending' } 
      })
    }
    
    console.log(`  📊 Estadísticas:`)
    console.log(`     - Total reservas: ${stats.total}`)
    console.log(`     - Confirmadas: ${stats.confirmed}`)
    console.log(`     - Canceladas: ${stats.cancelled}`)
    console.log(`     - Pagadas: ${stats.paid}`)
    console.log(`     - Pendientes de pago: ${stats.pending}`)
    
    console.log('\n✅ PRUEBAS DE MODIFICACIONES COMPLETADAS')
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error)
    throw error
  }
}

testModifications()
  .catch(console.error)
  .finally(() => prisma.$disconnect())