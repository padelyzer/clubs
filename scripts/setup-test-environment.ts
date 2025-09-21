#!/usr/bin/env tsx

/**
 * Complete Test Environment Setup Script for Padelyzer
 * This script prepares the entire system for exhaustive testing
 */

import { prisma } from '@/lib/config/prisma'
import bcrypt from 'bcryptjs'
import { ClubAdminIntegrationService } from '@/lib/services/club-admin-integration'
import chalk from 'chalk'

// Test credentials that will be created
const TEST_CREDENTIALS = {
  superAdmin: {
    email: 'admin@test.com',
    password: 'Test123!@#',
    name: 'Super Admin Test'
  },
  clubOwner: {
    email: 'owner@test.com', 
    password: 'Test123!@#',
    name: 'Club Owner Test'
  },
  clubStaff: {
    email: 'staff@test.com',
    password: 'Test123!@#',
    name: 'Staff Test'
  },
  player1: {
    email: 'player1@test.com',
    password: 'Test123!@#',
    name: 'Juan Pérez',
    phone: '5551234567'
  },
  player2: {
    email: 'player2@test.com',
    password: 'Test123!@#',
    name: 'María García',
    phone: '5559876543'
  }
}

async function cleanDatabase() {
  console.log(chalk.yellow('🧹 Cleaning database...'))
  
  // Delete in correct order to respect foreign keys
  await prisma.tournamentMatchResult.deleteMany()
  await prisma.tournamentMatch.deleteMany()
  await prisma.tournamentRound.deleteMany()
  await prisma.tournamentRegistration.deleteMany()
  await prisma.tournament.deleteMany()
  
  // Classes not implemented yet - skipping
  // await prisma.classBooking.deleteMany()
  // await prisma.classSchedule.deleteMany()
  // await prisma.class.deleteMany()
  
  await prisma.splitPayment.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.bookingGroup.deleteMany()
  await prisma.court.deleteMany()
  
  await prisma.supportMessage.deleteMany()
  await prisma.supportTicket.deleteMany()
  await prisma.adminNotification.deleteMany()
  await prisma.auditLog.deleteMany()
  
  await prisma.usageRecord.deleteMany()
  await prisma.subscriptionInvoice.deleteMany()
  await prisma.clubSubscription.deleteMany()
  await prisma.subscriptionPlan.deleteMany()
  
  await prisma.whatsAppConsent.deleteMany()
  await prisma.widgetSettings.deleteMany()
  await prisma.clubSettings.deleteMany()
  await prisma.transaction.deleteMany()
  
  await prisma.user.deleteMany()
  await prisma.club.deleteMany()
  
  console.log(chalk.green('✅ Database cleaned'))
}

async function createSubscriptionPlans() {
  console.log(chalk.yellow('📋 Creating subscription plans...'))
  
  const plans = [
    {
      name: 'trial',
      displayName: 'Trial - 14 días',
      description: 'Prueba gratis con todas las funciones',
      price: 0,
      currency: 'MXN',
      interval: 'month',
      features: {
        support: true,
        analytics: true,
        tournaments: true,
        classes: true,
        widget: true
      },
      maxUsers: 5,
      maxCourts: 4,
      maxBookings: 100,
      commissionRate: 0,
      isActive: true,
      sortOrder: 0
    },
    {
      name: 'basico',
      displayName: 'Básico',
      description: 'Para clubes pequeños',
      price: 99900,
      currency: 'MXN',
      interval: 'month',
      features: {
        support: true,
        analytics: true,
        tournaments: false,
        classes: true,
        widget: true
      },
      maxUsers: 10,
      maxCourts: 6,
      maxBookings: 500,
      commissionRate: 300,
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'profesional',
      displayName: 'Profesional',
      description: 'Todas las funciones',
      price: 199900,
      currency: 'MXN',
      interval: 'month',
      features: {
        support: true,
        analytics: true,
        tournaments: true,
        classes: true,
        widget: true,
        api: true
      },
      maxUsers: 25,
      maxCourts: 12,
      maxBookings: 2000,
      commissionRate: 200,
      isActive: true,
      sortOrder: 2
    }
  ]
  
  for (const plan of plans) {
    await prisma.subscriptionPlan.create({ data: plan })
  }
  
  console.log(chalk.green('✅ Subscription plans created'))
}

async function createTestClubs() {
  console.log(chalk.yellow('🏢 Creating test clubs...'))
  
  // Club 1: Approved with trial subscription
  const club1 = await prisma.club.create({
    data: {
      id: 'test-club-approved',
      name: 'Club Padel Puebla Test',
      slug: 'club-padel-puebla-test',
      email: 'club1@test.com',
      phone: '2221234567',
      address: 'Av. Juárez 123, Centro',
      city: 'Puebla',
      state: 'Puebla',
      status: 'APPROVED',
      active: true,
      approvedAt: new Date(),
      approvedBy: 'system',
      updatedAt: new Date()
    }
  })
  
  // Create subscription for approved club
  const trialPlan = await prisma.subscriptionPlan.findFirst({
    where: { name: 'trial' }
  })
  
  if (trialPlan) {
    await prisma.clubSubscription.create({
      data: {
        clubId: club1.id,
        planId: trialPlan.id,
        status: 'TRIALING',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    })
  }
  
  // Club 2: Pending approval
  const club2 = await prisma.club.create({
    data: {
      id: 'test-club-pending',
      name: 'Raqueta Club Test',
      slug: 'raqueta-club-test',
      email: 'club2@test.com',
      phone: '2229876543',
      address: 'Blvd. Atlixco 456',
      city: 'Puebla',
      state: 'Puebla',
      status: 'PENDING',
      active: false,
      updatedAt: new Date()
    }
  })
  
  // Club 3: Rejected
  const club3 = await prisma.club.create({
    data: {
      id: 'test-club-rejected',
      name: 'Sport Center Test',
      slug: 'sport-center-test',
      email: 'club3@test.com',
      phone: '2225551234',
      address: 'Periférico 789',
      city: 'Puebla',
      state: 'Puebla',
      status: 'REJECTED',
      active: false,
      updatedAt: new Date()
      // Note: Rejection reason would be stored in admin logs
    }
  })
  
  console.log(chalk.green('✅ Test clubs created'))
  return { club1, club2, club3 }
}

async function createTestUsers(clubId: string) {
  console.log(chalk.yellow('👥 Creating test users...'))
  
  const hashedPassword = await bcrypt.hash(TEST_CREDENTIALS.superAdmin.password, 10)
  
  // Super Admin
  await prisma.user.create({
    data: {
      id: 'test-user-admin',
      email: TEST_CREDENTIALS.superAdmin.email,
      name: TEST_CREDENTIALS.superAdmin.name,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      active: true,
      updatedAt: new Date()
    }
  })
  
  // Club Owner
  await prisma.user.create({
    data: {
      id: 'test-user-owner',
      email: TEST_CREDENTIALS.clubOwner.email,
      name: TEST_CREDENTIALS.clubOwner.name,
      password: hashedPassword,
      role: 'CLUB_OWNER',
      clubId,
      active: true,
      updatedAt: new Date()
    }
  })
  
  // Club Staff
  await prisma.user.create({
    data: {
      id: 'test-user-staff',
      email: TEST_CREDENTIALS.clubStaff.email,
      name: TEST_CREDENTIALS.clubStaff.name,
      password: hashedPassword,
      role: 'CLUB_STAFF',
      clubId,
      active: true,
      updatedAt: new Date()
    }
  })
  
  // Regular Players
  await prisma.user.create({
    data: {
      id: 'test-user-player1',
      email: TEST_CREDENTIALS.player1.email,
      name: TEST_CREDENTIALS.player1.name,
      password: hashedPassword,
      role: 'USER',
      active: true,
      updatedAt: new Date()
    }
  })
  
  await prisma.user.create({
    data: {
      id: 'test-user-player2',
      email: TEST_CREDENTIALS.player2.email,
      name: TEST_CREDENTIALS.player2.name,
      password: hashedPassword,
      role: 'USER',
      active: true,
      updatedAt: new Date()
    }
  })
  
  console.log(chalk.green('✅ Test users created'))
}

async function createCourts(clubId: string) {
  console.log(chalk.yellow('🎾 Creating courts...'))
  
  const courts = [
    { name: 'Cancha 1', type: 'INDOOR', pricePerHour: 50000, isActive: true },
    { name: 'Cancha 2', type: 'INDOOR', pricePerHour: 50000, isActive: true },
    { name: 'Cancha 3', type: 'OUTDOOR', pricePerHour: 40000, isActive: true },
    { name: 'Cancha 4', type: 'OUTDOOR', pricePerHour: 40000, isActive: true }
  ]
  
  for (const court of courts) {
    await prisma.court.create({
      data: {
        ...court,
        clubId
      }
    })
  }
  
  console.log(chalk.green('✅ Courts created'))
}

async function createSampleBookings(clubId: string) {
  console.log(chalk.yellow('📅 Creating sample bookings...'))
  
  const courts = await prisma.court.findMany({ where: { clubId } })
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Create bookings for next 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(today)
    date.setDate(date.getDate() + day)
    
    for (const court of courts) {
      // Morning booking
      await prisma.booking.create({
        data: {
          date,
          startTime: '09:00',
          endTime: '10:30',
          duration: 90,
          courtId: court.id,
          clubId,
          playerName: TEST_CREDENTIALS.player1.name,
          playerEmail: TEST_CREDENTIALS.player1.email,
          playerPhone: TEST_CREDENTIALS.player1.phone,
          status: day === 0 ? 'CONFIRMED' : 'PENDING',
          totalPrice: court.pricePerHour * 1.5,
          paymentStatus: day === 0 ? 'PAID' : 'PENDING',
          paymentMethod: day === 0 ? 'CARD' : null
        }
      })
      
      // Afternoon booking
      if (day < 3) {
        await prisma.booking.create({
          data: {
            date,
            startTime: '16:00',
            endTime: '17:30',
            duration: 90,
            courtId: court.id,
            clubId,
            playerName: TEST_CREDENTIALS.player2.name,
            playerEmail: TEST_CREDENTIALS.player2.email,
            playerPhone: TEST_CREDENTIALS.player2.phone,
            status: 'CONFIRMED',
            totalPrice: court.pricePerHour * 1.5,
            paymentStatus: 'PAID',
            paymentMethod: 'CASH'
          }
        })
      }
    }
  }
  
  console.log(chalk.green('✅ Sample bookings created'))
}

async function createTestTournament(clubId: string) {
  console.log(chalk.yellow('🏆 Creating test tournament...'))
  
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Torneo Test Eliminación Simple',
      slug: 'torneo-test-eliminacion',
      description: 'Torneo de prueba para testing',
      clubId,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // In 7 days
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // In 14 days
      registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
      format: 'SINGLE_ELIMINATION',
      maxTeams: 16,
      minTeams: 8,
      entryFee: 50000, // $500 MXN
      prizePool: 500000, // $5000 MXN
      categories: ['OPEN', 'B', 'C'],
      rules: {
        setsToWin: 2,
        gamesPerSet: 6,
        tieBreak: true,
        goldenPoint: true
      },
      status: 'DRAFT',
      visibility: 'PUBLIC'
    }
  })
  
  // Add some test registrations
  const registrations = [
    { teamName: 'Equipo Alpha', category: 'OPEN', player1: 'Juan Pérez', player2: 'Pedro López' },
    { teamName: 'Equipo Beta', category: 'OPEN', player1: 'María García', player2: 'Ana Martínez' },
    { teamName: 'Equipo Gamma', category: 'B', player1: 'Carlos Ruiz', player2: 'Luis Fernández' },
    { teamName: 'Equipo Delta', category: 'B', player1: 'Sofia Rodríguez', player2: 'Elena Sánchez' }
  ]
  
  for (const reg of registrations) {
    await prisma.tournamentRegistration.create({
      data: {
        tournamentId: tournament.id,
        ...reg,
        email: `${reg.teamName.toLowerCase().replace(' ', '')}@test.com`,
        phone: '5551234567',
        status: 'CONFIRMED',
        paid: true,
        checkedIn: false
      }
    })
  }
  
  console.log(chalk.green('✅ Test tournament created'))
  return tournament
}

// Classes feature not yet implemented in database - commented out
/*
async function createTestClasses(clubId: string) {
  console.log(chalk.yellow('🎓 Creating test classes...'))
  
  const classes = [
    {
      name: 'Clase Principiantes',
      description: 'Aprende los fundamentos del pádel',
      instructorName: 'Coach Carlos',
      level: 'BEGINNER',
      maxStudents: 8,
      pricePerClass: 30000, // $300 MXN
      duration: 60
    },
    {
      name: 'Clase Intermedio',
      description: 'Mejora tu técnica y estrategia',
      instructorName: 'Coach María',
      level: 'INTERMEDIATE',
      maxStudents: 6,
      pricePerClass: 40000, // $400 MXN
      duration: 90
    }
  ]
  
  for (const classData of classes) {
    const cls = await prisma.class.create({
      data: {
        ...classData,
        clubId,
        isActive: true
      }
    })
    
    // Create weekly schedule
    const days = ['MONDAY', 'WEDNESDAY', 'FRIDAY']
    for (const dayOfWeek of days) {
      await prisma.classSchedule.create({
        data: {
          classId: cls.id,
          dayOfWeek,
          startTime: classData.level === 'BEGINNER' ? '17:00' : '19:00',
          endTime: classData.level === 'BEGINNER' ? '18:00' : '20:30',
          isActive: true
        }
      })
    }
  }
  
  console.log(chalk.green('✅ Test classes created'))
}
*/

async function setupWhatsAppConsents() {
  console.log(chalk.yellow('📱 Setting up WhatsApp consents...'))
  
  await prisma.whatsAppConsent.create({
    data: {
      phoneNumber: TEST_CREDENTIALS.player1.phone,
      playerName: TEST_CREDENTIALS.player1.name,
      email: TEST_CREDENTIALS.player1.email,
      clubId: 'test-club-approved',
      bookingConfirmations: true,
      paymentReminders: true,
      bookingReminders: true,
      promotionalMessages: false,
      generalUpdates: false,
      optInSource: 'booking'
    }
  })
  
  await prisma.whatsAppConsent.create({
    data: {
      phoneNumber: TEST_CREDENTIALS.player2.phone,
      playerName: TEST_CREDENTIALS.player2.name,
      email: TEST_CREDENTIALS.player2.email,
      clubId: 'test-club-approved',
      bookingConfirmations: true,
      paymentReminders: true,
      bookingReminders: true,
      promotionalMessages: true,
      generalUpdates: true,
      optInSource: 'website'
    }
  })
  
  console.log(chalk.green('✅ WhatsApp consents configured'))
}

async function printTestCredentials() {
  console.log('\n' + chalk.bgBlue.white.bold(' TEST CREDENTIALS '))
  console.log(chalk.cyan('═'.repeat(50)))
  
  console.log(chalk.yellow('\n🔑 Super Admin:'))
  console.log(`   Email: ${chalk.green(TEST_CREDENTIALS.superAdmin.email)}`)
  console.log(`   Password: ${chalk.green(TEST_CREDENTIALS.superAdmin.password)}`)
  console.log(`   URL: ${chalk.blue('http://localhost:3000/admin')}`)
  
  console.log(chalk.yellow('\n🏢 Club Owner:'))
  console.log(`   Email: ${chalk.green(TEST_CREDENTIALS.clubOwner.email)}`)
  console.log(`   Password: ${chalk.green(TEST_CREDENTIALS.clubOwner.password)}`)
  console.log(`   URL: ${chalk.blue('http://localhost:3000/dashboard')}`)
  
  console.log(chalk.yellow('\n👤 Club Staff:'))
  console.log(`   Email: ${chalk.green(TEST_CREDENTIALS.clubStaff.email)}`)
  console.log(`   Password: ${chalk.green(TEST_CREDENTIALS.clubStaff.password)}`)
  console.log(`   URL: ${chalk.blue('http://localhost:3000/dashboard')}`)
  
  console.log(chalk.yellow('\n🎾 Players:'))
  console.log(`   Player 1: ${chalk.green(TEST_CREDENTIALS.player1.email)} / ${chalk.green(TEST_CREDENTIALS.player1.password)}`)
  console.log(`   Player 2: ${chalk.green(TEST_CREDENTIALS.player2.email)} / ${chalk.green(TEST_CREDENTIALS.player2.password)}`)
  
  console.log(chalk.cyan('\n═'.repeat(50)))
}

async function main() {
  console.log(chalk.bgMagenta.white.bold('\n 🚀 PADELYZER TEST ENVIRONMENT SETUP \n'))
  
  try {
    // 1. Clean database
    await cleanDatabase()
    
    // 2. Create subscription plans
    await createSubscriptionPlans()
    
    // 3. Create test clubs
    const { club1 } = await createTestClubs()
    
    // 4. Create test users
    await createTestUsers(club1.id)
    
    // 5. Create courts
    await createCourts(club1.id)
    
    // 6. Create sample bookings
    await createSampleBookings(club1.id)
    
    // 7. Create test tournament
    await createTestTournament(club1.id)
    
    // 8. Create test classes - SKIPPED (not yet implemented)
    // await createTestClasses(club1.id)
    
    // 9. Setup WhatsApp consents
    await setupWhatsAppConsents()
    
    // 10. Print credentials
    await printTestCredentials()
    
    console.log(chalk.bgGreen.black.bold('\n ✅ TEST ENVIRONMENT READY! \n'))
    console.log(chalk.yellow('You can now run exhaustive tests with:'))
    console.log(chalk.cyan('  - 3 clubs (approved, pending, rejected)'))
    console.log(chalk.cyan('  - 5 users with different roles'))
    console.log(chalk.cyan('  - 4 courts with bookings'))
    console.log(chalk.cyan('  - 1 tournament with registrations'))
    // console.log(chalk.cyan('  - 2 classes with schedules')) // Classes not yet implemented
    console.log(chalk.cyan('  - WhatsApp consent records'))
    console.log(chalk.cyan('  - Subscription plans and trials\n'))
    
  } catch (error) {
    console.error(chalk.red('❌ Setup failed:'), error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { TEST_CREDENTIALS }