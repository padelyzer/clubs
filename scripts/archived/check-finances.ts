import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFinances() {
  console.log('📊 REPORTE FINANCIERO DEL DÍA')
  console.log('=' * 50)
  
  // Get today's transactions
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: today
      }
    },
    orderBy: {
      date: 'desc'
    }
  })
  
  let totalIncome = 0
  let totalExpenses = 0
  
  console.log('\n💰 INGRESOS:')
  const incomeTransactions = transactions.filter(t => t.type === 'INCOME')
  
  for (const t of incomeTransactions) {
    totalIncome += t.amount
    console.log(`  • ${t.description}: $${(t.amount/100).toFixed(2)} MXN`)
  }
  
  console.log(`\nTOTAL INGRESOS: $${(totalIncome/100).toFixed(2)} MXN`)
  
  console.log('\n💸 GASTOS (Pagos a Instructores):')
  const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE' && t.category === 'SALARY')
  
  for (const t of expenseTransactions) {
    totalExpenses += t.amount
    console.log(`  • ${t.description}: -$${(t.amount/100).toFixed(2)} MXN`)
    if (t.notes) {
      try {
        const notes = JSON.parse(t.notes as string)
        if (notes.duration) {
          console.log(`    (Duración: ${notes.duration} min, Asistentes: ${notes.attendanceCount || 'N/A'})`)
        }
      } catch {}
    }
  }
  
  console.log(`\nTOTAL GASTOS: -$${(totalExpenses/100).toFixed(2)} MXN`)
  console.log('=' + '='.repeat(49))
  console.log(`📈 BALANCE NETO: $${((totalIncome - totalExpenses)/100).toFixed(2)} MXN`)
  
  // Verificar valores esperados
  console.log('\n✅ VERIFICACIÓN:')
  console.log(`  Ingresos esperados: $4,050.00 MXN`)
  console.log(`  Ingresos reales: $${(totalIncome/100).toFixed(2)} MXN`)
  console.log(`  Gastos esperados: $875.00 MXN`)
  console.log(`  Gastos reales: $${(totalExpenses/100).toFixed(2)} MXN`)
  console.log(`  Balance esperado: $3,175.00 MXN`)
  console.log(`  Balance real: $${((totalIncome - totalExpenses)/100).toFixed(2)} MXN`)
}

checkFinances()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
