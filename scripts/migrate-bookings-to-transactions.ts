import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateBookingsToTransactions() {
  try {
    console.log('🔄 Iniciando migración de reservas a transacciones...\n')

    // Buscar todas las reservas completadas/pagadas
    const completedBookings = await prisma.booking.findMany({
      where: {
        paymentStatus: 'completed'
      },
      include: {
        Court: true
      }
    })

    console.log(`📊 Total de reservas completadas: ${completedBookings.length}`)

    // Para cada reserva, verificar si tiene transacción
    let migratedCount = 0
    let skippedCount = 0
    let errors = []

    for (const booking of completedBookings) {
      try {
        // Verificar si ya existe una transacción para esta reserva
        const existingTransaction = await prisma.transaction.findFirst({
          where: { bookingId: booking.id }
        })

        if (existingTransaction) {
          skippedCount++
          console.log(`⏭️  Reserva ${booking.id} ya tiene transacción - saltando`)
          continue
        }

        // Crear la transacción faltante
        const transactionId = `tx_migrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const transaction = await prisma.transaction.create({
          data: {
            id: transactionId,
            clubId: booking.clubId,
            bookingId: booking.id,
            amount: booking.price,
            type: 'INCOME',
            category: 'BOOKING',
            description: `Reserva de cancha - ${booking.playerName}`,
            date: booking.date,
            currency: booking.currency || 'MXN',
            notes: 'Transacción migrada automáticamente',
            createdAt: booking.createdAt,
            updatedAt: new Date()
          }
        })

        migratedCount++
        console.log(`✅ Transacción creada para reserva ${booking.id}`)
        console.log(`   Cliente: ${booking.playerName}`)
        console.log(`   Cancha: ${booking.Court?.name}`)
        console.log(`   Monto: $${booking.price}`)
        console.log(`   Fecha: ${booking.date}`)
        console.log('')

      } catch (error) {
        console.error(`❌ Error procesando reserva ${booking.id}:`, error)
        errors.push({ bookingId: booking.id, error: String(error) })
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN DE MIGRACIÓN')
    console.log('='.repeat(60))
    console.log(`✅ Transacciones creadas: ${migratedCount}`)
    console.log(`⏭️  Reservas ya migradas: ${skippedCount}`)
    console.log(`❌ Errores encontrados: ${errors.length}`)

    if (errors.length > 0) {
      console.log('\n⚠️ Errores detallados:')
      errors.forEach(err => {
        console.log(`  - Reserva ${err.bookingId}: ${err.error}`)
      })
    }

    // Verificar el estado final
    const totalTransactions = await prisma.transaction.count({
      where: {
        category: 'BOOKING'
      }
    })

    console.log(`\n📈 Total de transacciones de reservas en el sistema: ${totalTransactions}`)

  } catch (error) {
    console.error('Error general en la migración:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar la migración
migrateBookingsToTransactions()
  .then(() => {
    console.log('\n✅ Migración completada exitosamente')
  })
  .catch((error) => {
    console.error('\n❌ Error fatal en la migración:', error)
    process.exit(1)
  })