import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PasswordGenerator } from '../lib/security/password-generator'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting demo seed with complete data...')
  
  // Clean existing data
  console.log('🧹 Cleaning existing data...')
  
  // Clean in safe order to avoid foreign key issues
  try {
    await prisma.notification.deleteMany()
  } catch (e) { console.log('Skipping notification cleanup') }
  
  try {
    await prisma.transaction.deleteMany()
  } catch (e) { console.log('Skipping transaction cleanup') }
  
  try {
    await prisma.splitPayment.deleteMany()
  } catch (e) { console.log('Skipping splitPayment cleanup') }
  
  try {
    await prisma.booking.deleteMany()
  } catch (e) { console.log('Skipping booking cleanup') }
  
  try {
    await prisma.courtSchedule.deleteMany()
  } catch (e) { console.log('Skipping courtSchedule cleanup') }
  
  try {
    await prisma.courtPricing.deleteMany()
  } catch (e) { console.log('Skipping courtPricing cleanup') }
  
  try {
    await prisma.court.deleteMany()
  } catch (e) { console.log('Skipping court cleanup') }
  
  try {
    await prisma.player.deleteMany()
  } catch (e) { console.log('Skipping player cleanup') }
  
  await prisma.user.deleteMany()
  await prisma.club.deleteMany()

  // Create Super Admin
  const passwords = PasswordGenerator.getSeedPasswords()
  const hashedAdminPassword = await bcrypt.hash(passwords.admin, 10)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@padelyzer.com',
      name: 'Super Admin',
      password: hashedAdminPassword,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
    }
  })
  console.log('✅ Super Admin created:', superAdmin.email)

  // Create Demo Club with WhatsApp
  const club = await prisma.club.create({
    data: {
      name: 'Club Padel Elite México',
      slug: 'club-padel-elite',
      description: 'El mejor club de padel en México con canchas de primer nivel',
      address: 'Av. Reforma 123, Polanco',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '11560',
      country: 'México',
      phone: '+525549125610',
      whatsappNumber: '+525549125610', // Your specific WhatsApp number
      email: 'info@clubpadelelite.mx',
      website: 'https://clubpadelelite.mx',
      logo: '/logos/club-elite.png',
      active: true
    }
  })
  console.log('✅ Demo Club created:', club.name)
  console.log('📱 WhatsApp configured:', club.whatsappNumber)

  // Create Club Owner
  const hashedOwnerPassword = await bcrypt.hash(passwords.owner, 10)
  const owner = await prisma.user.create({
    data: {
      email: 'owner@clubpadelelite.mx',
      name: 'Carlos Mendoza',
      password: hashedOwnerPassword,
      role: 'CLUB_OWNER',
      club: { connect: { id: club.id } },
      emailVerified: new Date(),
      phone: '+525551234567'
    }
  })
  console.log('✅ Club Owner created:', owner.email)

  // Create Staff Members
  const hashedStaffPassword = await bcrypt.hash(passwords.staff, 10)
  const staff1 = await prisma.user.create({
    data: {
      email: 'gerente@clubpadelelite.mx',
      name: 'María García',
      password: hashedStaffPassword,
      role: 'CLUB_STAFF',
      club: { connect: { id: club.id } },
      emailVerified: new Date(),
      phone: '+525552345678'
    }
  })

  const staff2 = await prisma.user.create({
    data: {
      email: 'recepcion@clubpadelelite.mx',
      name: 'Juan Pérez',
      password: hashedStaffPassword,
      role: 'CLUB_STAFF',
      club: { connect: { id: club.id } },
      emailVerified: new Date(),
      phone: '+525553456789'
    }
  })
  console.log('✅ Staff members created:', staff1.email, staff2.email)

  // Create 10 Players/Clients
  console.log('👥 Creating 10 clients...')
  const players = []
  const playerData = [
    { name: 'Alejandro Ruiz', email: 'alejandro@gmail.com', phone: '+525551234001', level: 'advanced' },
    { name: 'Beatriz Sánchez', email: 'beatriz@gmail.com', phone: '+525551234002', level: 'intermediate' },
    { name: 'Carlos López', email: 'carlos@gmail.com', phone: '+525551234003', level: 'beginner' },
    { name: 'Diana Martínez', email: 'diana@gmail.com', phone: '+525551234004', level: 'advanced' },
    { name: 'Eduardo Flores', email: 'eduardo@gmail.com', phone: '+525551234005', level: 'intermediate' },
    { name: 'Fernanda Torres', email: 'fernanda@gmail.com', phone: '+525551234006', level: 'advanced' },
    { name: 'Gabriel Hernández', email: 'gabriel@gmail.com', phone: '+525551234007', level: 'beginner' },
    { name: 'Helena Jiménez', email: 'helena@gmail.com', phone: '+525551234008', level: 'intermediate' },
    { name: 'Iván Morales', email: 'ivan@gmail.com', phone: '+525551234009', level: 'advanced' },
    { name: 'Julia Ramírez', email: 'julia@gmail.com', phone: '+525551234010', level: 'intermediate' }
  ]

  for (const data of playerData) {
    const player = await prisma.player.create({
      data: {
        clubId: club.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        level: data.level
      }
    })
    players.push(player)
  }
  console.log('✅ 10 clients created')

  // Create Courts
  console.log('🎾 Creating courts...')
  const courts = []
  const courtData = [
    { 
      name: 'Cancha Central', 
      type: 'panoramic',
      description: 'Cancha panorámica con vista espectacular, iluminación LED profesional'
    },
    { 
      name: 'Cancha 1', 
      type: 'indoor',
      description: 'Cancha cubierta con clima controlado, ideal para cualquier clima'
    },
    { 
      name: 'Cancha 2', 
      type: 'outdoor',
      description: 'Cancha al aire libre con césped sintético de última generación'
    },
    { 
      name: 'Cancha 3', 
      type: 'outdoor',
      description: 'Cancha estándar con excelente mantenimiento'
    },
    { 
      name: 'Cancha VIP', 
      type: 'indoor',
      description: 'Cancha premium con área lounge exclusiva y servicio personalizado'
    }
  ]

  for (const data of courtData) {
    const court = await prisma.court.create({
      data: {
        clubId: club.id,
        name: data.name,
        type: data.type,
        description: data.description,
        features: data.features,
        surface: data.surface,
        status: 'active'
      }
    })
    courts.push(court)
  }
  console.log('✅ 5 courts created')

  // Create Court Schedules
  console.log('📅 Creating court schedules...')
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  
  for (const court of courts) {
    for (const day of daysOfWeek) {
      await prisma.courtSchedule.create({
        data: {
          courtId: court.id,
          dayOfWeek: day,
          openTime: day === 'saturday' || day === 'sunday' ? '07:00' : '06:00',
          closeTime: day === 'sunday' ? '21:00' : (day === 'saturday' ? '22:00' : '23:00'),
          slotDuration: 90 // 90 minutes per slot
        }
      })
    }
  }
  console.log('✅ Court schedules created')

  // Create Pricing Configuration
  console.log('💰 Creating pricing configuration...')
  const pricingData = [
    // Peak hours (evenings and weekends)
    {
      name: 'Tarifa Premium',
      description: 'Horario estelar - Noches y fines de semana',
      basePrice: 80000, // $800 MXN
      timeRanges: [
        { start: '18:00', end: '22:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
        { start: '09:00', end: '14:00', days: ['saturday', 'sunday'] },
        { start: '17:00', end: '21:00', days: ['saturday', 'sunday'] }
      ]
    },
    // Regular hours
    {
      name: 'Tarifa Regular',
      description: 'Horario normal',
      basePrice: 60000, // $600 MXN
      timeRanges: [
        { start: '09:00', end: '18:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
        { start: '14:00', end: '17:00', days: ['saturday', 'sunday'] }
      ]
    },
    // Off-peak hours (early morning)
    {
      name: 'Tarifa Matutina',
      description: 'Madrugadores - 20% descuento',
      basePrice: 48000, // $480 MXN
      timeRanges: [
        { start: '06:00', end: '09:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
        { start: '07:00', end: '09:00', days: ['saturday', 'sunday'] }
      ]
    }
  ]

  for (const court of courts) {
    for (const pricing of pricingData) {
      // VIP court has 25% premium
      const courtMultiplier = court.name === 'Cancha VIP' ? 1.25 : 
                            court.name === 'Cancha Central' ? 1.15 : 1.0
      
      await prisma.courtPricing.create({
        data: {
          courtId: court.id,
          name: `${pricing.name} - ${court.name}`,
          description: pricing.description,
          basePrice: Math.round(pricing.basePrice * courtMultiplier),
          currency: 'MXN',
          timeRanges: pricing.timeRanges,
          priority: pricingData.indexOf(pricing)
        }
      })
    }
  }
  console.log('✅ Pricing configuration created')

  // Create Bookings with variety
  console.log('📅 Creating bookings...')
  const bookings = []
  const today = new Date()
  
  for (let i = 0; i < 15; i++) {
    const player = players[Math.floor(Math.random() * players.length)]
    const court = courts[Math.floor(Math.random() * courts.length)]
    
    // Mix of past and future bookings
    const daysOffset = Math.floor(Math.random() * 30) - 10 // -10 to +20 days
    const bookingDate = new Date(today)
    bookingDate.setDate(bookingDate.getDate() + daysOffset)
    
    const hours = [8, 10, 12, 14, 16, 18, 20]
    const startHour = hours[Math.floor(Math.random() * hours.length)]
    const startTime = `${startHour.toString().padStart(2, '0')}:00`
    const endTime = `${(startHour + 1).toString().padStart(2, '0')}:30`
    
    // Determine price based on time
    const price = startHour >= 18 ? 80000 : 
                 startHour <= 9 ? 48000 : 60000
    
    const paymentStatus = daysOffset < 0 ? 'completed' : 
                         (Math.random() > 0.3 ? 'pending' : 'completed')
    
    const booking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: court.id,
        playerId: player.id,
        playerName: player.name,
        playerEmail: player.email,
        playerPhone: player.phone,
        date: bookingDate,
        startTime,
        endTime,
        price,
        status: daysOffset < 0 ? 'completed' : 'confirmed',
        paymentStatus,
        paymentType: Math.random() > 0.5 ? 'ONLINE' : 'ONSITE',
        notes: i % 3 === 0 ? 'Cliente frecuente, aplicar descuento del 10%' : null,
        metadata: {
          source: 'web',
          deviceType: 'desktop',
          userAgent: 'Chrome/120.0'
        }
      }
    })
    bookings.push(booking)
  }
  console.log('✅ 15 bookings created')

  // Create Split Payments for some bookings
  console.log('💳 Creating split payments...')
  const splitPaymentBookings = bookings.filter(b => b.paymentStatus === 'pending').slice(0, 5)
  
  for (const booking of splitPaymentBookings) {
    const numPlayers = Math.floor(Math.random() * 3) + 2 // 2-4 players
    const amountPerPlayer = Math.floor(booking.price / numPlayers)
    
    for (let i = 0; i < numPlayers; i++) {
      const player = players[Math.floor(Math.random() * players.length)]
      await prisma.splitPayment.create({
        data: {
          bookingId: booking.id,
          playerName: i === 0 ? booking.playerName : player.name,
          playerEmail: i === 0 ? booking.playerEmail : player.email,
          playerPhone: i === 0 ? booking.playerPhone : player.phone,
          amount: amountPerPlayer,
          status: Math.random() > 0.5 ? 'completed' : 'pending',
          paymentMethod: 'card',
          metadata: {
            splitNumber: i + 1,
            totalSplits: numPlayers
          }
        }
      })
    }
  }
  console.log('✅ Split payments created')

  // Create Transactions
  console.log('💰 Creating transactions...')
  const completedBookings = bookings.filter(b => b.paymentStatus === 'completed')
  
  for (const booking of completedBookings) {
    await prisma.transaction.create({
      data: {
        clubId: club.id,
        bookingId: booking.id,
        playerId: booking.playerId,
        type: 'payment',
        amount: booking.price,
        status: 'completed',
        paymentMethod: 'card',
        reference: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        description: `Pago por reserva de ${booking.playerName}`,
        metadata: {
          courtName: courts.find(c => c.id === booking.courtId)?.name,
          bookingDate: booking.date.toISOString(),
          bookingTime: booking.startTime
        }
      }
    })
  }
  console.log('✅ Transactions created')

  // Create WhatsApp Notifications with the new number
  console.log('📱 Generating WhatsApp notifications...')
  const { WhatsAppLinkService } = await import('../lib/services/whatsapp-link-service')
  
  // Create notifications for recent bookings
  const recentBookings = bookings.filter(b => b.date >= today).slice(0, 5)
  
  for (const booking of recentBookings) {
    // Booking confirmation
    await WhatsAppLinkService.sendBookingConfirmation(booking.id)
    
    // Payment reminder for pending payments
    if (booking.paymentStatus === 'pending') {
      const message = 
        `💰 Recordatorio de Pago\n\n` +
        `Hola ${booking.playerName}!\n\n` +
        `Tienes un pago pendiente de $${(booking.price / 100).toFixed(2)} MXN\n` +
        `Para tu reserva del ${booking.date.toLocaleDateString('es-MX')}\n\n` +
        `Completa tu pago en: ${process.env.NEXT_PUBLIC_APP_URL}/pay/${booking.id}`

      await WhatsAppLinkService.generateLink({
        clubId: club.id,
        notificationType: 'PAYMENT_REMINDER',
        playerName: booking.playerName,
        playerPhone: booking.playerPhone,
        bookingId: booking.id,
        message
      })
    }
  }
  console.log('✅ WhatsApp notifications generated')

  // Create Notification Templates
  console.log('📝 Creating notification templates...')
  const templates = [
    {
      name: 'Confirmación Estándar',
      type: 'BOOKING_CONFIRMATION',
      body: '¡Hola {playerName}! 🎾\n\nTu reserva en {clubName} ha sido confirmada:\n\n📅 Fecha: {bookingDate}\n⏰ Hora: {bookingTime}\n🏟️ Cancha: {courtName}\n💰 Total: ${totalPrice} MXN\n\n¡Te esperamos!\n\n📱 WhatsApp del club: +525549125610'
    },
    {
      name: 'Recordatorio 24h',
      type: 'BOOKING_REMINDER',
      body: '⏰ ¡{playerName}, mañana juegas!\n\n📅 {bookingDate}\n⏰ {bookingTime}\n🏟️ {courtName}\n📍 {clubName}\n\n¿Necesitas cancelar o modificar? Contáctanos: +525549125610'
    },
    {
      name: 'Pago Pendiente',
      type: 'PAYMENT_REMINDER',
      body: '💰 {playerName}, tienes un pago pendiente\n\nMonto: ${amount} MXN\nReserva: {bookingDate} - {bookingTime}\n\nCompleta tu pago aquí: {paymentLink}\n\n⚠️ Tu reserva será cancelada si no se recibe el pago 2 horas antes del juego.'
    }
  ]

  for (const template of templates) {
    await prisma.notificationTemplate.create({
      data: {
        clubId: club.id,
        name: template.name,
        type: template.type as any,
        body: template.body,
        active: true,
        isDefault: true,
        variables: {
          playerName: 'Nombre del jugador',
          clubName: 'Nombre del club',
          bookingDate: 'Fecha de reserva',
          bookingTime: 'Hora de reserva',
          courtName: 'Nombre de la cancha',
          totalPrice: 'Precio total',
          amount: 'Monto a pagar',
          paymentLink: 'Link de pago'
        }
      }
    })
  }
  console.log('✅ Notification templates created')

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('🎉 Demo seed completed successfully!')
  console.log('='.repeat(50))
  
  console.log('\n📊 Summary of created data:')
  console.log('─'.repeat(30))
  console.log(`✓ ${players.length} clients`)
  console.log(`✓ ${courts.length} courts with schedules`)
  console.log(`✓ ${bookings.length} bookings`)
  console.log(`✓ Multiple split payments`)
  console.log(`✓ Transactions recorded`)
  console.log(`✓ WhatsApp notifications generated`)
  console.log(`✓ Notification templates configured`)
  
  console.log('\n📝 Login Credentials:')
  console.log('─'.repeat(30))
  console.log('Super Admin:')
  console.log('  Email: admin@padelyzer.com')
    // [REMOVED: Sensitive log for security]
  console.log('')
  console.log('Club Owner:')
  console.log('  Email: owner@clubpadelelite.mx')
    // [REMOVED: Sensitive log for security]
  console.log('')
  console.log('Manager:')
  console.log('  Email: gerente@clubpadelelite.mx')
    // [REMOVED: Sensitive log for security]
  console.log('')
  console.log('Reception:')
  console.log('  Email: recepcion@clubpadelelite.mx')
    // [REMOVED: Sensitive log for security]
  
  console.log('\n📱 WhatsApp Configuration:')
  console.log('─'.repeat(30))
  console.log(`Club WhatsApp: ${club.whatsappNumber}`)
  console.log('Ready to receive messages!')
  
  console.log('\n💳 Payment Configuration:')
  console.log('─'.repeat(30))
  console.log('✓ Split payments enabled')
  console.log('✓ Online payments configured')
  console.log('✓ Multiple pricing tiers active')
  console.log('  - Premium: $800 MXN (nights/weekends)')
  console.log('  - Regular: $600 MXN (normal hours)')
  console.log('  - Morning: $480 MXN (early bird discount)')
  
  console.log('\n🚀 Ready to test at: http://localhost:3002')
  console.log('─'.repeat(30))
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })