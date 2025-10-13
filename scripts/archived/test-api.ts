import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAPIs() {
  try {
    // Test that we can access bookings with proper relations
    console.log('Testing Booking relations...')
    const bookings = await prisma.booking.findMany({
      where: {
        clubId: 'club-padel-puebla-001'
      },
      include: {
        Court: true,
        SplitPayment: true,
        Payment: true
      },
      take: 1
    })
    console.log('✅ Booking relations work!')
    
    // Test Transaction relations
    console.log('\nTesting Transaction relations...')
    const transactions = await prisma.transaction.findMany({
      where: {
        clubId: 'club-padel-puebla-001'
      },
      include: {
        Booking: true,
        Player: true
      },
      take: 1
    })
    console.log('✅ Transaction relations work!')

    // Test BookingGroup relations
    console.log('\nTesting BookingGroup relations...')
    const bookingGroups = await prisma.bookingGroup.findMany({
      where: {
        clubId: 'club-padel-puebla-001'
      },
      include: {
        bookings: {
          include: {
            Court: true
          }
        }
      },
      take: 1
    })
    console.log('✅ BookingGroup relations work!')
    
    console.log('\n🎉 All Prisma relations are correctly configured!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPIs()