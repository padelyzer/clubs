import { prisma } from '../lib/config/prisma'

async function resetPaymentIntent() {
  try {
    console.log('🔄 Regenerando Payment Intent con formato correcto...\n')
    
    // Buscar el split payment en processing
    const splitPayment = await prisma.splitPayment.findFirst({
      where: {
        status: 'processing',
        stripePaymentIntentId: { not: null }
      },
      include: {
        booking: true
      }
    })
    
    if (!splitPayment) {
      console.log('❌ No se encontró split payment en processing')
      return
    }
    
    console.log(`💳 Split payment encontrado:`)
    console.log(`   Jugador: ${splitPayment.playerName}`)
    console.log(`   Estado: ${splitPayment.status}`)
    console.log(`   Payment Intent actual: ${splitPayment.stripePaymentIntentId}`)
    
    // Generar nuevo Payment Intent ID y client secret con formato correcto
    const newPaymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Actualizar el split payment
    await prisma.splitPayment.update({
      where: { id: splitPayment.id },
      data: {
        stripePaymentIntentId: newPaymentIntentId,
        updatedAt: new Date()
      }
    })
    
    console.log(`\n✅ Payment Intent actualizado:`)
    console.log(`   Nuevo ID: ${newPaymentIntentId}`)
    console.log(`   Link actualizado: http://localhost:3000/pay/${splitPayment.bookingId}?split=${splitPayment.id}`)
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

resetPaymentIntent()