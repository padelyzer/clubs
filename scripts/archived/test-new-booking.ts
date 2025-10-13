import { PrismaClient } from '@prisma/client'
import { WhatsAppLinkService } from '../lib/services/whatsapp-link-service'

const prisma = new PrismaClient()

async function main() {
  console.log('🎾 CREANDO NUEVA RESERVA DE PRUEBA\n')
  console.log('=' .repeat(50))
  
  // Get club and court
  const club = await prisma.club.findFirst()
  const court = await prisma.court.findFirst()
  
  if (!club || !court) {
    console.error('❌ No se encontró club o cancha')
    return
  }
  
  // Create new booking
  const booking = await prisma.booking.create({
    data: {
      clubId: club.id,
      courtId: court.id,
      date: new Date('2025-08-25'),
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      playerName: 'María González',
      playerEmail: 'maria@test.com',
      playerPhone: '2223334444',
      price: 50000, // $500 MXN
      currency: 'MXN',
      status: 'CONFIRMED',
      paymentStatus: 'pending'
    }
  })
  
  console.log('✅ Reserva creada:', booking.id)
  console.log('   Cliente:', booking.playerName)
  console.log('   Teléfono:', booking.playerPhone)
  console.log('   Fecha:', booking.date.toLocaleDateString('es-MX'))
  console.log('   Hora:', booking.startTime)
  
  // Generate WhatsApp link
  console.log('\n📱 GENERANDO LINK DE WHATSAPP...')
  
  const result = await WhatsAppLinkService.sendBookingConfirmation(booking.id)
  
  if (result.success && result.whatsappLink) {
    // Extract phone and message from link
    const phoneMatch = result.whatsappLink.match(/wa\.me\/(\d+)/)
    const messageMatch = result.whatsappLink.match(/text=(.+)$/)
    
    console.log('\n✅ LINK GENERADO CORRECTAMENTE:')
    console.log('   Destinatario (Cliente):', `+${phoneMatch?.[1]}`)
    console.log('   ID Notificación:', result.notificationId)
    
    if (messageMatch) {
      const decodedMessage = decodeURIComponent(messageMatch[1])
      console.log('\n📝 MENSAJE:')
      console.log('-'.repeat(40))
      console.log(decodedMessage)
      console.log('-'.repeat(40))
    }
    
    console.log('\n🔗 Link completo:')
    console.log(result.whatsappLink)
    
    console.log('\n✨ USO:')
    console.log('   1. El administrador del club hace click en el link')
    console.log('   2. Se abre WhatsApp con el cliente como destinatario')
    console.log('   3. El mensaje ya está listo para enviar')
  } else {
    console.error('❌ Error generando link:', result.error)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())