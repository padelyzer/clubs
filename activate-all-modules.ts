import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function activateAllModules() {
  try {
    console.log('🚀 Activando todos los módulos para el Club Demo Padelyzer...\n')

    // Primero, asegurar que los módulos base existan
    console.log('1️⃣ Verificando módulos base...')

    const modules = [
      {
        code: 'bookings',
        name: 'Sistema de Reservas',
        description: 'Gestión completa de reservas de canchas',
        scalesWithCourts: true,
        sortOrder: 1
      },
      {
        code: 'customers',
        name: 'Registro de Clientes',
        description: 'Base de datos de clientes y jugadores',
        scalesWithCourts: true,
        sortOrder: 2
      },
      {
        code: 'tournaments',
        name: 'Torneos',
        description: 'Organización y gestión de torneos',
        scalesWithCourts: true,
        sortOrder: 3
      },
      {
        code: 'classes',
        name: 'Clases',
        description: 'Gestión de clases y entrenamientos',
        scalesWithCourts: true,
        sortOrder: 4
      },
      {
        code: 'finance',
        name: 'Finanzas',
        description: 'Reportes financieros y contabilidad',
        scalesWithCourts: false,
        sortOrder: 5
      }
    ]

    // Crear o verificar módulos
    for (const moduleData of modules) {
      const existingModule = await prisma.saasModule.findUnique({
        where: { code: moduleData.code }
      })

      if (!existingModule) {
        await prisma.saasModule.create({
          data: moduleData
        })
        console.log(`   ✅ Módulo creado: ${moduleData.name}`)
      } else {
        console.log(`   ✓ Módulo ya existe: ${moduleData.name}`)
      }
    }

    // Buscar el club Demo
    console.log('\n2️⃣ Buscando Club Demo Padelyzer...')
    const club = await prisma.club.findFirst({
      where: {
        OR: [
          { id: 'club-demo-001' },
          { name: 'Club Demo Padelyzer' }
        ]
      },
      include: {
        Court: true
      }
    })

    if (!club) {
      console.error('❌ No se encontró el Club Demo Padelyzer')
      return
    }

    console.log(`   ✓ Club encontrado: ${club.name} (${club.Court.length} canchas)`)

    // Activar todos los módulos para el club
    console.log('\n3️⃣ Activando módulos para el club...')
    const allModules = await prisma.saasModule.findMany()

    for (const module of allModules) {
      // Verificar si ya está activo
      const existingActivation = await prisma.clubModuleAccess.findUnique({
        where: {
          clubId_moduleId: {
            clubId: club.id,
            moduleId: module.id
          }
        }
      })

      if (!existingActivation) {
        // Activar módulo
        await prisma.clubModuleAccess.create({
          data: {
            clubId: club.id,
            moduleId: module.id,
            isEnabled: true,
            activatedAt: new Date(),
            expiresAt: null // Sin expiración
          }
        })
        console.log(`   ✅ Módulo activado: ${module.name}`)
      } else if (!existingActivation.isEnabled) {
        // Reactivar si está deshabilitado
        await prisma.clubModuleAccess.update({
          where: {
            clubId_moduleId: {
              clubId: club.id,
              moduleId: module.id
            }
          },
          data: {
            isEnabled: true,
            activatedAt: new Date(),
            expiresAt: null
          }
        })
        console.log(`   ✅ Módulo reactivado: ${module.name}`)
      } else {
        console.log(`   ✓ Módulo ya activo: ${module.name}`)
      }
    }

    // Verificar el paquete del club
    console.log('\n4️⃣ Configurando paquete Premium para el club...')

    // Buscar o crear el paquete Premium
    let premiumPackage = await prisma.saasPackage.findFirst({
      where: { code: 'premium' }
    })

    if (!premiumPackage) {
      premiumPackage = await prisma.saasPackage.create({
        data: {
          code: 'premium',
          name: 'Premium',
          description: 'Acceso completo a todos los módulos',
          monthlyPrice: 0, // Gratis para demo
          features: [
            'Todos los módulos incluidos',
            'Sin límite de canchas',
            'Soporte prioritario',
            'Acceso a nuevas funcionalidades'
          ],
          maxCourts: null,
          maxBookingsPerMonth: null,
          maxUsers: null,
          isActive: true,
          sortOrder: 1
        }
      })
      console.log('   ✅ Paquete Premium creado')
    }

    // Asignar paquete al club
    await prisma.club.update({
      where: { id: club.id },
      data: {
        packageId: premiumPackage.id,
        packageExpiresAt: null // Sin expiración
      }
    })
    console.log('   ✅ Paquete Premium asignado al club')

    // Resumen final
    console.log('\n' + '='.repeat(50))
    console.log('✅ ACTIVACIÓN COMPLETADA')
    console.log('='.repeat(50))
    console.log(`Club: ${club.name}`)
    console.log(`Paquete: Premium (todos los módulos)`)
    console.log(`Módulos activados: ${allModules.length}`)
    console.log('\nMódulos disponibles:')
    for (const module of allModules) {
      console.log(`  • ${module.name}`)
    }
    console.log('\n🎉 El usuario demo@padelyzer.com ahora tiene acceso completo!')

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
    await prisma.$disconnect()
  }
}

activateAllModules()