import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Analizando la lógica de WhatsApp...\n')
  
  // Get club info
  const club = await prisma.club.findFirst()
  console.log('📱 CLUB (quien recibe los mensajes):')
  console.log(`   Nombre: ${club?.name}`)
  console.log(`   WhatsApp: ${club?.whatsappNumber}`)
  console.log('')
  
  // Get a booking with player info
  const booking = await prisma.booking.findFirst({
    include: {
      Player: true
    }
  })
  
  console.log('👤 CLIENTE (quien envía el mensaje):')
  console.log(`   Nombre: ${booking?.playerName}`)
  console.log(`   Teléfono: ${booking?.playerPhone}`)
  console.log('')
  
  // Check notifications
  const notification = await prisma.notification.findFirst({
    where: {
      whatsappLink: { not: null }
    }
  })
  
  console.log('📨 ESTRUCTURA DEL LINK:')
  let phoneMatch: RegExpMatchArray | null = null
  if (notification?.whatsappLink) {
    phoneMatch = notification.whatsappLink.match(/wa\.me\/(\d+)/)
    const messageMatch = notification.whatsappLink.match(/text=(.+)$/)

    console.log(`   Link completo: ${notification.whatsappLink.substring(0, 100)}...`)
    console.log('')
    console.log(`   Número en el link (destinatario): +${phoneMatch?.[1]}`)
    console.log(`   Este debería ser el número del CLUB: ${club?.whatsappNumber}`)
    console.log('')

    if (messageMatch) {
      const decodedMessage = decodeURIComponent(messageMatch[1])
      console.log('   Mensaje prellenado (lo que el cliente envía):')
      console.log(`   "${decodedMessage.substring(0, 100)}..."`)
    }
  }

  console.log('\n✅ LÓGICA CORRECTA:')
  console.log('   1. El link debe tener wa.me/525549125610 (número del CLUB)')
  console.log('   2. El mensaje prellenado es lo que el CLIENTE escribirá')
  console.log('   3. Cuando el cliente hace click, se abre WhatsApp')
  console.log('   4. El chat se abre con el CLUB como destinatario')
  console.log('   5. El mensaje ya está escrito, listo para enviar')

  console.log('\n📋 VERIFICACIÓN:')
  if (phoneMatch?.[1] === '525549125610') {
    console.log('   ✅ Los links están CORRECTOS - apuntan al club')
  } else {
    console.log('   ❌ Los links están INCORRECTOS - no apuntan al club')
  }
}