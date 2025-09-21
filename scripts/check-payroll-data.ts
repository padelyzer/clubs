import { prisma } from '../lib/config/prisma'

async function checkPayrollData() {
  console.log('🔍 Checking payroll data...')
  
  try {
    // Check September 2025 data
    const septData = await prisma.payroll.findMany({
      where: { 
        clubId: 'club-basic5-001',
        period: '2025-09'
      }
    })
    
    console.log(`\n📅 September 2025 Records: ${septData.length}`)
    if (septData.length > 0) {
      console.log('Sample records:')
      septData.slice(0, 3).forEach(record => {
        console.log(`  - ${record.employeeName}: ${record.baseSalary} cents (${record.baseSalary/100} dollars) - Status: ${record.status}`)
      })
    }
    
    // Check August 2025 data
    const augData = await prisma.payroll.findMany({
      where: { 
        clubId: 'club-basic5-001',
        period: '2025-08'
      }
    })
    
    console.log(`\n📅 August 2025 Records: ${augData.length}`)
    if (augData.length > 0) {
      console.log('Sample records:')
      augData.slice(0, 3).forEach(record => {
        console.log(`  - ${record.employeeName}: ${record.baseSalary} cents (${record.baseSalary/100} dollars) - Status: ${record.status}`)
      })
    }
    
    // Check all payroll data for the club
    const allData = await prisma.payroll.findMany({
      where: { 
        clubId: 'club-basic5-001'
      },
      orderBy: {
        period: 'desc'
      }
    })
    
    console.log(`\n📊 Total Payroll Records for club-basic5-001: ${allData.length}`)
    
    // Group by period
    const byPeriod = allData.reduce((acc, record) => {
      if (!acc[record.period]) {
        acc[record.period] = []
      }
      acc[record.period].push(record)
      return acc
    }, {} as Record<string, typeof allData>)
    
    console.log('\n📈 Records by Period:')
    Object.entries(byPeriod).forEach(([period, records]) => {
      const total = records.reduce((sum, r) => sum + r.netAmount, 0)
      console.log(`  ${period}: ${records.length} records, Total: $${total/100}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPayrollData().catch(console.error)