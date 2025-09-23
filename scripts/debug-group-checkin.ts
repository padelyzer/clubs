import { prisma } from '../lib/config/prisma'

async function debugGroupCheckin() {
  const bookingId = '505630c0-45e8-4ef5-8c18-bc0af1b6a2'
  
  console.log('🔍 Debugging group check-in for ID:', bookingId)
  
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
    console.log('✅ Found as regular booking:', {
      id: booking.id,
      playerName: booking.playerName,
      clubId: booking.clubId,
      court: booking.Court?.name,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      checkedIn: booking.checkedIn
    })
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
    console.log('✅ Found as booking group:', {
      id: bookingGroup.id,
      playerName: bookingGroup.playerName,
      clubId: bookingGroup.clubId,
      status: bookingGroup.status,
      checkedIn: bookingGroup.checkedIn,
      bookingsCount: bookingGroup.bookings?.length,
      courts: bookingGroup.bookings?.map(b => b.Court?.name)
    })
    
    console.log('\n   Individual bookings:')
    bookingGroup.bookings?.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.playerName} - ${b.Court?.name} - ${b.startTime}-${b.endTime}`)
    })
  } else {
    console.log('❌ Not found as booking group')
  }
  
  // Check both with the full ID
  console.log('\n3. Full ID search results...')
  console.log('Booking ID length:', bookingId.length)
  console.log('Booking ID type:', typeof bookingId)
  
  await prisma.$disconnect()
}

debugGroupCheckin().catch(console.error)