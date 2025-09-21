import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
const prisma = new PrismaClient()

async function fixOnsitePendingBookings() {
  console.log('🔧 CORRIGIENDO RESERVAS ONSITE PENDIENTES')
  console.log('=========================================\n')

  const clubId = 'club-basic5-001'

  // 1. Encontrar reservas ONSITE que están pending
  const pendingOnsiteBookings = await prisma.booking.findMany({
    where: {
      clubId: clubId,
      paymentType: 'ONSITE',
      paymentStatus: 'pending'
    },
    include: {
      Payment: true,
      Transaction: true
    }
  })

  console.log(`📋 Encontradas ${pendingOnsiteBookings.length} reservas ONSITE pendientes`)

  if (pendingOnsiteBookings.length === 0) {
    console.log('✅ No hay reservas ONSITE pendientes para corregir')
    await prisma.$disconnect()
    return
  }

  // 2. Analizar cada reserva
  for (const booking of pendingOnsiteBookings) {
    console.log(`\n🔍 Analizando reserva: ${booking.id}`)
    console.log(`   Jugador: ${booking.playerName}`)
    console.log(`   Precio: $${booking.price / 100}`)
    console.log(`   Tipo de pago: ${booking.paymentType}`)
    console.log(`   Estado de pago: ${booking.paymentStatus}`)
    console.log(`   Tiene Payment: ${booking.Payment?.length > 0}`)
    console.log(`   Tiene Transaction: ${booking.Transaction?.length > 0}`)

    // 3. Corregir el estado de pago
    console.log(`   🔧 Actualizando estado a "completed"...`)

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'completed'
      }
    })

    // 4. Crear Payment record si no existe
    if (!booking.Payment || booking.Payment.length === 0) {
      console.log(`   💳 Creando Payment record...`)

      await prisma.payment.create({
        data: {
          id: nanoid(),
          bookingId: booking.id,
          amount: booking.price,
          currency: 'MXN',
          method: 'CASH', // Default para ONSITE
          status: 'completed',
          completedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // 5. Crear Transaction si no existe
    if (!booking.Transaction || booking.Transaction.length === 0) {
      console.log(`   💰 Creando Transaction record...`)

      await prisma.transaction.create({
        data: {
          id: nanoid(),
          clubId: clubId,
          type: 'INCOME',
          category: 'BOOKING',
          amount: booking.price,
          currency: 'MXN',
          description: `Pago de reserva - ${booking.playerName}`,
          reference: `ONSITE-${booking.id}`,
          bookingId: booking.id,
          date: new Date(),
          createdBy: 'SYSTEM_FIX',
          notes: `Transacción creada automáticamente para corregir reserva ONSITE pendiente. Fecha original: ${booking.date}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    console.log(`   ✅ Reserva corregida exitosamente`)
  }

  // 6. Verificar resultado
  console.log('\n📊 VERIFICACIÓN FINAL:')
  console.log('=======================')

  const remainingPending = await prisma.booking.count({
    where: {
      clubId: clubId,
      paymentType: 'ONSITE',
      paymentStatus: 'pending'
    }
  })

  console.log(`Reservas ONSITE pendientes restantes: ${remainingPending}`)

  const totalCompleted = await prisma.booking.count({
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

  console.log(`Total reservas completadas: ${totalCompleted}`)
  console.log(`Total transacciones de reservas: ${totalTransactions}`)
  console.log(`Ratio: ${totalTransactions}/${totalCompleted} = ${Math.round((totalTransactions/totalCompleted)*100)}%`)

  if (totalTransactions === totalCompleted) {
    console.log('✅ SISTEMA PERFECTAMENTE BALANCEADO')
  } else {
    console.log('❌ Sistema aún desbalanceado')
  }

  await prisma.$disconnect()
}

fixOnsitePendingBookings().catch(console.error)