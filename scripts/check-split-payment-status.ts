import { prisma } from '../lib/config/prisma'

async function checkSplitPaymentStatus() {
  try {
    console.log('🔍 Verificando estado de pagos divididos...\n')
    
    // Buscar la reserva "Pago dividido"
    const booking = await prisma.booking.findFirst({
      where: {
        playerName: { contains: 'Pago dividido', mode: 'insensitive' }
      },
      include: {
        splitPayments: true
      }
    })
    
    if (!booking) {
      console.log('❌ No se encontró la reserva')
      return
    }
    
    console.log(`📋 Reserva: ${booking.playerName}`)
    console.log(`   Estado pago: ${booking.paymentStatus}`)
    console.log(`   Pagos divididos: ${booking.splitPayments.length}\n`)
    
    // Mostrar estado de cada pago
    booking.splitPayments.forEach((sp, i) => {
      console.log(`   ${i + 1}. ${sp.playerName}: $${sp.amount / 100} MXN`)
      console.log(`      Estado: ${sp.status}`)
      console.log(`      Payment Intent: ${sp.stripePaymentIntentId || 'No generado'}`)
      console.log(`      Completado: ${sp.completedAt || 'Pendiente'}\n`)
    })
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkSplitPaymentStatus()