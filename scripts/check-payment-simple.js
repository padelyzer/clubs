const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function checkPayment() {
  const bookingId = '9b799d4a-b6b4-499b-a879-f1f686091425';
  const paymentIntentId = 'pi_3SAggREtwpks3MKf1qkyBBex';
  
  try {
    console.log('Checking booking:', bookingId);
    console.log('Checking payment intent:', paymentIntentId);
    
    // Check booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });
    
    if (booking) {
      console.log('\nBooking found:');
      console.log('- Player:', booking.playerName);
      console.log('- Payment Status:', booking.paymentStatus);
      console.log('- Price:', booking.price);
    }
    
    // Check payment by booking ID
    const paymentsByBooking = await prisma.payment.findMany({
      where: { bookingId: bookingId }
    });
    
    console.log('\nPayments by booking ID:', paymentsByBooking.length);
    
    // Check payment by stripe payment intent
    const paymentsByIntent = await prisma.payment.findMany({
      where: { stripePaymentIntentId: paymentIntentId }
    });
    
    console.log('Payments by intent ID:', paymentsByIntent.length);
    
    if (paymentsByIntent.length > 0) {
      console.log('\nPayment details:');
      paymentsByIntent.forEach(p => {
        console.log('- ID:', p.id);
        console.log('- Status:', p.status);
        console.log('- Amount:', p.amount);
        console.log('- Booking ID:', p.bookingId);
        console.log('- Stripe Intent:', p.stripePaymentIntentId);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPayment();