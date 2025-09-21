import { PrismaClient } from '@prisma/client'
import { startOfMonth } from 'date-fns'

const prisma = new PrismaClient()

async function addExpenseTransactions() {
  try {
    console.log('💸 Agregando gastos del mes actual...')
    console.log('=' .repeat(60))

    const clubId = 'cmers0a3v0000r4ujqpxd0qls'
    const monthStart = startOfMonth(new Date())
    
    // Add expenses with valid categories
    const expenses = [
      { category: 'SALARY', amount: 8500000, description: 'Nómina mensual' },
      { category: 'UTILITIES', amount: 450000, description: 'Servicios (luz, agua, internet)' },
      { category: 'MAINTENANCE', amount: 350000, description: 'Mantenimiento de canchas' },
      { category: 'EQUIPMENT', amount: 180000, description: 'Material deportivo' },
      { category: 'MARKETING', amount: 250000, description: 'Publicidad y marketing' },
      { category: 'RENT', amount: 1500000, description: 'Renta del local' }
    ]
    
    for (const expense of expenses) {
      await prisma.transaction.create({
        data: {
          clubId,
          type: 'EXPENSE',
          category: expense.category as any,
          amount: expense.amount,
          currency: 'MXN',
          description: expense.description,
          date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 15),
          reference: `EXPENSE-${expense.category}-${Date.now()}`
        }
      })
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    console.log(`✅ ${expenses.length} gastos creados: $${totalExpenses / 100} MXN`)

    // Get summary for current month  
    const summary = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        clubId,
        date: {
          gte: monthStart,
          lte: new Date()
        }
      },
      _sum: { amount: true },
      _count: true
    })

    console.log('\n📈 RESUMEN DEL MES ACTUAL:')
    summary.forEach(s => {
      console.log(`  - ${s.type}: $${(s._sum.amount || 0) / 100} MXN (${s._count} transacciones)`)
    })
    
    const income = summary.find(s => s.type === 'INCOME')?._sum.amount || 0
    const expense = summary.find(s => s.type === 'EXPENSE')?._sum.amount || 0
    const profit = income - expense
    
    console.log(`\n💎 UTILIDAD NETA: $${profit / 100} MXN`)
    console.log(`📊 Margen de utilidad: ${((profit / income) * 100).toFixed(1)}%`)

    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addExpenseTransactions()
