import { prisma } from '../lib/config/prisma'

async function getPaymentLink() {
  try {
    console.log('🔍 Obteniendo link de pago...\n')
    
    // Buscar la reserva "Pago dividido"
    const booking = await prisma.booking.findFirst({
      where: {
        playerName: { contains: 'Pago dividido', mode: 'insensitive' }
      },
      include: {
        SplitPayment: {
          where: {
            status: 'processing'
          }
        }
      }
    })
    
    if (!booking) {
      console.log('❌ No se encontró la reserva')
      return
    }
    
    console.log(`📋 Reserva: ${booking.playerName}`)
    console.log(`   ID: ${booking.id}`)

    const processingPayment = booking.SplitPayment[0]
    if (processingPayment) {
      console.log(`💳 Pago en procesamiento:`)
      console.log(`   Jugador: ${processingPayment.playerName}`)
      console.log(`   ID: ${processingPayment.id}`)
      console.log(`   Monto: $${processingPayment.amount / 100} MXN`)
      console.log(`   Payment Intent: ${processingPayment.stripePaymentIntentId}`)
      
      const paymentLink = `http://localhost:3000/pay/${booking.id}?split=${processingPayment.id}`
      console.log(`\n🔗 Link de pago:`)
      console.log(paymentLink)
    } else {
      console.log('❌ No hay pagos en procesamiento')
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

getPaymentLink()