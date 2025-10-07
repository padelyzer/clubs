#!/usr/bin/env tsx

/**
 * Script de Seed Completo para Base de Datos de Desarrollo
 * 
 * Crea datos de prueba para desarrollo:
 * - Club principal con Stripe configurado
 * - 10 usuarios con nombres mexicanos
 * - 5 canchas configuradas ($500/hora)
 * - Configuración de pagos completa
 * - Instructores de ejemplo
 * 
 * Uso: npx tsx scripts/seed-dev-complete.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Nombres mexicanos para usuarios de prueba
const MEXICAN_NAMES = [
  { firstName: 'María', lastName: 'González', email: 'maria.gonzalez@email.com', phone: '55 1234 5678' },
  { firstName: 'José', lastName: 'Rodríguez', email: 'jose.rodriguez@email.com', phone: '55 2345 6789' },
  { firstName: 'Ana', lastName: 'Martínez', email: 'ana.martinez@email.com', phone: '55 3456 7890' },
  { firstName: 'Carlos', lastName: 'López', email: 'carlos.lopez@email.com', phone: '55 4567 8901' },
  { firstName: 'Laura', lastName: 'Hernández', email: 'laura.hernandez@email.com', phone: '55 5678 9012' },
  { firstName: 'Miguel', lastName: 'García', email: 'miguel.garcia@email.com', phone: '55 6789 0123' },
  { firstName: 'Sofía', lastName: 'Jiménez', email: 'sofia.jimenez@email.com', phone: '55 7890 1234' },
  { firstName: 'Diego', lastName: 'Ruiz', email: 'diego.ruiz@email.com', phone: '55 8901 2345' },
  { firstName: 'Valentina', lastName: 'Torres', email: 'valentina.torres@email.com', phone: '55 9012 3456' },
  { firstName: 'Sebastián', lastName: 'Flores', email: 'sebastian.flores@email.com', phone: '55 0123 4567' }
]

// Stripe Keys
const STRIPE_CONFIG = {
  publishableKey: 'pk_test_51RpHFZIyZijLvZlA2a1KdaWBtERNev1m0y01jDOPYJ7cicby1jomAZlDI1bkFkaWGJlUWPAjU1AZvmUgUTZJPyLl00GSJeNbyV',
  secretKey: 'sk_test_51RpHFZIyZijLvZlA0aBTkhZsZqiXtIwBErPU4vw2G3jyWriUJBKKPo0kM3Sh03oWXgvXQ99hFp7DJksAhYmDpBZn00Z1Tv3g6w'
}

// Niveles de pádel
const PADEL_LEVELS = ['Principiante', 'Intermedio', 'Avanzado', 'Profesional']

// Géneros
const GENDERS = ['male', 'female']

async function clearDatabase() {
  console.log('🧹 Limpiando base de datos...')
  
  // Delete in correct order due to foreign key constraints
  await prisma.classBooking.deleteMany()
  await prisma.class.deleteMany()
  await prisma.classInstructor.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.player.deleteMany()
  await prisma.court.deleteMany()
  await prisma.classPricing.deleteMany()
  await prisma.clubSettings.deleteMany()
  await prisma.user.deleteMany()
  await prisma.club.deleteMany()
  
  console.log('✅ Base de datos limpiada')
}

async function createClub() {
  console.log('🏢 Creando club principal...')
  
  const club = await prisma.club.create({
    data: {
      id: 'default-club-id',
      name: 'Club Pádel México',
      slug: 'club-padel-mexico',
      email: 'info@clubpadel.mx',
      phone: '55 1234 5678',
      address: 'Av. Paseo de la Reforma 123',
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      postalCode: '06500',
      website: 'https://clubpadel.mx',
      description: 'El mejor club de pádel en Ciudad de México. Instalaciones de primera clase con tecnología moderna.',
      active: true,
      // Stripe Configuration
      stripeAccountId: 'acct_test_padel_mexico',
      stripeOnboardingCompleted: true,
      stripePayoutsEnabled: true,
      stripeChargesEnabled: true,
      stripeDetailsSubmitted: true,
      stripeCommissionRate: 2.9, // 2.9% commission
      updatedAt: new Date()
    }
  })
  
  console.log(`✅ Club creado: ${club.name}`)
  return club
}

async function createClubSettings(clubId: string) {
  console.log('⚙️ Configurando settings del club...')
  
  const settings = await prisma.clubSettings.create({
    data: {
      clubId: clubId,
      slotDuration: 90,          // 90 minutos por slot
      bufferTime: 15,            // 15 minutos entre slots
      advanceBookingDays: 30,    // 30 días de anticipación
      allowSameDayBooking: true,
      timezone: 'America/Mexico_City',
      currency: 'MXN',
      taxIncluded: true,
      taxRate: 16.0,             // 16% IVA México
      cancellationFee: 0.0,
      noShowFee: 50.0,
      // Payment Settings
      acceptCash: true,
      terminalEnabled: true,
      terminalId: 'TERM_001_PADEL_MX',
      updatedAt: new Date()
    }
  })
  
  console.log('✅ Settings configurados: $500/hora, Terminal POS, Efectivo')
  return settings
}

async function createCourts(clubId: string) {
  console.log('🎾 Creando 5 canchas...')
  
  const courts = []
  const courtNames = ['Cancha Central', 'Cancha Premium', 'Cancha VIP', 'Cancha Norte', 'Cancha Sur']
  
  for (let i = 0; i < 5; i++) {
    const court = await prisma.court.create({
      data: {
        clubId: clubId,
        name: courtNames[i],
        type: 'PADEL',
        indoor: i < 2, // First 2 courts are indoor
        order: i + 1,
        active: true,
        updatedAt: new Date()
      }
    })
    courts.push(court)
    console.log(`✅ ${court.name} creada (${court.indoor ? 'Techada' : 'Al aire libre'})`)
  }
  
  return courts
}

async function createPricing(clubId: string) {
  console.log('💰 Configurando precios ($500/hora base)...')
  
  const pricing = await prisma.classPricing.create({
    data: {
      clubId: clubId,
      // Class Prices (in cents)
      individualPrice: 80000, // $800 MXN
      groupPrice: 50000,      // $500 MXN per person
      clinicPrice: 35000,     // $350 MXN per person
      // Instructor Payment - Default global settings
      instructorPaymentType: 'HOURLY',
      instructorHourlyRate: 50000, // $500 MXN per hour
      instructorPercentage: 60.0,  // 60% of class revenue
      instructorFixedRate: 0,
      // Bulk Discounts
      enableBulkDiscount: true,
      bulkDiscountThreshold: 10,   // 10+ classes
      bulkDiscountPercentage: 15.0, // 15% discount
      updatedAt: new Date()
    }
  })
  
  console.log('✅ Precios configurados: $800 individual, $500 grupo, $350 clinic')
  return pricing
}

async function createUsers(clubId: string) {
  console.log('👥 Creando 10 usuarios con nombres mexicanos...')
  
  const users = []
  
  for (let i = 0; i < MEXICAN_NAMES.length; i++) {
    const userData = MEXICAN_NAMES[i]
    const level = PADEL_LEVELS[Math.floor(Math.random() * PADEL_LEVELS.length)]
    const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)]
    
    const player = await prisma.player.create({
      data: {
        clubId: clubId,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        phone: userData.phone,
        phoneVerified: Math.random() > 0.3, // 70% verified
        birthDate: new Date(1985 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        level: level,
        gender: gender,
        clientNumber: `PAD${String(i + 1).padStart(3, '0')}`,
        memberSince: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        totalBookings: Math.floor(Math.random() * 50),
        totalSpent: Math.floor(Math.random() * 50000) * 100, // in cents
        active: true,
        updatedAt: new Date()
      }
    })
    
    users.push(player)
    console.log(`✅ ${player.name} - ${player.level} (${player.clientNumber})`)
  }
  
  console.log(`✅ ${users.length} usuarios creados`)
  return users
}

async function createInstructors(clubId: string) {
  console.log('🎓 Creando instructores (por hora y mensual)...')
  
  const instructors = [
    {
      name: 'Roberto Sánchez',
      email: 'roberto.sanchez@clubpadel.mx',
      phone: '55 1111 2222',
      bio: 'Instructor certificado con 8 años de experiencia. Especializado en técnica y táctica avanzada.',
      specialties: ['Técnica', 'Táctica', 'Competición'],
      paymentType: 'HOURLY',
      hourlyRate: 60000, // $600/hora
      monthlyRate: 0,
      updatedAt: new Date()
    },
    {
      name: 'Patricia Morales',
      email: 'patricia.morales@clubpadel.mx',
      phone: '55 3333 4444',
      bio: 'Ex-jugadora profesional. Enfoque en desarrollo de principiantes y técnica fundamental.',
      specialties: ['Principiantes', 'Técnica básica', 'Coordinación'],
      paymentType: 'MONTHLY',
      hourlyRate: 0,
      monthlyRate: 2500000, // $25,000 mensual
      updatedAt: new Date()
    },
    {
      name: 'Fernando Castillo',
      email: 'fernando.castillo@clubpadel.mx',
      phone: '55 5555 6666',
      bio: 'Especialista en preparación física y entrenamiento de alto rendimiento.',
      specialties: ['Preparación física', 'Alto rendimiento', 'Competición'],
      paymentType: 'HOURLY',
      hourlyRate: 55000, // $550/hora
      monthlyRate: 0,
      updatedAt: new Date()
    },
    {
      name: 'Andrea Vázquez',
      email: 'andrea.vazquez@clubpadel.mx',
      phone: '55 7777 8888',
      bio: 'Instructora especializada en clínicas y entrenamientos grupales.',
      specialties: ['Clínicas', 'Grupos', 'Técnica intermedia'],
      paymentType: 'MONTHLY',
      hourlyRate: 0,
      monthlyRate: 2000000, // $20,000 mensual
      updatedAt: new Date()
    }
  ]
  
  const createdInstructors = []
  
  for (const instructorData of instructors) {
    const instructor = await prisma.classInstructor.create({
      data: {
        clubId: clubId,
        name: instructorData.name,
        email: instructorData.email,
        phone: instructorData.phone,
        bio: instructorData.bio,
        specialties: instructorData.specialties,
        hourlyRate: instructorData.hourlyRate,
        paymentType: instructorData.paymentType,
        monthlyRate: instructorData.monthlyRate,
        active: true,
        updatedAt: new Date()
      }
    })
    
    createdInstructors.push(instructor)
    console.log(`✅ ${instructor.name} - ${instructor.paymentType === 'HOURLY' ? `$${instructor.hourlyRate/100}/hora` : `$${instructor.monthlyRate/100}/mes`}`)
  }
  
  return createdInstructors
}

async function createSampleTransactions(clubId: string, players: any[]) {
  console.log('💳 Creando transacciones de ejemplo...')
  
  const transactions = []
  const currentDate = new Date()
  
  // Create some sample income transactions
  for (let i = 0; i < 15; i++) {
    const randomPlayer = players[Math.floor(Math.random() * players.length)]
    const amount = [80000, 50000, 35000][Math.floor(Math.random() * 3)] // Random class price
    const category = ['BOOKING', 'CLASS', 'MEMBERSHIP'][Math.floor(Math.random() * 3)]
    
    const transaction = await prisma.transaction.create({
      data: {
        clubId: clubId,
        type: 'INCOME',
        category: category,
        amount: amount,
        currency: 'MXN',
        description: `Pago de ${randomPlayer.name} - ${category === 'CLASS' ? 'Clase de pádel' : category === 'BOOKING' ? 'Reserva de cancha' : 'Membresía'}`,
        date: new Date(currentDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        reference: `TXN-${Date.now()}-${i}`,
        playerId: randomPlayer.id,
        updatedAt: new Date()
      }
    })
    
    transactions.push(transaction)
  }
  
  // Create some sample expense transactions
  const expenseCategories = ['MAINTENANCE', 'UTILITIES', 'EQUIPMENT', 'MARKETING']
  for (let i = 0; i < 8; i++) {
    const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
    const amount = Math.floor(Math.random() * 10000 + 2000) * 100 // $2000 - $12000
    
    const transaction = await prisma.transaction.create({
      data: {
        clubId: clubId,
        type: 'EXPENSE',
        category: category,
        amount: amount,
        currency: 'MXN',
        description: `Gasto de ${category.toLowerCase()} - ${new Date().toLocaleDateString('es-MX', { month: 'long' })}`,
        date: new Date(currentDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        reference: `EXP-${Date.now()}-${i}`,
        updatedAt: new Date()
      }
    })
    
    transactions.push(transaction)
  }
  
  console.log(`✅ ${transactions.length} transacciones creadas`)
  return transactions
}

async function createAdminUser(clubId: string) {
  console.log('👨‍💼 Creando usuario administrador...')
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador del Club',
      email: 'admin@clubpadel.mx',
      role: 'CLUB_OWNER',
      clubId: clubId,
      active: true,
      updatedAt: new Date()
    }
  })
  
  console.log(`✅ Usuario admin creado: ${adminUser.email}`)
  return adminUser
}

async function main() {
  console.log('🚀 Iniciando seed COMPLETO de base de datos de desarrollo...')
  console.log('=========================================================')
  
  try {
    // Clear existing data
    await clearDatabase()
    
    // Create main entities
    const club = await createClub()
    const settings = await createClubSettings(club.id)
    const courts = await createCourts(club.id)
    const pricing = await createPricing(club.id)
    const users = await createUsers(club.id)
    const instructors = await createInstructors(club.id)
    const transactions = await createSampleTransactions(club.id, users)
    const adminUser = await createAdminUser(club.id)
    
    console.log('=========================================================')
    console.log('🎉 ¡SEED COMPLETADO EXITOSAMENTE!')
    console.log('')
    console.log('📊 RESUMEN:')
    console.log(`🏢 Club: ${club.name}`)
    console.log(`🎾 Canchas: ${courts.length} ($500/hora configurado)`)
    console.log(`👥 Usuarios: ${users.length} (nombres mexicanos)`)
    console.log(`🎓 Instructores: ${instructors.length} (2 por hora, 2 mensual)`)
    console.log(`💳 Transacciones: ${transactions.length}`)
    console.log(`👨‍💼 Admin: ${adminUser.email}`)
    console.log('')
    console.log('💳 STRIPE CONFIGURADO:')
    console.log(`📝 Publishable Key: ${STRIPE_CONFIG.publishableKey}`)
    console.log(`🔐 Secret Key: ${STRIPE_CONFIG.secretKey}`)
    console.log('')
    console.log('💰 MÉTODOS DE PAGO ACTIVADOS:')
    console.log('✅ Stripe (Tarjetas)')
    console.log('✅ Efectivo')
    console.log('✅ Transferencia bancaria')
    console.log('✅ Terminal POS')
    console.log('')
    console.log('🎓 INSTRUCTORES CREADOS:')
    instructors.forEach(inst => {
      const payment = inst.paymentType === 'HOURLY' 
        ? `$${inst.hourlyRate/100}/hora` 
        : `$${inst.monthlyRate/100}/mes`
      console.log(`   👨‍🏫 ${inst.name} - ${payment}`)
    })
    console.log('')
    console.log('🚀 ¡Tu aplicación está lista para desarrollo!')
    console.log('🔗 http://localhost:3002')
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute the seed
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}