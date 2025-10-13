import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function verifyPassword() {
  try {
    // Buscar usuario owner
    const user = await prisma.user.findUnique({
      where: { email: 'owner@clubdemo.padelyzer.com' }
    })
    
    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }
    
    console.log('✅ Usuario encontrado:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Has Password: ${user.password ? 'YES' : 'NO'}`)
    
    if (user.password) {
      console.log(`   Password hash: ${user.password.substring(0, 20)}...`)
      
      // Probar la contraseña
      const isValid = await bcrypt.compare('demo123', user.password)
      console.log(`   Password 'demo123' es válida: ${isValid ? 'YES' : 'NO'}`)
      
      // Verificar formato del hash
      const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')
      console.log(`   Hash es formato bcrypt: ${isBcryptHash ? 'YES' : 'NO'}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyPassword()