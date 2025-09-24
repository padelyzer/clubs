require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSplitBookings() {
  try {
    // Find bookings with split payment enabled
    const bookings = await prisma.booking.findMany({
      where: {
        splitPaymentEnabled: true
      },
      include: {
        SplitPayment: true
      }
    });
    
    console.log(`Found ${bookings.length} bookings with split payment enabled`);
    
    for (const booking of bookings) {
      console.log(`\nBooking ${booking.id}:`);
      console.log(`- Player: ${booking.playerName}`);
      console.log(`- Split into: ${booking.splitPaymentCount} payments`);
      console.log(`- Has split payment records: ${booking.SplitPayment.length > 0 ? 'YES' : 'NO'}`);
      console.log(`- Split payment count: ${booking.SplitPayment.length}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSplitBookings();