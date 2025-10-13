import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPayrollConsistency() {
  console.log('🔧 Fixing payroll consistency...\n')
  
  try {
    // Get all payrolls with their details
    const payrolls = await prisma.instructorPayroll.findMany({
      include: {
        details: true
      }
    })
    
    console.log(`Found ${payrolls.length} payrolls to check`)
    
    for (const payroll of payrolls) {
      const detailSum = payroll.details.reduce((sum, d) => sum + d.amount, 0)
      
      if (detailSum !== payroll.grossAmount) {
        console.log(`\nPayroll ${payroll.id}:`)
        console.log(`   Current gross amount: $${payroll.grossAmount / 100}`)
        console.log(`   Detail sum: $${detailSum / 100}`)
        
        // Update payroll gross amount to match details
        const updated = await prisma.instructorPayroll.update({
          where: { id: payroll.id },
          data: { 
            grossAmount: detailSum,
            // Recalculate net amount
            netAmount: detailSum - payroll.deductions
          }
        })
        
        console.log(`   ✅ Updated gross amount to: $${updated.grossAmount / 100}`)
        console.log(`   ✅ Updated net amount to: $${updated.netAmount / 100}`)
      } else {
        console.log(`✅ Payroll ${payroll.id} is consistent`)
      }
    }
    
    console.log('\n✨ Payroll consistency check completed!')
    
  } catch (error) {
    console.error('❌ Error fixing payroll consistency:', error)
    throw error
  }
}

fixPayrollConsistency()
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