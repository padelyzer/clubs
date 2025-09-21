import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addPaymentMethods() {
  try {
    console.log('💳 Agregando métodos de pago a las transacciones...')
    console.log('=' .repeat(60))

    const clubId = 'cmers0a3v0000r4ujqpxd0qls'
    
    // Get all income transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        clubId,
        type: 'INCOME'
      }
    })

    console.log(`📊 Actualizando ${transactions.length} transacciones...`)

    const paymentMethods = [
      'Efectivo',
      'Transferencia bancaria',
      'Tarjeta de débito',
      'Tarjeta de crédito',
      'OXXO',
      'SPEI'
    ]

    let updatedCount = 0
    for (const transaction of transactions) {
      // Add payment method to notes
      const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          notes: transaction.notes ? 
            `${transaction.notes} | Método de pago: ${randomMethod}` : 
            `Método de pago: ${randomMethod}`
        }
      })
      
      updatedCount++
      if (updatedCount % 50 === 0) {
        console.log(`  ✓ ${updatedCount} transacciones actualizadas...`)
      }
    }

    console.log(`✅ ${updatedCount} transacciones actualizadas con método de pago`)
    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addPaymentMethods()
