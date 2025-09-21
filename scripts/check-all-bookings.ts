import { prisma } from '../lib/config/prisma'

async function checkAllBookings() {
  try {
    console.log('🔍 Verificando todas las reservas recientes...\n')
    
    const bookings = await prisma.booking.findMany({
      where: {
        checkedIn: true
      },
      include: {
        court: { select: { name: true } },
        payments: true
      },
      orderBy: {
        checkedInAt: 'desc'
      },
      take: 10
    })
    
    console.log(`📋 Reservas con check-in (últimas 10):\n`)
    console.log('═'.repeat(80))
    
    for (const booking of bookings) {
      console.log(`\n📌 ${booking.playerName} - ${booking.court.name}`)
      console.log(`   ID: ${booking.id}`)
      console.log(`   Fecha: ${booking.date.toLocaleDateString('es-MX')}`)
      console.log(`   Horario: ${booking.startTime} - ${booking.endTime}`)
      console.log(`   Precio: $${(booking.price / 100).toFixed(2)} MXN`)
      console.log(`   Check-in: ${booking.checkedInAt?.toLocaleString('es-MX')}`)
      console.log(`   Tipo de pago: ${booking.paymentType}`)
      console.log(`   Estado pago: ${booking.paymentStatus}`)
      
      if (booking.payments.length > 0) {
        console.log(`\n   💳 Pagos registrados:`)
        booking.payments.forEach((p, idx) => {
          console.log(`      ${idx + 1}. Método: ${p.method}`)
          console.log(`         Monto: $${(p.amount / 100).toFixed(2)}`)
          console.log(`         Estado: ${p.status}`)
          console.log(`         Completado: ${p.completedAt?.toLocaleString('es-MX') || 'N/A'}`)
          if (p.stripeChargeId) {
            console.log(`         Referencia: ${p.stripeChargeId}`)
          }
        })
      } else {
        console.log(`   ⚠️ Sin pagos registrados`)
      }
      
      // Buscar transacción
      const transaction = await prisma.transaction.findFirst({
        where: { bookingId: booking.id }
      })
      
      if (transaction) {
        console.log(`\n   📊 Transacción:`)
        console.log(`      Referencia: ${transaction.reference}`)
        console.log(`      Monto: $${(transaction.amount / 100).toFixed(2)}`)
      } else {
        console.log(`\n   ❌ Sin transacción`)
      }
      
      console.log('\n' + '-'.repeat(80))
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllBookings()