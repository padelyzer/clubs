import { prisma } from '../lib/config/prisma'

async function debugSpecificBooking() {
  const bookingId = '50563039-1de9-416d-9fe8-696c0af1b6a2'
  
  console.log('🔍 Debugging specific booking:', bookingId)
  
  // Check if it's a regular booking
  console.log('\n1. Checking as regular booking...')
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Court: true,
      Payment: true
    }
  })
  
  if (booking) {
    console.log('✅ Found as regular booking:')
    console.log('   ID:', booking.id)
    console.log('   Player:', booking.playerName)
    console.log('   Club ID:', booking.clubId)
    console.log('   Court:', booking.Court?.name)
    console.log('   Status:', booking.status)
    console.log('   Payment Status:', booking.paymentStatus)
    console.log('   Split Payment Enabled:', booking.splitPaymentEnabled)
    console.log('   Split Payment Count:', booking.splitPaymentCount)
    console.log('   Checked In:', booking.checkedIn)
    console.log('   Checked In At:', booking.checkedInAt)
    console.log('   Checked In By:', booking.checkedInBy)
    console.log('   Date:', booking.date)
    console.log('   Start Time:', booking.startTime)
    console.log('   End Time:', booking.endTime)
    console.log('   Created At:', booking.createdAt)
    console.log('   Updated At:', booking.updatedAt)
  } else {
    console.log('❌ Not found as regular booking')
  }
  
  // Check if it's a booking group
  console.log('\n2. Checking as booking group...')
  const bookingGroup = await prisma.bookingGroup.findUnique({
    where: { id: bookingId },
    include: {
      bookings: {
        include: {
          Court: true
        }
      },
      payments: true
    }
  })
  
  if (bookingGroup) {
    console.log('✅ Found as booking group:')
    console.log('   ID:', bookingGroup.id)
    console.log('   Player:', bookingGroup.playerName)
    console.log('   Club ID:', bookingGroup.clubId)
    console.log('   Status:', bookingGroup.status)
    console.log('   Split Payment Enabled:', bookingGroup.splitPaymentEnabled)
    console.log('   Split Payment Count:', bookingGroup.splitPaymentCount)
    console.log('   Date:', bookingGroup.date)
    console.log('   Start Time:', bookingGroup.startTime)
    console.log('   End Time:', bookingGroup.endTime)
    console.log('   Created At:', bookingGroup.createdAt)
    console.log('   Updated At:', bookingGroup.updatedAt)
    console.log('   Bookings Count:', bookingGroup.bookings?.length)
    
    console.log('\n   Individual bookings:')
    bookingGroup.bookings?.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.playerName} - ${b.Court?.name} - ${b.startTime}-${b.endTime}`)
      console.log(`      Status: ${b.status}, Payment: ${b.paymentStatus}, Checked in: ${b.checkedIn}`)
    })
  } else {
    console.log('❌ Not found as booking group')
  }
  
  await prisma.$disconnect()
}

debugSpecificBooking().catch(console.error)