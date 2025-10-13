import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function testMissingTransactionFix() {
  console.log('🧪 Probando el fix para transacciones faltantes...\n')

  const bookingId = 'booking_club-basic5-001_1758047973384_07jk0c4cw'

  // 1. Get the booking details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Payment: true,
      Court: true
    }
  })

  if (!booking) {
    console.log('❌ No se encontró la reserva')
    return
  }

  console.log('📋 Estado de la reserva:')
  console.log('   Nombre:', booking.playerName)
  console.log('   Estado de pago:', booking.paymentStatus)
  console.log('   Precio:', `$${booking.price / 100}`)
  console.log('   Tiene payment record:', booking.Payment?.length > 0)
  console.log('   Método de pago:', booking.Payment?.[0]?.method)

  // 2. Check if transaction exists
  const existingTransaction = await prisma.transaction.findFirst({
    where: { bookingId: bookingId }
  })

  console.log('   Tiene transacción:', existingTransaction ? 'SÍ' : 'NO')

  // 3. Test the logic conditions
  const shouldCreateMissingTransaction = booking.paymentStatus === 'completed'

  console.log('\n🔧 Análisis del fix:')
  console.log('   shouldCreateMissingTransaction:', shouldCreateMissingTransaction)
  console.log('   !existingTransaction:', !existingTransaction)
  console.log('   Se debe crear transacción:', shouldCreateMissingTransaction && !existingTransaction)

  if (shouldCreateMissingTransaction && !existingTransaction) {
    console.log('\n✅ El fix SÍ aplicaría para esta reserva')
    console.log('   Se crearía una transacción automáticamente durante el check-in')

    // Simulate what the transaction would look like
    const paymentMethodFromRecord = booking.Payment?.[0]?.method || 'CASH'

    console.log('\n🎯 Datos de transacción que se crearían:')
    console.log('   Descripción:', `Pago de reserva - ${booking.playerName} - ${booking.Court?.name || 'Sin cancha'}`)
    console.log('   Monto:', `$${booking.price / 100}`)
    console.log('   Método:', paymentMethodFromRecord)
    console.log('   Referencia:', `${paymentMethodFromRecord}-${bookingId}`)

  } else {
    console.log('\n❌ El fix NO aplicaría para esta reserva')
    if (existingTransaction) {
      console.log('   Razón: Ya tiene transacción')
    }
    if (booking.paymentStatus !== 'completed') {
      console.log('   Razón: Estado de pago no es "completed"')
    }
  }

  // 4. Test broader scope - find all bookings without transactions
  const bookingsWithoutTransactions = await prisma.booking.count({
    where: {
      clubId: 'club-basic5-001',
      paymentStatus: 'completed',
      Transaction: {
        none: {}
      }
    }
  })

  console.log('\n📊 Estadísticas globales:')
  console.log(`   Reservas pagadas sin transacción: ${bookingsWithoutTransactions}`)
  console.log(`   El fix ayudaría a resolver estos ${bookingsWithoutTransactions} casos`)

  await prisma.$disconnect()
}

testMissingTransactionFix().catch(console.error)