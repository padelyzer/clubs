import { prisma } from '../lib/config/prisma'
import { v4 as uuidv4 } from 'uuid'

async function createTestBookings() {
  console.log('🏗️ Creando reservas de prueba para 2025-09-23...')
  
  // Get Club Demo Padelyzer details
  const club = await prisma.club.findUnique({
    where: { id: 'club-demo-001' },
    include: {
      Court: true
    }
  })
  
  if (!club || !club.Court.length) {
    console.error('❌ No se encontró Club Demo Padelyzer o no tiene canchas')
    return
  }
  
  console.log(`✅ Club encontrado: ${club.name}`)
  console.log(`   Canchas disponibles: ${club.Court.map(c => c.name).join(', ')}`)
  
  const today = new Date('2025-09-23T10:00:00.000Z') // 10 AM UTC
  
  // Create individual booking
  console.log('\n📋 Creando reserva individual...')
  const individualBooking = await prisma.booking.create({
    data: {
      id: uuidv4(),
      clubId: club.id,
      courtId: club.Court[0].id,
      date: today,
      startTime: '14:00',
      endTime: '15:30',
      duration: 90,
      playerName: 'Ana Martínez',
      playerEmail: 'ana@example.com',
      playerPhone: '+52 222 123 4567',
      totalPlayers: 4,
      price: 800,
      currency: 'MXN',
      paymentStatus: 'pending',
      status: 'CONFIRMED',
      checkedIn: false,
      splitPaymentEnabled: false,
      notes: 'Reserva de prueba individual',
      updatedAt: new Date()
    }
  })
  
  console.log(`✅ Reserva individual creada: ${individualBooking.id}`)
  console.log(`   Jugador: ${individualBooking.playerName}`)
  console.log(`   Cancha: ${club.Court[0].name}`)
  console.log(`   Horario: ${individualBooking.startTime} - ${individualBooking.endTime}`)
  
  // Create group booking with multiple courts
  console.log('\n📋 Creando reserva grupal...')
  const groupBookingId = uuidv4()
  
  const groupBooking = await prisma.bookingGroup.create({
    data: {
      id: groupBookingId,
      clubId: club.id,
      date: today,
      startTime: '16:00',
      endTime: '17:30',
      duration: 90,
      playerName: 'Carlos López',
      playerEmail: 'carlos@example.com',
      playerPhone: '+52 222 987 6543',
      totalPlayers: 8,
      price: 1600,
      currency: 'MXN',
      status: 'CONFIRMED',
      splitPaymentEnabled: true,
      splitPaymentCount: 4,
      notes: 'Reserva de prueba grupal',
      updatedAt: new Date()
    }
  })
  
  // Create individual bookings for the group
  const court1Booking = await prisma.booking.create({
    data: {
      id: uuidv4(),
      clubId: club.id,
      courtId: club.Court[0].id,
      bookingGroupId: groupBookingId,
      date: today,
      startTime: '16:00',
      endTime: '17:30',
      duration: 90,
      playerName: 'Carlos López',
      playerEmail: 'carlos@example.com',
      playerPhone: '+52 222 987 6543',
      totalPlayers: 4,
      price: 800,
      currency: 'MXN',
      paymentStatus: 'pending',
      status: 'CONFIRMED',
      checkedIn: false,
      splitPaymentEnabled: true,
      splitPaymentCount: 4,
      notes: 'Parte 1 de reserva grupal',
      updatedAt: new Date()
    }
  })
  
  const court2Booking = await prisma.booking.create({
    data: {
      id: uuidv4(),
      clubId: club.id,
      courtId: club.Court[1]?.id || club.Court[0].id, // Use second court or first if only one
      bookingGroupId: groupBookingId,
      date: today,
      startTime: '16:00',
      endTime: '17:30',
      duration: 90,
      playerName: 'María González',
      playerEmail: 'maria@example.com',
      playerPhone: '+52 222 555 1234',
      totalPlayers: 4,
      price: 800,
      currency: 'MXN',
      paymentStatus: 'pending',
      status: 'CONFIRMED',
      checkedIn: false,
      splitPaymentEnabled: true,
      splitPaymentCount: 4,
      notes: 'Parte 2 de reserva grupal',
      updatedAt: new Date()
    }
  })
  
  console.log(`✅ Reserva grupal creada: ${groupBooking.id}`)
  console.log(`   Organizador: ${groupBooking.playerName}`)
  console.log(`   Canchas: ${club.Court[0].name}${club.Court[1] ? `, ${club.Court[1].name}` : ''}`)
  console.log(`   Horario: ${groupBooking.startTime} - ${groupBooking.endTime}`)
  console.log(`   Booking 1: ${court1Booking.id}`)
  console.log(`   Booking 2: ${court2Booking.id}`)
  
  // Create another individual booking for different time
  console.log('\n📋 Creando segunda reserva individual...')
  const secondBooking = await prisma.booking.create({
    data: {
      id: uuidv4(),
      clubId: club.id,
      courtId: club.Court[1]?.id || club.Court[0].id,
      date: today,
      startTime: '18:00',
      endTime: '19:30',
      duration: 90,
      playerName: 'Roberto Silva',
      playerEmail: 'roberto@example.com',
      playerPhone: '+52 222 444 5678',
      totalPlayers: 4,
      price: 800,
      currency: 'MXN',
      paymentStatus: 'completed',
      paymentType: 'ONLINE_FULL',
      status: 'CONFIRMED',
      checkedIn: false,
      splitPaymentEnabled: false,
      notes: 'Reserva de prueba - pagada',
      updatedAt: new Date()
    }
  })
  
  console.log(`✅ Segunda reserva individual creada: ${secondBooking.id}`)
  console.log(`   Jugador: ${secondBooking.playerName}`)
  console.log(`   Estado de pago: ${secondBooking.paymentStatus}`)
  
  console.log('\n🎉 ¡Reservas de prueba creadas exitosamente!')
  console.log('\n📝 Resumen:')
  console.log(`1. Reserva individual (pago pendiente): ${individualBooking.id}`)
  console.log(`2. Reserva grupal: ${groupBooking.id}`)
  console.log(`3. Reserva individual (pagada): ${secondBooking.id}`)
  
  console.log('\n🧪 Ahora puedes probar:')
  console.log('• Check-in con pago en sitio (reserva 1)')
  console.log('• Check-in de reserva grupal (reserva 2)')  
  console.log('• Check-in de reserva ya pagada (reserva 3)')
  
  await prisma.$disconnect()
}

createTestBookings().catch(console.error)