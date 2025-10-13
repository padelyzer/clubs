import { prisma } from '../lib/config/prisma'

async function checkPaymentsAndTransactions() {
  try {
    console.log('🔍 Verificando pagos y transacciones...\n')
    
    // Obtener todos los pagos completados
    const payments = await prisma.payment.findMany({
      where: {
        status: 'completed'
      },
      include: {
        Booking: {
          select: {
            id: true,
            playerName: true,
            Court: {
              select: { name: true }
            },
            date: true,
            price: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })
    
    console.log(`📊 Total de pagos completados: ${payments.length}`)
    console.log('═'.repeat(80))
    
    for (const payment of payments) {
      console.log(`\n💳 Pago ID: ${payment.id}`)
      console.log(`   Booking: ${payment.Booking?.playerName} - ${payment.Booking?.Court.name}`)
      console.log(`   Método: ${payment.method}`)
      console.log(`   Monto: $${(payment.amount / 100).toFixed(2)} MXN`)
      console.log(`   Fecha: ${payment.completedAt?.toLocaleString('es-MX')}`)
      
      // Buscar transacción correspondiente
      const transaction = await prisma.transaction.findFirst({
        where: {
          bookingId: payment.bookingId
        }
      })
      
      if (transaction) {
        console.log(`   ✅ Transacción encontrada:`)
        console.log(`      - ID: ${transaction.id}`)
        console.log(`      - Referencia: ${transaction.reference}`)
        console.log(`      - Monto: $${(transaction.amount / 100).toFixed(2)} MXN`)
      } else {
        console.log(`   ❌ NO TIENE TRANSACCIÓN ASOCIADA`)
      }
    }
    
    console.log('\n' + '═'.repeat(80))
    
    // Verificar transacciones huérfanas
    const allTransactions = await prisma.transaction.findMany({
      where: {
        type: 'INCOME',
        category: 'BOOKING'
      },
      include: {
        Booking: {
          include: {
            Payment: true
          }
        }
      }
    })
    
    console.log(`\n📈 Total de transacciones de reservas: ${allTransactions.length}`)
    
    const orphanTransactions = allTransactions.filter(t =>
      !t.Booking || t.Booking.Payment.length === 0
    )
    
    if (orphanTransactions.length > 0) {
      console.log(`\n⚠️ Transacciones sin pago asociado: ${orphanTransactions.length}`)
      orphanTransactions.forEach(t => {
        console.log(`   - ${t.id}: ${t.description} (${t.reference})`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPaymentsAndTransactions()