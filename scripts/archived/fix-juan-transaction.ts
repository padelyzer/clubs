import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createMissingTransaction() {
  try {
    const bookingId = 'booking_club-basic5-001_1758042188469_woxyvihgu'

    // Verificar que la reserva existe
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { Court: true }
    })

    if (!booking) {
      console.log('No se encontró la reserva')
      return
    }

    console.log('Reserva encontrada:')
    console.log(`  Cliente: ${booking.playerName}`)
    console.log(`  Cancha: ${booking.Court?.name}`)
    console.log(`  Precio: $${booking.price}`)
    console.log(`  Estado pago: ${booking.paymentStatus}`)

    // Verificar si ya existe una transacción
    const existingTransaction = await prisma.transaction.findFirst({
      where: { bookingId }
    })

    if (existingTransaction) {
      console.log('\n✓ Ya existe una transacción para esta reserva')
      return
    }

    // Crear la transacción faltante
    const now = new Date()
    const transaction = await prisma.transaction.create({
      data: {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clubId: booking.clubId,
        bookingId: booking.id,
        amount: booking.price,
        type: 'INCOME',
        category: 'BOOKING',
        description: `Reserva de cancha - ${booking.playerName}`,
        date: booking.date,
        currency: 'MXN',
        createdAt: now,
        updatedAt: now
      }
    })

    console.log('\n✓ Transacción creada exitosamente:')
    console.log(`  ID: ${transaction.id}`)
    console.log(`  Monto: $${transaction.amount}`)
    console.log(`  Categoría: ${transaction.category}`)
    console.log(`  Fecha: ${transaction.date}`)

    console.log('\n✅ La reserva de Juan Pérez ahora aparecerá en los ingresos')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createMissingTransaction()