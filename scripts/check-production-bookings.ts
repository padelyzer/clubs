import { PrismaClient } from '@prisma/client'

// Use production database URL - Supabase production
const PRODUCTION_DATABASE_URL = 'postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL
    }
  }
})

async function checkProductionBookings() {
  console.log('🌐 Verificando reservas en PRODUCCIÓN...')
  console.log(`📍 Conectando a Supabase...`)
  
  try {
    await prisma.$connect()
    console.log('✅ Conexión exitosa')
    
    // Find club by slug
    const club = await prisma.club.findFirst({
      where: { 
        slug: 'club-demo-padelyzer'
      },
      include: { Court: true }
    })
    
    if (!club) {
      console.error('❌ Club no encontrado con slug: club-demo-padelyzer')
      return
    }
    
    console.log('\n✅ Club encontrado:')
    console.log(`   ID: ${club.id}`)
    console.log(`   Nombre: ${club.name}`)
    console.log(`   Slug: ${club.slug}`)
    console.log(`   Canchas: ${club.Court.map(c => `${c.name} (${c.id})`).join(', ')}`)
    
    // Get ALL bookings for this club
    const allBookings = await prisma.booking.findMany({
      where: {
        clubId: club.id
      },
      include: {
        Court: true
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'asc' }
      ]
    })
    
    // Get ALL booking groups for this club
    const allGroups = await prisma.bookingGroup.findMany({
      where: {
        clubId: club.id
      },
      include: {
        bookings: {
          include: {
            Court: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'asc' }
      ]
    })
    
    console.log('\n📊 RESUMEN TOTAL EN PRODUCCIÓN:')
    console.log(`   Total reservas individuales: ${allBookings.length}`)
    console.log(`   Total grupos de reservas: ${allGroups.length}`)
    
    if (allBookings.length === 0 && allGroups.length === 0) {
      console.log('\n❌ NO HAY NINGUNA RESERVA EN PRODUCCIÓN')
      console.log('   Esto explica por qué no ves reservas en el dashboard')
      console.log('\n💡 Voy a crear las reservas ahora...')
      
      // Create bookings now
      await createBookings(club)
      
    } else {
      console.log('\n📋 Reservas existentes:')
      allBookings.forEach(booking => {
        console.log(`   ${booking.playerName} - ${booking.Court?.name} - ${booking.date.toISOString()} ${booking.startTime}`)
      })
      
      console.log('\n📋 Grupos existentes:')
      allGroups.forEach(group => {
        console.log(`   [GRUPO] ${group.playerName} - ${group.date.toISOString()} ${group.startTime}`)
      })
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Error:', error)
    await prisma.$disconnect()
  }
}

async function createBookings(club: any) {
  const { v4: uuidv4 } = require('uuid')
  
  // Set date for today
  const todayDate = new Date('2025-09-24T06:00:00.000Z')
  console.log(`\n📅 Creando reservas para: ${todayDate.toISOString()}`)
  
  try {
    // 1. Individual booking - Ana Martínez
    const booking1 = await prisma.booking.create({
      data: {
        id: uuidv4(),
        clubId: club.id,
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
        notes: 'Reserva individual - pago pendiente'
      }
    })
    
    // 2. Individual booking - Roberto Silva
    const booking2 = await prisma.booking.create({
      data: {
        id: uuidv4(),
        clubId: club.id,
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
        notes: 'Reserva individual - ya pagada'
      }
    })
    
    // 3. Group booking
    const groupId = uuidv4()
    const groupBooking = await prisma.bookingGroup.create({
      data: {
        id: groupId,
        clubId: club.id,
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
        notes: 'Reserva grupal - 2 canchas'
      }
    })
    
    // Bookings for the group
    await prisma.booking.create({
      data: {
        id: uuidv4(),
        clubId: club.id,
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
        notes: 'Parte 1 de reserva grupal'
      }
    })
    
    await prisma.booking.create({
      data: {
        id: uuidv4(),
        clubId: club.id,
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
        notes: 'Parte 2 de reserva grupal'
      }
    })
    
    console.log('\n✅ ¡Reservas creadas exitosamente en PRODUCCIÓN!')
    console.log('\n📝 Resumen:')
    console.log('   • Ana Martínez (14:00) - Individual, pago pendiente')
    console.log('   • Carlos López (16:00) - Grupo, 2 canchas')
    console.log('   • Roberto Silva (18:00) - Individual, pagado')
    
  } catch (error) {
    console.error('❌ Error creando reservas:', error)
  }
}

checkProductionBookings().catch(console.error)