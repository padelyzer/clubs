import { prisma } from './lib/config/prisma'
import bcrypt from 'bcryptjs'

async function testPasswords() {
  try {
    console.log('🔐 Probando contraseñas documentadas...\n')

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

    // Contraseñas documentadas en TESTING-GUIDE.md y otras posibles
    const testPasswords = [
      'owner123',    // Para owner@clubpadelpuebla.com
      'staff123',    // Para staff@clubpadelpuebla.com
      'root123',     // Para root@padelyzer.com
      'admin123',    // Para admins
      'test123',     // Para usuarios de test
      'password123', // Contraseña genérica de seeding
      'clubpadel123',
      'padelyzer123'
    ]

    for (const user of users) {
      console.log(`📧 ${user.email} (${user.name})`)
      console.log(`   Rol: ${user.role}`)
      console.log(`   Club: ${user.clubId || 'Sin club'}`)

      if (user.password) {
        console.log('   🔍 Probando contraseñas...')

        let found = false
        for (const testPassword of testPasswords) {
          try {
            const isMatch = await bcrypt.compare(testPassword, user.password)
            if (isMatch) {
              console.log(`   ✅ CONTRASEÑA ENCONTRADA: "${testPassword}"`)
              found = true
              break
            }
          } catch (error) {
            // Continuar con la siguiente contraseña
          }
        }

        if (!found) {
          console.log('   ❌ Ninguna contraseña coincidió')
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

testPasswords()