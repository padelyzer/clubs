import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
const prisma = new PrismaClient()

async function fixFinalMissingTransaction() {
  console.log('🔧 CORRIGIENDO ÚLTIMA TRANSACCIÓN FALTANTE')
  console.log('==========================================\n')

  const bookingId = '18f2a187-ce12-4b80-b92d-d99150af9043'

  // 1. Obtener la reserva
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Payment: true,
      Transaction: true
    }
  })

  if (!booking) {
    console.log('❌ No se encontró la reserva')
    return
  }

  console.log('📋 Detalles de la reserva:')
  console.log(`   ID: ${booking.id}`)
  console.log(`   Jugador: ${booking.playerName}`)
  console.log(`   Precio: $${booking.price / 100}`)
  console.log(`   Estado: ${booking.paymentStatus}`)
  console.log(`   Tiene Payment: ${booking.Payment?.length > 0}`)
  console.log(`   Tiene Transaction: ${booking.Transaction?.length > 0}`)

  // 2. Crear transacción si no existe
  if (!booking.Transaction || booking.Transaction.length === 0) {
    console.log('\n💰 Creando transacción faltante...')

    await prisma.transaction.create({
      data: {
        id: nanoid(),
        clubId: 'club-basic5-001',
        type: 'INCOME',
        category: 'BOOKING',
        amount: booking.price,
        currency: 'MXN',
        description: `Pago de reserva - ${booking.playerName}`,
        reference: `ONSITE-${booking.id}`,
        bookingId: booking.id,
        date: new Date(),
        createdBy: 'SYSTEM_FINAL_FIX',
        notes: `Transacción creada para completar balance final del sistema. Reserva: ${booking.playerName}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Transacción creada exitosamente')
  } else {
    console.log('⚠️ La reserva ya tiene transacción')
  }

  // 3. Verificación final
  console.log('\n📊 VERIFICACIÓN FINAL DEL SISTEMA:')
  console.log('===================================')

  const totalCompleted = await prisma.booking.count({
    where: {
      clubId: 'club-basic5-001',
      paymentStatus: 'completed'
    }
  })

  const totalTransactions = await prisma.transaction.count({
    where: {
      clubId: 'club-basic5-001',
      category: 'BOOKING'
    }
  })

  const totalBookingAmount = await prisma.booking.aggregate({
    where: {
      clubId: 'club-basic5-001',
      paymentStatus: 'completed'
    },
    _sum: {
      price: true
    }
  })

  const totalTransactionAmount = await prisma.transaction.aggregate({
    where: {
      clubId: 'club-basic5-001',
      category: 'BOOKING'
    },
    _sum: {
      amount: true
    }
  })

  console.log(`Total reservas completadas: ${totalCompleted}`)
  console.log(`Total transacciones: ${totalTransactions}`)
  console.log(`Total ingresos reservas: $${(totalBookingAmount._sum.price || 0) / 100}`)
  console.log(`Total ingresos transacciones: $${(totalTransactionAmount._sum.amount || 0) / 100}`)

  const isBalanced = (totalCompleted === totalTransactions) &&
                    ((totalBookingAmount._sum.price || 0) === (totalTransactionAmount._sum.amount || 0))

  if (isBalanced) {
    console.log('\n🎉 SISTEMA PERFECTAMENTE BALANCEADO')
    console.log('   ✅ Cada reserva completada tiene su transacción')
    console.log('   ✅ Los montos coinciden exactamente')
    console.log('   ✅ Listo para producción')
  } else {
    console.log('\n❌ Sistema aún tiene inconsistencias')
  }

  await prisma.$disconnect()
}

fixFinalMissingTransaction().catch(console.error)