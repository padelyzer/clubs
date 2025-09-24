require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function debugSplitPayments() {
  try {
    console.log('\n🔍 Debugging Split Payments...\n');

    // 1. Find bookings with split payment enabled
    const bookingsWithSplit = await prisma.booking.findMany({
      where: {
        splitPaymentEnabled: true
      },
      include: {
        SplitPayment: true,
        Court: true,
        Club: true
      }
    });
    
    console.log(`Found ${bookingsWithSplit.length} bookings with split payment enabled\n`);
    
    for (const booking of bookingsWithSplit) {
      console.log(`\n📋 Booking: ${booking.id}`);
      console.log(`   Player: ${booking.playerName}`);
      console.log(`   Date: ${booking.date}`);
      console.log(`   Split Payment Count: ${booking.splitPaymentCount}`);
      console.log(`   Actual Split Payments: ${booking.SplitPayment.length}`);
      console.log(`   Payment Status: ${booking.paymentStatus}`);
      console.log(`   Total Price: $${booking.price / 100} MXN`);
      
      if (booking.SplitPayment.length > 0) {
        console.log('\n   Split Payment Details:');
        booking.SplitPayment.forEach((sp, index) => {
          console.log(`   ${index + 1}. ${sp.playerName}`);
          console.log(`      - Status: ${sp.status}`);
          console.log(`      - Amount: $${sp.amount / 100} MXN`);
          console.log(`      - ID: ${sp.id}`);
        });
      } else {
        console.log('   ⚠️  NO SPLIT PAYMENT RECORDS FOUND');
      }
    }

    // 2. Test the API endpoint
    if (bookingsWithSplit.length > 0) {
      const testBooking = bookingsWithSplit[0];
      console.log(`\n\n🌐 Testing API endpoint for booking: ${testBooking.id}`);
      
      // Import the function directly
      const { getSplitPaymentStatus } = require('../lib/payments/split-payment');
      
      try {
        const status = await getSplitPaymentStatus(testBooking.id);
        console.log('\nAPI Response:');
        console.log(JSON.stringify(status, null, 2));
      } catch (error) {
        console.error('API Error:', error.message);
      }
    }
    
    // 3. Check for orphaned split payments
    console.log('\n\n🔍 Checking for orphaned split payments...');
    const orphanedSplitPayments = await prisma.splitPayment.findMany({
      where: {
        AND: [
          { bookingId: null },
          { bookingGroupId: null }
        ]
      }
    });
    
    console.log(`Found ${orphanedSplitPayments.length} orphaned split payments`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSplitPayments();