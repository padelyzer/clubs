import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function checkFilomeno() {
  console.log('🔍 Buscando reserva de Filomeno...\n')

  // 1. Buscar la reserva más reciente con el nombre Filomeno
  const filomenoBooking = await prisma.booking.findFirst({
    where: {
      clubId: 'club-basic5-001',
      playerName: {
        contains: 'ilomeno', // Partial match in case of case issues
        mode: 'insensitive'
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      Payment: true,
      Court: true
    }
  })

  if (filomenoBooking) {
    console.log('✅ Reserva encontrada:')
    console.log('   ID:', filomenoBooking.id)
    console.log('   Jugador:', filomenoBooking.playerName)
    console.log('   Fecha:', filomenoBooking.date)
    console.log('   Hora:', `${filomenoBooking.startTime} - ${filomenoBooking.endTime}`)
    console.log('   Cancha:', filomenoBooking.Court?.name)
    console.log('   Precio:', `$${filomenoBooking.price / 100}`)
    console.log('   Estado de pago:', filomenoBooking.paymentStatus)
    console.log('   Pagos asociados:', filomenoBooking.Payment?.length || 0)
    console.log('   Creada:', filomenoBooking.createdAt)
    console.log('')

    // 2. Buscar transacción asociada
    const transaction = await prisma.transaction.findFirst({
      where: {
        bookingId: filomenoBooking.id
      }
    })

    if (transaction) {
      console.log('✅ Transacción asociada encontrada:')
      console.log('   ID:', transaction.id)
      console.log('   Tipo:', transaction.type)
      console.log('   Categoría:', transaction.category)
      console.log('   Monto:', `$${transaction.amount / 100}`)
      console.log('   Descripción:', transaction.description)
      console.log('   Fecha:', transaction.date)
    } else {
      console.log('❌ NO se encontró transacción asociada')
      console.log('   La reserva existe pero no generó transacción')
      console.log('   Esto explica por qué no aparece en Finanzas')
    }

    // 3. Verificar si hay alguna transacción con el nombre Filomeno
    const anyFilomenoTransaction = await prisma.transaction.findFirst({
      where: {
        clubId: 'club-basic5-001',
        OR: [
          { description: { contains: 'ilomeno', mode: 'insensitive' } },
          { notes: { contains: 'ilomeno', mode: 'insensitive' } }
        ]
      }
    })

    if (anyFilomenoTransaction && !transaction) {
      console.log('\n📝 Se encontró una transacción con el nombre pero sin asociación:')
      console.log('   ID:', anyFilomenoTransaction.id)
      console.log('   Descripción:', anyFilomenoTransaction.description)
    }

  } else {
    console.log('❌ No se encontró ninguna reserva para Filomeno')
    console.log('   Verificando reservas recientes...')

    // Mostrar las últimas 5 reservas
    const recentBookings = await prisma.booking.findMany({
      where: {
        clubId: 'club-basic5-001'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        playerName: true,
        createdAt: true,
        paymentStatus: true
      }
    })

    console.log('\n📅 Últimas 5 reservas creadas:')
    recentBookings.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.playerName} - ${b.createdAt.toISOString()} - Pago: ${b.paymentStatus}`)
    })
  }

  // 4. Verificar el flujo de creación de transacciones
  console.log('\n🔧 Diagnóstico del sistema:')

  const bookingsWithoutTransactions = await prisma.booking.count({
    where: {
      clubId: 'club-basic5-001',
      paymentStatus: 'completed',
      Transaction: {
        none: {}
      }
    }
  })

  console.log(`   Reservas pagadas sin transacción: ${bookingsWithoutTransactions}`)

  if (bookingsWithoutTransactions > 0) {
    console.log('   ⚠️ Hay un problema en el flujo de creación de transacciones')
  }

  await prisma.$disconnect()
}

checkFilomeno().catch(console.error)