import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function checkFilomenoPayment() {
  console.log('🔍 Analizando el pago de Filomeno...\n')

  const bookingId = 'booking_club-basic5-001_1758047973384_07jk0c4cw'

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Payment: true,
      SplitPayment: true
    }
  })

  if (!booking) {
    console.log('❌ No se encontró la reserva')
    return
  }

  console.log('📋 Detalles del pago:')
  console.log('   Estado de pago:', booking.paymentStatus)
  console.log('   Tipo de pago:', booking.paymentType)
  console.log('   Pago dividido habilitado:', booking.splitPaymentEnabled)
  console.log('   Registros de Payment:', booking.Payment?.length || 0)

  if (booking.Payment && booking.Payment.length > 0) {
    console.log('\n💳 Detalles del Payment record:')
    booking.Payment.forEach((p, i) => {
      console.log(`   Pago ${i + 1}:`)
      console.log(`     - ID: ${p.id}`)
      console.log(`     - Método: ${p.method}`)
      console.log(`     - Monto: $${p.amount / 100}`)
      console.log(`     - Estado: ${p.status}`)
      console.log(`     - Stripe Payment Intent: ${p.stripePaymentIntentId || 'N/A'}`)
      console.log(`     - Completado: ${p.completedAt}`)
    })
  }

  // Buscar en logs de servidor para ver qué endpoint se usó
  console.log('\n🔍 Posibles rutas de pago usadas:')

  if (booking.Payment?.[0]?.stripePaymentIntentId) {
    console.log('   ✅ Probablemente se usó Stripe payment')
    console.log('   Ruta probable: /api/stripe/payments/confirm')
    console.log('   ⚠️ Esta ruta puede NO estar creando transacciones')
  } else if (booking.paymentType === 'ONLINE') {
    console.log('   ✅ Se marcó como pago ONLINE')
    console.log('   Ruta probable: /api/bookings/[id]/payment-link o similar')
  } else {
    console.log('   ✅ Se usó pago manual')
    console.log('   Ruta probable: /api/bookings/[id]/payment')
  }

  console.log('\n💡 Diagnóstico:')
  console.log('   La reserva está pagada pero no se creó la transacción.')
  console.log('   Esto sugiere que el método de pago usado no tiene la lógica')
  console.log('   para crear transacciones automáticamente.')

  await prisma.$disconnect()
}

checkFilomenoPayment().catch(console.error)