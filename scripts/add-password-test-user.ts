import { prisma } from './lib/config/prisma'
import bcrypt from 'bcryptjs'

async function addPasswordToTestUser() {
  try {
    console.log('🔐 Agregando contraseña al usuario de prueba...')

    const password = 'test123'
    const hashedPassword = await bcrypt.hash(password, 12)

    // Find the test user
    const testUser = await prisma.user.findFirst({
      where: {
        email: { contains: 'wizard.com' }
      }
    })

    if (!testUser) {
      console.log('❌ No se encontró usuario de prueba')
      return
    }

    // Update with password
    await prisma.user.update({
      where: { id: testUser.id },
      data: { password: hashedPassword }
    })

    console.log('✅ Contraseña agregada exitosamente!')
    console.log('')
    console.log('🎯 Credenciales para probar el wizard:')
    console.log(`  Email: ${testUser.email}`)
    console.log('  Password: test123')
    console.log('')
    console.log('🚀 Pasos para probar:')
    console.log('1. Ir a http://localhost:3002/login')
    console.log('2. Usar las credenciales de arriba')
    console.log('3. El sistema debería redirigir automáticamente al setup wizard')
    console.log('4. Completar todos los pasos incluyendo la configuración de canchas')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addPasswordToTestUser()