#!/usr/bin/env tsx

/**
 * Script de Seed para Base de Datos de Desarrollo
 * 
 * Crea datos de prueba para desarrollo:
 * - Club principal con Stripe configurado
 * - 10 usuarios con nombres mexicanos
 * - 5 canchas configuradas ($500/hora)
 * - Configuración de pagos completa
 * - Instructores de ejemplo
 * 
 * Uso: npx tsx scripts/seed-dev-data.ts
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
      currency: 'MXN',
      taxRate: 16.0, // 16% IVA México
      timezone: 'America/Mexico_City',
      // Payment Methods - Todos activados
      stripeEnabled: true,
      cashEnabled: true,
      transferEnabled: true,
      terminalEnabled: true,
      acceptCash: true,
      // Banking Details
      bankName: 'BBVA México',
      accountHolder: 'Club Pádel México S.A. de C.V.',
      accountNumber: '0123456789',
      clabe: '012180001234567890',
      terminalId: 'TERM_001_PADEL_MX'
    }
  })
  
  console.log('✅ Settings configurados con todos los métodos de pago')
  return settings
}

async function createCourts(clubId: string) {
  console.log('🎾 Creando 5 canchas...')
  
  const courts = []
  const courtTypes = ['PADEL', 'PADEL', 'PADEL', 'PADEL', 'PADEL']
  const courtNames = ['Cancha 1', 'Cancha 2', 'Cancha 3', 'Cancha 4', 'Cancha 5']
  
  for (let i = 0; i < 5; i++) {
    const court = await prisma.court.create({
      data: {
        clubId: clubId,
        name: courtNames[i],
        type: courtTypes[i] as any,
        indoor: i < 2, // First 2 courts are indoor
        order: i + 1,
        active: true
      }
    })
    courts.push(court)
    console.log(`✅ ${court.name} creada (${court.indoor ? 'Techada' : 'Al aire libre'})`)
  }
  
  return courts
}

async function createDevClub() {
  console.log('🏢 Creating development club...')
  
  try {
    // Create or update dev club
    const club = await prisma.club.upsert({
      where: { id: 'dev-club-001' },
      update: {},
      create: {
        id: 'dev-club-001',
        name: 'Dev Club',
        slug: 'dev-club',
        description: 'Development test club',
        address: '123 Dev Street',
        phone: '+52 555 0123456',
        email: 'dev@padelyzer.com',
        city: 'Ciudad de México',
        state: 'CDMX',
        country: 'México',
        status: 'APPROVED',
        active: true,
      },
    })
    console.log('✅ Club created:', club.name)

    // Create courts
    const courts = await Promise.all([
      prisma.court.upsert({
        where: { id: 'dev-court-001' },
        update: {},
        create: {
          id: 'dev-court-001',
          clubId: club.id,
          name: 'Cancha Central',
          type: 'PADEL',
          indoor: false,
          order: 1,
          active: true,
        },
      }),
      prisma.court.upsert({
        where: { id: 'dev-court-002' },
        update: {},
        create: {
          id: 'dev-court-002',
          clubId: club.id,
          name: 'Cancha Premium',
          type: 'PADEL',
          indoor: true,
          order: 2,
          active: true,
        },
      }),
    ])
    console.log(`✅ Created ${courts.length} courts`)

    // Create club settings
    const settings = await prisma.clubSettings.upsert({
      where: { clubId: club.id },
      update: {},
      create: {
        clubId: club.id,
        slotDuration: 90,
        bufferTime: 15,
        advanceBookingDays: 30,
        allowSameDayBooking: true,
        currency: 'MXN',
        taxIncluded: true,
        taxRate: 16,
        cancellationFee: 0,
        noShowFee: 50,
      },
    })
    console.log('✅ Club settings created')

    // Create schedule rules (Monday to Sunday, 7am to 10pm)
    const scheduleRules = await Promise.all(
      [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) =>
        prisma.scheduleRule.create({
          data: {
            clubId: club.id,
            name: getDayName(dayOfWeek),
            dayOfWeek,
            startTime: '07:00',
            endTime: '22:00',
            enabled: true,
          },
        })
      )
    )
    console.log(`✅ Created ${scheduleRules.length} schedule rules`)

    // Create price rules
    const priceRules = await Promise.all([
      prisma.priceRule.create({
        data: {
          clubId: club.id,
          name: 'Precio Base',
          type: 'base',
          price: 500,
          conditions: {},
          enabled: true,
        },
      }),
      prisma.priceRule.create({
        data: {
          clubId: club.id,
          name: 'Precio Fin de Semana',
          type: 'weekend',
          price: 700,
          conditions: {
            days: ['Saturday', 'Sunday'],
          },
          enabled: true,
        },
      }),
      prisma.priceRule.create({
        data: {
          clubId: club.id,
          name: 'Precio Hora Pico',
          type: 'peak',
          price: 600,
          conditions: {
            timeStart: '18:00',
            timeEnd: '21:00',
          },
          enabled: true,
        },
      }),
    ])
    console.log(`✅ Created ${priceRules.length} price rules`)

    // Create payment providers
    const paymentProviders = await Promise.all([
      prisma.paymentProvider.upsert({
        where: {
          clubId_providerId: {
            clubId: club.id,
            providerId: 'stripe',
          },
        },
        update: {},
        create: {
          clubId: club.id,
          providerId: 'stripe',
          name: 'Stripe',
          enabled: true,
          config: {
            apiKey: 'sk_test_...',
          },
          fees: {
            percentage: 2.9,
            fixed: 3,
          },
        },
      }),
      prisma.paymentProvider.upsert({
        where: {
          clubId_providerId: {
            clubId: club.id,
            providerId: 'cash',
          },
        },
        update: {},
        create: {
          clubId: club.id,
          providerId: 'cash',
          name: 'Efectivo',
          enabled: true,
          config: {},
          fees: {
            percentage: 0,
            fixed: 0,
          },
        },
      }),
    ])
    console.log(`✅ Created ${paymentProviders.length} payment providers`)

    // Create notification channels
    const notificationChannels = await Promise.all([
      prisma.notificationChannel.upsert({
        where: {
          clubId_channelId: {
            clubId: club.id,
            channelId: 'email',
          },
        },
        update: {},
        create: {
          clubId: club.id,
          channelId: 'email',
          name: 'Email',
          enabled: true,
          config: {
            fromEmail: 'noreply@padelyzer.com',
          },
        },
      }),
      prisma.notificationChannel.upsert({
        where: {
          clubId_channelId: {
            clubId: club.id,
            channelId: 'whatsapp',
          },
        },
        update: {},
        create: {
          clubId: club.id,
          channelId: 'whatsapp',
          name: 'WhatsApp',
          enabled: false,
          config: {
            twilioSid: '',
            twilioToken: '',
          },
        },
      }),
    ])
    console.log(`✅ Created ${notificationChannels.length} notification channels`)

    // Create notification templates
    const notificationTemplates = await Promise.all([
      prisma.notificationTemplate.upsert({
        where: {
          clubId_templateId: {
            clubId: club.id,
            templateId: 'booking_confirmation',
          },
        },
        update: {},
        create: {
          clubId: club.id,
          templateId: 'booking_confirmation',
          name: 'Confirmación de Reserva',
          description: 'Se envía cuando se confirma una reserva',
          channels: ['email'],
          triggers: ['booking_confirmed'],
          subject: 'Reserva Confirmada - {{court_name}}',
          content: 'Tu reserva para {{date}} a las {{time}} ha sido confirmada.',
          variables: ['court_name', 'date', 'time'],
          enabled: true,
        },
      }),
      prisma.notificationTemplate.upsert({
        where: {
          clubId_templateId: {
            clubId: club.id,
            templateId: 'booking_reminder',
          },
        },
        update: {},
        create: {
          clubId: club.id,
          templateId: 'booking_reminder',
          name: 'Recordatorio de Reserva',
          description: 'Se envía 1 hora antes de la reserva',
          channels: ['email', 'whatsapp'],
          triggers: ['booking_reminder'],
          subject: 'Recordatorio: Reserva en 1 hora',
          content: 'Recuerda que tienes una reserva a las {{time}} en {{court_name}}.',
          variables: ['court_name', 'time'],
          enabled: true,
        },
      }),
    ])
    console.log(`✅ Created ${notificationTemplates.length} notification templates`)

    // Create widget settings
    const widgetSettings = await prisma.widgetSettings.upsert({
      where: { clubId: club.id },
      update: {},
      create: {
        clubId: club.id,
        theme: 'light',
        primaryColor: '#10B981',
        language: 'es',
        showLogo: true,
        showPrices: true,
        showAvailability: true,
        allowGuestBooking: false,
        width: '400px',
        height: '600px',
        borderRadius: '12px',
        headerText: 'Reserva tu cancha',
        footerText: 'Powered by Padelyzer',
      },
    })
    console.log('✅ Widget settings created')
    
    return club
  } catch (error) {
    console.error('❌ Error creating dev club:', error)
    throw error
  }
}

async function seedDevData() {
  console.log('🚀 Iniciando seed de datos de desarrollo...')
  
  try {
    await clearDatabase()
    
    const club = await createDevClub()
    console.log('✅ All development data created successfully!')
    
    console.log('🎉 Development data seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

function getDayName(dayOfWeek: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[dayOfWeek]
}

// Run the seed
seedDevData().catch((error) => {
  console.error(error)
  process.exit(1)
})