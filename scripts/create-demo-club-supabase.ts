import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
    }
  }
})

async function createDemoClub() {
  console.log('🏓 Creando Club Demo Padelyzer en Supabase...\n')
  
  try {
    // 1. Create the club
    console.log('1️⃣ Creando club...')
    const club = await prisma.club.create({
      data: {
        id: uuidv4(),
        name: 'Club Demo Padelyzer',
        slug: 'club-demo-padelyzer',
        email: 'info@clubdemo.padelyzer.com',
        description: 'Club de demostración para pruebas',
        phone: '+52 1234567890',
        address: '123 Demo Street',
        city: 'Ciudad de México',
        state: 'CDMX',
        postalCode: '01000',
        country: 'Mexico',
        active: true,
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
        initialSetupCompleted: true
      }
    })
    console.log(`✅ Club creado: ${club.name} (${club.id})`)
    
    // 2. Create users with proper passwords
    console.log('\n2️⃣ Creando usuarios...')
    const password = await bcrypt.hash('demo123', 10)
    console.log(`Password hash generado: ${password.substring(0, 30)}...`)
    
    // Owner user
    const owner = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: 'owner@clubdemo.padelyzer.com',
        password: password,
        name: 'Owner Demo',
        role: 'CLUB_OWNER',
        clubId: club.id,
        active: true,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log(`✅ Owner creado: ${owner.email}`)
    
    // Staff user
    const staff = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: 'staff@clubdemo.padelyzer.com',
        password: password,
        name: 'Staff Demo',
        role: 'CLUB_STAFF',
        clubId: club.id,
        active: true,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log(`✅ Staff creado: ${staff.email}`)
    
    // 3. Create some courts
    console.log('\n3️⃣ Creando canchas...')
    const courtNames = ['Cancha 1', 'Cancha 2', 'Cancha 3']
    
    for (const name of courtNames) {
      await prisma.court.create({
        data: {
          id: uuidv4(),
          clubId: club.id,
          name: name,
          type: 'PADEL',
          description: `${name} del Club Demo`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log(`✅ ${name} creada`)
    }
    
    // 4. Test password
    console.log('\n4️⃣ Verificando contraseñas...')
    const testUser = await prisma.user.findUnique({
      where: { email: 'owner@clubdemo.padelyzer.com' }
    })
    
    if (testUser?.password) {
      const isValid = await bcrypt.compare('demo123', testUser.password)
      console.log(`✓ Test password 'demo123': ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`)
    }
    
    console.log('\n🎉 Club Demo Padelyzer creado exitosamente!')
    console.log('\n📝 Credenciales de prueba:')
    console.log('Owner:')
    console.log('  Email: owner@clubdemo.padelyzer.com')
    console.log('  Password: demo123')
    console.log('\nStaff:')
    console.log('  Email: staff@clubdemo.padelyzer.com')
    console.log('  Password: demo123')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoClub()