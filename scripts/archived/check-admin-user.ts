import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking admin user in Supabase...')
  
  try {
    // Check if admin user exists
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@padelyzer.com' }
    })
    
    if (!admin) {
      console.log('❌ Admin user not found')
      return
    }
    
    console.log('✅ Admin user found:')
    console.log(`   ID: ${admin.id}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Name: ${admin.name}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Active: ${admin.active}`)
    console.log(`   Created: ${admin.createdAt}`)
    
    // Test password verification
    const testPassword = 'admin123'
    const isValidPassword = await bcrypt.compare(testPassword, admin.password)
    
    console.log(`\n🔑 Password verification:`)
    console.log(`   Testing password: "${testPassword}"`)
    console.log(`   Result: ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`)
    
    if (!isValidPassword) {
      console.log('\n🔧 Resetting password to "admin123"...')
      const newHashedPassword = await bcrypt.hash('admin123', 10)
      
      await prisma.user.update({
        where: { email: 'admin@padelyzer.com' },
        data: { 
          password: newHashedPassword,
          active: true,
          updatedAt: new Date()
        }
      })
      
      console.log('✅ Password reset successfully!')
      
      // Verify the new password
      const finalAdmin = await prisma.user.findUnique({
        where: { email: 'admin@padelyzer.com' }
      })
      
      if (finalAdmin) {
        const finalCheck = await bcrypt.compare('admin123', finalAdmin.password)
        console.log(`🎯 Final verification: ${finalCheck ? '✅ VALID' : '❌ STILL INVALID'}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('\n🎉 Admin check completed!')
  })
  .catch(async (e) => {
    console.error('💥 Failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })