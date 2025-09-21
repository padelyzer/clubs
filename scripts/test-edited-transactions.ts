import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testEditedTransactions() {
  try {
    console.log('🔄 Simulando transacciones editadas...')
    console.log('=' .repeat(60))

    const clubId = 'cmers0a3v0000r4ujqpxd0qls'
    
    // Get some recent income transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        clubId,
        type: 'INCOME'
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📝 Marcando ${transactions.length} transacciones como editadas...`)

    for (const transaction of transactions) {
      // Update the transaction to simulate an edit
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          description: `${transaction.description} (modificado)`,
          notes: `${transaction.notes || ''} | Editado para prueba`
        }
      })
      
      console.log(`  ✓ Transacción ${transaction.id.substring(0, 8)} marcada como editada`)
    }

    console.log('=' .repeat(60))
    console.log('✅ Transacciones marcadas como editadas exitosamente')
    console.log('💡 Las transacciones editadas mostrarán un indicador "EDITADO" en la UI')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEditedTransactions()