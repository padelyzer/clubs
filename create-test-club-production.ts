import { PrismaClient } from '@prisma/client'

// Usar directamente la URL de producción
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
})

async function createTestClub() {
  try {
    console.log('🏓 Creando club de prueba en PRODUCCIÓN...\n')

    // Crear un club de prueba
    const club = await prisma.club.create({
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

    console.log('✅ Club creado:', club.name)

    // Crear algunas canchas para el club
    const courts = await prisma.court.createMany({
      data: [
        {
          id: 'court-demo-001',
          clubId: 'club-demo-001',
          name: 'Cancha 1',
          description: 'Cancha techada con iluminación LED',
          active: true
        },
        {
          id: 'court-demo-002',
          clubId: 'club-demo-001',
          name: 'Cancha 2',
          description: 'Cancha al aire libre',
          active: true
        },
        {
          id: 'court-demo-003',
          clubId: 'club-demo-001',
          name: 'Cancha 3',
          description: 'Cancha panorámica',
          active: true
        }
      ]
    })

    console.log('✅ Canchas creadas:', courts.count)

    // Actualizar el usuario demo para asociarlo con este club
    const updatedUser = await prisma.user.update({
      where: { id: 'user-demo-production-001' },
      data: {
        clubId: 'club-demo-001',
        role: 'CLUB_OWNER' // Cambiar a CLUB_OWNER para que pueda administrar el club
      }
    })

    console.log('✅ Usuario actualizado con club:', updatedUser.email)

    console.log('\n🎯 DATOS DEL CLUB DE PRUEBA:')
    console.log('Nombre:', club.name)
    console.log('Email:', club.email)
    console.log('Ciudad:', club.city)
    console.log('Canchas:', courts.count)
    console.log('\n🎯 USUARIO ACTUALIZADO:')
    console.log('Email: demo@padelyzer.com')
    console.log('Contraseña: test123')
    console.log('Rol: CLUB_OWNER')
    console.log('Club: Club Demo Padelyzer')

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
    await prisma.$disconnect()
  }
}

createTestClub()