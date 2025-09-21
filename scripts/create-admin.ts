import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔧 Creando usuario administrador...')
    
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@padelyzer.com' },
      update: {},
      create: {
        id: uuidv4(),
        email: 'admin@padelyzer.com',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        emailVerified: new Date(),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Usuario administrador creado exitosamente')
    console.log('📧 Email: admin@padelyzer.com')
    console.log('🔑 Password: admin123')
    console.log('👤 Rol: SUPER_ADMIN')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()