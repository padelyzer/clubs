import { PrismaClient } from '@prisma/client'
import { startOfMonth, endOfMonth } from 'date-fns'

const prisma = new PrismaClient()

async function testWidgetsData() {
  try {
    console.log('🔍 Verificando datos para widgets del dashboard...')
    console.log('=' .repeat(60))

    const clubId = 'cmers0a3v0000r4ujqpxd0qls'
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // 1. Test Main Dashboard Data
    console.log('\n📊 DASHBOARD PRINCIPAL:')
    
    // Bookings
    const bookings = await prisma.booking.count({
      where: { clubId }
    })
    console.log(`  ✓ Total reservas: ${bookings}`)

    const todayBookings = await prisma.booking.count({
      where: {
        clubId,
        date: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        }
      }
    })
    console.log(`  ✓ Reservas de hoy: ${todayBookings}`)

    // 2. Test Finance Dashboard Data
    console.log('\n💰 DASHBOARD DE FINANZAS:')
    
    const incomeTransactions = await prisma.transaction.aggregate({
      where: {
        clubId,
        type: 'INCOME',
        date: { gte: monthStart, lte: monthEnd }
      },
      _sum: { amount: true },
      _count: true
    })
    console.log(`  ✓ Ingresos del mes: $${(incomeTransactions._sum.amount || 0) / 100} MXN (${incomeTransactions._count} transacciones)`)

    const expenseTransactions = await prisma.transaction.aggregate({
      where: {
        clubId,
        type: 'EXPENSE',
        date: { gte: monthStart, lte: monthEnd }
      },
      _sum: { amount: true },
      _count: true
    })
    console.log(`  ✓ Gastos del mes: $${(expenseTransactions._sum.amount || 0) / 100} MXN (${expenseTransactions._count} transacciones)`)

    const netProfit = (incomeTransactions._sum.amount || 0) - (expenseTransactions._sum.amount || 0)
    console.log(`  ✓ Utilidad neta: $${netProfit / 100} MXN`)

    // 3. Test Players Data
    console.log('\n👥 JUGADORES:')
    
    const totalPlayers = await prisma.player.count({
      where: { clubId }
    })
    console.log(`  ✓ Total jugadores: ${totalPlayers}`)

    const activePlayers = await prisma.player.count({
      where: { clubId, active: true }
    })
    console.log(`  ✓ Jugadores activos: ${activePlayers}`)

    // 4. Test Courts Data
    console.log('\n🎾 CANCHAS:')
    
    const courts = await prisma.court.findMany({
      where: { clubId },
      select: {
        name: true,
        active: true,
        _count: {
          select: { bookings: true }
        }
      }
    })
    
    courts.forEach(court => {
      console.log(`  ✓ ${court.name}: ${court._count.bookings} reservas (${court.active ? 'Activa' : 'Inactiva'})`)
    })

    // 5. Test Payment Methods Distribution
    console.log('\n💳 MÉTODOS DE PAGO:')
    
    const paymentMethods = await prisma.payment.groupBy({
      by: ['method'],
      where: {
        booking: { clubId },
        status: 'completed'
      },
      _count: true,
      _sum: { amount: true }
    })

    paymentMethods.forEach(method => {
      console.log(`  ✓ ${method.method}: ${method._count} pagos, $${(method._sum.amount || 0) / 100} MXN`)
    })

    // 6. Test Recent Activity
    console.log('\n📅 ACTIVIDAD RECIENTE:')
    
    const recentBookings = await prisma.booking.findMany({
      where: { clubId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        playerName: true,
        date: true,
        startTime: true,
        court: { select: { name: true } }
      }
    })

    console.log(`  ✓ Últimas ${recentBookings.length} reservas:`)
    recentBookings.forEach(b => {
      console.log(`    - ${b.playerName} | ${b.court?.name} | ${new Date(b.date).toLocaleDateString()}`)
    })

    // 7. Test Analytics API endpoints
    console.log('\n🔗 VERIFICANDO ENDPOINTS:')
    
    const endpoints = [
      '/api/bookings',
      '/api/finance/transactions',
      '/api/finance/analytics?type=overview',
      '/api/players',
      '/api/settings/courts'
    ]

    console.log('  Los siguientes endpoints deberían estar funcionando:')
    endpoints.forEach(endpoint => {
      console.log(`    - ${endpoint}`)
    })

    console.log('\n' + '=' .repeat(60))
    console.log('✅ Verificación de datos completada')
    console.log('💡 Todos los widgets deberían mostrar estos datos correctamente')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testWidgetsData()