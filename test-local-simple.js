const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testDirectFunction() {
  try {
    console.log('🧪 Testing getSplitPaymentStatus function directly...\n');
    
    const bookingId = '9f43ba36-adea-429e-ba29-5b5a21085bb5';
    
    // Test the exact same query that the function does
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        SplitPayment: {
          orderBy: { createdAt: 'asc' }
        },
        Court: true,
        Club: true
      }
    });

    if (!booking) {
      console.log('❌ Booking not found');
      return;
    }
    
    console.log('✅ Raw booking data from Prisma:');
    console.log('   ID:', booking.id);
    console.log('   Player:', booking.playerName);
    console.log('   Split Payments Found:', booking.SplitPayment.length);
    console.log('   Court:', booking.Court ? booking.Court.name : 'NOT FOUND');
    console.log('   Club:', booking.Club ? booking.Club.name : 'NOT FOUND');
    
    if (booking.SplitPayment.length > 0) {
      console.log('\n💰 Split Payment Details:');
      booking.SplitPayment.forEach((sp, index) => {
        console.log(`   ${index + 1}. ${sp.playerName} - $${(sp.amount / 100).toFixed(2)} (${sp.status})`);
      });
    }

    // Now simulate the function logic
    const completedPayments = booking.SplitPayment.filter(sp => sp.status === 'completed').length;
    const pendingPayments = booking.SplitPayment.filter(sp => sp.status === 'pending').length;
    const failedPayments = booking.SplitPayment.filter(sp => sp.status === 'failed').length;

    const completedAmount = booking.SplitPayment
      .filter(sp => sp.status === 'completed')
      .reduce((sum, sp) => sum + sp.amount, 0);
      
    const totalAmount = booking.price || 0;
    const pendingAmount = totalAmount - completedAmount;

    console.log('\n📊 Status Summary:');
    console.log('   Total Payments:', booking.splitPaymentCount);
    console.log('   Completed:', completedPayments);
    console.log('   Pending:', pendingPayments);
    console.log('   Failed:', failedPayments);
    console.log('   Total Amount:', `$${(totalAmount / 100).toFixed(2)} MXN`);
    console.log('   Completed Amount:', `$${(completedAmount / 100).toFixed(2)} MXN`);
    console.log('   Pending Amount:', `$${(pendingAmount / 100).toFixed(2)} MXN`);

    // Create the expected response
    const response = {
      booking: {
        id: booking.id,
        date: booking.date.toISOString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        club: {
          name: booking.Club.name
        },
        court: {
          name: booking.Court.name
        },
        playerName: booking.playerName,
        totalPlayers: booking.totalPlayers || 4,
        price: booking.price,
        paymentStatus: booking.paymentStatus
      },
      splitPayments: booking.SplitPayment.map(sp => ({
        id: sp.id,
        playerName: sp.playerName,
        playerEmail: sp.playerEmail,
        playerPhone: sp.playerPhone,
        amount: sp.amount,
        status: sp.status,
        completedAt: sp.completedAt?.toISOString(),
        stripePaymentIntentId: sp.stripePaymentIntentId,
        paymentLink: sp.paymentLink
      })),
      totalPayments: booking.splitPaymentCount,
      completedPayments,
      pendingPayments,
      totalAmount,
      completedAmount,
      pendingAmount
    };

    console.log('\n🎯 Expected API Response:');
    console.log(JSON.stringify(response, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectFunction();