require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSplitPayments() {
  try {
    // Find bookings with split payment enabled but no split payment records
    const bookings = await prisma.booking.findMany({
      where: {
        splitPaymentEnabled: true,
        SplitPayment: {
          none: {}
        }
      }
    });
    
    console.log(`Found ${bookings.length} bookings needing split payment records`);
    
    for (const booking of bookings) {
      console.log(`\nCreating split payments for booking ${booking.id}`);
      console.log(`Player: ${booking.playerName}`);
      console.log(`Total amount: ${booking.price}`);
      console.log(`Split into: ${booking.splitPaymentCount} payments`);
      
      const amountPerPlayer = Math.floor(booking.price / booking.splitPaymentCount);
      
      // Create split payment records
      for (let i = 0; i < booking.splitPaymentCount; i++) {
        const splitId = `split_${booking.id}_${i + 1}_${Date.now()}`;
        const splitPayment = await prisma.splitPayment.create({
          data: {
            id: splitId,
            bookingId: booking.id,
            amount: amountPerPlayer,
            status: 'pending',
            playerName: i === 0 ? booking.playerName : `Jugador ${i + 1}`,
            playerEmail: i === 0 ? booking.playerEmail : null,
            playerPhone: i === 0 ? booking.playerPhone : null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        console.log(`  - Created split payment ${i + 1}: ${amountPerPlayer} MXN`);
      }
    }
    
    console.log('\nSplit payments created successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createSplitPayments();