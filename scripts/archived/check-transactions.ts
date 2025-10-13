import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTransactions() {
  try {
    console.log('🔍 Verificando transacciones financieras...')
    console.log('=' .repeat(60))

    const clubId = 'cmers0a3v0000r4ujqpxd0qls'

    // Check transactions
    const transactions = await prisma.transaction.count({
      where: { clubId }
    })

    console.log(`📊 Transacciones encontradas: ${transactions}`)

    // Check bookings with payment status
    const bookingStats = await prisma.booking.groupBy({
      by: ['paymentStatus'],
      where: { 
        clubId,
        status: { not: 'CANCELLED' }
      },
      _count: true,
      _sum: { price: true }
    })

    console.log('\n💰 ESTADO DE PAGOS EN RESERVAS:')
    bookingStats.forEach(stat => {
      console.log(`  - ${stat.paymentStatus || 'Sin estado'}: ${stat._count} reservas`)
      console.log(`    Total: $${(stat._sum.price || 0) / 100} MXN`)
    })

    // Check total revenue from bookings
    const totalRevenue = await prisma.booking.aggregate({
      where: { 
        clubId,
        status: { not: 'CANCELLED' }
      },
      _sum: { price: true }
    })

    console.log('\n📈 INGRESOS TOTALES DE RESERVAS:')
    console.log(`  $${(totalRevenue._sum.price || 0) / 100} MXN`)

    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTransactions()
