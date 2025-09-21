import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixClubIdMismatch() {
  try {
    console.log('🔧 Fixing clubId mismatch...')
    console.log('=' .repeat(60))

    // Find which user needs to be updated
    const users = await prisma.user.findMany()
    console.log('👥 USERS FOUND:')
    users.forEach(user => {
      console.log(`  - ${user.email}: clubId=${user.clubId}`)
    })

    // Find the admin user (likely the one we're logged in as)
    const adminUser = users.find(user => user.role === 'ADMIN') || users[0]
    console.log(`\n🔑 Admin user: ${adminUser?.email} (current clubId: ${adminUser?.clubId})`)

    // Find the club with bookings
    const correctClubId = 'cmers0a3v0000r4ujqpxd0qls'
    
    if (adminUser && adminUser.clubId !== correctClubId) {
      console.log(`\n🔄 Updating user ${adminUser.email} clubId from ${adminUser.clubId} to ${correctClubId}`)
      
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { clubId: correctClubId }
      })
      
      console.log('✅ User clubId updated successfully!')
    } else {
      console.log('✅ User already has correct clubId')
    }

    // Verify bookings count for the correct club
    const bookingCount = await prisma.booking.count({
      where: { clubId: correctClubId }
    })
    console.log(`\n📊 Bookings for club ${correctClubId}: ${bookingCount}`)

    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixClubIdMismatch()