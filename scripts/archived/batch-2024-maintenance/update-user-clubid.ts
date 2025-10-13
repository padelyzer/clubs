import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUserClubId() {
  try {
    console.log('🔄 Updating default admin user to correct clubId...')
    
    const correctClubId = 'cmers0a3v0000r4ujqpxd0qls'
    
    // Update the default admin user
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@clubpadel.mx' },
      data: { clubId: correctClubId }
    })
    
    console.log(`✅ Updated user ${updatedUser.email} to clubId: ${updatedUser.clubId}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserClubId()
