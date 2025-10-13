import { PrismaClient } from '@prisma/client'
// Usar la misma librería que el login
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fixDemoPasswords() {
  try {
    console.log('🔧 Actualizando contraseñas con bcryptjs...\n')
    
    const password = 'demo123'
    const hashedPassword = await bcrypt.hash(password, 10)
    
    console.log(`Hash generado: ${hashedPassword.substring(0, 30)}...`)
    
    // Lista de usuarios a actualizar
    const emails = [
      'owner@clubdemo.padelyzer.com',
      'staff@clubdemo.padelyzer.com',
      'admin@padelyzer.com'
    ]
    
    for (const email of emails) {
      try {
        const result = await prisma.user.update({
          where: { email },
          data: { password: hashedPassword }
        })
        console.log(`✅ ${email} - Contraseña actualizada`)
      } catch (error) {
        console.log(`⚠️  ${email} - No encontrado o error`)
      }
    }
    
    console.log('\n🎉 Proceso completado!')
    console.log('\nPrueba con:')
    console.log('   Email: owner@clubdemo.padelyzer.com')
    console.log('   Password: demo123')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDemoPasswords()