import { PrismaClient } from '@prisma/client'
import { addDays } from 'date-fns'

const prisma = new PrismaClient()

async function addMissingPayrollDetails() {
  console.log('📝 Adding missing payroll details...\n')
  
  try {
    // Get payrolls with no details
    const payrollsWithoutDetails = await prisma.instructorPayroll.findMany({
      where: {
        details: {
          none: {}
        }
      },
      include: {
        instructor: true
      }
    })
    
    console.log(`Found ${payrollsWithoutDetails.length} payrolls without details`)
    
    for (const payroll of payrollsWithoutDetails) {
      console.log(`\nProcessing payroll for instructor: ${payroll.instructor.name}`)
      
      // Get classes for this instructor
      const classes = await prisma.class.findMany({
        where: {
          instructorId: payroll.instructorId,
          date: {
            gte: payroll.periodStart,
            lte: payroll.periodEnd
          }
        },
        take: 5
      })
      
      if (classes.length > 0) {
        // Create details for these classes
        const details = await prisma.payrollDetail.createMany({
          data: classes.map((cls, index) => ({
            payrollId: payroll.id,
            classId: cls.id,
            className: cls.name,
            classDate: cls.date,
            students: 5 + index * 2,
            duration: cls.duration / 60,
            rate: payroll.instructor.hourlyRate || 30000,
            amount: Math.floor((cls.duration / 60) * (payroll.instructor.hourlyRate || 30000))
          }))
        })
        
        console.log(`   ✅ Created ${classes.length} detail entries`)
        
        // Update payroll gross amount to match new details
        const detailSum = await prisma.payrollDetail.aggregate({
          where: { payrollId: payroll.id },
          _sum: { amount: true }
        })
        
        await prisma.instructorPayroll.update({
          where: { id: payroll.id },
          data: {
            grossAmount: detailSum._sum.amount || 0,
            netAmount: (detailSum._sum.amount || 0) - payroll.deductions
          }
        })
        
        console.log(`   ✅ Updated gross amount to: $${(detailSum._sum.amount || 0) / 100}`)
      } else {
        // If no classes found, create sample details
        const sampleDetails = await prisma.payrollDetail.create({
          data: {
            payrollId: payroll.id,
            classId: 'sample_' + payroll.id,
            className: 'Clases del período',
            classDate: payroll.periodStart,
            students: payroll.totalStudents || 10,
            duration: payroll.totalHours || 10,
            rate: payroll.instructor.hourlyRate || 30000,
            amount: payroll.grossAmount || 500000
          }
        })
        
        console.log(`   ✅ Created sample detail entry with amount: $${sampleDetails.amount / 100}`)
        
        // Update payroll to be consistent
        await prisma.instructorPayroll.update({
          where: { id: payroll.id },
          data: {
            grossAmount: sampleDetails.amount,
            netAmount: sampleDetails.amount - payroll.deductions
          }
        })
      }
    }
    
    console.log('\n✨ Missing payroll details added successfully!')
    
  } catch (error) {
    console.error('❌ Error adding payroll details:', error)
    throw error
  }
}

addMissingPayrollDetails()
  .then(() => {
    console.log('\n✅ Process completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })