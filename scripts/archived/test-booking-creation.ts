// Script para probar la creación de reserva con notificación WhatsApp
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestBooking() {
  console.log('🎾 Creando reserva de prueba con notificación WhatsApp...')
  
  try {
    // 1. Verificar que el club tenga un número de WhatsApp configurado
    const club = await prisma.club.findFirst({
      where: { slug: 'club-padel-puebla' }
    })

    if (!club) {
      console.error('❌ No se encontró el club. Ejecuta primero el seed.')
      return
    }

    if (!club.whatsappNumber) {
      console.error('❌ El club no tiene número de WhatsApp configurado.')
      console.log('   Ejecuta primero: npx tsx scripts/update-whatsapp-number.ts')
      return
    }

    console.log(`✅ Club: ${club.name}`)
    console.log(`📱 WhatsApp del club: ${club.whatsappNumber}`)
    
    // 2. Buscar una cancha disponible
    const court = await prisma.court.findFirst({
      where: { 
        clubId: club.id,
        active: true
      }
    })

    if (!court) {
      console.error('❌ No se encontró ninguna cancha activa')
      return
    }

    // 3. Crear la reserva
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const booking = await prisma.booking.create({
      data: {
        date: tomorrow,
        startTime: '20:00',
        endTime: '21:30',
        duration: 90,
        status: 'CONFIRMED',
        paymentStatus: 'completed',
        paymentType: 'ONLINE_FULL',
        price: 60000, // $600 MXN
        playerName: 'Test User WhatsApp',
        playerEmail: 'test@whatsapp.com',
        playerPhone: '+52 555 987 6543', // Número del cliente
        notes: 'Reserva de prueba para WhatsApp',
        courtId: court.id,
        clubId: club.id,
        totalPlayers: 4
      }
    })

    console.log('✅ Reserva creada:', booking.id)
    
    // 4. Generar la notificación de WhatsApp
    const { WhatsAppLinkService } = await import('../lib/services/whatsapp-link-service')
    
    const result = await WhatsAppLinkService.sendBookingConfirmation(booking.id)
    
    if (result.success) {
      console.log('\n🎉 ¡Notificación de WhatsApp generada exitosamente!')
      console.log('📱 Link de WhatsApp:', result.whatsappLink)
      console.log('🆔 ID de notificación:', result.notificationId)
      
      console.log('\n🔍 Para verificar:')
      console.log('1. Abre el link en tu navegador o móvil')
      console.log('2. Se abrirá WhatsApp con el mensaje pre-escrito')
      console.log('3. El mensaje irá al número del club:', club.whatsappNumber)
      console.log('\n📊 También puedes ver la notificación en:')
      console.log('   Dashboard → Configuración → WhatsApp → Notificaciones')
      
      console.log('\n⚠️  IMPORTANTE:')
      console.log('   Si el link dice "The phone number isn\'t on WhatsApp"')
      console.log('   significa que el número del club no tiene WhatsApp activo.')
      console.log('   Actualiza el número con: npx tsx scripts/update-whatsapp-number.ts')
    } else {
      console.error('❌ Error generando notificación:', result.error)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
createTestBooking()