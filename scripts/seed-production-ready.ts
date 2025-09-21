#!/usr/bin/env tsx

/**
 * Script de Seed COMPLETO para Base de Datos de Desarrollo
 * 
 * 🎯 CARACTERÍSTICAS INCLUIDAS:
 * - Club principal con configuración completa
 * - 10 usuarios mexicanos con datos realistas
 * - 5 canchas configuradas ($500/hora)
 * - Stripe configurado automáticamente con claves de prueba
 * - TODOS los métodos de pago activados (Stripe, Efectivo, Transferencia, Terminal)
 * - Sistema de instructores individuales (por hora y mensual)
 * - Precios configurados para clases (individual, grupal, clínica)
 * - Transacciones de ejemplo
 * - Usuario administrador
 * 
 * 💻 USO: 
 *   npm run seed:complete
 *   o
 *   npx tsx scripts/seed-production-ready.ts
 * 
 * ⚠️  ATENCIÓN: Este script BORRA TODOS los datos existentes
 */

import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'

const prisma = new PrismaClient()

// Configuración del Club y Stripe
const CLUB_CONFIG = {
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
  description: 'El mejor club de pádel en Ciudad de México. Instalaciones de primera clase con tecnología moderna.'
}

// Claves Stripe de Prueba
const STRIPE_CONFIG = {
  publishableKey: 'pk_test_51RpHFZIyZijLvZlA2a1KdaWBtERNev1m0y01jDOPYJ7cicby1jomAZlDI1bkFkaWGJlUWPAjU1AZvmUgUTZJPyLl00GSJeNbyV',
  secretKey: 'sk_test_51RpHFZIyZijLvZlA0aBTkhZsZqiXtIwBErPU4vw2G3jyWriUJBKKPo0kM3Sh03oWXgvXQ99hFp7DJksAhYmDpBZn00Z1Tv3g6w',
  environment: 'test'
}

// Base URL de la aplicación
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'

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

const PADEL_LEVELS = ['Principiante', 'Intermedio', 'Avanzado', 'Profesional']
const GENDERS = ['male', 'female']

async function clearDatabase() {
  console.log('🧹 Limpiando base de datos...')
  
  // Delete in correct order due to foreign key constraints
  await prisma.paymentProvider.deleteMany()
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
      ...CLUB_CONFIG,
      active: true,
      status: 'APPROVED',
      // Stripe Configuration
      stripeAccountId: 'acct_test_padel_mexico',
      stripeOnboardingCompleted: true,
      stripePayoutsEnabled: true,
      stripeChargesEnabled: true,
      stripeDetailsSubmitted: true,
      stripeCommissionRate: 2.9 // 2.9% commission
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
      slotDuration: 90,
      bufferTime: 15,
      advanceBookingDays: 30,
      allowSameDayBooking: true,
      timezone: 'America/Mexico_City',
      currency: 'MXN',
      taxIncluded: true,
      taxRate: 16.0, // 16% IVA México
      cancellationFee: 0.0,
      noShowFee: 50.0,
      // Todos los métodos de pago activados
      acceptCash: true,
      terminalEnabled: true,
      terminalId: 'TERM_001_PADEL_MX',
      transferEnabled: true,
      bankName: 'BBVA México',
      accountNumber: '0123456789',
      clabe: '012180001234567890',
      accountHolder: 'Club Pádel México S.A. de C.V.'
    }
  })
  
  console.log('✅ Settings configurados: Todos los métodos de pago activados')
  return settings
}

async function createStripeProvider(clubId: string) {
  console.log('💳 Configurando proveedor Stripe...')
  
  const stripeProvider = await prisma.paymentProvider.create({
    data: {
      clubId: clubId,
      providerId: 'stripe',
      name: 'Stripe',
      enabled: true,
      config: {
        publicKey: STRIPE_CONFIG.publishableKey,
        secretKey: STRIPE_CONFIG.secretKey,
        environment: STRIPE_CONFIG.environment
      },
      fees: {
        fixed: 30, // 30 centavos
        percentage: 2.9 // 2.9%
      }
    }
  })
  
  console.log('✅ Stripe configurado con claves de prueba')
  return stripeProvider
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
        indoor: i < 2, // Primeras 2 canchas techadas
        order: i + 1,
        active: true
      }
    })
    courts.push(court)
    console.log(`✅ ${court.name} creada (${court.indoor ? 'Techada' : 'Al aire libre'})`)
  }
  
  return courts
}

async function createPricing(clubId: string) {
  console.log('💰 Configurando precios...')
  
  const pricing = await prisma.classPricing.create({
    data: {
      clubId: clubId,
      // Precios de clases (en centavos)
      individualPrice: 80000, // $800 MXN
      groupPrice: 50000,      // $500 MXN por persona
      clinicPrice: 35000,     // $350 MXN por persona
      // Configuración global de instructores
      instructorPaymentType: 'HOURLY',
      instructorHourlyRate: 50000, // $500 MXN por hora
      instructorPercentage: 60.0,
      instructorFixedRate: 0,
      // Descuentos por volumen
      enableBulkDiscount: true,
      bulkDiscountThreshold: 10,
      bulkDiscountPercentage: 15.0
    }
  })
  
  console.log('✅ Precios configurados: $800 individual, $500 grupo, $350 clínica')
  return pricing
}

async function createUsers(clubId: string) {
  console.log('👥 Creando 10 usuarios mexicanos...')
  
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
        phoneVerified: Math.random() > 0.3,
        birthDate: new Date(1985 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        level: level,
        gender: gender,
        clientNumber: `PAD${String(i + 1).padStart(3, '0')}`,
        memberSince: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        totalBookings: Math.floor(Math.random() * 50),
        totalSpent: Math.floor(Math.random() * 50000) * 100,
        active: true
      }
    })
    
    users.push(player)
    console.log(`✅ ${player.name} - ${player.level} (${player.clientNumber})`)
  }
  
  console.log(`✅ ${users.length} usuarios creados`)
  return users
}

async function createInstructors(clubId: string) {
  console.log('🎓 Creando instructores (pago individual: por hora y mensual)...')
  
  const instructorsData = [
    {
      name: 'Roberto Sánchez',
      email: 'roberto.sanchez@clubpadel.mx',
      phone: '55 1111 2222',
      bio: 'Instructor certificado con 8 años de experiencia. Especializado en técnica y táctica avanzada.',
      specialties: ['Técnica', 'Táctica', 'Competición'],
      paymentType: 'HOURLY',
      hourlyRate: 60000, // $600/hora
      monthlyRate: 0
    },
    {
      name: 'Patricia Morales',
      email: 'patricia.morales@clubpadel.mx',
      phone: '55 3333 4444',
      bio: 'Ex-jugadora profesional. Enfoque en desarrollo de principiantes y técnica fundamental.',
      specialties: ['Principiantes', 'Técnica básica', 'Coordinación'],
      paymentType: 'MONTHLY',
      hourlyRate: 0,
      monthlyRate: 2500000 // $25,000 mensual
    },
    {
      name: 'Fernando Castillo',
      email: 'fernando.castillo@clubpadel.mx',
      phone: '55 5555 6666',
      bio: 'Especialista en preparación física y entrenamiento de alto rendimiento.',
      specialties: ['Preparación física', 'Alto rendimiento', 'Competición'],
      paymentType: 'HOURLY',
      hourlyRate: 55000, // $550/hora
      monthlyRate: 0
    },
    {
      name: 'Andrea Vázquez',
      email: 'andrea.vazquez@clubpadel.mx',
      phone: '55 7777 8888',
      bio: 'Instructora especializada en clínicas y entrenamientos grupales.',
      specialties: ['Clínicas', 'Grupos', 'Técnica intermedia'],
      paymentType: 'MONTHLY',
      hourlyRate: 0,
      monthlyRate: 2000000 // $20,000 mensual
    }
  ]
  
  const instructors = []
  
  for (const data of instructorsData) {
    const instructor = await prisma.classInstructor.create({
      data: {
        clubId: clubId,
        ...data,
        active: true
      }
    })
    
    instructors.push(instructor)
    const paymentDisplay = instructor.paymentType === 'HOURLY' 
      ? `$${instructor.hourlyRate/100}/hora` 
      : `$${instructor.monthlyRate/100}/mes`
    console.log(`✅ ${instructor.name} - ${paymentDisplay}`)
  }
  
  return instructors
}

async function createSampleTransactions(clubId: string, players: any[]) {
  console.log('💳 Creando transacciones de ejemplo...')
  
  const transactions = []
  const currentDate = new Date()
  
  // Ingresos de ejemplo
  for (let i = 0; i < 15; i++) {
    const randomPlayer = players[Math.floor(Math.random() * players.length)]
    const amount = [80000, 50000, 35000][Math.floor(Math.random() * 3)]
    const category = ['BOOKING', 'CLASS', 'MEMBERSHIP'][Math.floor(Math.random() * 3)]
    
    const transaction = await prisma.transaction.create({
      data: {
        clubId: clubId,
        type: 'INCOME',
        category: category,
        amount: amount,
        currency: 'MXN',
        description: `Pago de ${randomPlayer.name} - ${category === 'CLASS' ? 'Clase de pádel' : category === 'BOOKING' ? 'Reserva de cancha' : 'Membresía'}`,
        date: new Date(currentDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        reference: `TXN-${Date.now()}-${i}`,
        playerId: randomPlayer.id
      }
    })
    
    transactions.push(transaction)
  }
  
  // Gastos de ejemplo
  const expenseCategories = ['MAINTENANCE', 'UTILITIES', 'EQUIPMENT', 'MARKETING']
  for (let i = 0; i < 8; i++) {
    const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
    const amount = Math.floor(Math.random() * 10000 + 2000) * 100
    
    const transaction = await prisma.transaction.create({
      data: {
        clubId: clubId,
        type: 'EXPENSE',
        category: category,
        amount: amount,
        currency: 'MXN',
        description: `Gasto de ${category.toLowerCase()} - ${new Date().toLocaleDateString('es-MX', { month: 'long' })}`,
        date: new Date(currentDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        reference: `EXP-${Date.now()}-${i}`
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
      active: true
    }
  })
  
  console.log(`✅ Usuario admin creado: ${adminUser.email}`)
  return adminUser
}

async function main() {
  console.log('🚀 INICIANDO SEED COMPLETO Y LISTO PARA PRODUCCIÓN')
  console.log('=' .repeat(80))
  console.log('')
  console.log('📦 CONTENIDO DEL SEED:')
  console.log('  🏢 Club completo con configuración mexicana')
  console.log('  👥 10 usuarios con nombres mexicanos')
  console.log('  🎾 5 canchas ($500/hora)')
  console.log('  💳 Stripe configurado automáticamente')
  console.log('  💰 TODOS los métodos de pago activados')
  console.log('  🎓 Sistema de instructores individual (por hora/mensual)')
  console.log('  📊 Transacciones de ejemplo')
  console.log('  👨‍💼 Usuario administrador')
  console.log('')
  console.log('⚠️  ATENCIÓN: Este proceso BORRARÁ todos los datos existentes')
  console.log('')
  
  // Pequeña pausa para que el usuario pueda leer
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  try {
    // 1. Limpiar base de datos
    await clearDatabase()
    
    // 2. Crear entidades principales
    const club = await createClub()
    const settings = await createClubSettings(club.id)
    const stripeProvider = await createStripeProvider(club.id)
    const courts = await createCourts(club.id)
    const pricing = await createPricing(club.id)
    const users = await createUsers(club.id)
    const instructors = await createInstructors(club.id)
    const transactions = await createSampleTransactions(club.id, users)
    const adminUser = await createAdminUser(club.id)
    
    console.log('')
    console.log('=' .repeat(80))
    console.log('🎉 ¡SEED COMPLETADO EXITOSAMENTE!')
    console.log('')
    console.log('📊 RESUMEN COMPLETO:')
    console.log(`🏢 Club: ${club.name}`)
    console.log(`🎾 Canchas: ${courts.length} (2 techadas, 3 al aire libre)`)
    console.log(`👥 Usuarios: ${users.length} (nombres mexicanos)`)
    console.log(`🎓 Instructores: ${instructors.length} (2 por hora, 2 mensual)`)
    console.log(`💳 Transacciones: ${transactions.length}`)
    console.log(`👨‍💼 Admin: ${adminUser.email}`)
    console.log('')
    console.log('💳 STRIPE CONFIGURADO:')
    console.log(`📝 Publishable: ${STRIPE_CONFIG.publishableKey}`)
    console.log(`🔐 Secret: ${STRIPE_CONFIG.secretKey.substring(0, 20)}...`)
    console.log(`🌍 Environment: ${STRIPE_CONFIG.environment}`)
    console.log('')
    console.log('💰 MÉTODOS DE PAGO ACTIVADOS:')
    console.log('✅ Stripe (Tarjetas de crédito/débito)')
    console.log('✅ Efectivo')
    console.log('✅ Transferencia bancaria (BBVA México)')
    console.log('✅ Terminal POS (TERM_001_PADEL_MX)')
    console.log('')
    console.log('🎓 INSTRUCTORES CON PAGO INDIVIDUAL:')
    instructors.forEach(inst => {
      const payment = inst.paymentType === 'HOURLY' 
        ? `$${inst.hourlyRate/100}/hora` 
        : `$${inst.monthlyRate/100}/mes`
      console.log(`   👨‍🏫 ${inst.name} - ${payment}`)
    })
    console.log('')
    console.log('🏦 DATOS BANCARIOS CONFIGURADOS:')
    console.log('   🏛️  Banco: BBVA México')
    console.log('   📄 Cuenta: 0123456789')
    console.log('   🔢 CLABE: 012180001234567890')
    console.log('   📋 Titular: Club Pádel México S.A. de C.V.')
    console.log('')
    console.log('🚀 ¡TU APLICACIÓN ESTÁ LISTA!')
    console.log(`🔗 ${APP_URL}`)
    console.log('')
    console.log('💡 PRÓXIMOS PASOS:')
    console.log('   1. Acceder a la aplicación')
    console.log('   2. Probar reservas con diferentes métodos de pago')
    console.log('   3. Crear clases y probar sistema de instructores')
    console.log('   4. Verificar dashboard financiero')
    console.log('')
    console.log('📧 CREDENCIALES ADMIN:')
    console.log(`   Email: ${adminUser.email}`)
    console.log('   (No password - desarrollo)')
    console.log('')
    console.log('=' .repeat(80))
    
  } catch (error) {
    console.error('')
    console.error('❌ ERROR DURANTE EL SEED:')
    console.error(error)
    console.error('')
    console.error('💡 Si encuentras errores de base de datos:')
    console.error('   1. Verifica que PostgreSQL esté ejecutándose')
    console.error('   2. Ejecuta: npm run db:reset')
    console.error('   3. Vuelve a intentar este seed')
    console.error('')
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el seed
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}

export default main