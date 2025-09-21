import { prisma } from './lib/config/prisma'
import { nanoid } from 'nanoid'

async function createTestClub() {
  try {
    console.log('🏗️ Creando club de prueba para testing del wizard...')

    // Create the test club
    const testClub = await prisma.club.create({
      data: {
        id: nanoid(),
        name: 'Club Test Wizard',
        slug: `club-test-wizard-${Date.now()}`,
        email: 'test@wizard.com',
        phone: '+52 555 123 4567',
        address: '',
        city: '',
        state: '',
        country: 'México',
        postalCode: '',
        active: true,
        status: 'APPROVED',
        initialSetupCompleted: false, // This is key - setup not completed
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Club creado exitosamente:')
    console.log(`  ID: ${testClub.id}`)
    console.log(`  Nombre: ${testClub.name}`)
    console.log(`  Slug: ${testClub.slug}`)
    console.log(`  Setup completado: ${testClub.initialSetupCompleted}`)

    // Create a test user for this club
    const testUser = await prisma.user.create({
      data: {
        id: nanoid(),
        email: `admin${Date.now()}@wizard.com`,
        name: 'Admin Test',
        role: 'CLUB_OWNER',
        clubId: testClub.id,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Usuario admin creado:')
    console.log(`  Email: ${testUser.email}`)
    console.log(`  Nombre: ${testUser.name}`)
    console.log(`  Club ID: ${testUser.clubId}`)

    console.log('')
    console.log('🎯 Para probar el wizard:')
    console.log('1. Hacer login con email: admin@wizard.com')
    console.log('2. El sistema debería redirigir automáticamente al wizard de setup')
    console.log('3. Completar todos los pasos incluyendo la nueva configuración de canchas')
    console.log('')
    console.log('🎉 Club de prueba listo!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestClub()