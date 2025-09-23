import { prisma } from '../lib/config/prisma'

async function checkGroupBookingDetails() {
  console.log('🔍 Revisando detalles de la reserva grupal...')
  
  // Get the booking group we created
  const groupBookingId = 'b7580ae3-7c77-48b1-933f-de15ce189633'
  
  const bookingGroup = await prisma.bookingGroup.findUnique({
    where: { id: groupBookingId },
    include: {
      bookings: {
        include: {
          Court: true
        }
      },
      payments: true
    }
  })
  
  if (!bookingGroup) {
    console.log('❌ No se encontró la reserva grupal')
    return
  }
  
  console.log('✅ Reserva grupal encontrada:')
  console.log('   ID:', bookingGroup.id)
  console.log('   Player:', bookingGroup.playerName)
  console.log('   Club ID:', bookingGroup.clubId)
  console.log('   Status:', bookingGroup.status)
  console.log('   Date:', bookingGroup.date)
  console.log('   Start Time:', bookingGroup.startTime)
  console.log('   End Time:', bookingGroup.endTime)
  console.log('   Price:', bookingGroup.price)
  console.log('   Split Payment Enabled:', bookingGroup.splitPaymentEnabled)
  console.log('   Split Payment Count:', bookingGroup.splitPaymentCount)
  
  console.log('\n📋 Bookings individuales en el grupo:')
  bookingGroup.bookings.forEach((booking, i) => {
    console.log(`   ${i + 1}. ID: ${booking.id}`)
    console.log(`      Player: ${booking.playerName}`)
    console.log(`      Court: ${booking.Court?.name}`)
    console.log(`      Status: ${booking.status}`)
    console.log(`      Payment Status: ${booking.paymentStatus}`)
    console.log(`      Checked In: ${booking.checkedIn}`)
    console.log('')
  })
  
  // Now let's test what the check-in endpoint would see
  console.log('🧪 Testing check-in endpoint logic...')
  console.log('   Group booking status:', bookingGroup.status)
  console.log('   Would be considered checked in?', bookingGroup.status === 'CONFIRMED')
  
  // Check if any of the individual bookings are checked in
  const anyCheckedIn = bookingGroup.bookings.some(b => b.checkedIn)
  console.log('   Any individual booking checked in?', anyCheckedIn)
  
  await prisma.$disconnect()
}

checkGroupBookingDetails().catch(console.error)