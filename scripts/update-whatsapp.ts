import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Update club WhatsApp number
  const updatedClub = await prisma.club.updateMany({
    data: {
      whatsappNumber: '+525549125610'
    }
  })
  
  console.log('✅ WhatsApp number updated to +525549125610')
  console.log(`Updated ${updatedClub.count} club(s)`)
  
  // Verify the update
  const club = await prisma.club.findFirst()
  console.log('📱 Current WhatsApp:', club?.whatsappNumber)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())