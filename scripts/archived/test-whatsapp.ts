import { WhatsAppLinkService } from '../lib/services/whatsapp-link-service'
import { prisma } from '../lib/config/prisma'

async function testWhatsAppIntegration() {
  try {
    console.log('🧪 Iniciando pruebas de WhatsApp...')

    // 1. Buscar un club para pruebas
    const club = await prisma.club.findFirst({
      select: { id: true, name: true, whatsappNumber: true, phone: true }
    })

    if (!club) {
      console.error('❌ No se encontró ningún club en la base de datos')
      return
    }

    console.log(`📱 Club encontrado: ${club.name}`)
    console.log(`📞 Número WhatsApp: ${club.whatsappNumber || club.phone || 'No configurado'}`)

    // 2. Actualizar el número de WhatsApp si no existe
    if (!club.whatsappNumber) {
      const testNumber = '+525551234567' // Número de prueba
      await prisma.club.update({
        where: { id: club.id },
        data: { whatsappNumber: testNumber }
      })
      console.log(`✅ Número de WhatsApp actualizado: ${testNumber}`)
    }

    // 3. Generar un link de confirmación de reserva
    console.log('\n🔗 Generando link de confirmación...')
    const confirmationResult = await WhatsAppLinkService.generateLink({
      clubId: club.id,
      notificationType: 'BOOKING_CONFIRMATION',
      playerName: 'Juan Pérez',
      playerPhone: '+525559876543',
      message: `¡Hola Juan Pérez! 👋

Tu reserva en ${club.name} ha sido confirmada. ✅

📅 Fecha: 23/08/2025
⏰ Hora: 10:00
🎾 Cancha: Cancha Central
💰 Total: $350.00 MXN

¡Te esperamos en la cancha! 🎾`
    })

    if (confirmationResult.success) {
      console.log('✅ Link generado exitosamente!')
      console.log(`🔗 Link: ${confirmationResult.whatsappLink}`)
      console.log(`📧 Notification ID: ${confirmationResult.notificationId}`)
      
      // 4. Simular clic en el link
      if (confirmationResult.notificationId) {
        console.log('\n👆 Simulando clic en el link...')
        const clickResult = await WhatsAppLinkService.trackLinkClick(confirmationResult.notificationId)
        console.log(`✅ Clic registrado: ${clickResult}`)
      }
    } else {
      console.error(`❌ Error generando link: ${confirmationResult.error}`)
    }

    // 5. Generar un link de pago dividido
    console.log('\n💸 Generando link de pago dividido...')
    const splitResult = await WhatsAppLinkService.generateLink({
      clubId: club.id,
      notificationType: 'SPLIT_PAYMENT_REQUEST',
      playerName: 'María García',
      playerPhone: '+525559876544',
      message: `¡Hola María García! 💸

Te han invitado a dividir el pago de una reserva:

🏟️ Club: ${club.name}
📅 Fecha: 23/08/2025
⏰ Hora: 10:00
🎾 Cancha: Cancha Central
💰 Tu parte: $87.50 MXN

Completa tu pago aquí: http://localhost:3003/pay/test-booking

¡Nos vemos en la cancha! 🎾`
    })

    if (splitResult.success) {
      console.log('✅ Link de pago dividido generado!')
      console.log(`🔗 Link: ${splitResult.whatsappLink}`)
    }

    // 6. Obtener estadísticas
    console.log('\n📊 Obteniendo estadísticas...')
    const stats = await WhatsAppLinkService.getNotificationStats(club.id, 7)
    console.log('Estadísticas (últimos 7 días):', stats)

    // 7. Marcar links expirados
    console.log('\n⏰ Marcando links expirados...')
    const expiredCount = await WhatsAppLinkService.markExpiredLinks()
    console.log(`✅ Links expirados marcados: ${expiredCount}`)

    console.log('\n🎉 ¡Pruebas completadas exitosamente!')

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar las pruebas
testWhatsAppIntegration()