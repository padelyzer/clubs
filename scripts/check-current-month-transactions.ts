import { PrismaClient } from '@prisma/client'
import { startOfMonth, endOfMonth } from 'date-fns'

const prisma = new PrismaClient()

async function checkCurrentMonthTransactions() {
  try {
    console.log('📊 Verificando transacciones del mes actual...')
    console.log('=' .repeat(60))

    const clubId = 'cmers0a3v0000r4ujqpxd0qls'
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    
    console.log(`📅 Período: ${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}`)
    console.log('')

    // Get all income transactions for current month
    const incomeTransactions = await prisma.transaction.findMany({
      where: {
        clubId,
        type: 'INCOME',
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      orderBy: {
        date: 'desc'
      },
      select: {
        id: true,
        description: true,
        amount: true,
        date: true,
        category: true
      }
    })

    console.log(`💰 TRANSACCIONES DE INGRESO DEL MES:`)
    console.log(`   Total: ${incomeTransactions.length} transacciones`)
    
    // Group by category
    const byCategory = incomeTransactions.reduce((acc, t) => {
      const cat = t.category || 'OTHER'
      if (!acc[cat]) {
        acc[cat] = { count: 0, total: 0 }
      }
      acc[cat].count++
      acc[cat].total += t.amount
      return acc
    }, {} as Record<string, { count: number, total: number }>)

    console.log('\n📈 POR CATEGORÍA:')
    Object.entries(byCategory).forEach(([category, data]) => {
      console.log(`   ${category}: ${data.count} transacciones, $${data.total / 100} MXN`)
    })

    // Calculate total and average
    const totalAmount = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
    const avgTicket = incomeTransactions.length > 0 ? totalAmount / incomeTransactions.length : 0

    console.log('\n💵 RESUMEN FINANCIERO:')
    console.log(`   Ingreso total: $${totalAmount / 100} MXN`)
    console.log(`   Ticket promedio: $${Math.round(avgTicket / 100)} MXN`)
    console.log(`   Transacciones totales: ${incomeTransactions.length}`)

    // Show first 10 transactions
    console.log('\n📝 PRIMERAS 10 TRANSACCIONES:')
    incomeTransactions.slice(0, 10).forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.description} - $${t.amount / 100} MXN (${new Date(t.date).toLocaleDateString()})`)
    })

    // Check what's being shown in the API
    console.log('\n🔍 VERIFICACIÓN API:')
    console.log('   El endpoint /api/finance/transactions?type=INCOME&limit=50')
    console.log(`   debería devolver ${Math.min(50, incomeTransactions.length)} transacciones`)

    console.log('\n' + '=' .repeat(60))
    console.log('✅ Verificación completada')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentMonthTransactions()