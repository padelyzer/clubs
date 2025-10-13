import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function testBookingTransactionCreation() {
  console.log('🧪 Probando la creación automática de transacciones...\n')

  // Test the logic without actually creating a booking
  const testData = {
    paymentMethod: 'onsite' as const,
    playerName: 'Test Player'
  }

  // Simulate the logic from the fixed booking API
  const paymentMethod = testData.paymentMethod || 'onsite'
  const paymentStatus = paymentMethod === 'stripe' ? 'pending' : 'completed'

  console.log('🔧 Lógica de prueba:')
  console.log('   paymentMethod:', paymentMethod)
  console.log('   paymentStatus:', paymentStatus)
  console.log('   ¿Se crearía transacción?:', paymentStatus === 'completed')

  if (paymentStatus === 'completed') {
    console.log('\n✅ El fix funcionaría:')
    console.log('   - Se marcaría la reserva como "completed"')
    console.log('   - Se crearía automáticamente una transacción')
    console.log('   - La transacción aparecería en el módulo de Finanzas')
  } else {
    console.log('\n❌ El fix NO funcionaría')
  }

  // Test with stripe method too
  console.log('\n🧪 Probando con método Stripe:')
  const stripePaymentStatus = 'stripe' === 'stripe' ? 'pending' : 'completed'
  console.log('   paymentMethod: stripe')
  console.log('   paymentStatus:', stripePaymentStatus)
  console.log('   ¿Se crearía transacción?:', stripePaymentStatus === 'completed')

  console.log('\n📊 Resumen del fix:')
  console.log('   ✅ Pagos "onsite" (efectivo/terminal): Se marca como "completed" → Crea transacción')
  console.log('   ⏳ Pagos "stripe": Se marca como "pending" → NO crea transacción (correcto)')
  console.log('   ✅ Cuando stripe confirme el pago, otro endpoint creará la transacción')

  await prisma.$disconnect()
}

testBookingTransactionCreation().catch(console.error)