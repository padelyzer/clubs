import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function paymentFlowAnalysis() {
  console.log('💳 ANÁLISIS COMPLETO DEL FLUJO DE PAGOS')
  console.log('======================================\n')

  console.log('🔄 MAPEO DE FLUJOS DE PAGO POR MÉTODO')
  console.log('=====================================\n')

  console.log('📋 1. MÉTODO: PAGO EN SITIO (ONSITE)')
  console.log('------------------------------------')
  console.log('   FLUJO PRINCIPAL:')
  console.log('   1. Usuario crea reserva → paymentMethod: "onsite"')
  console.log('   2. Sistema marca → paymentStatus: "completed" (FIJO RECIENTE)')
  console.log('   3. Sistema crea → Payment record (method: CASH/TERMINAL)')
  console.log('   4. Sistema crea → Transaction automáticamente ✅')
  console.log('   ')
  console.log('   ENDPOINTS INVOLUCRADOS:')
  console.log('   📍 POST /api/bookings → Crea reserva + payment + transaction')
  console.log('   📍 POST /api/bookings/[id]/payment → Procesa pago manual')
  console.log('   📍 POST /api/bookings/[id]/checkin → Check-in + pago si pending')
  console.log('   ')
  console.log('   VARIANTES:')
  console.log('   - CASH: Efectivo en recepción')
  console.log('   - TERMINAL: Terminal POS en el club')
  console.log('   - SPEI: Transferencia bancaria')

  console.log('\n📋 2. MÉTODO: STRIPE (ONLINE)')
  console.log('------------------------------')
  console.log('   FLUJO PRINCIPAL:')
  console.log('   1. Usuario crea reserva → paymentMethod: "stripe"')
  console.log('   2. Sistema marca → paymentStatus: "pending"')
  console.log('   3. Sistema NO crea transaction todavía ⏳')
  console.log('   4. Frontend solicita → Payment Intent via POST /api/stripe/payments/create-intent')
  console.log('   5. Usuario completa pago → Stripe webhook o manual confirm')
  console.log('   6. Sistema confirma → POST /api/stripe/payments/confirm')
  console.log('   7. Sistema crea → Transaction al confirmar ✅')
  console.log('   ')
  console.log('   ENDPOINTS INVOLUCRADOS:')
  console.log('   📍 POST /api/bookings → Crea reserva (sin transaction)')
  console.log('   📍 POST /api/stripe/payments/create-intent → Crea PaymentIntent')
  console.log('   📍 POST /api/stripe/payments/confirm → Confirma pago + crea transaction')
  console.log('   📍 POST /api/webhooks/stripe → Webhook automático (alternativo)')
  console.log('   📍 GET /api/bookings/[id]/payment-link → Obtiene link de pago')

  console.log('\n📋 3. MÉTODO: STRIPE MÉXICO (OXXO/SPEI)')
  console.log('---------------------------------------')
  console.log('   FLUJO PRINCIPAL:')
  console.log('   1. Usuario solicita → pago OXXO o SPEI')
  console.log('   2. Sistema crea → PaymentIntent específico')
  console.log('   3. Usuario paga → en OXXO o transfiere SPEI')
  console.log('   4. Stripe confirma → via webhook')
  console.log('   5. Sistema crea → Transaction al confirmar ✅')
  console.log('   ')
  console.log('   ENDPOINTS INVOLUCRADOS:')
  console.log('   📍 POST /api/stripe/payments/oxxo → PaymentIntent OXXO')
  console.log('   📍 POST /api/stripe/payments/spei → PaymentIntent SPEI')
  console.log('   📍 POST /api/webhooks/stripe → Webhook confirmación')
  console.log('   📍 POST /api/stripe/payments/confirm → Confirmación manual')

  console.log('\n📋 4. MÉTODO: SPLIT PAYMENTS (PAGO DIVIDIDO)')
  console.log('---------------------------------------------')
  console.log('   FLUJO PRINCIPAL:')
  console.log('   1. Usuario crea reserva → splitPaymentEnabled: true')
  console.log('   2. Sistema crea → múltiples SplitPayment records')
  console.log('   3. Cada jugador paga → su parte individualmente')
  console.log('   4. Al completar último pago → crea Transaction total ✅')
  console.log('   ')
  console.log('   ENDPOINTS INVOLUCRADOS:')
  console.log('   📍 POST /api/bookings → Crea reserva + split payments')
  console.log('   📍 PUT /api/bookings/[id]/split-payments → Marca pago individual')
  console.log('   📍 POST /api/split-payments/regenerate → Regenera payment intent')
  console.log('   📍 POST /api/stripe/payments/confirm → Confirma cada pago individual')

  console.log('\n📋 5. OTROS CONTEXTOS DE PAGO')
  console.log('------------------------------')
  console.log('   CLASES:')
  console.log('   📍 POST /api/classes/[id]/students/[studentId]/payment')
  console.log('   ')
  console.log('   TORNEOS:')
  console.log('   📍 POST /api/tournaments/[id]/payment-link')
  console.log('   📍 POST /api/tournaments/[id]/registrations/[registrationId]/payment')

  // Verificar problemas comunes
  console.log('\n🔍 VERIFICACIÓN DE PROBLEMAS COMUNES')
  console.log('====================================')

  const clubId = 'club-basic5-001'

  // 1. Reservas pending que deberían ser completed
  const pendingOnsite = await prisma.booking.count({
    where: {
      clubId: clubId,
      paymentType: 'ONSITE',
      paymentStatus: 'pending'
    }
  })

  console.log(`❌ Reservas ONSITE con status "pending": ${pendingOnsite}`)
  if (pendingOnsite > 0) {
    console.log('   → Estas deberían ser "completed" automáticamente')
  }

  // 2. Reservas completed sin transaction
  const completedWithoutTransaction = await prisma.booking.count({
    where: {
      clubId: clubId,
      paymentStatus: 'completed',
      Transaction: {
        none: {}
      }
    }
  })

  console.log(`❌ Reservas "completed" sin Transaction: ${completedWithoutTransaction}`)
  if (completedWithoutTransaction > 0) {
    console.log('   → El endpoint de checkin puede crear transacciones faltantes')
  }

  // 3. Stripe payments sin confirmar
  const stripePaymentsPending = await prisma.payment.count({
    where: {
      method: 'STRIPE',
      status: 'pending',
      Booking: {
        clubId: clubId
      }
    }
  })

  console.log(`⏳ Pagos Stripe pendientes: ${stripePaymentsPending}`)

  // 4. Split payments incompletos
  const splitPaymentsPending = await prisma.splitPayment.count({
    where: {
      status: 'pending',
      Booking: {
        clubId: clubId
      }
    }
  })

  console.log(`⏳ Split payments pendientes: ${splitPaymentsPending}`)

  console.log('\n📊 RESUMEN DE SALUD DEL SISTEMA')
  console.log('===============================')

  const totalBookings = await prisma.booking.count({
    where: { clubId: clubId }
  })

  const totalCompletedBookings = await prisma.booking.count({
    where: {
      clubId: clubId,
      paymentStatus: 'completed'
    }
  })

  const totalTransactions = await prisma.transaction.count({
    where: {
      clubId: clubId,
      category: 'BOOKING'
    }
  })

  console.log(`📊 Total reservas: ${totalBookings}`)
  console.log(`✅ Reservas completadas: ${totalCompletedBookings}`)
  console.log(`💰 Transacciones de reservas: ${totalTransactions}`)
  console.log(`📈 Tasa de conversión: ${totalCompletedBookings}/${totalBookings} = ${Math.round((totalCompletedBookings/totalBookings)*100)}%`)
  console.log(`🔗 Ratio transaction/completed: ${totalTransactions}/${totalCompletedBookings} = ${Math.round((totalTransactions/totalCompletedBookings)*100)}%`)

  await prisma.$disconnect()
}

paymentFlowAnalysis().catch(console.error)