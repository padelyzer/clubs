import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function createFilomenoTransaction() {
  console.log('🔧 Creando transacción faltante para Filomeno...\n')

  const bookingId = 'booking_club-basic5-001_1758047973384_07jk0c4cw'

  // Verify booking exists
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { Payment: true }
  })

  if (!booking) {
    console.log('❌ No se encontró la reserva')
    return
  }

  // Check if transaction already exists
  const existingTransaction = await prisma.transaction.findFirst({
    where: { bookingId: bookingId }
  })

  if (existingTransaction) {
    console.log('⚠️ Ya existe una transacción para esta reserva')
    return
  }

  // Create the transaction
  const transaction = await prisma.transaction.create({
    data: {
      id: `tx_${Date.now()}_${nanoid(9).toLowerCase()}`,
      clubId: 'club-basic5-001',
      type: 'INCOME',
      category: 'BOOKING',
      amount: booking.price,
      currency: 'MXN',
      description: `Reserva de cancha - ${booking.playerName}`,
      reference: booking.Payment?.[0]?.stripePaymentIntentId || null,
      bookingId: bookingId,
      date: new Date(),
      createdBy: 'SYSTEM_FIX',
      notes: `Transacción creada automáticamente para reserva pagada. Método de pago: ${booking.Payment?.[0]?.method || 'CASH'}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  console.log('✅ Transacción creada exitosamente:')
  console.log('   ID:', transaction.id)
  console.log('   Descripción:', transaction.description)
  console.log('   Monto:', `$${transaction.amount / 100}`)
  console.log('   Categoría:', transaction.category)
  console.log('')
  console.log('🎉 Ahora la reserva de Filomeno aparecerá en Finanzas!')
  console.log('   Ve a: http://localhost:3002/c/basic5-club/dashboard/finance/income')
  console.log('   Busca: "filomeno"')

  await prisma.$disconnect()
}

createFilomenoTransaction().catch(console.error)