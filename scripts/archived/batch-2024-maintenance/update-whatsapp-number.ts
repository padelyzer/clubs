// Script para actualizar el número de WhatsApp del club
// Asegúrate de usar un número real que tenga WhatsApp activo

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateClubWhatsAppNumber() {
  // IMPORTANTE: Cambia este número por uno real que tenga WhatsApp
  // Formato: +52 seguido del número móvil de 10 dígitos
  const REAL_WHATSAPP_NUMBER = '+525551234567' // <-- CAMBIA ESTE NÚMERO
  
  console.log('📱 Actualizando número de WhatsApp del club...')
  console.log('⚠️  IMPORTANTE: Asegúrate de cambiar el número en el script por uno real con WhatsApp')
  
  try {
    // Buscar el club de prueba
    const club = await prisma.club.findFirst({
      where: {
        slug: 'club-padel-puebla'
      }
    })

    if (!club) {
      console.error('❌ No se encontró el club. Ejecuta primero el seed.')
      return
    }

    console.log(`\n📊 Club encontrado: ${club.name}`)
    console.log(`📞 Número actual: ${club.whatsappNumber || 'No configurado'}`)
    
    // Actualizar el número
    const updatedClub = await prisma.club.update({
      where: { id: club.id },
      data: { whatsappNumber: REAL_WHATSAPP_NUMBER }
    })

    console.log(`✅ Número actualizado a: ${updatedClub.whatsappNumber}`)
    
    console.log('\n🔍 Próximos pasos:')
    console.log('1. Asegúrate de que el número configurado tenga WhatsApp activo')
    console.log('2. Ve al Dashboard → Configuración → WhatsApp → Notificaciones')
    console.log('3. Verifica que los links ahora abren WhatsApp correctamente')
    console.log('4. El mensaje aparecerá pre-escrito en la conversación')
    
    console.log('\n💡 Tip: Para probar con tu propio número:')
    console.log('   1. Edita este script y cambia REAL_WHATSAPP_NUMBER')
    console.log('   2. Usa tu número en formato +52XXXXXXXXXX')
    console.log('   3. Ejecuta: npx tsx scripts/update-whatsapp-number.ts')

  } catch (error) {
    console.error('❌ Error actualizando el número:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
updateClubWhatsAppNumber()