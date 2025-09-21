import { PrismaClient } from '@prisma/client'
import { startOfMonth, endOfMonth, addDays } from 'date-fns'

const prisma = new PrismaClient()

async function createCurrentMonthTransactions() {
  try {
    console.log('💳 Creando transacciones para el mes actual...')
    console.log('=' .repeat(60))

    const clubId = 'cmers0a3v0000r4ujqpxd0qls'
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    
    console.log(`📅 Período: ${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}`)

    // Delete existing transactions for current month to avoid duplicates
    console.log('🗑️ Eliminando transacciones existentes del mes actual...')
    await prisma.transaction.deleteMany({
      where: {
        clubId,
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    })

    // Create sample transactions for current month
    const transactions = []
    const categories = ['BOOKING', 'CLASS', 'MEMBERSHIP', 'TOURNAMENT']
    const dailyBookings = 8 // Average bookings per day
    
    // Generate transactions for each day of the current month
    let currentDate = new Date(monthStart)
    let totalAmount = 0
    
    while (currentDate <= monthEnd && currentDate <= now) {
      // Create 5-10 booking transactions per day
      const bookingsToday = Math.floor(Math.random() * 5) + 5
      
      for (let i = 0; i < bookingsToday; i++) {
        const amount = (Math.random() < 0.3 ? 100000 : 75000) // 30% chance of $1000, 70% chance of $750
        
        transactions.push({
          clubId,
          type: 'INCOME' as const,
          category: 'BOOKING',
          amount,
          currency: 'MXN',
          description: `Reserva de cancha - ${currentDate.toLocaleDateString()}`,
          date: new Date(currentDate),
          reference: `BOOKING-${currentDate.getTime()}-${i}`
        })
        
        totalAmount += amount
      }
      
      // Add some class income (20% chance per day)
      if (Math.random() < 0.2) {
        const classAmount = 25000 // $250 per class
        transactions.push({
          clubId,
          type: 'INCOME' as const,
          category: 'CLASS',
          amount: classAmount,
          currency: 'MXN',
          description: `Clase grupal - ${currentDate.toLocaleDateString()}`,
          date: new Date(currentDate),
          reference: `CLASS-${currentDate.getTime()}`
        })
        totalAmount += classAmount
      }
      
      currentDate = addDays(currentDate, 1)
    }

    console.log(`📊 Creando ${transactions.length} transacciones...`)
    
    // Bulk create transactions
    await prisma.transaction.createMany({
      data: transactions
    })

    console.log(`✅ ${transactions.length} transacciones creadas exitosamente`)
    console.log(`💰 Total ingresos del mes: $${totalAmount / 100} MXN`)

    // Add some expenses for the month
    const expenses = [
      { category: 'SALARY', amount: 8500000, description: 'Nómina mensual' },
      { category: 'UTILITIES', amount: 450000, description: 'Servicios (luz, agua, internet)' },
      { category: 'MAINTENANCE', amount: 350000, description: 'Mantenimiento de canchas' },
      { category: 'SUPPLIES', amount: 180000, description: 'Material deportivo' },
      { category: 'MARKETING', amount: 250000, description: 'Publicidad y marketing' }
    ]

    console.log('\n💸 Creando gastos del mes...')
    
    for (const expense of expenses) {
      await prisma.transaction.create({
        data: {
          clubId,
          type: 'EXPENSE',
          category: expense.category,
          amount: expense.amount,
          currency: 'MXN',
          description: expense.description,
          date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 15), // Mid-month
          reference: `EXPENSE-${expense.category}-${monthStart.getMonth()}`
        }
      })
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    console.log(`✅ ${expenses.length} gastos creados: $${totalExpenses / 100} MXN`)

    // Verify totals
    const summary = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        clubId,
        date: {
          gte: monthStart,
          lte: monthEnd
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

    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createCurrentMonthTransactions()
