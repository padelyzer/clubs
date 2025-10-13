import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // First, check if classes module exists
    let classesModule = await prisma.saasModule.findFirst({
      where: { code: 'CLASSES' }
    })

    if (!classesModule) {
      console.log('Creating CLASSES module...')
      classesModule = await prisma.saasModule.create({
        data: {
          code: 'CLASSES',
          name: 'Clases',
          description: 'Gestión de clases grupales de padel',
          isActive: true,
          scalesWithCourts: false,
          sortOrder: 2
        }
      })
      
      // Create pricing tier for classes module
      await prisma.modulePricingTier.create({
        data: {
          moduleId: classesModule.id,
          name: 'Plan Único',
          minCourts: 0,
          maxCourts: null,
          price: 50000, // $500 MXN in cents
          currency: 'MXN',
          isActive: true
        }
      })
      
      console.log('CLASSES module created successfully')
    }

    // Find Club Demo
    const clubDemo = await prisma.club.findFirst({
      where: { 
        OR: [
          { slug: 'club-demo' },
          { name: 'Club Demo Padelyzer' }
        ]
      }
    })

    if (!clubDemo) {
      console.error('Club Demo not found')
      return
    }

    console.log(`Found Club Demo with ID: ${clubDemo.id}`)

    // Check if classes module is already enabled
    const existingModule = await prisma.clubModule.findFirst({
      where: {
        clubId: clubDemo.id,
        moduleId: classesModule.id
      }
    })

    if (existingModule && existingModule.isEnabled) {
      console.log('CLASSES module is already enabled for Club Demo')
      return
    }

    // Enable classes module
    const enabledModule = await prisma.clubModule.upsert({
      where: {
        clubId_moduleId: {
          clubId: clubDemo.id,
          moduleId: classesModule.id
        }
      },
      update: {
        isEnabled: true,
        enabledAt: new Date()
      },
      create: {
        clubId: clubDemo.id,
        moduleId: classesModule.id,
        isEnabled: true,
        enabledAt: new Date()
      }
    })

    console.log('✅ CLASSES module enabled successfully for Club Demo')
    
    // List all enabled modules for the club
    const allModules = await prisma.clubModule.findMany({
      where: {
        clubId: clubDemo.id,
        isEnabled: true
      },
      include: {
        module: true
      }
    })

    console.log('\nEnabled modules for Club Demo:')
    allModules.forEach(m => {
      console.log(`- ${m.module.name} (${m.module.code})`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()