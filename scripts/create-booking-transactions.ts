import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createBookingTransactions() {
  try {
    console.log('💳 Creando transacciones para reservas pagadas...')
    console.log('=' .repeat(60))

    const clubId = 'cmers0a3v0000r4ujqpxd0qls'

    // Delete old incorrect transactions for bookings
    console.log('🗑️ Eliminando transacciones incorrectas de reservas...')
    await prisma.transaction.deleteMany({
      where: {
        clubId,
        type: 'INCOME',
        category: 'BOOKING'
      }
    })

    // Get all completed bookings
    const completedBookings = await prisma.booking.findMany({
      where: {
        clubId,
        paymentStatus: 'completed',
        status: { not: 'CANCELLED' }
      }
    })

    console.log(`📊 Creando transacciones para ${completedBookings.length} reservas pagadas...`)

    let createdCount = 0
    for (const booking of completedBookings) {
      await prisma.transaction.create({
        data: {
          clubId,
          type: 'INCOME',
          category: 'BOOKING',
          amount: booking.price,
          currency: 'MXN',
          description: `Reserva de ${booking.playerName} - ${booking.date.toISOString().split('T')[0]} ${booking.startTime}`,
          date: booking.date,
          bookingId: booking.id,
          reference: `BOOKING-${booking.id}`,
          notes: `Cancha reservada de ${booking.startTime} a ${booking.endTime}`
        }
      })
      createdCount++
      
      if (createdCount % 50 === 0) {
        console.log(`  ✓ ${createdCount} transacciones creadas...`)
      }
    }

    console.log(`✅ ${createdCount} transacciones creadas exitosamente`)

    // Verify totals
    const totalIncome = await prisma.transaction.aggregate({
      where: {
        clubId,
        type: 'INCOME'
      },
      _sum: { amount: true },
      _count: true
    })

    console.log(`\n💰 TOTAL INGRESOS: $${(totalIncome._sum.amount || 0) / 100} MXN`)
    console.log(`   Transacciones: ${totalIncome._count}`)

    // Check breakdown by category
    const breakdown = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        clubId,
        type: 'INCOME'
      },
      _sum: { amount: true },
      _count: true
    })

    console.log('\n📊 DESGLOSE POR CATEGORÍA:')
    breakdown.forEach(cat => {
      console.log(`  - ${cat.category}: $${(cat._sum.amount || 0) / 100} MXN (${cat._count} transacciones)`)
    })

    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createBookingTransactions()
