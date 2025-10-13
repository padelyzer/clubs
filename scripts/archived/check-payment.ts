import { prisma } from '../lib/config/prisma'

async function main() {
  const bookingId = 'cmeq4owz10007r4bdwhafpzo3'
  
  console.log('Checking payment for booking:', bookingId)
  
  const payment = await prisma.payment.findFirst({
    where: { bookingId },
    orderBy: { createdAt: 'desc' }
  })
  
  console.log('Payment found:', payment)
  
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  })
  
  console.log('Booking payment status:', booking?.paymentStatus)
}

main()
  .then(() => prisma.$disconnect())
  .catch(console.error)