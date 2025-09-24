const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
    }
  }
});

async function createMissingTransaction() {
  // Find Ana's payment
  const payment = await prisma.payment.findFirst({
    where: {
      id: 'payment_90e75af6-4ef5-49bf-adb3-a6f2a78e2e8d_1758674147525_lf4dmbcaq'
    },
    include: {
      Booking: true
    }
  });
  
  if (!payment) {
    console.log('Payment not found');
    await prisma.$disconnect();
    return;
  }
  
  // Check if transaction already exists
  const existing = await prisma.transaction.findFirst({
    where: { paymentId: payment.id }
  });
  
  if (existing) {
    console.log('Transaction already exists:', existing.id);
    await prisma.$disconnect();
    return;
  }
  
  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      id: 'txn_90e75af6-4ef5-49bf-adb3-a6f2a78e2e8d_' + Date.now() + '_manual',
      type: 'INCOME',
      amount: payment.amount,
      description: 'Pago de reserva - Ana Martínez',
      clubId: '90e75af6-4ef5-49bf-adb3-a6f2a78e2e8d',
      paymentId: payment.id,
      createdAt: payment.createdAt,
      updatedAt: new Date()
    }
  });
  
  console.log('Transaction created:', transaction.id);
  console.log('Amount:', transaction.amount);
  console.log('Description:', transaction.description);
  
  await prisma.$disconnect();
}

createMissingTransaction();