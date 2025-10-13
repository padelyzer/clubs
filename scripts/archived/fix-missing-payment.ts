import { prisma } from '../lib/config/prisma'

async function fixMissingPaymentRecord() {
  const bookingId = 'cmejccxfa0001r4wwwtzbjio3'
  
  try {
    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Payment: true,
        Club: true
      }
    })
    
    if (!booking) {
      console.error('Booking not found')
      return
    }
    
    console.log('Found booking:', {
      id: booking.id,
      playerName: booking.playerName,
      price: booking.price,
      paymentCount: booking.Payment.length
    })

    // Check if payment record exists
    if (booking.Payment.length === 0) {
      console.log('No payment record found, creating one...')
      
      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.price,
          currency: 'MXN',
          method: 'STRIPE',
          status: 'pending'
        }
      })
      
      console.log('Payment record created:', payment.id)
    } else {
      console.log('Payment record already exists:', booking.Payment[0].id)

      // Check if status needs update
      if (booking.Payment[0].status !== 'pending') {
        await prisma.payment.update({
          where: { id: booking.Payment[0].id },
          data: { status: 'pending' }
        })
        console.log('Payment status updated to pending')
      }
    }
    
    // Also ensure booking has correct payment status
    if (booking.paymentStatus !== 'pending') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: 'pending' }
      })
      console.log('Booking payment status updated to pending')
    }
    
    console.log('✅ Fix completed successfully')
    console.log(`You can now access the payment page at: http://localhost:3002/pay/${bookingId}`)
    
  } catch (error) {
    console.error('Error fixing payment record:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixMissingPaymentRecord()