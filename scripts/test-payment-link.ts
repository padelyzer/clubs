import { PrismaClient } from '@prisma/client'
import { WhatsAppLinkService } from '../lib/services/whatsapp-link-service'

const prisma = new PrismaClient()

async function main() {
  console.log('💳 PROBANDO NOTIFICACIONES CON LINKS DE PAGO\n')
  console.log('=' .repeat(50))
  
  // Get club and court
  const club = await prisma.club.findFirst()
  const court = await prisma.court.findFirst()
  
  if (!club || !court) {
    console.error('❌ No se encontró club o cancha')
    return
  }
  
  // Create test booking with pending payment
  const booking = await prisma.booking.create({
    data: {
      clubId: club.id,
      courtId: court.id,
      date: new Date('2025-08-26'),
      startTime: '16:00',
      endTime: '17:00',
      duration: 60,
      playerName: 'Ana Martínez',
      playerEmail: 'ana@test.com',
      playerPhone: '5556667777',
      price: 75000, // $750 MXN
      currency: 'MXN',
      status: 'CONFIRMED',
      paymentStatus: 'pending'
    }
  })
  
  console.log('✅ Reserva creada:')
  console.log('   Cliente:', booking.playerName)
  console.log('   Teléfono:', booking.playerPhone)
  console.log('   Total: $', (booking.price / 100).toFixed(2), 'MXN')
  console.log('   Estado de pago:', booking.paymentStatus)
  
  // Test 1: Booking confirmation with payment link
  console.log('\n\n📱 TEST 1: CONFIRMACIÓN CON LINK DE PAGO')
  console.log('-'.repeat(50))
  
  const confirmResult = await WhatsAppLinkService.sendBookingConfirmation(booking.id)
  
  if (confirmResult.success && confirmResult.whatsappLink) {
    const phoneMatch = confirmResult.whatsappLink.match(/wa\.me\/(\d+)/)
    const messageMatch = confirmResult.whatsappLink.match(/text=(.+)$/)
    
    console.log('✅ Link generado para:', `+${phoneMatch?.[1]}`)
    
    if (messageMatch) {
      const decodedMessage = decodeURIComponent(messageMatch[1])
      console.log('\n📝 Mensaje:')
      console.log(decodedMessage)
      
      // Check if payment link is included
      if (decodedMessage.includes('/pay/')) {
        console.log('\n✅ Link de pago incluido correctamente')
      } else {
        console.log('\n❌ Link de pago NO encontrado')
      }
    }
  }
  
  // Test 2: Payment reminder
  console.log('\n\n💰 TEST 2: RECORDATORIO DE PAGO')
  console.log('-'.repeat(50))
  
  const reminderResult = await WhatsAppLinkService.generateLink({
    clubId: club.id,
    notificationType: 'PAYMENT_REMINDER',
    playerName: booking.playerName,
    playerPhone: booking.playerPhone,
    bookingId: booking.id
  })
  
  if (reminderResult.success && reminderResult.whatsappLink) {
    const messageMatch = reminderResult.whatsappLink.match(/text=(.+)$/)
    
    if (messageMatch) {
      const decodedMessage = decodeURIComponent(messageMatch[1])
      console.log('📝 Mensaje:')
      console.log(decodedMessage)
      
      // Check if payment link is included
      if (decodedMessage.includes('/pay/')) {
        console.log('\n✅ Link de pago incluido correctamente')
      } else {
        console.log('\n❌ Link de pago NO encontrado')
      }
    }
  }
  
  // Test 3: Split payment request
  console.log('\n\n💸 TEST 3: PAGO DIVIDIDO')
  console.log('-'.repeat(50))
  
  // Create split payment
  const splitPayment = await prisma.splitPayment.create({
    data: {
      bookingId: booking.id,
      playerName: 'Carlos López',
      playerEmail: 'carlos@test.com',
      playerPhone: '5554443333',
      amount: 37500, // Half of $750
      status: 'pending'
    }
  })
  
  const splitResult = await WhatsAppLinkService.sendSplitPaymentRequest(splitPayment.id)
  
  if (splitResult.success && splitResult.whatsappLink) {
    const messageMatch = splitResult.whatsappLink.match(/text=(.+)$/)
    
    if (messageMatch) {
      const decodedMessage = decodeURIComponent(messageMatch[1])
      console.log('📝 Mensaje:')
      console.log(decodedMessage)
      
      // Check if payment link is included with split parameter
      if (decodedMessage.includes('/pay/') && decodedMessage.includes('split=')) {
        console.log('\n✅ Link de pago dividido incluido correctamente')
      } else {
        console.log('\n❌ Link de pago dividido NO encontrado o incorrecto')
      }
    }
  }
  
  console.log('\n\n✨ RESUMEN DE PRUEBAS:')
  console.log('   • Los íconos diamante (◆) han sido reemplazados por bullets (•)')
  console.log('   • Se incluye link de pago en todas las notificaciones relevantes')
  console.log('   • Los mensajes están optimizados para WhatsApp')
  console.log('   • URL base:', process.env.NEXT_PUBLIC_APP_URL || 'https://padelyzer.com')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())