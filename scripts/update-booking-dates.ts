import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateBookingDates() {
  try {
    console.log('🔄 Actualizando fechas de reservas y transacciones...\n')

    // Definir el 16 de septiembre 2025 como fecha de corte
    const cutoffDate = new Date('2025-09-16T00:00:00.000Z')

    // Nueva fecha objetivo: 10 de septiembre 2025
    const newDate = new Date('2025-09-10T06:00:00.000Z')

    // Buscar reservas desde el 16 de septiembre en adelante
    const bookingsToUpdate = await prisma.booking.findMany({
      where: {
        date: {
          gte: cutoffDate
        }
      },
      include: {
        Transaction: true
      }
    })

    console.log(`📊 Reservas encontradas desde el 16 de septiembre: ${bookingsToUpdate.length}`)

    let updatedBookings = 0
    let updatedTransactions = 0

    for (const booking of bookingsToUpdate) {
      console.log(`\n📅 Procesando reserva: ${booking.id}`)
      console.log(`   Cliente: ${booking.playerName}`)
      console.log(`   Fecha actual: ${booking.date}`)
      console.log(`   Nueva fecha: ${newDate}`)

      // Actualizar la reserva
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          date: newDate,
          updatedAt: new Date()
        }
      })
      updatedBookings++

      // Actualizar las transacciones asociadas
      if (booking.Transaction && booking.Transaction.length > 0) {
        for (const transaction of booking.Transaction) {
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              date: newDate,
              updatedAt: new Date()
            }
          })
          updatedTransactions++
          console.log(`   ✅ Transacción actualizada: ${transaction.id}`)
        }
      }

      console.log(`   ✅ Reserva actualizada`)
    }

    // También buscar transacciones sin reserva asociada que tengan fecha >= 16 sept
    const standaloneTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: cutoffDate
        },
        bookingId: null
      }
    })

    console.log(`\n📊 Transacciones sin reserva desde el 16 de septiembre: ${standaloneTransactions.length}`)

    for (const transaction of standaloneTransactions) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          date: newDate,
          updatedAt: new Date()
        }
      })
      updatedTransactions++
      console.log(`✅ Transacción actualizada: ${transaction.id} - ${transaction.description}`)
    }

    // Resumen
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN DE ACTUALIZACIÓN')
    console.log('='.repeat(60))
    console.log(`✅ Reservas actualizadas: ${updatedBookings}`)
    console.log(`✅ Transacciones actualizadas: ${updatedTransactions}`)

    // Verificar el resultado
    const septemberBookings = await prisma.booking.count({
      where: {
        date: {
          gte: new Date('2025-09-01T00:00:00.000Z'),
          lt: new Date('2025-09-16T00:00:00.000Z')
        }
      }
    })

    const septemberTransactions = await prisma.transaction.count({
      where: {
        date: {
          gte: new Date('2025-09-01T00:00:00.000Z'),
          lt: new Date('2025-09-16T00:00:00.000Z')
        },
        category: 'BOOKING'
      }
    })

    console.log(`\n📈 Estado final:`)
    console.log(`   Reservas del 1-15 de septiembre: ${septemberBookings}`)
    console.log(`   Transacciones de reservas del 1-15 de septiembre: ${septemberTransactions}`)

  } catch (error) {
    console.error('Error actualizando fechas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar la actualización
updateBookingDates()
  .then(() => {
    console.log('\n✅ Actualización de fechas completada exitosamente')
  })
  .catch((error) => {
    console.error('\n❌ Error fatal en la actualización:', error)
    process.exit(1)
  })