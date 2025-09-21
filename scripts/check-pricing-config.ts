import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPricingConfig() {
  try {
    console.log('🔍 Verificando configuración de precios...')
    console.log('=' .repeat(60))

    // Check pricing configuration
    const pricing = await prisma.pricing.findMany({
      where: { clubId: 'cmers0a3v0000r4ujqpxd0qls' }
    })

    console.log('💰 CONFIGURACIÓN DE PRECIOS:')
    if (pricing.length === 0) {
      console.log('  ❌ No hay configuración de precios!')
    } else {
      pricing.forEach(p => {
        console.log(`  - Día ${p.dayOfWeek || 'Todos'}: ${p.startTime}-${p.endTime}`)
        console.log(`    Precio: ${p.price} centavos = $${p.price / 100} MXN`)
      })
    }

    // Check actual booking prices
    const bookings = await prisma.booking.findMany({
      where: { clubId: 'cmers0a3v0000r4ujqpxd0qls' },
      take: 10,
      orderBy: { date: 'asc' }
    })

    console.log('\n📊 PRECIOS EN RESERVAS (primeras 10):')
    bookings.forEach(b => {
      console.log(`  - ${b.playerName}: ${b.price} centavos = $${b.price / 100} MXN`)
    })

    // Check average price
    const avgPrice = await prisma.booking.aggregate({
      where: { clubId: 'cmers0a3v0000r4ujqpxd0qls' },
      _avg: { price: true }
    })

    console.log('\n📈 ESTADÍSTICAS:')
    console.log(`  Precio promedio: ${avgPrice._avg.price} centavos = $${(avgPrice._avg.price || 0) / 100} MXN`)

    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPricingConfig()
