import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const club = await prisma.club.findFirst()
  console.log('CLUB WhatsApp:', club?.whatsappNumber)
  
  const notification = await prisma.notification.findFirst({
    where: { whatsappLink: { not: null } }
  })
  
  if (notification?.whatsappLink) {
    const match = notification.whatsappLink.match(/wa\.me\/(\d+)/)
    console.log('Link apunta a:', match?.[1])
    console.log('Destinatario (cliente):', notification.recipient, notification.recipientPhone)
    
    if (match?.[1] === '525549125610') {
      console.log('✅ CORRECTO: El link apunta al WhatsApp del CLUB')
      console.log('El cliente', notification.recipient, 'enviará mensaje al club')
    }
  }
  
  console.log('\nPrimeros 200 caracteres del link:')
  console.log(notification?.whatsappLink?.substring(0, 200))
}

main().catch(console.error).finally(() => prisma.$disconnect())