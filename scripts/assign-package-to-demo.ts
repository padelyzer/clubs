import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔗 Assigning package to demo club...')
  
  try {
    // Get the club and package
    const club = await prisma.club.findUnique({
      where: { slug: 'club-demo-padelyzer' }
    })
    
    const pkg = await prisma.saasPackage.findUnique({
      where: { name: 'todo-incluido' }
    })
    
    if (!club) {
      console.error('❌ Club not found: club-demo-padelyzer')
      return
    }
    
    if (!pkg) {
      console.error('❌ Package not found: todo-incluido')
      return
    }
    
    console.log(`📍 Found club: ${club.name} (${club.id})`)
    console.log(`📦 Found package: ${pkg.displayName} (${pkg.id})`)
    
    // Check if already assigned
    const existing = await prisma.clubPackage.findUnique({
      where: { clubId: club.id }
    })
    
    if (existing) {
      console.log('✅ Package already assigned to club')
      return
    }
    
    // Assign package
    await prisma.clubPackage.create({
      data: {
        clubId: club.id,
        packageId: pkg.id,
        activatedAt: new Date(),
        notes: 'Auto-assigned Todo Incluido package for demo club'
      }
    })
    
    console.log('✅ Package assigned successfully!')
    
    // Verify
    const verification = await prisma.clubPackage.findUnique({
      where: { clubId: club.id },
      include: {
        package: {
          include: {
            modules: {
              include: {
                module: true
              }
            }
          }
        }
      }
    })
    
    if (verification) {
      console.log('🎯 Verification:')
      console.log(`   📦 Package: ${verification.package.displayName}`)
      console.log(`   🔧 Modules: ${verification.package.modules.length}`)
      
      const includedModules = verification.package.modules
        .filter(pm => pm.isIncluded)
        .map(pm => pm.module.name)
      console.log(`   ✅ Included: ${includedModules.join(', ')}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('🎉 Done!')
  })
  .catch(async (e) => {
    console.error('💥 Failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })