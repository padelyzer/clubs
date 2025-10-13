import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createDemoClubAndUser() {
  try {
    console.log('🏓 Creando Club Demo y usuario en base de datos LOCAL...\n')

    // 1. Verificar/Crear usuario demo
    console.log('1️⃣ Creando usuario demo...')

    let user = await prisma.user.findUnique({
      where: { email: 'demo@padelyzer.com' }
    })

    if (!user) {
      const hashedPassword = await bcrypt.hash('test123', 10)
      user = await prisma.user.create({
        data: {
          id: 'user-demo-local-001',
          email: 'demo@padelyzer.com',
          name: 'Usuario Demo',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          active: true
        }
      })
      console.log('   ✅ Usuario creado: demo@padelyzer.com')
    } else {
      console.log('   ✓ Usuario ya existe: demo@padelyzer.com')
    }

    // 2. Crear el Club Demo
    console.log('\n2️⃣ Creando Club Demo Padelyzer...')

    let club = await prisma.club.findFirst({
      where: {
        OR: [
          { id: 'club-demo-001' },
          { name: 'Club Demo Padelyzer' }
        ]
      }
    })

    if (!club) {
      club = await prisma.club.create({
        data: {
          id: 'club-demo-001',
          name: 'Club Demo Padelyzer',
          slug: 'club-demo-padelyzer',
          email: 'demo@clubdemopadelyzer.com',
          phone: '+52 555 123 4567',
          address: 'Av. Demo 123, Col. Centro',
          city: 'Ciudad de México',
          state: 'CDMX',
          country: 'México',
          postalCode: '06000',
          status: 'APPROVED',
          active: true,
          stripeAccountId: null,
          stripeOnboardingCompleted: false,
          stripePayoutsEnabled: false,
          stripeChargesEnabled: false,
          stripeDetailsSubmitted: false,
          stripeCommissionRate: 250, // 2.5%
          whatsappNumber: '+52 555 123 4567',
          initialSetupCompleted: true,
          initialSetupCompletedAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('   ✅ Club creado: Club Demo Padelyzer')
    } else {
      console.log('   ✓ Club ya existe: Club Demo Padelyzer')
    }

    // 3. Crear canchas para el club
    console.log('\n3️⃣ Creando canchas...')

    const existingCourts = await prisma.court.count({
      where: { clubId: club.id }
    })

    if (existingCourts === 0) {
      const courts = await prisma.court.createMany({
        data: [
          {
            id: 'court-demo-001',
            clubId: club.id,
            name: 'Cancha 1',
            active: true,
            updatedAt: new Date()
          },
          {
            id: 'court-demo-002',
            clubId: club.id,
            name: 'Cancha 2',
            active: true,
            updatedAt: new Date()
          },
          {
            id: 'court-demo-003',
            clubId: club.id,
            name: 'Cancha 3',
            active: true,
            updatedAt: new Date()
          }
        ]
      })
      console.log(`   ✅ ${courts.count} canchas creadas`)
    } else {
      console.log(`   ✓ El club ya tiene ${existingCourts} canchas`)
    }

    // 4. Asociar usuario con el club
    console.log('\n4️⃣ Asociando usuario con el club...')

    await prisma.user.update({
      where: { id: user.id },
      data: {
        clubId: club.id,
        role: 'SUPER_ADMIN' // Mantener como SUPER_ADMIN
      }
    })
    console.log('   ✅ Usuario asociado al club')


    // Resumen
    console.log('\n' + '='.repeat(50))
    console.log('✅ CONFIGURACIÓN COMPLETADA')
    console.log('='.repeat(50))
    console.log('📧 Email: demo@padelyzer.com')
    console.log('🔑 Password: test123')
    console.log('👤 Rol: SUPER_ADMIN')
    console.log('🏓 Club: Club Demo Padelyzer')
    console.log('🎾 Canchas: 3')
    console.log('\n✨ Ahora ejecuta: npx tsx activate-all-modules.ts')

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Error:', error)
    await prisma.$disconnect()
  }
}

createDemoClubAndUser()