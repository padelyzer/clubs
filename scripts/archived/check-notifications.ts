import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking notifications and WhatsApp links...\n')
  
  // Get all notifications with WhatsApp links
  const notifications = await prisma.notification.findMany({
    where: {
      whatsappLink: { not: null }
    },
    select: {
      id: true,
      recipient: true,
      whatsappLink: true,
      createdAt: true
    },
    take: 10
  })

  console.log(`Found ${notifications.length} notifications with WhatsApp links:\n`)

  notifications.forEach((n, index) => {
    console.log(`${index + 1}. ${n.recipient}`)
    console.log(`   Link: ${n.whatsappLink}`)
    console.log(`   Created: ${n.createdAt.toLocaleString()}\n`)
    
    // Extract phone number from link
    const match = n.whatsappLink?.match(/wa\.me\/(\d+)/)
    if (match) {
      console.log(`   📱 Phone in link: +${match[1]}`)
      if (match[1] !== '525549125610') {
        console.log(`   ⚠️  INCORRECT PHONE NUMBER! Should be 525549125610`)
      }
    }
    console.log('---')
  })
  
  // Check club configuration
  const club = await prisma.club.findFirst()
  console.log('\nClub Configuration:')
  console.log(`Name: ${club?.name}`)
  console.log(`WhatsApp Number: ${club?.whatsappNumber}`)
  console.log(`Phone: ${club?.phone}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())