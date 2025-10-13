import { prisma } from '../lib/config/prisma'
import { addMinutes } from 'date-fns'

async function createSplitPaymentBooking() {
  try {
    console.log('🔍 Creando nueva reserva con pagos divididos...\n')
    
    // Obtener el club
    const club = await prisma.club.findFirst()
    if (!club) {
      console.log('❌ No se encontró club')
      return
    }
    
    // Obtener una cancha
    const court = await prisma.court.findFirst({
      where: { clubId: club.id, active: true }
    })
    
    if (!court) {
      console.log('❌ No se encontró cancha activa')
      return
    }
    
    // Primero, eliminar la reserva problemática de Ana Martinez si existe
    const oldBooking = await prisma.booking.findFirst({
      where: {
        playerName: {
          contains: 'Ana',
          mode: 'insensitive'
        }
      }
    })
    
    if (oldBooking) {
      console.log('🗑️  Eliminando reserva anterior de Ana Martinez...')
      
      // Eliminar split payments primero
      await prisma.splitPayment.deleteMany({
        where: { bookingId: oldBooking.id }
      })
      
      // Eliminar la reserva
      await prisma.booking.delete({
        where: { id: oldBooking.id }
      })
      
      console.log('✅ Reserva anterior eliminada\n')
    }
    
    // Crear nueva reserva con pagos divididos
    const now = new Date()
    const bookingDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0, 0) // Mañana a las 2PM
    
    console.log('📅 Creando nueva reserva:')
    console.log(`   Cancha: ${court.name}`)
    console.log(`   Fecha: ${bookingDate.toLocaleDateString('es-MX')}`)
    console.log(`   Horario: 14:00 - 15:30`)
    console.log(`   Precio Total: $600 MXN`)
    console.log(`   Pagos Divididos: 4 jugadores\n`)
    
    const booking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: court.id,
        playerName: 'María González',
        playerEmail: 'maria@example.com',
        playerPhone: '555-0001',
        date: bookingDate,
        startTime: '14:00',
        endTime: '15:30',
        duration: 90,
        price: 60000, // $600 MXN en centavos
        currency: 'MXN',
        status: 'CONFIRMED',
        paymentStatus: 'pending',
        paymentType: 'ONSITE',
        totalPlayers: 4,
        splitPaymentEnabled: true,
        splitPaymentCount: 4,
        notes: 'Reserva de prueba con pagos divididos'
      }
    })
    
    console.log('✅ Reserva creada: ' + booking.id)
    
    // Crear los 4 pagos divididos
    const players = [
      { name: 'María González', email: 'maria@example.com', phone: '555-0001' },
      { name: 'Carlos López', email: 'carlos@example.com', phone: '555-0002' },
      { name: 'Laura Martín', email: 'laura@example.com', phone: '555-0003' },
      { name: 'Pedro Sánchez', email: 'pedro@example.com', phone: '555-0004' }
    ]
    
    console.log('\n💳 Creando pagos divididos:')
    
    for (let i = 0; i < players.length; i++) {
      const player = players[i]
      const amount = Math.floor(booking.price / 4) // $150 MXN cada uno
      
      const splitPayment = await prisma.splitPayment.create({
        data: {
          bookingId: booking.id,
          playerName: player.name,
          playerEmail: player.email,
          playerPhone: player.phone,
          amount: amount,
          status: i === 0 ? 'completed' : 'pending', // Solo el primer pago está completado
          completedAt: i === 0 ? new Date() : null
        }
      })
      
      console.log(`   ${i + 1}. ${player.name}: $${amount / 100} MXN - ${i === 0 ? '✅ Pagado' : '⏳ Pendiente'}`)
    }
    
    // Actualizar el estado de pago de la reserva a 'processing' ya que hay 1 pago completado
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'processing'
      }
    })
    
    console.log('\n📊 Resumen:')
    console.log('   Total: $600 MXN')
    console.log('   Pagos completados: 1/4 ($150 MXN)')
    console.log('   Pendiente: 3/4 ($450 MXN)')
    console.log('\n✅ Reserva con pagos divididos creada exitosamente!')
    console.log(`   ID de Reserva: ${booking.id}`)
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createSplitPaymentBooking()