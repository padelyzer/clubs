import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing payment status for all registrations...')
  
  // Update all registrations with PAID status to 'completed'
  const result = await prisma.tournamentRegistration.updateMany({
    where: {
      paymentStatus: 'PAID'
    },
    data: {
      paymentStatus: 'completed',
      confirmed: true,
      checkedIn: false, // Reset check-in to false for all
      checkedInAt: null,
      updatedAt: new Date()
    }
  })
  
  console.log(`✅ Updated ${result.count} registrations`)
  
  // Also update any with lowercase 'pending' or 'failed'
  await prisma.tournamentRegistration.updateMany({
    where: {
      paymentStatus: 'pending'
    },
    data: {
      paymentStatus: 'pending',
      confirmed: false,
      checkedIn: false,
      checkedInAt: null,
      updatedAt: new Date()
    }
  })
  
  await prisma.tournamentRegistration.updateMany({
    where: {
      paymentStatus: 'failed'
    },
    data: {
      paymentStatus: 'failed',
      confirmed: false,
      checkedIn: false,
      checkedInAt: null,
      updatedAt: new Date()
    }
  })
  
  // Check current status
  const stats = await prisma.tournamentRegistration.groupBy({
    by: ['paymentStatus'],
    _count: {
      id: true
    }
  })
  
  console.log('\n📊 Payment Status Summary:')
  stats.forEach(stat => {
    console.log(`   - ${stat.paymentStatus}: ${stat._count.id} registrations`)
  })
  
  console.log('\n✅ All payment statuses have been fixed!')
  console.log('   - Check-in field has been reset for all registrations')
  console.log('   - All paid registrations are now marked as "completed"')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })