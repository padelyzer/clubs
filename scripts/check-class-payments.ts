import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkClassPayments() {
  try {
    // Find today's classes
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
        bookings: {
          select: {
            id: true,
            studentName: true,
            paymentStatus: true,
            paidAmount: true,
            dueAmount: true,
            attended: true,
            attendanceStatus: true
          }
        }
      }
    })
    
    console.log(`\n📅 Classes for today (${today.toLocaleDateString()}):\n`)
    console.log(`Found ${classes.length} class(es)\n`)
    
    for (const cls of classes) {
      console.log('━'.repeat(60))
      console.log(`📚 Class: ${cls.name}`)
      console.log(`   ID: ${cls.id}`)
      console.log(`   Time: ${cls.startTime} - ${cls.endTime}`)
      console.log(`   Total Price: $${(cls.price / 100).toFixed(2)} MXN`)
      console.log(`   Students: ${cls.bookings.length}`)
      console.log()
      
      if (cls.bookings.length > 0) {
        const pricePerStudent = Math.round(cls.price / cls.bookings.length)
        console.log(`   Price per student: $${(pricePerStudent / 100).toFixed(2)} MXN`)
        console.log()
        
        cls.bookings.forEach((booking, idx) => {
          console.log(`   ${idx + 1}. ${booking.studentName}`)
          console.log(`      Payment Status: ${booking.paymentStatus}`)
          console.log(`      Paid Amount: $${((booking.paidAmount || 0) / 100).toFixed(2)}`)
          console.log(`      Due Amount: $${((booking.dueAmount || 0) / 100).toFixed(2)}`)
          console.log(`      Attended: ${booking.attended ? '✅' : '❌'}`)
          if (booking.attendanceStatus) {
            console.log(`      Attendance Status: ${booking.attendanceStatus}`)
          }
          console.log()
        })
        
        // Summary
        const paidCount = cls.bookings.filter(b => b.paymentStatus === 'completed').length
        const attendedCount = cls.bookings.filter(b => b.attended).length
        
        console.log(`   📊 Summary:`)
        console.log(`      Paid: ${paidCount}/${cls.bookings.length}`)
        console.log(`      Attended: ${attendedCount}/${cls.bookings.length}`)
      }
    }
    
    console.log('━'.repeat(60))
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkClassPayments()