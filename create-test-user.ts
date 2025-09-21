import { prisma } from './lib/config/prisma'
import bcrypt from 'bcryptjs'

async function createTestUser() {
  try {
    console.log('👤 Creando usuario de prueba para testing...\n')

    // Contraseña conocida para testing
    const testPassword = 'test123'
    const hashedPassword = await bcrypt.hash(testPassword, 10)

    // Verificar si ya existe un usuario de prueba
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@padelyzer.com' }
    })

    if (existingUser) {
      console.log('Usuario de prueba ya existe. Actualizando contraseña...')

      await prisma.user.update({
        where: { email: 'demo@padelyzer.com' },
        data: { password: hashedPassword }
      })

      console.log('✅ Contraseña actualizada')
    } else {
      console.log('Creando nuevo usuario de prueba...')

      // Usar el club existente de Padel Puebla
      const testUser = await prisma.user.create({
        data: {
          id: 'user-demo-test-001',
          email: 'demo@padelyzer.com',
          password: hashedPassword,
          name: 'Usuario Demo',
          role: 'CLUB_STAFF',
          clubId: 'club-padel-puebla-001', // Club existente
          active: true,
          updatedAt: new Date()
        }
      })

      console.log('✅ Usuario de prueba creado')
    }

    console.log('\n🎯 CREDENCIALES PARA PROBAR:')
    console.log('Email: demo@padelyzer.com')
    console.log('Contraseña: test123')
    console.log('Rol: CLUB_STAFF')
    console.log('Club: Club Padel Puebla')

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
  }
}

createTestUser()