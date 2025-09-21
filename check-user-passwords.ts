import { prisma } from './lib/config/prisma'
import bcrypt from 'bcryptjs'

async function checkPasswords() {
  try {
    console.log('🔐 Verificando contraseñas de usuarios...\n')

    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        password: true,
        clubId: true
      },
      orderBy: { email: 'asc' }
    })

    // Contraseñas comunes de testing para probar
    const commonPasswords = [
      'password123',
      'admin123',
      'test123',
      '123456',
      'clubpadel123',
      'padelyzer123'
    ]

    for (const user of users) {
      console.log(`📧 ${user.email} (${user.name})`)
      console.log(`   Rol: ${user.role}`)
      console.log(`   Club: ${user.clubId || 'Sin club'}`)

      if (user.password) {
        console.log('   🔍 Probando contraseñas comunes...')

        for (const testPassword of commonPasswords) {
          try {
            const isMatch = await bcrypt.compare(testPassword, user.password)
            if (isMatch) {
              console.log(`   ✅ CONTRASEÑA ENCONTRADA: "${testPassword}"`)
              break
            }
          } catch (error) {
            // Continuar con la siguiente contraseña
          }
        }
      } else {
        console.log('   ❌ Sin contraseña configurada')
      }
      console.log('   ─────────────────────\n')
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
  }
}

checkPasswords()