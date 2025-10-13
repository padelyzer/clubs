import { prisma } from '../lib/config/prisma'

async function enableTournamentsModule() {
  console.log('🏆 Habilitando módulo de torneos...\n')

  // 1. Buscar el club
  const club = await prisma.club.findFirst({
    where: { active: true }
  })

  if (!club) {
    console.error('❌ No se encontró ningún club activo')
    return
  }

  console.log(`✅ Club encontrado: ${club.name} (${club.id})\n`)

  // 2. Buscar el módulo de torneos en SaasModule
  let tournamentsModule = await prisma.saasModule.findFirst({
    where: {
      OR: [
        { code: 'TOURNAMENTS' },
        { code: 'tournaments' },
        { code: 'Tournament' }
      ]
    }
  })

  if (!tournamentsModule) {
    console.log('📦 Módulo de torneos no existe, creando...')
    tournamentsModule = await prisma.saasModule.create({
      data: {
        id: `module_tournaments_${Date.now()}`,
        code: 'TOURNAMENTS',
        name: 'Torneos',
        description: 'Gestión completa de torneos de pádel',
        category: 'CORE',
        status: 'ACTIVE',
        pricing: {
          create: true
        },
        features: [
          'Creación de torneos',
          'Inscripciones online',
          'Generación de brackets',
          'Programación automática',
          'QR check-in',
          'Notificaciones',
          'Rankings'
        ],
        isCore: false,
        requiresSetup: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log(`✅ Módulo creado: ${tournamentsModule.name}\n`)
  } else {
    console.log(`✅ Módulo encontrado: ${tournamentsModule.name} (${tournamentsModule.code})\n`)
  }

  // 3. Verificar si ya está habilitado para el club
  let clubModule = await prisma.clubModule.findUnique({
    where: {
      clubId_moduleId: {
        clubId: club.id,
        moduleId: tournamentsModule.id
      }
    }
  })

  if (clubModule) {
    if (clubModule.isEnabled) {
      console.log('ℹ️  El módulo ya está habilitado para este club')
    } else {
      // Actualizar a habilitado
      clubModule = await prisma.clubModule.update({
        where: { id: clubModule.id },
        data: {
          isEnabled: true,
          enabledAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('✅ Módulo habilitado exitosamente')
    }
  } else {
    // Crear la relación club-módulo
    clubModule = await prisma.clubModule.create({
      data: {
        id: `clubmodule_${Date.now()}`,
        clubId: club.id,
        moduleId: tournamentsModule.id,
        isEnabled: true,
        enabledAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('✅ Módulo habilitado para el club exitosamente')
  }

  console.log('\n📊 Resumen:')
  console.log(`   Club: ${club.name}`)
  console.log(`   Módulo: ${tournamentsModule.name}`)
  console.log(`   Estado: ${clubModule.isEnabled ? 'HABILITADO ✅' : 'DESHABILITADO ❌'}`)
  console.log(`   Habilitado desde: ${clubModule.enabledAt?.toLocaleDateString()}`)

  await prisma.$disconnect()
}

enableTournamentsModule()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
