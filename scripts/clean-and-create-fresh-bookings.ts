import { prisma } from '../lib/config/prisma'
import { v4 as uuidv4 } from 'uuid'

async function cleanAndCreateFreshBookings() {
  console.log('🧹 Limpiando todas las reservas de Club Demo Padelyzer...')
  
  const clubId = 'club-demo-001'
  
  // Delete all existing bookings and booking groups for this club
  console.log('\n🗑️ Eliminando reservas existentes...')
  
  // Delete individual bookings first
  const deletedBookings = await prisma.booking.deleteMany({
    where: { clubId }
  })
  
  // Delete booking groups
  const deletedGroups = await prisma.bookingGroup.deleteMany({
    where: { clubId }
  })
  
  console.log(`✅ Eliminadas ${deletedBookings.count} reservas individuales`)
  console.log(`✅ Eliminados ${deletedGroups.count} grupos de reservas`)
  
  // Get club courts
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: { Court: true }
  })
  
  if (!club || !club.Court.length) {
    console.error('❌ No se encontró el club o no tiene canchas')
    return
  }
  
  console.log(`\n🏟️ Club: ${club.name}`)
  console.log(`   Canchas: ${club.Court.map(c => c.name).join(', ')}`)
  
  // Set correct date for today (Sept 23, 2025)
  const todayDate = new Date('2025-09-23T06:00:00.000Z')
  console.log(`\n📅 Creando reservas para: ${todayDate.toISOString()}`)
  
  // Create fresh bookings
  console.log('\n🆕 Creando nuevas reservas...')
  
  // 1. Individual booking - Ana Martínez (with pending payment)
  const booking1 = await prisma.booking.create({
    data: {
      id: uuidv4(),
      clubId,
      courtId: club.Court[0].id,
      date: todayDate,
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
      notes: 'Reserva individual - pago pendiente',
      updatedAt: new Date()
    }
  })
  
  // 2. Individual booking - Roberto Silva (already paid)
  const booking2 = await prisma.booking.create({
    data: {
      id: uuidv4(),
      clubId,
      courtId: club.Court[1]?.id || club.Court[0].id,
      date: todayDate,
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
      notes: 'Reserva individual - ya pagada',
      updatedAt: new Date()
    }
  })
  
  // 3. Group booking
  const groupId = uuidv4()
  const groupBooking = await prisma.bookingGroup.create({
    data: {
      id: groupId,
      clubId,
      date: todayDate,
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
      notes: 'Reserva grupal - 2 canchas',
      updatedAt: new Date()
    }
  })
  
  // Individual bookings for the group
  const groupBooking1 = await prisma.booking.create({
    data: {
      id: uuidv4(),
      clubId,
      courtId: club.Court[0].id,
      bookingGroupId: groupId,
      date: todayDate,
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
  
  const groupBooking2 = await prisma.booking.create({
    data: {
      id: uuidv4(),
      clubId,
      courtId: club.Court[1]?.id || club.Court[0].id,
      bookingGroupId: groupId,
      date: todayDate,
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
  
  console.log('\n✅ ¡Reservas creadas exitosamente!')
  console.log('\n📝 Resumen de reservas creadas:')
  console.log(`1. 🔸 Ana Martínez (${booking1.id})`)
  console.log(`   📍 ${club.Court[0].name} | ⏰ 14:00-15:30 | 💰 Pago pendiente`)
  
  console.log(`\n2. 🔸 Roberto Silva (${booking2.id})`)
  console.log(`   📍 ${club.Court[1]?.name || club.Court[0].name} | ⏰ 18:00-19:30 | ✅ Pagado`)
  
  console.log(`\n3. 🔶 Carlos López - GRUPO (${groupBooking.id})`)
  console.log(`   📍 ${club.Court[0].name}, ${club.Court[1]?.name || club.Court[0].name} | ⏰ 16:00-17:30 | 👥 Grupal`)
  
  console.log('\n🎯 Deberías ver EXACTAMENTE 3 reservas en el dashboard:')
  console.log('   • Ana Martínez (14:00) - Individual')
  console.log('   • Carlos López (16:00) - Grupo')  
  console.log('   • Roberto Silva (18:00) - Individual')
  
  await prisma.$disconnect()
}

cleanAndCreateFreshBookings().catch(console.error)