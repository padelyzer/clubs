import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    // Verificar si ya existe un super admin
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'SUPER_ADMIN'
      }
    })

    if (existingAdmin) {
      console.log('✅ Ya existe un Super Admin:')
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   Nombre: ${existingAdmin.name}`)
      
      // Actualizar la contraseña para asegurarnos de que funcione
      const hashedPassword = await bcrypt.hash('Admin123!@#', 10)
      
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { 
          password: hashedPassword,
          active: true
        }
      })
      
      console.log('\n🔐 Contraseña actualizada a: Admin123!@#')
      return
    }

    // Crear nuevo Super Admin
    const hashedPassword = await bcrypt.hash('Admin123!@#', 10)
    
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@padelyzer.com',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        active: true,
        emailVerified: new Date()
      }
    })

    console.log('✅ Super Admin creado exitosamente:')
    console.log(`   Email: ${newAdmin.email}`)
    console.log(`   Contraseña: Admin123!@#`)
    console.log(`   Rol: ${newAdmin.role}`)
    
  } catch (error) {
    console.error('Error creando Super Admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()
