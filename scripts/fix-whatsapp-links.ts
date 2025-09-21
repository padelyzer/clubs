import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing WhatsApp links with correct phone number...\n')
  
  const CORRECT_PHONE = '525549125610'
  const CORRECT_PHONE_FORMATTED = '+525549125610'
  
  // Get all notifications with WhatsApp links
  const notifications = await prisma.notification.findMany({
    where: {
      whatsappLink: { not: null }
    }
  })
  
  console.log(`Found ${notifications.length} notifications to fix\n`)
  
  let fixedCount = 0
  
  for (const notification of notifications) {
    if (notification.whatsappLink) {
      // Replace any phone number in the wa.me link with the correct one
      const updatedLink = notification.whatsappLink.replace(
        /wa\.me\/\d+/,
        `wa.me/${CORRECT_PHONE}`
      )
      
      // Update the notification
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          whatsappLink: updatedLink,
          clubPhone: CORRECT_PHONE_FORMATTED
        }
      })
      
      fixedCount++
      console.log(`✅ Fixed notification for ${notification.recipient}`)
    }
  }
  
  console.log(`\n✨ Fixed ${fixedCount} notifications!`)
  
  // Also ensure the club has the correct number
  await prisma.club.updateMany({
    data: {
      whatsappNumber: CORRECT_PHONE_FORMATTED
    }
  })
  
  console.log('✅ Updated club WhatsApp number')
  
  // Verify the fix
  console.log('\n📱 Verification:')
  const sampleNotification = await prisma.notification.findFirst({
    where: {
      whatsappLink: { not: null }
    }
  })
  
  if (sampleNotification?.whatsappLink) {
    const match = sampleNotification.whatsappLink.match(/wa\.me\/(\d+)/)
    if (match) {
      console.log(`Sample link phone: +${match[1]}`)
      if (match[1] === CORRECT_PHONE) {
        console.log('✅ Links are now correct!')
      } else {
        console.log('⚠️ Links still need fixing')
      }
    }
  }
  
  const club = await prisma.club.findFirst()
  console.log(`Club WhatsApp: ${club?.whatsappNumber}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())