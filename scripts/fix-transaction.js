require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create transaction for Ana's payment
    const transaction = await prisma.transaction.create({
      data: {
        id: 'txn_ana_' + Date.now(),
        type: 'INCOME',
        amount: 80000,
        description: 'Pago de reserva - Ana Martínez',
        category: 'BOOKING',
        date: new Date('2025-09-24'),
        clubId: '90e75af6-4ef5-49bf-adb3-a6f2a78e2e8d',
        bookingId: '9b799d4a-b6b4-499b-a879-f1f686091425',
        reference: 'STRIPE-pi_3SAhk4Etwpks3MKf0ooIieDR',
        createdAt: new Date('2025-09-24T00:35:47.525Z'),
        updatedAt: new Date()
      }
    });
    
    console.log('Transaction created successfully:');
    console.log('ID:', transaction.id);
    console.log('Amount:', transaction.amount);
    console.log('Description:', transaction.description);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();