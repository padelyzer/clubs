import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking session table in Supabase...')
  
  try {
    // Check if session table exists by trying to count records
    const sessionCount = await prisma.session.count()
    console.log(`✅ Session table exists with ${sessionCount} records`)
    
    // Check recent sessions
    const recentSessions = await prisma.session.findMany({
      take: 5,
      orderBy: { expiresAt: 'desc' },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    })
    
    console.log('\n📝 Recent sessions:')
    recentSessions.forEach(session => {
      console.log(`   - ${session.user.email} (${session.user.role}) expires: ${session.expiresAt}`)
    })
    
  } catch (error) {
    console.error('❌ Error checking session table:', error)
    
    // Check if it's a table not found error
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('\n🔧 Session table does not exist. Need to run migrations.')
    }
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