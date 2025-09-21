import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixExpiredPackages() {
  console.log('📦 Fixing expired package statuses...\n')
  
  try {
    const now = new Date()
    
    // Find expired packages that are still marked as active
    const expiredPackages = await prisma.packagePurchase.findMany({
      where: {
        status: 'active',
        expirationDate: { lt: now }
      }
    })
    
    if (expiredPackages.length === 0) {
      console.log('✅ No expired packages found with active status')
      return
    }
    
    console.log(`Found ${expiredPackages.length} expired packages to update:`)
    
    // Update each expired package
    for (const pkg of expiredPackages) {
      await prisma.packagePurchase.update({
        where: { id: pkg.id },
        data: { status: 'expired' }
      })
      
      console.log(`   - Updated package ${pkg.id} (expired on ${pkg.expirationDate?.toLocaleDateString()})`)
    }
    
    // Also check for packages with no remaining classes
    const depleted = await prisma.packagePurchase.findMany({
      where: {
        status: 'active',
        classesRemaining: 0
      }
    })
    
    if (depleted.length > 0) {
      console.log(`\nFound ${depleted.length} depleted packages to update:`)
      
      for (const pkg of depleted) {
        await prisma.packagePurchase.update({
          where: { id: pkg.id },
          data: { status: 'completed' }
        })
        
        console.log(`   - Updated package ${pkg.id} (no classes remaining)`)
      }
    }
    
    console.log('\n✨ Package statuses fixed successfully!')
    
  } catch (error) {
    console.error('❌ Error fixing packages:', error)
    throw error
  }
}

fixExpiredPackages()
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