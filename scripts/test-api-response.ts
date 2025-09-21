import { PrismaClient } from '@prisma/client'
import { startOfMonth, endOfMonth } from 'date-fns'

const prisma = new PrismaClient()

async function testAPIResponse() {
  try {
    console.log('🔍 Verificando respuesta del API de transacciones...')
    console.log('=' .repeat(60))

    const clubId = 'cmers0a3v0000r4ujqpxd0qls'
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    
    // Test with limit 500 like the frontend
    const transactions = await prisma.transaction.findMany({
      where: {
        clubId,
        type: 'INCOME',
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      take: 500,
      orderBy: {
        date: 'desc'
      }
    })

    const total = await prisma.transaction.count({
      where: {
        clubId,
        type: 'INCOME',
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    })

    console.log(`📊 RESPUESTA DEL API CON LIMIT=500:`)
    console.log(`   Transacciones devueltas: ${transactions.length}`)
    console.log(`   Total real en BD: ${total}`)
    
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
    console.log(`   Suma total: $${totalAmount / 100} MXN`)
    console.log(`   Suma en centavos: ${totalAmount}`)
    
    // Check if there are transactions from other months being included
    console.log('\n📅 VERIFICACIÓN DE FECHAS:')
    const byMonth = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })
      if (!acc[month]) {
        acc[month] = { count: 0, total: 0 }
      }
      acc[month].count++
      acc[month].total += t.amount
      return acc
    }, {} as Record<string, { count: number, total: number }>)
    
    Object.entries(byMonth).forEach(([month, data]) => {
      console.log(`   ${month}: ${data.count} transacciones, $${data.total / 100} MXN`)
    })

    // Check ALL income transactions (no date filter)
    console.log('\n🌍 TODAS LAS TRANSACCIONES DE INGRESO (sin filtro de fecha):')
    const allTransactions = await prisma.transaction.findMany({
      where: {
        clubId,
        type: 'INCOME'
      },
      take: 500
    })
    
    const allTotal = await prisma.transaction.count({
      where: {
        clubId,
        type: 'INCOME'
      }
    })
    
    console.log(`   Total encontradas: ${allTransactions.length}`)
    console.log(`   Total en BD: ${allTotal}`)
    
    const allTotalAmount = allTransactions.reduce((sum, t) => sum + t.amount, 0)
    console.log(`   Suma total: $${allTotalAmount / 100} MXN`)
    
    console.log('\n' + '=' .repeat(60))
    console.log('✅ Verificación completada')
    
    if (allTransactions.length > transactions.length) {
      console.log('⚠️  PROBLEMA DETECTADO: El API podría estar devolviendo transacciones de todos los meses')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPIResponse()