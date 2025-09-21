import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'

const prisma = new PrismaClient()

async function seedTestData() {
  console.log('🌱 Seeding test data for Playwright tests...')

  try {
    // Check if test club exists
    let club = await prisma.club.findUnique({
      where: { slug: 'padel-premium' }
    })

    if (!club) {
      console.log('Creating test club...')
      club = await prisma.club.create({
        data: {
          id: 'test-padel-premium',
          slug: 'padel-premium',
          name: 'Padel Premium Test Club',
          email: 'contact@padelpremium.mx',
          phone: '5551234567',
          address: 'Test Address 123',
          city: 'Puebla',
          state: 'Puebla',
          country: 'México',
          postalCode: '72000',
          website: 'https://padelpremium.mx',
          description: 'Test club for E2E testing',
          status: 'APPROVED',
          active: true,
          initialSetupCompleted: true,
          initialSetupCompletedAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('✅ Test club created')
    } else {
      console.log('✅ Test club already exists')
    }

    // Check if club settings exist
    const settings = await prisma.clubSettings.findUnique({
      where: { clubId: club.id }
    })

    if (!settings) {
      console.log('Creating club settings...')
      await prisma.clubSettings.create({
        data: {
          id: `settings-${club.id}`,
          clubId: club.id,
          slotDuration: 90,
          bufferTime: 15,
          advanceBookingDays: 30,
          timezone: 'America/Mexico_City',
          currency: 'MXN',
          taxRate: 16.0,
          cancellationFee: 0,
          noShowFee: 50,
          updatedAt: new Date(),
          operatingHours: {
            monday: { open: '07:00', close: '22:00' },
            tuesday: { open: '07:00', close: '22:00' },
            wednesday: { open: '07:00', close: '22:00' },
            thursday: { open: '07:00', close: '22:00' },
            friday: { open: '07:00', close: '22:00' },
            saturday: { open: '07:00', close: '20:00' },
            sunday: { open: '07:00', close: '20:00' }
          }
        }
      })
      console.log('✅ Club settings created')
    } else {
      console.log('✅ Club settings already exist')
    }

    // Check if test user exists
    let user = await prisma.user.findUnique({
      where: { email: 'admin@padelpremium.mx' }
    })

    if (!user) {
      console.log('Creating test user...')
      const hashedPassword = await hash('admin123')
      
      user = await prisma.user.create({
        data: {
          id: 'user-test-admin',
          email: 'admin@padelpremium.mx',
          name: 'Admin Test',
          password: hashedPassword,
          role: 'CLUB_OWNER',
          clubId: club.id,
          active: true,
          updatedAt: new Date()
        }
      })
      console.log('✅ Test user created')
    } else {
      console.log('✅ Test user already exists')
      
      // Update club association if needed
      if (user.clubId !== club.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { clubId: club.id }
        })
        console.log('✅ User club association updated')
      }
    }

    // Create some test courts
    const courtsCount = await prisma.court.count({
      where: { clubId: club.id }
    })

    if (courtsCount === 0) {
      console.log('Creating test courts...')
      
      for (let i = 1; i <= 3; i++) {
        await prisma.court.create({
          data: {
            id: `court-${club.id}-${i}`,
            clubId: club.id,
            name: `Cancha ${i}`,
            type: 'PADEL',
            indoor: false,
            order: i,
            active: true,
            updatedAt: new Date()
          }
        })
      }
      console.log('✅ Test courts created')
    } else {
      console.log(`✅ ${courtsCount} courts already exist`)
    }

    // Create a test player
    const player = await prisma.player.findFirst({
      where: { 
        email: 'player@test.com',
        clubId: club.id
      }
    })

    if (!player) {
      console.log('Creating test player...')
      await prisma.player.create({
        data: {
          id: `player-test-001`,
          clubId: club.id,
          name: 'Test Player',
          email: 'player@test.com',
          phone: '5559876543',
          active: true,
          memberNumber: 'TEST001',
          updatedAt: new Date()
        }
      })
      console.log('✅ Test player created')
    } else {
      console.log('✅ Test player already exists')
    }

    console.log('\n✅ Test data seeding completed successfully!')
    console.log('\n📝 Test Credentials:')
    console.log('   Email: admin@padelpremium.mx')
    console.log('   Password: admin123')
    console.log('   Club Slug: padel-premium')
    console.log(`   Dashboard URL: http://localhost:3002/c/padel-premium/dashboard`)

  } catch (error) {
    console.error('❌ Error seeding test data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedTestData()
  .catch(console.error)
  .finally(() => process.exit())