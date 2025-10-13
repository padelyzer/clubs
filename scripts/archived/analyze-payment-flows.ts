import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function analyzePaymentFlows() {
  console.log('💳 ANÁLISIS COMPLETO DE FLUJOS DE PAGO')
  console.log('=====================================\n')

  const clubId = 'club-basic5-001'

  // 1. Analizar métodos de pago disponibles en el sistema
  console.log('📋 MÉTODOS DE PAGO CONFIGURADOS:')
  console.log('=================================')

  // Obtener configuración de pagos del club
  const clubSettings = await prisma.clubSettings.findFirst({
    where: { clubId: clubId }
  })

  if (clubSettings) {
    console.log('✅ Configuración de pagos encontrada:')
    console.log(`   - Stripe habilitado: ${clubSettings.stripeEnabled}`)
    console.log(`   - Terminal habilitado: ${clubSettings.terminalEnabled}`)
    console.log(`   - Transferencia habilitada: ${clubSettings.transferEnabled}`)
    console.log(`   - Efectivo habilitado: ${clubSettings.cashEnabled}`)

    if (clubSettings.stripeEnabled) {
      console.log(`   - Stripe Account ID: ${clubSettings.stripeAccountId || 'No configurado'}`)
    }

    if (clubSettings.transferEnabled) {
      console.log(`   - Banco: ${clubSettings.bankName || 'No configurado'}`)
      console.log(`   - CLABE: ${clubSettings.clabe || 'No configurado'}`)
    }
  } else {
    console.log('❌ No se encontró configuración de pagos')
  }

  // 2. Analizar pagos realizados por método
  console.log('\n📊 PAGOS REALIZADOS POR MÉTODO:')
  console.log('===============================')

  const paymentsByMethod = await prisma.payment.groupBy({
    by: ['method'],
    where: {
      Booking: {
        clubId: clubId
      }
    },
    _count: {
      id: true
    },
    _sum: {
      amount: true
    }
  })

  paymentsByMethod.forEach(payment => {
    console.log(`   ${payment.method}: ${payment._count.id} pagos, $${(payment._sum.amount || 0) / 100}`)
  })

  // 3. Analizar estados de pago
  console.log('\n📊 ESTADOS DE PAGO:')
  console.log('===================')

  const paymentsByStatus = await prisma.payment.groupBy({
    by: ['status'],
    where: {
      Booking: {
        clubId: clubId
      }
    },
    _count: {
      id: true
    },
    _sum: {
      amount: true
    }
  })

  paymentsByStatus.forEach(payment => {
    console.log(`   ${payment.status}: ${payment._count.id} pagos, $${(payment._sum.amount || 0) / 100}`)
  })

  // 4. Analizar reservas por tipo de pago
  console.log('\n📊 RESERVAS POR TIPO DE PAGO:')
  console.log('=============================')

  const bookingsByPaymentType = await prisma.booking.groupBy({
    by: ['paymentType'],
    where: {
      clubId: clubId
    },
    _count: {
      id: true
    },
    _sum: {
      price: true
    }
  })

  bookingsByPaymentType.forEach(booking => {
    console.log(`   ${booking.paymentType || 'NULL'}: ${booking._count.id} reservas, $${(booking._sum.price || 0) / 100}`)
  })

  // 5. Analizar reservas por estado de pago
  console.log('\n📊 RESERVAS POR ESTADO DE PAGO:')
  console.log('===============================')

  const bookingsByPaymentStatus = await prisma.booking.groupBy({
    by: ['paymentStatus'],
    where: {
      clubId: clubId
    },
    _count: {
      id: true
    },
    _sum: {
      price: true
    }
  })

  bookingsByPaymentStatus.forEach(booking => {
    console.log(`   ${booking.paymentStatus}: ${booking._count.id} reservas, $${(booking._sum.price || 0) / 100}`)
  })

  // 6. Verificar consistencia Payment <-> Booking
  console.log('\n🔍 VERIFICACIÓN DE CONSISTENCIA:')
  console.log('================================')

  const bookingsWithPayments = await prisma.booking.findMany({
    where: {
      clubId: clubId,
      paymentStatus: 'completed'
    },
    include: {
      Payment: true,
      Transaction: true
    }
  })

  let consistencyIssues = 0
  bookingsWithPayments.forEach(booking => {
    const hasPayment = booking.Payment && booking.Payment.length > 0
    const hasTransaction = booking.Transaction && booking.Transaction.length > 0
    const paymentAmount = booking.Payment?.[0]?.amount || 0
    const transactionAmount = booking.Transaction?.[0]?.amount || 0

    if (!hasPayment) {
      console.log(`   ❌ Reserva ${booking.id} está "completed" pero no tiene Payment record`)
      consistencyIssues++
    }

    if (!hasTransaction) {
      console.log(`   ❌ Reserva ${booking.id} está "completed" pero no tiene Transaction`)
      consistencyIssues++
    }

    if (hasPayment && hasTransaction && paymentAmount !== transactionAmount) {
      console.log(`   ❌ Reserva ${booking.id}: Payment ($${paymentAmount/100}) ≠ Transaction ($${transactionAmount/100})`)
      consistencyIssues++
    }

    if (hasPayment && hasTransaction && booking.price !== paymentAmount) {
      console.log(`   ❌ Reserva ${booking.id}: Booking price ($${booking.price/100}) ≠ Payment ($${paymentAmount/100})`)
      consistencyIssues++
    }
  })

  if (consistencyIssues === 0) {
    console.log('   ✅ No se encontraron problemas de consistencia')
  } else {
    console.log(`   ⚠️  Se encontraron ${consistencyIssues} problemas de consistencia`)
  }

  // 7. Analizar split payments
  console.log('\n📊 ANÁLISIS DE SPLIT PAYMENTS:')
  console.log('==============================')

  const splitPaymentsCount = await prisma.splitPayment.count({
    where: {
      Booking: {
        clubId: clubId
      }
    }
  })

  const splitPaymentsByStatus = await prisma.splitPayment.groupBy({
    by: ['status'],
    where: {
      Booking: {
        clubId: clubId
      }
    },
    _count: {
      id: true
    },
    _sum: {
      amount: true
    }
  })

  console.log(`Total split payments: ${splitPaymentsCount}`)
  splitPaymentsByStatus.forEach(sp => {
    console.log(`   ${sp.status}: ${sp._count.id} pagos divididos, $${(sp._sum.amount || 0) / 100}`)
  })

  await prisma.$disconnect()
}

analyzePaymentFlows().catch(console.error)