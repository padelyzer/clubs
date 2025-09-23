import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function createClubDemoUser() {
  try {
    // Buscar el Club Demo Padelyzer
    const club = await prisma.club.findFirst({
      where: { slug: 'club-demo-padelyzer' },
    })
    
    if (!club) {
      console.error('❌ Club Demo Padelyzer no encontrado')
      return
    }
    
    console.log('✅ Club encontrado:', club.name)
    
    // Verificar si ya existe el usuario
    const existingOwner = await prisma.user.findUnique({
      where: { email: 'owner@clubdemo.padelyzer.com' }
    })
    
    if (existingOwner) {
      console.log('⚠️  Usuario owner ya existe')
    } else {
      // Crear usuario owner para el club
      const ownerUser = await prisma.user.create({
        data: {
          id: uuidv4(),
          email: 'owner@clubdemo.padelyzer.com',
          name: 'Owner Demo',
          role: 'CLUB_OWNER',
          clubId: club.id,
          active: true,
          emailVerified: new Date(),
          updatedAt: new Date(),
        }
      })
      
      console.log('✅ Usuario CLUB_OWNER creado:')
      console.log(`   Email: ${ownerUser.email}`)
      console.log(`   Role: ${ownerUser.role}`)
    }
    
    // Verificar si ya existe el usuario staff
    const existingStaff = await prisma.user.findUnique({
      where: { email: 'staff@clubdemo.padelyzer.com' }
    })
    
    if (existingStaff) {
      console.log('⚠️  Usuario staff ya existe')
    } else {
      // Crear usuario staff para el club
      const staffUser = await prisma.user.create({
        data: {
          id: uuidv4(),
          email: 'staff@clubdemo.padelyzer.com',
          name: 'Staff Demo',
          role: 'CLUB_STAFF',
          clubId: club.id,
          active: true,
          emailVerified: new Date(),
          updatedAt: new Date(),
        }
      })
      
      console.log('\n✅ Usuario CLUB_STAFF creado:')
      console.log(`   Email: ${staffUser.email}`)
      console.log(`   Role: ${staffUser.role}`)
    }
    
    console.log('\n🎉 Proceso completado!')
    console.log('\n📱 Para iniciar sesión en padelyzer.app usa:')
    console.log('   Email: owner@clubdemo.padelyzer.com (acceso completo)')
    console.log('   Email: staff@clubdemo.padelyzer.com (acceso limitado)')
    console.log('   Password: (sin contraseña en desarrollo)')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createClubDemoUser()