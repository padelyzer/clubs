import { PrismaClient } from '@prisma/client'
import { startOfMonth, endOfMonth } from 'date-fns'

const prisma = new PrismaClient()

async function verifyClassIncome() {
  try {
    console.log('📊 Verificando ingresos de clases...')
    console.log('=' .repeat(60))

    const clubId = 'cmers0a3v0000r4ujqpxd0qls'
    const monthStart = startOfMonth(new Date())
    const monthEnd = endOfMonth(new Date())
    
    // Get all CLASS transactions for current month
    const classTransactions = await prisma.transaction.findMany({
      where: {
        clubId,
        type: 'INCOME',
        category: 'CLASS',
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    console.log(`\n💰 TRANSACCIONES DE CLASES DEL MES:`)
    console.log(`   Total: ${classTransactions.length} transacciones`)
    
    const totalClassIncome = classTransactions.reduce((sum, t) => sum + t.amount, 0)
    console.log(`   Ingreso total: $${totalClassIncome / 100} MXN`)
    console.log(`   Ticket promedio: $${Math.round(totalClassIncome / classTransactions.length / 100)} MXN`)

    // Show breakdown by class type
    console.log('\n📚 DESGLOSE POR TIPO:')
    const byType = classTransactions.reduce((acc, t) => {
      const type = t.description?.includes('Individual') ? 'Individual' :
                   t.description?.includes('Grupal') ? 'Grupal' :
                   t.description?.includes('Clínica') ? 'Clínica' :
                   t.description?.includes('Masterclass') ? 'Especial' :
                   t.description?.includes('Taller') ? 'Especial' : 'Otro'
      if (!acc[type]) {
        acc[type] = { count: 0, total: 0 }
      }
      acc[type].count++
      acc[type].total += t.amount
      return acc
    }, {} as Record<string, { count: number, total: number }>)

    Object.entries(byType).forEach(([type, data]) => {
      console.log(`   ${type}: ${data.count} clases, $${data.total / 100} MXN`)
    })

    // Get all income transactions to see the distribution
    console.log('\n📈 DISTRIBUCIÓN DE INGRESOS TOTALES:')
    const allIncome = await prisma.transaction.aggregate({
      where: {
        clubId,
        type: 'INCOME',
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      _sum: { amount: true },
      _count: true
    })

    const bookingIncome = await prisma.transaction.aggregate({
      where: {
        clubId,
        type: 'INCOME',
        category: 'BOOKING',
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      _sum: { amount: true },
      _count: true
    })

    const totalIncome = allIncome._sum.amount || 0
    const bookingTotal = bookingIncome._sum.amount || 0
    const classTotal = totalClassIncome

    console.log(`   Ingresos totales: $${totalIncome / 100} MXN`)
    console.log(`   - Reservas: $${bookingTotal / 100} MXN (${Math.round(bookingTotal / totalIncome * 100)}%)`)
    console.log(`   - Clases: $${classTotal / 100} MXN (${Math.round(classTotal / totalIncome * 100)}%)`)
    console.log(`   - Otros: $${(totalIncome - bookingTotal - classTotal) / 100} MXN`)

    // Get active classes
    const activeClasses = await prisma.class.count({
      where: {
        clubId,
        status: 'SCHEDULED',
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    })

    const totalBookings = await prisma.classBooking.count({
      where: {
        Class: {
          clubId,
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      }
    })

    console.log('\n🎾 ESTADÍSTICAS DE CLASES:')
    console.log(`   Clases programadas: ${activeClasses}`)
    console.log(`   Total inscripciones: ${totalBookings}`)
    console.log(`   Promedio estudiantes/clase: ${Math.round(totalBookings / activeClasses)}`)

    console.log('\n' + '=' .repeat(60))
    console.log('✅ Verificación completada')
    console.log('💡 Las clases ahora aparecerán en el tab "Clases" del módulo de ingresos')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyClassIncome()