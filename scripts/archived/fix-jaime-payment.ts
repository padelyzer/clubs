import { prisma } from './lib/config/prisma'

async function fixJaimePayment() {
  console.log('🔧 Fixing Jaime Alcázar payment status...')
  
  const bookingId = 'booking_club-basic5-001_1757528876778_cgqlltc5l'
  const paymentIntentId = 'pi_3S5v8kEtwpks3MKf08o8twgx'
  
  console.log(`📋 Booking ID: ${bookingId}`)
  console.log(`💳 Payment Intent: ${paymentIntentId}`)
  
  // Update the payment status to completed
  const payment = await prisma.payment.updateMany({
    where: {
      bookingId: bookingId,
      stripePaymentIntentId: paymentIntentId
    },
    data: {
      status: 'completed',
      completedAt: new Date()
    }
  })
  
  console.log(`✅ Updated ${payment.count} payment records`)
  
  // Update the booking payment status
  const booking = await prisma.booking.update({
    where: {
      id: bookingId
    },
    data: {
      paymentStatus: 'completed',
      status: 'CONFIRMED'
    }
  })
  
  console.log(`✅ Updated booking status to: ${booking.paymentStatus}`)
  
  // Verify the fix
  const verifyBooking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Payment: true
    }
  })
  
  console.log('\n📊 Verification:')
  console.log(`   Booking Payment Status: ${verifyBooking?.paymentStatus}`)
  console.log(`   Booking Status: ${verifyBooking?.status}`)
  if (verifyBooking?.Payment && verifyBooking?.Payment.length > 0) {
    verifyBooking.Payment.forEach((p, i) => {
      console.log(`   Payment #${i + 1}: ${p.method} - ${p.status} - ${p.completedAt ? 'completed at ' + p.completedAt : 'no completion date'}`)
    })
  }
  
  console.log('\n🎉 Payment fix complete!')
}

fixJaimePayment().catch(console.error).finally(() => process.exit())