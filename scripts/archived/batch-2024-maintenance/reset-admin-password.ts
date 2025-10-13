import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    const adminEmail = 'root@padelyzer.com'
    const newPassword = 'admin123'
    
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    const updatedUser = await prisma.user.update({
      where: { email: adminEmail },
      data: { 
        password: hashedPassword,
        emailVerified: new Date()
      }
    })
    
    console.log('✅ Contraseña actualizada exitosamente!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Contraseña:', newPassword)
    console.log('🌐 URL: http://localhost:3001/login')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()