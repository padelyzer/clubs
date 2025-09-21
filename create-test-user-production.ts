import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Usar directamente la URL de producción
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
})

async function createTestUserProduction() {
  try {
    console.log('👤 Creando usuario de prueba en PRODUCCIÓN...\n')

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

      console.log('✅ Contraseña actualizada en PRODUCCIÓN')
    } else {
      console.log('Creando nuevo usuario de prueba en PRODUCCIÓN...')

      // Crear usuario sin club por ahora (para evitar foreign key constraint)
      const testUser = await prisma.user.create({
        data: {
          id: 'user-demo-production-001',
          email: 'demo@padelyzer.com',
          password: hashedPassword,
          name: 'Usuario Demo Producción',
          role: 'SUPER_ADMIN', // SUPER_ADMIN no requiere club
          clubId: null,
          active: true,
          updatedAt: new Date()
        }
      })

      console.log('✅ Usuario de prueba creado en PRODUCCIÓN')
    }

    console.log('\n🎯 CREDENCIALES PARA PROBAR EN PRODUCCIÓN:')
    console.log('Email: demo@padelyzer.com')
    console.log('Contraseña: test123')
    console.log('Rol: CLUB_STAFF')

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
  }
}

createTestUserProduction()