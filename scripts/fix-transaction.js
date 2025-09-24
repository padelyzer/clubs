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
        category: 'COURT_RENTAL',
        date: new Date('2025-09-24'),
        clubId: '90e75af6-4ef5-49bf-adb3-a6f2a78e2e8d',
        paymentId: 'payment_90e75af6-4ef5-49bf-adb3-a6f2a78e2e8d_1758674147525_lf4dmbcaq',
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