import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Creating admin user...')
  
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@padelyzer.com' }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists with email: admin@padelyzer.com')
      console.log('📧 Email: admin@padelyzer.com')
      console.log('🔑 Password: admin123')
      return
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        id: 'admin-user-001',
        email: 'admin@padelyzer.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'SUPER_ADMIN',
        active: true,
        updatedAt: new Date(),
      },
    })
    
    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@padelyzer.com')
    console.log('🔑 Password: admin123')
    console.log('👤 User ID:', adminUser.id)
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('🎉 Admin user setup completed!')
  })
  .catch(async (e) => {
    console.error('💥 Failed to create admin user:', e)
    await prisma.$disconnect()
    process.exit(1)
  })