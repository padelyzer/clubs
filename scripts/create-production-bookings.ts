import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

// Use production database URL - Supabase production
const PRODUCTION_DATABASE_URL = process.env.DATABASE_URL_PRODUCTION || 
  'postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL
    }
  }
})

async function createProductionBookings() {
  console.log('🌐 Creando reservas en la base de datos de PRODUCCIÓN...')
  console.log(`📍 Conectando a: ${PRODUCTION_DATABASE_URL.substring(0, 50)}...`)
  
  try {
    await prisma.$connect()
    console.log('✅ Conexión exitosa a Supabase')
    
    const clubId = 'club-demo-001'
    
    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: { Court: true }
    })
    
    if (!club) {
      console.error('❌ Club Demo Padelyzer no encontrado en producción')
      console.log('💡 Necesitas crear el club primero en la base de datos de producción')
      return
    }
    
    console.log(`✅ Club encontrado: ${club.name}`)
    console.log(`🏟️ Canchas: ${club.Court.map(c => c.name).join(', ')}`)
    
    // Delete existing bookings first
    console.log('\n🧹 Limpiando reservas existentes...')
    
    const deletedBookings = await prisma.booking.deleteMany({
      where: { clubId }
    })
    
    const deletedGroups = await prisma.bookingGroup.deleteMany({
      where: { clubId }
    })
    
    console.log(`✅ Eliminadas ${deletedBookings.count} reservas individuales`)
    console.log(`✅ Eliminados ${deletedGroups.count} grupos de reservas`)
    
    // Set correct date for today (Sept 24, 2025 - current date)
    const todayDate = new Date('2025-09-24T06:00:00.000Z')
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
        createdAt: new Date(),
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
        createdAt: new Date(),
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
        createdAt: new Date(),
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
        createdAt: new Date(),
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
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log('\n✅ ¡Reservas creadas exitosamente en PRODUCCIÓN!')
    console.log('\n📝 Resumen de reservas creadas:')
    console.log(`1. 🔸 Ana Martínez (${booking1.id})`)
    console.log(`   📍 ${club.Court[0].name} | ⏰ 14:00-15:30 | 💰 Pago pendiente`)
    
    console.log(`\n2. 🔸 Roberto Silva (${booking2.id})`)
    console.log(`   📍 ${club.Court[1]?.name || club.Court[0].name} | ⏰ 18:00-19:30 | ✅ Pagado`)
    
    console.log(`\n3. 🔶 Carlos López - GRUPO (${groupBooking.id})`)
    console.log(`   📍 ${club.Court[0].name}, ${club.Court[1]?.name || club.Court[0].name} | ⏰ 16:00-17:30 | 👥 Grupal`)
    
    console.log('\n🎯 Ahora deberías ver EXACTAMENTE 3 reservas en el dashboard de producción:')
    console.log('   • Ana Martínez (14:00) - Individual')
    console.log('   • Carlos López (16:00) - Grupo')  
    console.log('   • Roberto Silva (18:00) - Individual')
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Error creando reservas en producción:', error)
    await prisma.$disconnect()
  }
}

createProductionBookings().catch(console.error)