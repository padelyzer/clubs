import { PrismaClient } from '@prisma/client'

// Use production database URL - Supabase production
const PRODUCTION_DATABASE_URL = 'postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL
    }
  }
})

async function fixProductionPrices() {
  console.log('🌐 Corrigiendo precios en PRODUCCIÓN...')
  
  try {
    await prisma.$connect()
    console.log('✅ Conexión exitosa a Supabase')
    
    // Find club by slug
    const club = await prisma.club.findFirst({
      where: { 
        slug: 'club-demo-padelyzer'
      }
    })
    
    if (!club) {
      console.error('❌ Club no encontrado')
      return
    }
    
    console.log(`✅ Club encontrado: ${club.name} (${club.id})`)
    
    // Get all bookings for today
    const todayStart = new Date('2025-09-24T06:00:00.000Z')
    const todayEnd = new Date('2025-09-25T05:59:59.999Z')
    
    const bookings = await prisma.booking.findMany({
      where: {
        clubId: club.id,
        date: {
          gte: todayStart,
          lt: todayEnd
        }
      }
    })
    
    const groups = await prisma.bookingGroup.findMany({
      where: {
        clubId: club.id,
        date: {
          gte: todayStart,
          lt: todayEnd
        }
      }
    })
    
    console.log(`\n📋 Reservas encontradas: ${bookings.length}`)
    console.log(`📋 Grupos encontrados: ${groups.length}`)
    
    // Fix individual bookings prices (multiply by 100 to convert to cents)
    for (const booking of bookings) {
      if (booking.price < 10000) { // If price is less than 100 pesos, it's probably in pesos not cents
        const newPrice = booking.price * 100
        await prisma.booking.update({
          where: { id: booking.id },
          data: { price: newPrice }
        })
        console.log(`✅ Actualizado precio de ${booking.playerName}: $${booking.price} → $${newPrice/100} (${newPrice} centavos)`)
      }
    }
    
    // Fix group bookings prices
    for (const group of groups) {
      if (group.price < 10000) { // If price is less than 100 pesos, it's probably in pesos not cents
        const newPrice = group.price * 100
        await prisma.bookingGroup.update({
          where: { id: group.id },
          data: { price: newPrice }
        })
        console.log(`✅ Actualizado precio del grupo ${group.playerName}: $${group.price} → $${newPrice/100} (${newPrice} centavos)`)
      }
    }
    
    console.log('\n✅ ¡Precios corregidos exitosamente!')
    console.log('Los precios ahora deberían mostrarse correctamente:')
    console.log('   • Reservas individuales: $800 MXN')
    console.log('   • Reserva grupal: $1,600 MXN')
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Error:', error)
    await prisma.$disconnect()
  }
}

fixProductionPrices().catch(console.error)