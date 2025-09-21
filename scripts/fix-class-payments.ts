import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixClassPayments() {
  try {
    // Fix the unpaid group class
    const classId = 'cmelzhl680005r4x9nl8aiedv' // The unpaid group class
    
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        bookings: true
      }
    })
    
    if (!cls) {
      console.log('Class not found')
      return
    }
    
    console.log(`\nFixing class: ${cls.name}`)
    console.log(`Total price: $${(cls.price / 100).toFixed(2)}`)
    console.log(`Students: ${cls.bookings.length}`)
    
    // Calculate correct price per student
    const pricePerStudent = Math.round(cls.price / cls.bookings.length)
    console.log(`Price per student should be: $${(pricePerStudent / 100).toFixed(2)}`)
    
    // Update all bookings to have the correct dueAmount
    for (const booking of cls.bookings) {
      await prisma.classBooking.update({
        where: { id: booking.id },
        data: {
          dueAmount: pricePerStudent
        }
      })
      console.log(`✅ Updated ${booking.studentName}: dueAmount = $${(pricePerStudent / 100).toFixed(2)}`)
    }
    
    console.log('\n✨ All students updated successfully!')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixClassPayments()