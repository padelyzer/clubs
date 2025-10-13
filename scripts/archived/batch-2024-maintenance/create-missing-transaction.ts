import { prisma } from './lib/config/prisma'

async function createMissingTransaction() {
  console.log('💰 Creating missing transaction for Jaime Alcázar booking...')
  
  // Get the booking details
  const booking = await prisma.booking.findMany({
    where: {
      clubId: 'club-basic5-001',
      playerName: 'Jaime Alcázar',
      paymentStatus: 'completed',
      date: {
        gte: new Date('2025-09-10'),
        lt: new Date('2025-09-11')
      }
    },
    include: {
      Court: true,
      Payment: true
    }
  })
  
  if (booking.length === 0) {
    console.log('❌ No completed booking found for Jaime Alcázar on 2025-09-10')
    return
  }
  
  const targetBooking = booking[0]
  console.log('📋 Found booking:', targetBooking.id)
  console.log('   Player:', targetBooking.playerName)
  console.log('   Amount:', `$${targetBooking.price / 100}`)
  console.log('   Date:', targetBooking.date.toISOString().split('T')[0])
  console.log('   Court:', targetBooking.Court.name)
  console.log('   Payment Status:', targetBooking.paymentStatus)
  
  // Check if transaction already exists
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      bookingId: targetBooking.id
    }
  })
  
  if (existingTransaction) {
    console.log('⚠️ Transaction already exists:', existingTransaction.id)
    return
  }
  
  // Determine payment method from Payment record
  let paymentMethod = 'efectivo' // default
  if (targetBooking.Payment && targetBooking.Payment.length > 0) {
    const payment = targetBooking.Payment[0]
    paymentMethod = payment.method === 'STRIPE' ? 'Stripe' :
                   payment.method === 'TERMINAL' ? 'terminal' :
                   payment.method === 'SPEI' ? 'transferencia' : 'efectivo'
  }
  
  // Generate transaction ID
  const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2)}`
  
  // Create the missing transaction
  const transaction = await prisma.transaction.create({
    data: {
      id: transactionId,
      clubId: 'club-basic5-001',
      type: 'INCOME',
      category: 'BOOKING',
      amount: targetBooking.price,
      currency: 'MXN',
      description: `Pago de reserva - ${targetBooking.playerName} - ${targetBooking.Court.name}`,
      reference: `BOOKING-${targetBooking.id}`,
      bookingId: targetBooking.id,
      date: targetBooking.date,
      createdBy: 'system-fix', // Indicating this was created by system fix
      notes: `Transacción creada manualmente para reserva pagada vía ${paymentMethod}. Fecha: ${targetBooking.date.toLocaleDateString('es-MX')} Hora: ${targetBooking.startTime}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
  
  console.log('✅ Created transaction:', transaction.id)
  console.log('   Type:', transaction.type)
  console.log('   Category:', transaction.category)
  console.log('   Amount:', `$${transaction.amount / 100} ${transaction.currency}`)
  console.log('   Description:', transaction.description)
  console.log('   Reference:', transaction.reference)
  console.log('   Date:', transaction.date.toISOString().split('T')[0])
  
  console.log('\n🎉 Missing transaction created successfully!')
  console.log('💡 This income should now appear in the finance dashboard.')
}

createMissingTransaction().catch(console.error).finally(() => process.exit())