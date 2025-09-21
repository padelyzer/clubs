import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPricing() {
  try {
    console.log('🔧 Arreglando configuración de precios y reservas...')
    console.log('=' .repeat(60))

    const clubId = 'cmers0a3v0000r4ujqpxd0qls'
    const targetPrice = 50000 // $500 MXN en centavos

    // Step 1: Create pricing configuration for $500 MXN
    console.log('📝 Creando configuración de precios a $500 MXN...')
    
    const existingPricing = await prisma.pricing.findFirst({
      where: { clubId }
    })

    if (!existingPricing) {
      await prisma.pricing.create({
        data: {
          clubId,
          dayOfWeek: null, // All days
          startTime: '07:00',
          endTime: '22:00',
          price: targetPrice // $500 MXN
        }
      })
      console.log('✅ Configuración de precios creada: $500 MXN por hora')
    } else {
      console.log('⚠️ Ya existe configuración de precios')
    }

    // Step 2: Update all booking prices to $500 MXN (or $750 for 1.5 hours)
    console.log('\n📊 Actualizando precios de reservas...')
    
    // Update bookings based on duration
    const bookings = await prisma.booking.findMany({
      where: { clubId }
    })

    let updated60min = 0
    let updated90min = 0
    let updated120min = 0

    for (const booking of bookings) {
      let newPrice = targetPrice // Default $500 for 60 min
      
      if (booking.duration === 90) {
        newPrice = Math.round(targetPrice * 1.5) // $750 for 90 min
        updated90min++
      } else if (booking.duration === 120) {
        newPrice = targetPrice * 2 // $1000 for 120 min
        updated120min++
      } else {
        updated60min++
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: { price: newPrice }
      })
    }

    console.log(`✅ Actualizadas ${bookings.length} reservas:`)
    console.log(`   - ${updated60min} reservas de 60 min → $500 MXN`)
    console.log(`   - ${updated90min} reservas de 90 min → $750 MXN`)
    console.log(`   - ${updated120min} reservas de 120 min → $1000 MXN`)

    // Step 3: Update payment records to match
    console.log('\n💳 Actualizando registros de pagos...')
    
    const payments = await prisma.payment.findMany({
      include: { booking: true }
    })

    for (const payment of payments) {
      if (payment.booking) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { amount: payment.booking.price }
        })
      }
    }

    console.log(`✅ Actualizados ${payments.length} registros de pagos`)

    // Step 4: Calculate new totals
    const stats = await prisma.booking.aggregate({
      where: { 
        clubId,
        status: { not: 'CANCELLED' }
      },
      _sum: { price: true },
      _count: true
    })

    console.log('\n📈 NUEVOS TOTALES:')
    console.log(`   Total reservas: ${stats._count}`)
    console.log(`   Ingresos totales: $${(stats._sum.price || 0) / 100} MXN`)
    console.log(`   Promedio por reserva: $${Math.round(((stats._sum.price || 0) / stats._count) / 100)} MXN`)

    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPricing()
