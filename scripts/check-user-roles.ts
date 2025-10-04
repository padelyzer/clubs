import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking user roles in Supabase...')
  
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        active: true,
        clubId: true
      }
    })
    
    console.log('\n👥 Users and their roles:')
    users.forEach(user => {
      console.log(`   - ${user.email}: ${user.role} ${user.active ? '✅' : '❌'} Club: ${user.clubId || 'None'}`)
    })
    
    console.log('\n📋 Unique roles found:')
    const uniqueRoles = [...new Set(users.map(u => u.role))]
    uniqueRoles.forEach(role => {
      console.log(`   - ${role}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('💥 Failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })