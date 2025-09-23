// Test database connection
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
})

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful')
    
    // Test user query
    const users = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      take: 5
    })
    
    console.log(`📊 Found ${users.length} SUPER_ADMIN users:`)
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Active: ${user.active}`)
    })
    
    // Test specific user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@padelyzer.com' }
    })
    
    if (adminUser) {
      console.log('\n✅ admin@padelyzer.com found:')
      console.log(`   Role: ${adminUser.role}`)
      console.log(`   Active: ${adminUser.active}`)
      console.log(`   ID: ${adminUser.id}`)
    } else {
      console.log('\n❌ admin@padelyzer.com NOT found')
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()