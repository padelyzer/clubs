import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Usar la URL de producción
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
})

async function fixClubDemo() {
  try {
    console.log('🔍 Verificando Club Demo en PRODUCCIÓN...\n')

    // 1. Verificar si el club existe
    let club = await prisma.club.findUnique({
      where: { id: 'club-demo-001' }
    })

    if (!club) {
      console.log('❌ Club Demo no existe. Creándolo...')

      // Crear el club
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
          stripeCommissionRate: 250,
          whatsappNumber: '+52 555 123 4567',
          initialSetupCompleted: true,
          initialSetupCompletedAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('✅ Club Demo creado')
    } else {
      console.log('✓ Club Demo ya existe')
    }

    // 2. Verificar/crear canchas
    const existingCourts = await prisma.court.count({
      where: { clubId: 'club-demo-001' }
    })

    if (existingCourts === 0) {
      await prisma.court.createMany({
        data: [
          {
            id: 'court-demo-001',
            clubId: 'club-demo-001',
            name: 'Cancha 1',
            active: true,
            updatedAt: new Date()
          },
          {
            id: 'court-demo-002',
            clubId: 'club-demo-001',
            name: 'Cancha 2',
            active: true,
            updatedAt: new Date()
          },
          {
            id: 'court-demo-003',
            clubId: 'club-demo-001',
            name: 'Cancha 3',
            active: true,
            updatedAt: new Date()
          }
        ]
      })
      console.log('✅ Canchas creadas')
    } else {
      console.log(`✓ El club ya tiene ${existingCourts} canchas`)
    }

    // 3. Verificar/asociar usuario demo
    const user = await prisma.user.findUnique({
      where: { email: 'demo@padelyzer.com' }
    })

    if (user && user.clubId !== 'club-demo-001') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          clubId: 'club-demo-001',
          role: 'SUPER_ADMIN'
        }
      })
      console.log('✅ Usuario demo asociado al club')
    } else if (user) {
      console.log('✓ Usuario ya está asociado al club')
    } else {
      console.log('⚠️ Usuario demo@padelyzer.com no encontrado')
    }

    // 4. Mostrar resumen
    console.log('\n' + '='.repeat(50))
    console.log('✅ VERIFICACIÓN COMPLETADA')
    console.log('='.repeat(50))
    console.log(`Club ID: club-demo-001`)
    console.log(`Club: ${club.name}`)
    console.log(`Estado: ${club.status}`)
    console.log(`Activo: ${club.active}`)
    console.log('\n🌐 URLs:')
    console.log('Admin: https://pdzr4.vercel.app/admin/clubs')
    console.log('Detalle: https://pdzr4.vercel.app/admin/clubs/club-demo-001')
    console.log('Editar: https://pdzr4.vercel.app/admin/clubs/club-demo-001/edit')

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Error:', error)
    await prisma.$disconnect()
  }
}

fixClubDemo()