import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function checkJuanBooking() {
  console.log('🔍 Buscando transacción de Juan Pérez...\n')

  // 1. Find Juan's transaction
  const juanTransaction = await prisma.transaction.findFirst({
    where: {
      clubId: 'club-basic5-001',
      type: 'INCOME',
      description: {
        contains: 'Juan Pérez'
      }
    },
    include: {
      Booking: true
    }
  })

  if (juanTransaction) {
    console.log('✅ Transacción encontrada:')
    console.log('   ID:', juanTransaction.id)
    console.log('   Descripción:', juanTransaction.description)
    console.log('   Categoría:', juanTransaction.category)
    console.log('   Tiene Booking:', !!juanTransaction.Booking)
    console.log('   Booking ID:', juanTransaction.bookingId)
    console.log('')

    // 2. Check how many BOOKING category transactions exist
    const bookingTransactions = await prisma.transaction.count({
      where: {
        clubId: 'club-basic5-001',
        type: 'INCOME',
        category: 'BOOKING'
      }
    })

    console.log(`📊 Transacciones con categoría BOOKING: ${bookingTransactions}`)

    // 3. Find position if it has BOOKING category
    if (juanTransaction.category === 'BOOKING') {
      const transactionsBefore = await prisma.transaction.count({
        where: {
          clubId: 'club-basic5-001',
          type: 'INCOME',
          category: 'BOOKING',
          date: {
            gt: juanTransaction.date
          }
        }
      })

      console.log(`📍 Posición en lista de BOOKING: ${transactionsBefore + 1}`)
      console.log(`   ${transactionsBefore + 1 > 100 ? '❌ Está más allá del límite de 100' : '✅ Está dentro del límite de 100'}`)
    } else {
      console.log(`❌ La transacción NO tiene categoría BOOKING, tiene: ${juanTransaction.category}`)
      console.log('   Por eso no aparece en el módulo de reservas')
    }
  } else {
    console.log('❌ No se encontró la transacción de Juan Pérez')
  }

  await prisma.$disconnect()
}

checkJuanBooking().catch(console.error)