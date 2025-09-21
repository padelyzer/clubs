// Script rápido para actualizar el número de WhatsApp del club
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function quickUpdate() {
  // ⚠️ CAMBIA ESTE NÚMERO POR TU NÚMERO REAL DE WHATSAPP
  // Ejemplo: Si tu número es 555-123-4567, usa: '+525551234567'
  const TU_NUMERO_WHATSAPP = '+525551234567' // <-- CAMBIA ESTO
  
  const club = await prisma.club.findFirst()
  if (!club) {
    console.error('No hay club en la base de datos')
    return
  }

  await prisma.club.update({
    where: { id: club.id },
    data: { whatsappNumber: TU_NUMERO_WHATSAPP }
  })

  console.log(`✅ Número actualizado a: ${TU_NUMERO_WHATSAPP}`)
  console.log('\n📱 Ahora cuando alguien haga una reserva:')
  console.log('1. Se genera un link de WhatsApp')
  console.log('2. Al hacer clic, se abre WhatsApp')
  console.log(`3. El mensaje va dirigido a: ${TU_NUMERO_WHATSAPP}`)
  console.log('4. El club recibe el mensaje y puede responder al cliente')
  
  await prisma.$disconnect()
}

quickUpdate()