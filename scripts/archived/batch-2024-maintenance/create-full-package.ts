import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📦 Creating "Todo Incluido" package...')
  
  try {
    // Check if package already exists
    const existingPackage = await prisma.saasPackage.findUnique({
      where: { name: 'todo-incluido' }
    })
    
    if (existingPackage) {
      console.log('✅ Package already exists:', existingPackage.displayName)
      
      // Check if club is already assigned
      const clubPackage = await prisma.clubPackage.findUnique({
        where: { clubId: 'club-padel-puebla-001' }
      })
      
      if (clubPackage) {
        console.log('✅ Club already has package assigned')
        return
      } else {
        console.log('🔄 Assigning existing package to club...')
        await prisma.clubPackage.create({
          data: {
            clubId: 'club-padel-puebla-001',
            packageId: existingPackage.id,
            activatedAt: new Date(),
            notes: 'Auto-assigned for demo club'
          }
        })
        console.log('✅ Package assigned to club successfully!')
        return
      }
    }
    
    // Get all available modules
    const modules = await prisma.saasModule.findMany({
      where: { isActive: true }
    })
    
    console.log(`📋 Found ${modules.length} active modules`)
    
    // Create the package
    const fullPackage = await prisma.saasPackage.create({
      data: {
        id: 'pkg-todo-incluido-001',
        name: 'todo-incluido',
        displayName: 'Todo Incluido',
        description: 'Paquete completo con todos los módulos incluidos para máxima funcionalidad',
        basePrice: 99900, // $999 MXN
        currency: 'MXN',
        isDefault: true,
        maxCourts: null,      // Unlimited courts
        maxUsers: null,       // Unlimited users  
        maxBookingsMonth: null, // Unlimited bookings
        isActive: true
      }
    })
    
    console.log('✅ Package created:', fullPackage.displayName)
    
    // Add all modules to the package as included
    const packageModules = await Promise.all(
      modules.map(module => 
        prisma.packageModule.create({
          data: {
            packageId: fullPackage.id,
            moduleId: module.id,
            isIncluded: true,
            isOptional: false,
            priceOverride: null
          }
        })
      )
    )
    
    console.log(`✅ Added ${packageModules.length} modules to package`)
    
    // Assign package to demo club
    await prisma.clubPackage.create({
      data: {
        clubId: 'club-padel-puebla-001',
        packageId: fullPackage.id,
        activatedAt: new Date(),
        notes: 'Auto-assigned for demo club - includes all modules'
      }
    })
    
    console.log('✅ Package assigned to Club Padel Puebla successfully!')
    
    // Verify assignment
    const verification = await prisma.clubPackage.findUnique({
      where: { clubId: 'club-padel-puebla-001' },
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
      console.log('🎯 Verification successful:')
      console.log(`   📦 Package: ${verification.package.displayName}`)
      console.log(`   🏢 Club: club-padel-puebla-001`)
      console.log(`   📅 Activated: ${verification.activatedAt}`)
      console.log(`   🔧 Modules: ${verification.package.modules.length}`)
      
      const includedModules = verification.package.modules
        .filter(pm => pm.isIncluded)
        .map(pm => pm.module.name)
      console.log(`   ✅ Included: ${includedModules.join(', ')}`)
    }
    
  } catch (error) {
    console.error('❌ Error creating package:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('🎉 Package creation and assignment completed!')
  })
  .catch(async (e) => {
    console.error('💥 Failed to create package:', e)
    await prisma.$disconnect()
    process.exit(1)
  })