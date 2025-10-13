import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function seedClubs() {
  try {
    console.log('🌱 Iniciando seed de clubs...')
    
    // Crear un club de prueba
    const now = new Date()
    const club = await prisma.club.create({
      data: {
        id: nanoid(),
        name: 'Club Pádel Madrid',
        slug: 'club-padel-madrid',
        email: 'info@clubpadelmadrid.com',
        phone: '+34 91 234 5678',
        address: 'Calle del Pádel, 1',
        city: 'Madrid',
        state: 'Madrid',
        postalCode: '28001',
        country: 'España',
        status: 'APPROVED',
        active: true,
        description: 'El mejor club de pádel en Madrid',
        website: 'https://clubpadelmadrid.com',
        createdAt: now,
        updatedAt: now,
        approvedAt: now
      }
    })
    
    console.log('✅ Club creado:', club.name)
    console.log('   ID:', club.id)
    console.log('   Estado:', club.status)
    console.log('   Activo:', club.active)
    
    // Crear algunas canchas para el club
    const courts = []
    
    for (let i = 1; i <= 6; i++) {
      const court = await prisma.court.create({
        data: {
          id: nanoid(),
          clubId: club.id,
          name: `Pista ${i}`,
          type: 'PADEL',
          indoor: i <= 3,
          order: i,
          active: true,
          createdAt: now,
          updatedAt: now
        }
      })
      courts.push(court)
      console.log(`   📍 Cancha creada: ${court.name} (${court.indoor ? 'Indoor' : 'Outdoor'})`)
    }
    
    // Crear un usuario admin para el club
    const clubAdmin = await prisma.user.create({
      data: {
        id: nanoid(),
        email: 'admin@clubpadelmadrid.com',
        name: 'Admin Madrid',
        role: 'CLUB_OWNER',
        clubId: club.id,
        active: true,
        emailVerified: now,
        createdAt: now,
        updatedAt: now
      }
    })
    
    console.log(`   👤 Admin del club creado: ${clubAdmin.email}`)
    
    // Crear algunos usuarios jugadores
    const players = []
    for (let i = 1; i <= 5; i++) {
      const player = await prisma.user.create({
        data: {
          id: nanoid(),
          email: `jugador${i}@example.com`,
          name: `Jugador ${i}`,
          role: 'USER',
          clubId: club.id,
          active: true,
          emailVerified: now,
          createdAt: now,
          updatedAt: now
        }
      })
      players.push(player)
    }
    
    console.log(`   👥 ${players.length} jugadores creados`)
    
    // Crear algunas reservas de ejemplo
    const today = new Date()
    const bookings = []
    
    for (let i = 0; i < 10; i++) {
      const bookingDate = new Date(today)
      bookingDate.setDate(today.getDate() + Math.floor(Math.random() * 7))
      const hour = 10 + Math.floor(Math.random() * 10)
      const startTime = `${hour.toString().padStart(2, '0')}:00`
      const endHour = hour + 1
      const endMinute = 30
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
      
      const player = players[Math.floor(Math.random() * players.length)]
      const booking = await prisma.booking.create({
        data: {
          id: nanoid(),
          clubId: club.id,
          courtId: courts[Math.floor(Math.random() * courts.length)].id,
          date: bookingDate,
          startTime: startTime,
          endTime: endTime,
          duration: 90,
          playerName: player.name || 'Jugador',
          playerEmail: player.email,
          playerPhone: '+34 600 123 456',
          totalPlayers: 4,
          price: 300 + Math.floor(Math.random() * 200),
          currency: 'MXN',
          status: ['PENDING', 'CONFIRMED', 'COMPLETED'][Math.floor(Math.random() * 3)] as any,
          paymentStatus: ['pending', 'completed'][Math.floor(Math.random() * 2)] as any,
          paymentType: 'ONSITE',
          createdAt: now,
          updatedAt: now
        }
      })
      bookings.push(booking)
    }
    
    console.log(`   📅 ${bookings.length} reservas creadas`)
    
    console.log('\n✅ Seed completado exitosamente!')
    console.log('   Puedes acceder al panel de admin en: http://localhost:3001/admin')
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedClubs()