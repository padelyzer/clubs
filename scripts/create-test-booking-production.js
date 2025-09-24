require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createTestBookingWithSplitPayments() {
  try {
    console.log('🚀 Creating test booking with split payments in production...\n');
    
    // Get the Club Demo Padelyzer ID and a court
    const club = await prisma.club.findUnique({
      where: { slug: 'club-demo-padelyzer' },
      include: {
        Court: {
          where: { active: true },
          take: 1
        }
      }
    });
    
    if (!club || !club.Court.length) {
      console.log('❌ Club or court not found');
      return;
    }
    
    console.log(`✅ Using club: ${club.name}`);
    console.log(`✅ Using court: ${club.Court[0].name}`);
    
    // Create a booking for tomorrow with the ID from the console log
    const bookingId = '7a9493bf-0972-4497-aa38-2ccad5145296';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const booking = await prisma.booking.create({
      data: {
        id: bookingId,
        clubId: club.id,
        courtId: club.Court[0].id,
        date: tomorrow,
        startTime: '16:00',
        endTime: '17:30',
        duration: 90,
        playerName: 'Test Player Split',
        playerEmail: 'test@example.com',
        playerPhone: '+52 222 123 4567',
        totalPlayers: 4,
        price: 1600, // $16.00 MXN
        currency: 'MXN',
        splitPaymentEnabled: true,
        splitPaymentCount: 4,
        status: 'PENDING',
        paymentStatus: 'pending',
        updatedAt: new Date()
      }
    });
    
    console.log(`✅ Created booking: ${booking.id}`);
    console.log(`   Player: ${booking.playerName}`);
    console.log(`   Date: ${booking.date.toLocaleDateString()}`);
    console.log(`   Price: $${booking.price / 100} MXN`);
    
    // Create 4 split payment records
    const amountPerPlayer = Math.ceil(booking.price / 4); // $4.00 each
    
    console.log(`\n💰 Creating ${booking.splitPaymentCount} split payments of $${amountPerPlayer / 100} each...`);
    
    for (let i = 0; i < booking.splitPaymentCount; i++) {
      const splitId = `split_${bookingId}_${i + 1}_${Date.now() + i}`;
      
      const splitPayment = await prisma.splitPayment.create({
        data: {
          id: splitId,
          bookingId: booking.id,
          amount: amountPerPlayer,
          status: 'pending',
          playerName: i === 0 ? booking.playerName : `Jugador ${i + 1}`,
          playerPhone: i === 0 ? booking.playerPhone : '',
          playerEmail: i === 0 ? booking.playerEmail || '' : '',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log(`   ✅ Created split payment ${i + 1}: ${splitPayment.playerName} - $${amountPerPlayer / 100} MXN`);
    }
    
    console.log('\n🎉 Test booking with split payments created successfully!');
    console.log(`📋 Booking ID: ${bookingId}`);
    console.log('   You can now test this booking in the production dashboard.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error.code === 'P2002') {
      console.log('ℹ️  Booking with this ID already exists. That means it\'s ready for testing!');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestBookingWithSplitPayments();