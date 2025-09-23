// Quick fix para verificar y crear superadmin
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

// Usar URL con pgbouncer para conexión rápida
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
})

async function quickFix() {
  try {
    console.log('🔍 Verificando superadmin...')
    
    // Verificar si existe
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@padelyzer.com' }
    })
    
    const hashedPassword = '$2b$10$YIqsFIwSZ6a7xLng9GAIg.uFGds7h2HexxXOrHu6FL0Won0l/g5dW'
    
    if (existing) {
      console.log('✅ Usuario existe, actualizando...')
      await prisma.user.update({
        where: { email: 'admin@padelyzer.com' },
        data: {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          active: true
        }
      })
    } else {
      console.log('🆕 Creando nuevo superadmin...')
      await prisma.user.create({
        data: {
          id: 'super-admin-001',
          email: 'admin@padelyzer.com',
          name: 'Super Admin',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          active: true,
          emailVerified: new Date(),
          updatedAt: new Date()
        }
      })
    }
    
    console.log('✅ Superadmin listo:')
    console.log('   📧 Email: admin@padelyzer.com')
    console.log('   🔐 Password: Admin123!@#')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

quickFix()