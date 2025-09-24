require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // This should point to production Supabase
    }
  }
});

async function createSplitPaymentsForProduction() {
  try {
    console.log('🔧 Creating split payment records for production booking...\n');
    
    const bookingId = '7a9493bf-0972-4497-aa38-2ccad5145296'; // From the console log you showed
    
    // First check if the booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        SplitPayment: true
      }
    });
    
    if (!booking) {
      console.log('❌ Booking not found in production database');
      return;
    }
    
    console.log(`✅ Found booking: ${booking.playerName}`);
    console.log(`   Split Payment Enabled: ${booking.splitPaymentEnabled}`);
    console.log(`   Split Payment Count: ${booking.splitPaymentCount}`);
    console.log(`   Existing Split Payments: ${booking.SplitPayment.length}`);
    console.log(`   Price: $${booking.price / 100} MXN`);
    
    if (!booking.splitPaymentEnabled) {
      console.log('\n📝 Enabling split payment for this booking...');
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          splitPaymentEnabled: true,
          splitPaymentCount: 4
        }
      });
    }
    
    // Create missing split payment records if needed
    const neededRecords = booking.splitPaymentCount - booking.SplitPayment.length;
    
    if (neededRecords > 0) {
      console.log(`\n💰 Creating ${neededRecords} split payment records...`);
      
      const amountPerPlayer = Math.ceil(booking.price / booking.splitPaymentCount);
      
      for (let i = booking.SplitPayment.length; i < booking.splitPaymentCount; i++) {
        const splitId = `split_${bookingId}_${i + 1}_${Date.now()}`;
        
        await prisma.splitPayment.create({
          data: {
            id: splitId,
            Booking: {
              connect: { id: bookingId }
            },
            amount: amountPerPlayer,
            status: 'pending',
            playerName: i === 0 ? booking.playerName : `Jugador ${i + 1}`,
            playerPhone: i === 0 ? booking.playerPhone : '',
            playerEmail: i === 0 ? booking.playerEmail || '' : '',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        console.log(`   ✅ Created split payment ${i + 1}: $${amountPerPlayer / 100} MXN for ${i === 0 ? booking.playerName : `Jugador ${i + 1}`}`);
      }
    }
    
    // Verify final state
    const updatedBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        SplitPayment: true
      }
    });
    
    console.log(`\n🎉 Final verification:`);
    console.log(`   Split Payments: ${updatedBooking.SplitPayment.length}/${updatedBooking.splitPaymentCount}`);
    console.log(`   All records created successfully!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSplitPaymentsForProduction();