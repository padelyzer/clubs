const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function checkBooking() {
  const bookingId = '9b799d4a-b6b4-499b-a879-f1f686091425';
  
  try {
    // Check if it's a regular booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        Club: true,
        Payment: true 
      }
    });
    
    if (booking) {
      console.log('Found regular booking:');
      console.log('- ID:', booking.id);
      console.log('- Player:', booking.playerName);
      console.log('- Club:', booking.Club?.name);
      console.log('- Payment Status:', booking.paymentStatus);
      console.log('- Payments count:', booking.Payment.length);
      
      if (booking.Payment.length > 0) {
        console.log('\nPayment records:');
        booking.Payment.forEach((payment, index) => {
          console.log(`Payment ${index + 1}:`);
          console.log('  - ID:', payment.id);
          console.log('  - Status:', payment.status);
          console.log('  - Amount:', payment.amount);
          console.log('  - Stripe Payment Intent ID:', payment.stripePaymentIntentId);
          console.log('  - Created:', payment.createdAt);
        });
      }
    }
    
    // Check related ClassBookings
    const classBookings = await prisma.classBooking.findMany({
      where: { id: bookingId }
    });
    
    console.log('\nIs class booking?', classBookings.length > 0);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBooking();