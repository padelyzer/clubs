import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function cleanOrphanTransactions() {
  console.log('🧹 LIMPIEZA DE TRANSACCIONES HUÉRFANAS')
  console.log('=====================================\n')

  const clubId = 'club-basic5-001'

  // 1. Hacer backup de las transacciones que se van a eliminar
  console.log('📋 PASO 1: Creando respaldo de transacciones huérfanas...')

  const orphanTransactions = await prisma.transaction.findMany({
    where: {
      clubId: clubId,
      type: 'INCOME',
      category: 'BOOKING',
      bookingId: null
    }
  })

  console.log(`Encontradas ${orphanTransactions.length} transacciones huérfanas`)

  // Calcular total
  const totalAmount = orphanTransactions.reduce((sum, tx) => sum + tx.amount, 0)
  console.log(`Monto total a eliminar: $${totalAmount / 100}`)

  // 2. Identificar patrones de datos de prueba
  console.log('\n🔍 PASO 2: Identificando datos de prueba...')

  const testDataPatterns = orphanTransactions.filter(tx =>
    tx.createdBy === null ||
    tx.createdBy === 'SPLIT_PAYMENT_SYSTEM' ||
    tx.reference?.includes('BOK-2025') ||
    tx.reference?.includes('RES-2025') ||
    tx.description.includes('Reserva Cancha')
  )

  console.log(`Transacciones identificadas como datos de prueba: ${testDataPatterns.length}`)

  // 3. Confirmar eliminación
  if (testDataPatterns.length === orphanTransactions.length) {
    console.log('✅ Todas las transacciones huérfanas parecen ser datos de prueba')
  } else {
    console.log('⚠️  Algunas transacciones huérfanas podrían ser legítimas')
    const legitimate = orphanTransactions.filter(tx => !testDataPatterns.includes(tx))
    console.log('Transacciones potencialmente legítimas:')
    legitimate.forEach(tx => {
      console.log(`  - ${tx.id}: ${tx.description} - $${tx.amount / 100}`)
    })
  }

  // 4. Realizar limpieza
  console.log('\n🧹 PASO 3: Ejecutando limpieza...')

  const deleteResult = await prisma.transaction.deleteMany({
    where: {
      clubId: clubId,
      type: 'INCOME',
      category: 'BOOKING',
      bookingId: null
    }
  })

  console.log(`✅ Eliminadas ${deleteResult.count} transacciones huérfanas`)

  // 5. Verificar resultado
  console.log('\n📊 PASO 4: Verificando resultado...')

  const remainingOrphans = await prisma.transaction.count({
    where: {
      clubId: clubId,
      type: 'INCOME',
      category: 'BOOKING',
      bookingId: null
    }
  })

  console.log(`Transacciones huérfanas restantes: ${remainingOrphans}`)

  // 6. Recalcular totales
  const finalTotals = await prisma.transaction.aggregate({
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

  console.log('\n📊 RESUMEN FINAL:')
  console.log('==================')
  console.log(`Total transacciones BOOKING restantes: ${finalTotals._count.id}`)
  console.log(`Total ingresos de reservas: $${(finalTotals._sum.amount || 0) / 100}`)

  // 7. Verificar balance con reservas pagadas
  const paidBookings = await prisma.booking.aggregate({
    where: {
      clubId: clubId,
      paymentStatus: 'completed'
    },
    _sum: {
      price: true
    },
    _count: {
      id: true
    }
  })

  console.log(`Total reservas pagadas: ${paidBookings._count.id}`)
  console.log(`Total ingresos según reservas: $${(paidBookings._sum.price || 0) / 100}`)

  const isBalanced = (finalTotals._sum.amount || 0) === (paidBookings._sum.price || 0)
  console.log(`\n${isBalanced ? '✅ SISTEMA BALANCEADO' : '❌ SISTEMA DESBALANCEADO'}`)

  if (!isBalanced) {
    const difference = (finalTotals._sum.amount || 0) - (paidBookings._sum.price || 0)
    console.log(`Diferencia: $${difference / 100}`)
  }

  await prisma.$disconnect()
}

cleanOrphanTransactions().catch(console.error)