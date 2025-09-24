import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Encontrar el Club Demo Padelyzer
    const clubDemo = await prisma.club.findFirst({
      where: {
        slug: 'club-demo-padelyzer'
      }
    })

    if (!clubDemo) {
      console.error('❌ Club Demo Padelyzer no encontrado')
      return
    }

    console.log(`✅ Club Demo Padelyzer encontrado: ${clubDemo.id}`)

    // Crear o encontrar módulo de TORNEOS
    let tournamentsModule = await prisma.saasModule.findFirst({
      where: { code: 'TOURNAMENTS' }
    })

    if (!tournamentsModule) {
      console.log('Creando módulo TOURNAMENTS...')
      tournamentsModule = await prisma.saasModule.create({
        data: {
          code: 'TOURNAMENTS',
          name: 'Torneos',
          description: 'Gestión de torneos de pádel',
          isActive: true,
          scalesWithCourts: false,
          sortOrder: 3
        }
      })

      // Crear pricing tier para torneos
      await prisma.modulePricingTier.create({
        data: {
          moduleId: tournamentsModule.id,
          name: 'Plan Único',
          minCourts: 0,
          maxCourts: null,
          price: 100000, // $1000 MXN en centavos
          currency: 'MXN',
          isActive: true
        }
      })
    }

    // Crear o encontrar módulo de CLASES
    let classesModule = await prisma.saasModule.findFirst({
      where: { code: 'CLASSES' }
    })

    if (!classesModule) {
      console.log('Creando módulo CLASSES...')
      classesModule = await prisma.saasModule.create({
        data: {
          code: 'CLASSES',
          name: 'Clases',
          description: 'Gestión de clases grupales de pádel',
          isActive: true,
          scalesWithCourts: false,
          sortOrder: 2
        }
      })

      // Crear pricing tier para clases
      await prisma.modulePricingTier.create({
        data: {
          moduleId: classesModule.id,
          name: 'Plan Único',
          minCourts: 0,
          maxCourts: null,
          price: 50000, // $500 MXN en centavos
          currency: 'MXN',
          isActive: true
        }
      })
    }

    // Activar módulo de TORNEOS
    const tournamentsModuleEnabled = await prisma.clubModule.upsert({
      where: {
        clubId_moduleId: {
          clubId: clubDemo.id,
          moduleId: tournamentsModule.id
        }
      },
      update: {
        isEnabled: true,
        enabledAt: new Date()
      },
      create: {
        clubId: clubDemo.id,
        moduleId: tournamentsModule.id,
        isEnabled: true,
        enabledAt: new Date()
      }
    })

    console.log('✅ Módulo TORNEOS activado para Club Demo Padelyzer')

    // Activar módulo de CLASES
    const classesModuleEnabled = await prisma.clubModule.upsert({
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

    console.log('✅ Módulo CLASES activado para Club Demo Padelyzer')

    // Listar todos los módulos habilitados para el club
    const allModules = await prisma.clubModule.findMany({
      where: {
        clubId: clubDemo.id,
        isEnabled: true
      },
      include: {
        module: true
      }
    })

    console.log('\n📋 Módulos habilitados para Club Demo Padelyzer:')
    allModules.forEach(m => {
      console.log(`   - ${m.module.name} (${m.module.code})`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()