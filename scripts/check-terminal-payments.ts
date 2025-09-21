import { prisma } from '../lib/config/prisma'

async function checkTerminalPayments() {
  try {
    console.log('🔍 Buscando pagos con terminal...\n')
    
    // Buscar pagos con método TERMINAL
    const terminalPayments = await prisma.payment.findMany({
      where: {
        method: 'TERMINAL'
      },
      include: {
        booking: {
          select: {
            id: true,
            playerName: true,
            court: { select: { name: true } },
            date: true,
            price: true,
            checkedIn: true,
            checkedInAt: true
          }
        }
      }
    })
    
    console.log(`💳 Pagos con terminal encontrados: ${terminalPayments.length}`)
    
    if (terminalPayments.length > 0) {
      for (const payment of terminalPayments) {
        console.log(`\n📋 Pago Terminal:`)
        console.log(`   ID: ${payment.id}`)
        console.log(`   Booking: ${payment.booking?.playerName} - ${payment.booking?.court.name}`)
        console.log(`   Monto: $${(payment.amount / 100).toFixed(2)} MXN`)
        console.log(`   Estado: ${payment.status}`)
        console.log(`   Check-in: ${payment.booking?.checkedIn ? '✅' : '❌'}`)
        console.log(`   Referencia: ${payment.stripeChargeId || 'Sin referencia'}`)
        
        // Buscar transacción
        const transaction = await prisma.transaction.findFirst({
          where: {
            bookingId: payment.bookingId
          }
        })
        
        if (transaction) {
          console.log(`   ✅ Transacción encontrada:`)
          console.log(`      - ID: ${transaction.id}`)
          console.log(`      - Referencia: ${transaction.reference}`)
        } else {
          console.log(`   ❌ SIN TRANSACCIÓN`)
        }
      }
    } else {
      console.log('\n⚠️ No se encontraron pagos con terminal')
    }
    
    // Buscar todas las transacciones para ver referencias
    console.log('\n' + '═'.repeat(80))
    console.log('\n📊 Todas las transacciones de reservas:')
    
    const allTransactions = await prisma.transaction.findMany({
      where: {
        type: 'INCOME',
        category: 'BOOKING'
      },
      select: {
        id: true,
        reference: true,
        amount: true,
        description: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    allTransactions.forEach(t => {
      const paymentMethod = t.reference?.split('-')[0] || 'UNKNOWN'
      console.log(`\n   ${t.createdAt.toLocaleString('es-MX')}`)
      console.log(`   Método detectado: ${paymentMethod}`)
      console.log(`   Ref: ${t.reference}`)
      console.log(`   Monto: $${(t.amount / 100).toFixed(2)}`)
      console.log(`   Desc: ${t.description}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTerminalPayments()