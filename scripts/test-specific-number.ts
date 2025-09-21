import { PrismaClient } from '@prisma/client'
import { WhatsAppLinkService } from '../lib/services/whatsapp-link-service'

const prisma = new PrismaClient()

async function main() {
  console.log('📱 GENERANDO MENSAJE DE PRUEBA\n')
  console.log('=' .repeat(50))
  
  const testPhone = '2213577517' // Número limpio sin espacios ni prefijo
  const testName = 'Cliente Prueba'
  
  console.log('📞 Número de prueba: +52 221 357 7517')
  console.log('👤 Nombre: ' + testName)
  
  // Get club and court
  const club = await prisma.club.findFirst()
  const court = await prisma.court.findFirst()
  
  if (!club || !court) {
    console.error('❌ No se encontró club o cancha')
    return
  }
  
  // Create test booking for this specific number
  const booking = await prisma.booking.create({
    data: {
      clubId: club.id,
      courtId: court.id,
      date: new Date('2025-08-27'),
      startTime: '19:00',
      endTime: '20:00',
      duration: 60,
      playerName: testName,
      playerEmail: 'prueba@test.com',
      playerPhone: testPhone,
      price: 60000, // $600 MXN
      currency: 'MXN',
      status: 'CONFIRMED',
      paymentStatus: 'pending'
    }
  })
  
  console.log('\n✅ Reserva de prueba creada:')
  console.log('   Fecha: 27 de agosto 2025')
  console.log('   Hora: 19:00')
  console.log('   Cancha:', court.name)
  console.log('   Total: $600.00 MXN')
  
  // Generate WhatsApp link
  const result = await WhatsAppLinkService.sendBookingConfirmation(booking.id)
  
  if (result.success && result.whatsappLink) {
    const messageMatch = result.whatsappLink.match(/text=(.+)$/)
    
    if (messageMatch) {
      const decodedMessage = decodeURIComponent(messageMatch[1])
      console.log('\n📝 MENSAJE QUE RECIBIRÁ:')
      console.log('=' .repeat(50))
      console.log(decodedMessage)
      console.log('=' .repeat(50))
    }
    
    console.log('\n🔗 LINK DE WHATSAPP PARA +52 221 357 7517:')
    console.log('=' .repeat(50))
    console.log(result.whatsappLink)
    console.log('=' .repeat(50))
    
    console.log('\n✨ INSTRUCCIONES:')
    console.log('1. Copia el link de arriba')
    console.log('2. Pégalo en tu navegador o aplicación')
    console.log('3. Se abrirá WhatsApp con el mensaje listo')
    console.log('4. Solo presiona enviar')
    
    const paymentUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
    console.log('\n💳 LINK DE PAGO INCLUIDO:')
    console.log(`${paymentUrl}/pay/${booking.id}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())