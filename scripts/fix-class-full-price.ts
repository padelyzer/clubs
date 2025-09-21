import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixClassFullPrice() {
  try {
    // Get all classes for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const classes = await prisma.class.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        bookings: true
      }
    })
    
    console.log(`\nFixing class prices for ${classes.length} classes...`)
    
    for (const cls of classes) {
      console.log(`\n📚 Class: ${cls.name}`)
      console.log(`   Total price: $${(cls.price / 100).toFixed(2)}`)
      console.log(`   Students: ${cls.bookings.length}`)
      
      // Each student should pay the full class price
      const fullPrice = cls.price
      console.log(`   Each student should pay: $${(fullPrice / 100).toFixed(2)}`)
      
      // Update all bookings to have the correct dueAmount
      for (const booking of cls.bookings) {
        if (booking.paymentStatus === 'pending') {
          await prisma.classBooking.update({
            where: { id: booking.id },
            data: {
              dueAmount: fullPrice
            }
          })
          console.log(`   ✅ Updated ${booking.studentName}: dueAmount = $${(fullPrice / 100).toFixed(2)}`)
        } else {
          console.log(`   ⏭️  Skipped ${booking.studentName} (already paid)`)
        }
      }
    }
    
    console.log('\n✨ All classes updated successfully!')
    console.log('Each student now has the full class price as their due amount.')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixClassFullPrice()