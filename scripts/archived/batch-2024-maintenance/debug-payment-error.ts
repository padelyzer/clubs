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

async function debugPaymentError() {
  const bookingId = '9b799d4a-b6b4-499b-a879-f1f686091425'
  console.log(`🔍 Depurando error de pago para booking: ${bookingId}`)
  
  try {
    await prisma.$connect()
    console.log('✅ Conexión exitosa a Supabase')
    
    // 1. Verificar que la reserva existe
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Club: true,
        Court: true,
        Payment: true
      }
    })
    
    if (!booking) {
      console.log('❌ Reserva no encontrada')
      return
    }
    
    console.log('\n✅ Reserva encontrada:')
    console.log(`   Jugador: ${booking.playerName}`)
    console.log(`   Club ID: ${booking.clubId}`)
    console.log(`   Club: ${booking.Club?.name}`)
    console.log(`   Precio: $${booking.price / 100} MXN (${booking.price} centavos)`)
    console.log(`   Estado de pago: ${booking.paymentStatus}`)
    console.log(`   Pagos existentes: ${booking.Payment.length}`)
    
    // 2. Verificar ClubSettings
    const clubSettings = await prisma.clubSettings.findUnique({
      where: { clubId: booking.clubId }
    })
    
    console.log('\n🏢 Club Settings:')
    if (clubSettings) {
      console.log(`   Timezone: ${clubSettings.timezone}`)
      console.log(`   Currency: ${clubSettings.currency}`)
    } else {
      console.log('   ❌ No hay ClubSettings - esto puede causar problemas')
    }
    
    // 3. Verificar PaymentProvider
    const paymentProviders = await prisma.paymentProvider.findMany({
      where: { clubId: booking.clubId }
    })
    
    console.log('\n💳 Payment Providers:')
    if (paymentProviders.length === 0) {
      console.log('   ❌ No hay proveedores de pago configurados')
    } else {
      paymentProviders.forEach(provider => {
        console.log(`   - ${provider.providerId}: ${provider.enabled ? 'Habilitado' : 'Deshabilitado'}`)
        if (provider.config) {
          const config = provider.config as any
          console.log(`     Has publicKey: ${!!config.publicKey}`)
          console.log(`     Has secretKey: ${!!config.secretKey}`)
        }
      })
    }
    
    // 4. Verificar si hay algún payment intent existente
    if (booking.Payment.length > 0) {
      console.log('\n💰 Pagos existentes:')
      booking.Payment.forEach(payment => {
        console.log(`   - ID: ${payment.id}`)
        console.log(`     Status: ${payment.status}`)
        console.log(`     Amount: $${payment.amount / 100} MXN`)
        console.log(`     Stripe PI: ${payment.stripePaymentIntentId || 'None'}`)
      })
    }
    
    // 5. Simular la creación de payment intent
    console.log('\n🧪 Simulando creación de payment intent...')
    console.log('   La reserva debería poder crear un payment intent')
    console.log('   Si falla, puede ser por:')
    console.log('   1. Falta de configuración de Stripe (debería usar modo test)')
    console.log('   2. Error en el formato de datos')
    console.log('   3. Problema con la base de datos')
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Error:', error)
    await prisma.$disconnect()
  }
}

debugPaymentError().catch(console.error)