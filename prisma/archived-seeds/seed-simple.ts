import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Limpiar datos existentes en orden correcto
  await prisma.notification.deleteMany()
  await prisma.splitPayment.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.court.deleteMany()
  await prisma.user.deleteMany()
  await prisma.club.deleteMany()

  // Crear club de prueba
  const club = await prisma.club.create({
    data: {
      name: 'Club Pádel México',
      slug: 'club-padel-mexico',
      email: 'info@clubpadel.mx',
      phone: '55 1234 5678',
      address: 'Av. Universidad 1234',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '03100',
      country: 'México',
      status: 'APPROVED',
      active: true,
      settings: {
        create: {
          currency: 'MXN',
          slotDuration: 90,
          bufferTime: 15,
          advanceBookingDays: 30,
          allowSameDayBooking: true,
          taxIncluded: true,
          taxRate: 16, // IVA México
          cancellationFee: 0,
          noShowFee: 50
        }
      }
    }
  })

  console.log('✅ Club created:', club.name)

  // Crear usuario administrador
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@clubpadel.mx',
      name: 'Administrador',
      role: 'CLUB_OWNER',
      clubId: club.id
    }
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Crear canchas
  const courts = await Promise.all([
    prisma.court.create({
      data: {
        clubId: club.id,
        name: 'Cancha Central',
        type: 'PADEL',
        indoor: false,
        active: true,
        order: 1
      }
    }),
    prisma.court.create({
      data: {
        clubId: club.id,
        name: 'Cancha Norte',
        type: 'PADEL',
        indoor: true,
        active: true,
        order: 2
      }
    }),
    prisma.court.create({
      data: {
        clubId: club.id,
        name: 'Cancha Sur',
        type: 'PADEL',
        indoor: false,
        active: true,
        order: 3
      }
    })
  ])

  console.log('✅ Courts created:', courts.length)

  // Crear jugadores de ejemplo
  const players = await Promise.all([
    prisma.player.create({
      data: {
        clubId: club.id,
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '555-0101',
        level: 'Intermediate',
        preferredPosition: 'Right',
        memberNumber: 'MX001',
        totalBookings: 12,
        totalSpent: 360000 // 3600 MXN
      }
    }),
    prisma.player.create({
      data: {
        clubId: club.id,
        name: 'María García',
        email: 'maria@example.com',
        phone: '555-0102',
        level: 'Advanced',
        preferredPosition: 'Left',
        memberNumber: 'MX002',
        totalBookings: 8,
        totalSpent: 240000 // 2400 MXN
      }
    }),
    prisma.player.create({
      data: {
        clubId: club.id,
        name: 'Carlos López',
        email: 'carlos@example.com',
        phone: '555-0103',
        level: 'Beginner',
        preferredPosition: 'Either',
        memberNumber: 'MX003',
        totalBookings: 4,
        totalSpent: 120000 // 1200 MXN
      }
    }),
    prisma.player.create({
      data: {
        clubId: club.id,
        name: 'Ana Martínez',
        phone: '555-0104',
        level: 'Intermediate',
        preferredPosition: 'Left',
        memberNumber: 'MX004',
        totalBookings: 6,
        totalSpent: 180000 // 1800 MXN
      }
    }),
    prisma.player.create({
      data: {
        clubId: club.id,
        name: 'Roberto Díaz',
        phone: '555-0105',
        level: 'Professional',
        preferredPosition: 'Right',
        memberNumber: 'MX005',
        totalBookings: 20,
        totalSpent: 600000 // 6000 MXN
      }
    })
  ])

  console.log('✅ Players created:', players.length)

  // Crear algunas reservas de ejemplo
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const bookings = []
  
  // Reserva pagada con check-in pendiente
  const booking1 = await prisma.booking.create({
    data: {
      clubId: club.id,
      courtId: courts[0].id,
      date: today,
      startTime: '09:00',
      endTime: '10:30',
      duration: 90,
      playerName: 'Juan Pérez',
      playerEmail: 'juan@example.com',
      playerPhone: '555-0101',
      totalPlayers: 4,
      price: 30000, // 300 MXN en centavos
      paymentStatus: 'completed',
      status: 'CONFIRMED',
      splitPaymentEnabled: false
    }
  })
  bookings.push(booking1)

  // Reserva con pago dividido
  const booking2 = await prisma.booking.create({
    data: {
      clubId: club.id,
      courtId: courts[1].id,
      date: today,
      startTime: '10:00',
      endTime: '11:30',
      duration: 90,
      playerName: 'María García',
      playerEmail: 'maria@example.com',
      playerPhone: '555-0102',
      totalPlayers: 4,
      price: 30000,
      paymentStatus: 'processing', // Split payment in progress
      status: 'CONFIRMED',
      splitPaymentEnabled: true,
      splitPaymentCount: 4,
      SplitPayment: {
        create: [
          {
            playerName: 'María García',
            playerPhone: '555-0102',
            playerEmail: 'maria@example.com',
            amount: 7500,
            status: 'completed'
          },
          {
            playerName: 'Carlos López',
            playerPhone: '555-0103',
            amount: 7500,
            status: 'completed'
          },
          {
            playerName: 'Ana Martínez',
            playerPhone: '555-0104',
            amount: 7500,
            status: 'pending'
          },
          {
            playerName: 'Roberto Díaz',
            playerPhone: '555-0105',
            amount: 7500,
            status: 'pending'
          }
        ]
      }
    }
  })
  bookings.push(booking2)

  // Reserva pendiente de pago
  const booking3 = await prisma.booking.create({
    data: {
      clubId: club.id,
      courtId: courts[0].id,
      date: today,
      startTime: '14:00',
      endTime: '15:30',
      duration: 90,
      playerName: 'Carlos López',
      playerEmail: 'carlos@example.com',
      playerPhone: '555-0103',
      totalPlayers: 4,
      price: 35000, // 350 MXN
      paymentStatus: 'pending',
      status: 'PENDING',
      splitPaymentEnabled: false
    }
  })
  bookings.push(booking3)

  console.log('✅ Bookings created:', bookings.length)

  // Crear algunos pagos de ejemplo
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      amount: 30000,
      currency: 'MXN',
      status: 'completed',
      method: 'STRIPE'
    }
  })

  console.log('✅ Sample payments created')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })