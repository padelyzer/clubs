import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function updateDemoUsersPassword() {
  try {
    // Contraseña para demo
    const password = 'demo123'
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Actualizar usuario owner
    const ownerUpdate = await prisma.user.updateMany({
      where: { email: 'owner@clubdemo.padelyzer.com' },
      data: { password: hashedPassword }
    })
    
    if (ownerUpdate.count > 0) {
      console.log('✅ Usuario owner actualizado con contraseña')
    }
    
    // Actualizar usuario staff
    const staffUpdate = await prisma.user.updateMany({
      where: { email: 'staff@clubdemo.padelyzer.com' },
      data: { password: hashedPassword }
    })
    
    if (staffUpdate.count > 0) {
      console.log('✅ Usuario staff actualizado con contraseña')
    }
    
    // Actualizar admin si existe
    const adminUpdate = await prisma.user.updateMany({
      where: { email: 'admin@padelyzer.com' },
      data: { password: hashedPassword }
    })
    
    if (adminUpdate.count > 0) {
      console.log('✅ Usuario admin actualizado con contraseña')
    }
    
    console.log('\n🎉 Contraseñas actualizadas!')
    console.log('\n📱 Credenciales para padelyzer.app:')
    console.log('\n1. Owner del Club (acceso completo):')
    console.log('   Email: owner@clubdemo.padelyzer.com')
    console.log('   Password: demo123')
    console.log('\n2. Staff del Club (acceso limitado):')
    console.log('   Email: staff@clubdemo.padelyzer.com')
    console.log('   Password: demo123')
    console.log('\n3. Super Admin (acceso total):')
    console.log('   Email: admin@padelyzer.com')
    console.log('   Password: demo123')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateDemoUsersPassword()