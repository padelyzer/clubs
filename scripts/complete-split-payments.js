require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function completeSplitPayments() {
  try {
    // Find bookings with split payment enabled but incomplete records
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
      const existingSplitPayments = booking.SplitPayment.length;
      const expectedSplitPayments = booking.splitPaymentCount || 4;
      
      console.log(`\nBooking ${booking.id}:`);
      console.log(`- Player: ${booking.playerName}`);
      console.log(`- Expected split payments: ${expectedSplitPayments}`);
      console.log(`- Existing split payments: ${existingSplitPayments}`);
      
      if (existingSplitPayments < expectedSplitPayments) {
        console.log(`- Creating ${expectedSplitPayments - existingSplitPayments} additional split payment records...`);
        
        const amountPerPlayer = Math.floor(booking.price / expectedSplitPayments);
        
        // Create missing split payment records
        for (let i = existingSplitPayments; i < expectedSplitPayments; i++) {
          const splitId = `split_${booking.id}_${i + 1}_${Date.now()}`;
          const splitPayment = await prisma.splitPayment.create({
            data: {
              id: splitId,
              Booking: {
                connect: { id: booking.id }
              },
              amount: amountPerPlayer,
              status: 'pending',
              playerName: `Jugador ${i + 1}`,
              playerPhone: '',
              playerEmail: '',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          
          console.log(`  - Created split payment ${i + 1}: ${amountPerPlayer} MXN`);
        }
      }
    }
    
    console.log('\nSplit payments completed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

completeSplitPayments();