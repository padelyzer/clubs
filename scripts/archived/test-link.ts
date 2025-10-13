import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📱 VERIFICACIÓN DE LÓGICA CORREGIDA\n')
  console.log('=' .repeat(50))
  
  const notification = await prisma.notification.findFirst({
    where: { 
      whatsappLink: { not: null },
      type: 'BOOKING_CONFIRMATION'
    }
  })
  
  if (notification?.whatsappLink) {
    const phoneMatch = notification.whatsappLink.match(/wa\.me\/(\d+)/)
    const messageMatch = notification.whatsappLink.match(/text=(.+)$/)
    
    console.log('\n✅ ESTRUCTURA DEL LINK:')
    console.log(`   Destinatario (Cliente): +${phoneMatch?.[1]}`)
    console.log(`   Remitente (Club): Club Padel Puebla`)
    
    if (messageMatch) {
      const decodedMessage = decodeURIComponent(messageMatch[1])
      console.log('\n📝 MENSAJE QUE EL CLUB ENVIARÁ AL CLIENTE:')
      console.log('-'.repeat(40))
      console.log(decodedMessage)
      console.log('-'.repeat(40))
    }
    
    console.log('\n🎯 FLUJO CORRECTO:')
    console.log('   1. El club hace click en el link')
    console.log('   2. Se abre WhatsApp')
    console.log('   3. El destinatario es el Cliente (su número de teléfono)')
    console.log('   4. El mensaje ya está escrito desde la perspectiva del club')
    console.log('   5. El club solo tiene que presionar "Enviar"')
    
    console.log('\n🔗 Link completo para probar:')
    console.log(notification.whatsappLink)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())