import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function auditIncomeConsistency() {
  console.log('🔍 AUDITORÍA DE CONSISTENCIA DE INGRESOS')
  console.log('===========================================\n')

  const clubId = 'club-basic5-001'

  // 1. Obtener todas las reservas pagadas
  const paidBookings = await prisma.booking.findMany({
    where: {
      clubId: clubId,
      paymentStatus: 'completed'
    },
    include: {
      Payment: true,
      Transaction: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`📊 RESERVAS PAGADAS: ${paidBookings.length}`)
  console.log('=====================================')

  let totalBookingIncome = 0
  let bookingsWithoutTransaction = 0
  let bookingsWithTransaction = 0
  let totalTransactionIncome = 0

  const inconsistencies: any[] = []

  for (const booking of paidBookings) {
    totalBookingIncome += booking.price

    const hasTransaction = booking.Transaction && booking.Transaction.length > 0

    if (hasTransaction) {
      bookingsWithTransaction++
      const transaction = booking.Transaction[0]
      totalTransactionIncome += transaction.amount

      // Verificar si coinciden los montos
      if (booking.price !== transaction.amount) {
        inconsistencies.push({
          type: 'MONTO_NO_COINCIDE',
          bookingId: booking.id,
          playerName: booking.playerName,
          bookingPrice: booking.price,
          transactionAmount: transaction.amount,
          difference: booking.price - transaction.amount
        })
      }
    } else {
      bookingsWithoutTransaction++
      inconsistencies.push({
        type: 'SIN_TRANSACCION',
        bookingId: booking.id,
        playerName: booking.playerName,
        bookingPrice: booking.price
      })
    }
  }

  console.log(`✅ Reservas con transacción: ${bookingsWithTransaction}`)
  console.log(`❌ Reservas sin transacción: ${bookingsWithoutTransaction}`)
  console.log(`💰 Total ingresos reservas: $${totalBookingIncome / 100}`)
  console.log(`💰 Total ingresos transacciones: $${totalTransactionIncome / 100}`)
  console.log(`📊 Diferencia: $${(totalBookingIncome - totalTransactionIncome) / 100}`)

  // 2. Obtener todas las transacciones de tipo BOOKING
  const bookingTransactions = await prisma.transaction.findMany({
    where: {
      clubId: clubId,
      type: 'INCOME',
      category: 'BOOKING'
    },
    include: {
      Booking: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`\n📊 TRANSACCIONES DE BOOKING: ${bookingTransactions.length}`)
  console.log('==========================================')

  let transactionsWithoutBooking = 0
  let orphanTransactionAmount = 0

  for (const transaction of bookingTransactions) {
    if (!transaction.Booking) {
      transactionsWithoutBooking++
      orphanTransactionAmount += transaction.amount
      inconsistencies.push({
        type: 'TRANSACCION_HUERFANA',
        transactionId: transaction.id,
        description: transaction.description,
        amount: transaction.amount
      })
    }
  }

  console.log(`❌ Transacciones sin reserva: ${transactionsWithoutBooking}`)
  console.log(`💰 Monto huérfano: $${orphanTransactionAmount / 100}`)

  // 3. Verificar duplicados
  console.log(`\n🔍 VERIFICANDO DUPLICADOS`)
  console.log('==========================')

  const duplicateTransactions = await prisma.$queryRaw`
    SELECT "bookingId", COUNT(*) as count, array_agg(id) as transaction_ids, SUM(amount) as total_amount
    FROM "Transaction"
    WHERE "clubId" = ${clubId} AND "bookingId" IS NOT NULL AND "category" = 'BOOKING'
    GROUP BY "bookingId"
    HAVING COUNT(*) > 1
  `

  console.log(`📊 Reservas con múltiples transacciones: ${(duplicateTransactions as any[]).length}`)

  for (const dup of duplicateTransactions as any[]) {
    inconsistencies.push({
      type: 'TRANSACCIONES_DUPLICADAS',
      bookingId: dup.bookingId,
      transactionCount: dup.count,
      transactionIds: dup.transaction_ids,
      totalAmount: dup.total_amount
    })
    console.log(`   ⚠️  Reserva ${dup.bookingId}: ${dup.count} transacciones, total: $${dup.total_amount / 100}`)
  }

  // 4. Resumen de inconsistencias
  console.log(`\n🚨 RESUMEN DE INCONSISTENCIAS`)
  console.log('==============================')

  const groupedInconsistencies = inconsistencies.reduce((acc, inc) => {
    acc[inc.type] = (acc[inc.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  Object.entries(groupedInconsistencies).forEach(([type, count]) => {
    console.log(`${type}: ${count} casos`)
  })

  if (inconsistencies.length === 0) {
    console.log('✅ ¡Perfecto! No se encontraron inconsistencias')
  } else {
    console.log(`\n📋 DETALLES DE INCONSISTENCIAS:`)
    console.log('================================')
    inconsistencies.forEach((inc, i) => {
      console.log(`${i + 1}. ${inc.type}:`)
      console.log(`   ${JSON.stringify(inc, null, 2)}`)
    })
  }

  // 5. Verificar totales del dashboard
  console.log(`\n📊 VERIFICACIÓN CON DASHBOARD`)
  console.log('==============================')

  const dashboardMetrics = await prisma.transaction.aggregate({
    where: {
      clubId: clubId,
      type: 'INCOME',
      category: 'BOOKING'
    },
    _sum: {
      amount: true
    },
    _count: {
      id: true
    }
  })

  console.log(`Transacciones contadas: ${dashboardMetrics._count.id}`)
  console.log(`Total según transacciones: $${(dashboardMetrics._sum.amount || 0) / 100}`)
  console.log(`Total según reservas pagadas: $${totalBookingIncome / 100}`)

  const isBalanced = (dashboardMetrics._sum.amount || 0) === totalBookingIncome
  console.log(`Estado: ${isBalanced ? '✅ BALANCEADO' : '❌ DESBALANCEADO'}`)

  await prisma.$disconnect()
}

auditIncomeConsistency().catch(console.error)