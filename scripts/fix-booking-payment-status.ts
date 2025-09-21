import { prisma } from './lib/config/prisma'

async function fixBookingPaymentStatus() {
  const bookingId = 'booking_club-basic5-001_1757809373255_8fnaa8nhe'
  
  console.log('🔧 Fixing booking payment status...')
  console.log('   Booking ID:', bookingId)
  
  // Get the booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { 
      id: true, 
      clubId: true, 
      status: true, 
      paymentStatus: true,
      playerName: true 
    }
  })
  
  if (!booking) {
    console.log('❌ Booking not found')
    await prisma.$disconnect()
    return
  }
  
  console.log('📋 Current booking:', booking)
  
  // Update the booking with proper paymentStatus
  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: booking.paymentStatus || 'pending'
    }
  })
  
  console.log('✅ Updated booking:', {
    id: updated.id,
    status: updated.status,
    paymentStatus: updated.paymentStatus
  })
  
  await prisma.$disconnect()
}

fixBookingPaymentStatus().catch(console.error)