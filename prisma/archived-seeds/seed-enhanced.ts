import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { WhatsAppLinkService } from '../lib/services/whatsapp-link-service'
import { PasswordGenerator } from '../lib/security/password-generator'

const prisma = new PrismaClient()

// Datos de prueba para jugadores
const TEST_PLAYERS = [
  { name: 'Carlos Rodríguez', email: 'carlos@example.com', phone: '+52 222 555 0001', level: 'INTERMEDIATE' },
  { name: 'Ana Martínez', email: 'ana@example.com', phone: '+52 222 555 0002', level: 'ADVANCED' },
  { name: 'Luis Hernández', email: 'luis@example.com', phone: '+52 222 555 0003', level: 'BEGINNER' },
  { name: 'María López', email: 'maria@example.com', phone: '+52 222 555 0004', level: 'INTERMEDIATE' },
  { name: 'Pedro García', email: 'pedro@example.com', phone: '+52 222 555 0005', level: 'ADVANCED' },
  { name: 'Sofia Ramírez', email: 'sofia@example.com', phone: '+52 222 555 0006', level: 'INTERMEDIATE' },
  { name: 'Diego Torres', email: 'diego@example.com', phone: '+52 222 555 0007', level: 'BEGINNER' },
  { name: 'Isabella Flores', email: 'isabella@example.com', phone: '+52 222 555 0008', level: 'ADVANCED' },
  { name: 'Miguel Sánchez', email: 'miguel@example.com', phone: '+52 222 555 0009', level: 'INTERMEDIATE' },
  { name: 'Valentina Cruz', email: 'valentina@example.com', phone: '+52 222 555 0010', level: 'BEGINNER' },
]

async function main() {
  console.log('🌱 Starting enhanced seed...')

  // Limpiar datos existentes
  console.log('🧹 Limpiando datos existentes...')
  await prisma.splitPayment.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.bookingGroup.deleteMany()
  await prisma.player.deleteMany()
  await prisma.court.deleteMany()
  await prisma.pricing.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.user.deleteMany()
  await prisma.club.deleteMany()

  // Crear Super Admin
  const passwords = PasswordGenerator.getSeedPasswords()
  const superAdminPassword = await bcrypt.hash(passwords.admin, 10)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@padelyzer.com',
      password: superAdminPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      active: true,
    },
  })

  console.log('✅ Super Admin creado:', superAdmin.email)

  // Crear Club de prueba con WhatsApp configurado
  const club = await prisma.club.create({
    data: {
      name: 'Club Padel Puebla',
      slug: 'club-padel-puebla',
      email: 'info@clubpadelpuebla.com',
      phone: '+52 222 123 4567',
      whatsappNumber: '+525551234567', // Número de WhatsApp configurado
      address: 'Av. Juárez 123, Centro',
      city: 'Puebla',
      state: 'Puebla',
      country: 'México',
      postalCode: '72000',
      description: 'El mejor club de padel en Puebla con canchas techadas y al aire libre',
      status: 'APPROVED',
      stripeAccountId: 'acct_test_123',
      stripeChargesEnabled: true,
      stripeDetailsSubmitted: true,
      stripeOnboardingCompleted: true,
      stripeCommissionRate: 250, // 2.5%
    },
  })

  console.log('✅ Club creado:', club.name)
  console.log('📱 WhatsApp configurado:', club.whatsappNumber)

  // Crear Owner del Club
  const ownerPassword = await bcrypt.hash(passwords.owner, 10)
  const owner = await prisma.user.create({
    data: {
      email: 'owner@clubpadelpuebla.com',
      password: ownerPassword,
      name: 'Juan Pérez',
      role: 'CLUB_OWNER',
      clubId: club.id,
      active: true,
    },
  })

  console.log('✅ Club Owner creado:', owner.email)

  // Crear Staff del Club (2 miembros)
  const staffPassword = await bcrypt.hash(passwords.staff, 10)
  const staff1 = await prisma.user.create({
    data: {
      email: 'staff@clubpadelpuebla.com',
      password: staffPassword,
      name: 'María García',
      role: 'CLUB_STAFF',
      clubId: club.id,
      active: true,
    },
  })

  const staff2 = await prisma.user.create({
    data: {
      email: 'recepcion@clubpadelpuebla.com',
      password: staffPassword,
      name: 'Roberto Jiménez',
      role: 'CLUB_STAFF',
      clubId: club.id,
      active: true,
    },
  })

  console.log('✅ Club Staff creados:', staff1.email, staff2.email)

  // Crear Jugadores/Clientes
  console.log('👥 Creando jugadores...')
  const players = await Promise.all(
    TEST_PLAYERS.map((player, index) =>
      prisma.player.create({
        data: {
          name: player.name,
          email: player.email,
          phone: player.phone,
          phoneVerified: true,
          level: player.level,
          gender: index % 2 === 0 ? 'MALE' : 'FEMALE',
          active: true,
          memberSince: new Date(2024, 0, 1),
          clientNumber: `PDP${String(index + 1).padStart(4, '0')}`,
          totalBookings: Math.floor(Math.random() * 50) + 5,
          totalSpent: Math.floor(Math.random() * 500000) + 50000, // Entre $500 y $5000 MXN
          clubId: club.id,
        },
      })
    )
  )

  console.log('✅ Jugadores creados:', players.length)

  // Crear Canchas (5 canchas)
  const courts = await Promise.all([
    prisma.court.create({
      data: {
        name: 'Cancha Central',
        type: 'PADEL',
        indoor: true,
        active: true,
        order: 1,
        clubId: club.id,
      },
    }),
    prisma.court.create({
      data: {
        name: 'Cancha 2',
        type: 'PADEL',
        indoor: false,
        active: true,
        order: 2,
        clubId: club.id,
      },
    }),
    prisma.court.create({
      data: {
        name: 'Cancha 3',
        type: 'PADEL',
        indoor: true,
        active: true,
        order: 3,
        clubId: club.id,
      },
    }),
    prisma.court.create({
      data: {
        name: 'Cancha VIP',
        type: 'PADEL',
        indoor: true,
        active: true,
        order: 4,
        clubId: club.id,
      },
    }),
    prisma.court.create({
      data: {
        name: 'Cancha 5',
        type: 'PADEL',
        indoor: false,
        active: true,
        order: 5,
        clubId: club.id,
      },
    }),
  ])

  console.log('✅ Canchas creadas:', courts.length)

  // Crear Horarios
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6] // Domingo a Sábado
  const schedules = await Promise.all(
    daysOfWeek.map((day) =>
      prisma.schedule.create({
        data: {
          dayOfWeek: day,
          openTime: '07:00',
          closeTime: '22:00',
          clubId: club.id,
        },
      })
    )
  )

  console.log('✅ Horarios creados:', schedules.length)

  // Crear Precios diferenciados
  const pricingData = [
    { startTime: '07:00', endTime: '12:00', price: 40000 }, // $400 MXN mañana
    { startTime: '12:00', endTime: '18:00', price: 50000 }, // $500 MXN tarde
    { startTime: '18:00', endTime: '22:00', price: 60000 }, // $600 MXN noche
  ]

  const pricing = await Promise.all(
    pricingData.map((p) =>
      prisma.pricing.create({
        data: {
          ...p,
          clubId: club.id,
        },
      })
    )
  )

  console.log('✅ Precios creados:', pricing.length)

  // Crear Reservas variadas
  console.log('📅 Creando reservas...')
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(dayAfter.getDate() + 1)

  const bookings = []

  // Reserva 1: Confirmada y pagada (hoy)
  bookings.push(
    await prisma.booking.create({
      data: {
        date: today,
        startTime: '18:00',
        endTime: '19:30',
        duration: 90,
        status: 'CONFIRMED',
        paymentStatus: 'completed',
        paymentType: 'ONLINE_FULL',
        price: 60000,
        playerName: players[0].name,
        playerEmail: players[0].email,
        playerPhone: players[0].phone,
        totalPlayers: 4,
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: staff1.email,
        notes: 'Partido regular del viernes',
        courtId: courts[0].id,
        clubId: club.id,
      },
    })
  )

  // Reserva 2: Con pago dividido (mañana)
  bookings.push(
    await prisma.booking.create({
      data: {
        date: tomorrow,
        startTime: '10:00',
        endTime: '11:30',
        duration: 90,
        status: 'PENDING',
        paymentStatus: 'processing',
        paymentType: 'ONLINE_SPLIT',
        price: 50000,
        playerName: players[1].name,
        playerEmail: players[1].email,
        playerPhone: players[1].phone,
        totalPlayers: 4,
        splitPaymentEnabled: true,
        splitPaymentCount: 4,
        notes: 'Torneo amistoso - pago dividido',
        courtId: courts[1].id,
        clubId: club.id,
      },
    })
  )

  // Reserva 3: Pendiente de pago (mañana)
  bookings.push(
    await prisma.booking.create({
      data: {
        date: tomorrow,
        startTime: '16:00',
        endTime: '17:30',
        duration: 90,
        status: 'PENDING',
        paymentStatus: 'pending',
        paymentType: 'ONSITE',
        price: 60000,
        playerName: players[2].name,
        playerEmail: players[2].email,
        playerPhone: players[2].phone,
        totalPlayers: 4,
        notes: 'Pago pendiente en recepción',
        courtId: courts[2].id,
        clubId: club.id,
      },
    })
  )

  // Reserva 4: Confirmada para pasado mañana
  bookings.push(
    await prisma.booking.create({
      data: {
        date: dayAfter,
        startTime: '09:00',
        endTime: '10:30',
        duration: 90,
        status: 'CONFIRMED',
        paymentStatus: 'completed',
        paymentType: 'ONLINE_FULL',
        price: 40000,
        playerName: players[3].name,
        playerEmail: players[3].email,
        playerPhone: players[3].phone,
        totalPlayers: 2,
        notes: 'Clase particular',
        courtId: courts[3].id,
        clubId: club.id,
      },
    })
  )

  // Reserva 5: Cancelada
  bookings.push(
    await prisma.booking.create({
      data: {
        date: tomorrow,
        startTime: '20:00',
        endTime: '21:30',
        duration: 90,
        status: 'CANCELLED',
        paymentStatus: 'cancelled',
        paymentType: 'ONLINE_FULL',
        price: 60000,
        playerName: players[4].name,
        playerEmail: players[4].email,
        playerPhone: players[4].phone,
        totalPlayers: 4,
        cancelledAt: new Date(),
        notes: 'Cancelado por lluvia',
        courtId: courts[4].id,
        clubId: club.id,
      },
    })
  )

  // Más reservas aleatorias
  for (let i = 0; i < 5; i++) {
    const randomPlayer = players[Math.floor(Math.random() * players.length)]
    const randomCourt = courts[Math.floor(Math.random() * courts.length)]
    const randomDate = new Date(today)
    randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 7))
    
    bookings.push(
      await prisma.booking.create({
        data: {
          date: randomDate,
          startTime: `${10 + i * 2}:00`,
          endTime: `${11 + i * 2}:30`,
          duration: 90,
          status: 'CONFIRMED',
          paymentStatus: 'completed',
          paymentType: 'ONLINE_FULL',
          price: 50000,
          playerName: randomPlayer.name,
          playerEmail: randomPlayer.email,
          playerPhone: randomPlayer.phone,
          totalPlayers: 4,
          courtId: randomCourt.id,
          clubId: club.id,
        },
      })
    )
  }

  console.log('✅ Reservas creadas:', bookings.length)

  // Crear pagos divididos para la reserva 2
  if (bookings[1]) {
    const splitPayments = await Promise.all([
      prisma.splitPayment.create({
        data: {
          playerName: players[1].name,
          playerPhone: players[1].phone,
          playerEmail: players[1].email,
          amount: 12500, // $125 MXN
          status: 'completed',
          completedAt: new Date(),
          stripeChargeId: 'ch_test_1',
          bookingId: bookings[1].id,
        },
      }),
      prisma.splitPayment.create({
        data: {
          playerName: players[5].name,
          playerPhone: players[5].phone,
          playerEmail: players[5].email,
          amount: 12500,
          status: 'completed',
          completedAt: new Date(),
          stripeChargeId: 'ch_test_2',
          bookingId: bookings[1].id,
        },
      }),
      prisma.splitPayment.create({
        data: {
          playerName: players[6].name,
          playerPhone: players[6].phone,
          amount: 12500,
          status: 'pending',
          bookingId: bookings[1].id,
        },
      }),
      prisma.splitPayment.create({
        data: {
          playerName: players[7].name,
          playerPhone: players[7].phone,
          amount: 12500,
          status: 'pending',
          bookingId: bookings[1].id,
        },
      }),
    ])

    console.log('✅ Pagos divididos creados:', splitPayments.length)
  }

  // Crear Transacciones
  console.log('💰 Creando transacciones...')
  const transactions = []

  for (const booking of bookings.filter(b => b.paymentStatus === 'completed')) {
    transactions.push(
      await prisma.transaction.create({
        data: {
          clubId: club.id,
          type: 'INCOME',
          category: 'BOOKING',
          amount: booking.price,
          currency: 'MXN',
          description: `Reserva de cancha - ${booking.playerName}`,
          reference: `BOOKING-${booking.id.slice(0, 8)}`,
          bookingId: booking.id,
          date: booking.date,
        },
      })
    )
  }

  console.log('✅ Transacciones creadas:', transactions.length)

  // Generar Notificaciones de WhatsApp de ejemplo
  console.log('📱 Generando notificaciones de WhatsApp...')
  
  // Notificación 1: Confirmación de reserva
  await WhatsAppLinkService.generateLink({
    clubId: club.id,
    notificationType: 'BOOKING_CONFIRMATION',
    playerName: bookings[0].playerName,
    playerPhone: bookings[0].playerPhone,
    bookingId: bookings[0].id,
  })

  // Notificación 2: Solicitud de pago dividido
  if (bookings[1]) {
    await WhatsAppLinkService.generateLink({
      clubId: club.id,
      notificationType: 'SPLIT_PAYMENT_REQUEST',
      playerName: players[6].name,
      playerPhone: players[6].phone,
      bookingId: bookings[1].id,
    })
  }

  // Notificación 3: Recordatorio de pago
  await WhatsAppLinkService.generateLink({
    clubId: club.id,
    notificationType: 'PAYMENT_REMINDER',
    playerName: bookings[2].playerName,
    playerPhone: bookings[2].playerPhone,
    bookingId: bookings[2].id,
  })

  // Notificación 4: Cancelación
  await WhatsAppLinkService.generateLink({
    clubId: club.id,
    notificationType: 'BOOKING_CANCELLATION',
    playerName: bookings[4].playerName,
    playerPhone: bookings[4].playerPhone,
    bookingId: bookings[4].id,
  })

  // Marcar algunas notificaciones como vistas
  const notifications = await prisma.notification.findMany({
    take: 2,
  })

  if (notifications.length > 0) {
    await WhatsAppLinkService.trackLinkClick(notifications[0].id)
  }

  console.log('✅ Notificaciones de WhatsApp generadas')

  // Resumen final
  console.log('\n🎉 Seed mejorado completado exitosamente!')
  console.log('\n📊 Resumen de datos creados:')
  console.log('─────────────────────────────')
  console.log(`✓ ${players.length} jugadores`)
  console.log(`✓ ${courts.length} canchas`)
  console.log(`✓ ${bookings.length} reservas`)
  console.log(`✓ ${transactions.length} transacciones`)
  console.log(`✓ 4 pagos divididos`)
  console.log(`✓ 4+ notificaciones de WhatsApp`)
  
  console.log('\n📝 Credenciales de acceso:')
  console.log('─────────────────────────────')
  console.log('Super Admin:')
  console.log('  Email: admin@padelyzer.com')
    // [REMOVED: Sensitive log for security]
  console.log('\nClub Owner:')
  console.log('  Email: owner@clubpadelpuebla.com')
    // [REMOVED: Sensitive log for security]
  console.log('\nClub Staff:')
  console.log('  Email: staff@clubpadelpuebla.com')
    // [REMOVED: Sensitive log for security]
  console.log('\nStaff Recepción:')
  console.log('  Email: recepcion@clubpadelpuebla.com')
    // [REMOVED: Sensitive log for security]
  
  console.log('\n📱 WhatsApp del Club:')
  console.log(`  Número: ${club.whatsappNumber}`)
  console.log('─────────────────────────────')
  
  console.log('\n🧪 Para probar WhatsApp:')
  console.log('1. Ve a Dashboard → Configuración → WhatsApp')
  console.log('2. Revisa las notificaciones generadas')
  console.log('3. Haz clic en "Abrir" para ver los links de WhatsApp')
  console.log('4. Crea una nueva reserva para ver la generación automática')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })