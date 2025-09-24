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

async function resetPaymentIntent() {
  const bookingId = '9b799d4a-b6b4-499b-a879-f1f686091425'
  console.log(`🔧 Reseteando payment intent para booking: ${bookingId}`)
  
  try {
    await prisma.$connect()
    console.log('✅ Conexión exitosa a Supabase')
    
    // Encontrar el pago existente
    const existingPayment = await prisma.payment.findFirst({
      where: { 
        bookingId: bookingId,
        status: 'processing'
      }
    })
    
    if (existingPayment) {
      console.log(`\n💳 Payment intent existente: ${existingPayment.stripePaymentIntentId}`)
      console.log('   Eliminando payment record para permitir nuevo intento...')
      
      // Eliminar el payment record
      await prisma.payment.delete({
        where: { id: existingPayment.id }
      })
      
      console.log('✅ Payment record eliminado')
    } else {
      console.log('❌ No se encontró payment intent activo')
    }
    
    // Resetear el estado de pago de la reserva
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        paymentStatus: 'pending'
      }
    })
    
    console.log('\n✅ Estado de la reserva reseteado:')
    console.log(`   Payment Status: ${booking.paymentStatus}`)
    console.log('\n🎯 Ahora puedes intentar el pago nuevamente')
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Error:', error)
    await prisma.$disconnect()
  }
}

resetPaymentIntent().catch(console.error)