import { PrismaClient } from '@prisma/client'
import { startOfMonth } from 'date-fns'

const prisma = new PrismaClient()

async function balanceFinances() {
  try {
    console.log('💰 Balanceando finanzas del mes actual...')
    console.log('=' .repeat(60))

    const clubId = 'cmers0a3v0000r4ujqpxd0qls'
    const monthStart = startOfMonth(new Date())
    
    // Delete all expenses for current month to start fresh
    console.log('🗑️ Eliminando gastos del mes...')
    await prisma.transaction.deleteMany({
      where: {
        clubId,
        type: 'EXPENSE',
        date: {
          gte: monthStart,
          lte: new Date()
        }
      }
    })
    
    // Add more income transactions to balance
    console.log('💵 Agregando más ingresos...')
    const additionalIncome = []
    
    for (let i = 0; i < 50; i++) {
      additionalIncome.push({
        clubId,
        type: 'INCOME' as const,
        category: 'BOOKING',
        amount: 75000, // $750 per booking
        currency: 'MXN',
        description: `Reserva adicional #${i + 1}`,
        date: new Date(monthStart.getFullYear(), monthStart.getMonth(), Math.floor(Math.random() * 25) + 1),
        reference: `BOOKING-EXTRA-${Date.now()}-${i}`
      })
    }
    
    await prisma.transaction.createMany({
      data: additionalIncome
    })
    
    // Add reasonable expenses (about 60% of income)
    const expenses = [
      { category: 'SALARY', amount: 4500000, description: 'Nómina mensual' },
      { category: 'UTILITIES', amount: 350000, description: 'Servicios (luz, agua, internet)' },
      { category: 'MAINTENANCE', amount: 280000, description: 'Mantenimiento de canchas' },
      { category: 'EQUIPMENT', amount: 150000, description: 'Material deportivo' },
      { category: 'MARKETING', amount: 200000, description: 'Publicidad y marketing' }
    ]
    
    console.log('💸 Agregando gastos razonables...')
    for (const expense of expenses) {
      await prisma.transaction.create({
        data: {
          clubId,
          type: 'EXPENSE',
          category: expense.category as any,
          amount: expense.amount,
          currency: 'MXN',
          description: expense.description,
          date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 20),
          reference: `EXPENSE-${expense.category}-${Date.now()}`
        }
      })
    }

    // Get final summary
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

    console.log('\n📈 RESUMEN FINAL DEL MES:')
    summary.forEach(s => {
      console.log(`  - ${s.type}: $${((s._sum.amount || 0) / 100).toLocaleString('es-MX')} MXN (${s._count} transacciones)`)
    })
    
    const income = summary.find(s => s.type === 'INCOME')?._sum.amount || 0
    const expense = summary.find(s => s.type === 'EXPENSE')?._sum.amount || 0
    const profit = income - expense
    
    console.log('\n💎 MÉTRICAS FINANCIERAS:')
    console.log(`  Ingresos totales: $${(income / 100).toLocaleString('es-MX')} MXN`)
    console.log(`  Gastos totales: $${(expense / 100).toLocaleString('es-MX')} MXN`)
    console.log(`  Utilidad neta: $${(profit / 100).toLocaleString('es-MX')} MXN`)
    console.log(`  Margen de utilidad: ${((profit / income) * 100).toFixed(1)}%`)
    
    console.log('=' .repeat(60))
    console.log('✅ Finanzas balanceadas exitosamente')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

balanceFinances()
