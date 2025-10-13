import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function verifyJuanTransaction() {
  console.log('🔍 Verificando transacción de Juan Pérez...\n')

  // Get Juan's transaction
  const juanTransaction = await prisma.transaction.findFirst({
    where: {
      clubId: 'club-basic5-001',
      type: 'INCOME',
      description: {
        contains: 'Juan Pérez'
      }
    },
    include: {
      Booking: {
        select: {
          playerName: true,
          Court: {
            select: {
              name: true
            }
          },
          startTime: true,
          endTime: true,
          date: true,
          status: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  })

  if (juanTransaction) {
    console.log('✅ Transacción encontrada:')
    console.log('   ID:', juanTransaction.id)
    console.log('   Descripción:', juanTransaction.description)
    console.log('   Monto:', `$${juanTransaction.amount / 100}`)
    console.log('   Fecha:', juanTransaction.date)
    console.log('   Referencia:', juanTransaction.reference)

    if (juanTransaction.Booking) {
      console.log('\n📅 Información de la reserva:')
      console.log('   Jugador:', juanTransaction.Booking.playerName)
      console.log('   Cancha:', juanTransaction.Booking.Court?.name || 'No especificada')
      console.log('   Hora:', `${juanTransaction.Booking.startTime} - ${juanTransaction.Booking.endTime}`)
      console.log('   Estado:', juanTransaction.Booking.status)
    }

    // Count total income transactions to find position
    const allTransactions = await prisma.transaction.findMany({
      where: {
        clubId: 'club-basic5-001',
        type: 'INCOME'
      },
      orderBy: {
        date: 'desc'
      },
      select: {
        id: true
      }
    })

    const position = allTransactions.findIndex(t => t.id === juanTransaction.id) + 1
    console.log(`\n📍 Posición en la lista: ${position} de ${allTransactions.length} transacciones`)
    console.log(`   Página: ${Math.ceil(position / 20)} (mostrando 20 por página)`)

    console.log('\n💡 Para encontrarla en la UI:')
    console.log('   1. Ve a Dashboard > Finanzas > Ingresos')
    console.log('   2. Busca "juan" o "Juan Pérez" en el campo de búsqueda')
    console.log('   3. O navega a la página', Math.ceil(position / 20))

  } else {
    console.log('❌ No se encontró la transacción de Juan Pérez')

    // Check if there's a booking for Juan
    const juanBooking = await prisma.booking.findFirst({
      where: {
        clubId: 'club-basic5-001',
        playerName: {
          contains: 'Juan'
        }
      }
    })

    if (juanBooking) {
      console.log('\n📅 Se encontró una reserva para Juan pero sin transacción asociada')
      console.log('   ID de reserva:', juanBooking.id)
      console.log('   Necesita crear la transacción correspondiente')
    }
  }

  await prisma.$disconnect()
}

verifyJuanTransaction().catch(console.error)