import { PrismaClient } from '@prisma/client'
import { WhatsAppLinkService } from '../lib/services/whatsapp-link-service'

const prisma = new PrismaClient()

async function main() {
  console.log('📱 ENVIAR NOTIFICACIÓN A RESERVA EXISTENTE\n')
  console.log('=' .repeat(50))
  
  // Get the most recent booking
  const booking = await prisma.booking.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      club: { select: { id: true, name: true } },
      court: { select: { name: true } }
    }
  })
  
  if (!booking) {
    console.error('❌ No se encontraron reservas')
    return
  }
  
  console.log('📋 Reserva encontrada:')
  console.log('   ID:', booking.id)
  console.log('   Cliente:', booking.playerName)
  console.log('   Teléfono:', booking.playerPhone)
  console.log('   Fecha:', booking.date.toLocaleDateString('es-MX'))
  console.log('   Hora:', booking.startTime)
  console.log('   Total: $', (booking.price / 100).toFixed(2), 'MXN')
  console.log('   Estado:', booking.status)
  console.log('   Pago:', booking.paymentStatus)
  
  console.log('\n¿Qué tipo de notificación quieres enviar?')
  console.log('1. Confirmación de reserva (con link de pago)')
  console.log('2. Recordatorio de pago')
  
  // For this demo, we'll send a booking confirmation
  // You can change this to test different notification types
  const notificationType = 'BOOKING_CONFIRMATION' // Change to 'PAYMENT_REMINDER' if needed
  
  console.log(`\n✉️ Enviando: ${notificationType}...`)
  
  let result
  if (notificationType === 'BOOKING_CONFIRMATION') {
    result = await WhatsAppLinkService.sendBookingConfirmation(booking.id)
  } else {
    result = await WhatsAppLinkService.generateLink({
      clubId: booking.clubId,
      notificationType: 'PAYMENT_REMINDER',
      playerName: booking.playerName,
      playerPhone: booking.playerPhone,
      bookingId: booking.id
    })
  }
  
  if (result.success && result.whatsappLink) {
    const phoneMatch = result.whatsappLink.match(/wa\.me\/(\d+)/)
    const messageMatch = result.whatsappLink.match(/text=(.+)$/)
    
    console.log('\n✅ NOTIFICACIÓN GENERADA:')
    console.log('   Destinatario:', `+${phoneMatch?.[1]}`)
    console.log('   ID Notificación:', result.notificationId)
    
    if (messageMatch) {
      const decodedMessage = decodeURIComponent(messageMatch[1])
      console.log('\n📝 MENSAJE:')
      console.log('-'.repeat(50))
      console.log(decodedMessage)
      console.log('-'.repeat(50))
    }
    
    console.log('\n🔗 LINK DE WHATSAPP (click para abrir):')
    console.log(result.whatsappLink)
    
    console.log('\n✨ INSTRUCCIONES:')
    console.log('1. Copia el link de arriba')
    console.log('2. Pégalo en tu navegador')
    console.log('3. Se abrirá WhatsApp con el mensaje pre-escrito')
    console.log('4. El link de pago estará incluido en el mensaje')
    
    // Also show the payment link separately
    const paymentUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
    console.log('\n💳 LINK DE PAGO DIRECTO:')
    console.log(`${paymentUrl}/pay/${booking.id}`)
    
  } else {
    console.error('❌ Error:', result.error)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())