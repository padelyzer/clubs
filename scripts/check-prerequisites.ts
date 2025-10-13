import { prisma } from '../lib/config/prisma'

async function checkPrerequisites() {
  console.log('🔍 Verificando prerequisitos del módulo de torneos...\n')

  // 1. Verificar clubs
  const clubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      active: true,
      status: true
    }
  })

  console.log(`1️⃣ CLUBS ENCONTRADOS: ${clubs.length}`)
  clubs.forEach(c => {
    console.log(`   - ${c.name} (${c.slug})`)
    console.log(`     Active: ${c.active}, Status: ${c.status}`)
  })

  if (clubs.length === 0) {
    console.log('   ❌ NO HAY CLUBS - Necesitamos crear uno\n')
    await prisma.$disconnect()
    return { needsClub: true }
  }
  console.log('')

  // 2. Verificar módulos del club
  const clubId = clubs[0].id
  const clubModules = await prisma.clubModule.findMany({
    where: { clubId },
    include: {
      module: {
        select: {
          code: true,
          name: true
        }
      }
    }
  })

  console.log(`2️⃣ MÓDULOS DEL CLUB "${clubs[0].name}": ${clubModules.length}`)
  if (clubModules.length === 0) {
    console.log('   ℹ️  No hay módulos configurados')
  } else {
    clubModules.forEach(m => {
      const status = m.isEnabled ? '✅' : '❌'
      console.log(`   ${status} ${m.module.name} (${m.module.code}): enabled=${m.isEnabled}`)
    })
  }

  const tournamentsModule = clubModules.find(m =>
    m.module.code.toLowerCase() === 'tournaments' ||
    m.module.code.toLowerCase() === 'tournament'
  )

  if (tournamentsModule) {
    const status = tournamentsModule.isEnabled ? '✅ HABILITADO' : '❌ DESHABILITADO'
    console.log(`\n   Módulo de torneos: ${status}`)
    if (tournamentsModule.enabledAt) {
      console.log(`   Habilitado desde: ${tournamentsModule.enabledAt.toLocaleDateString()}`)
    }
  } else {
    console.log(`\n   ❌ Módulo de torneos NO ENCONTRADO`)
    console.log(`   Necesitamos crear el módulo para el club`)
  }
  console.log('')

  // 3. Verificar usuarios
  const users = await prisma.user.findMany({
    where: {
      clubId
    },
    select: {
      id: true,
      email: true,
      name: true,
      clubId: true,
      role: true,
      active: true
    },
    take: 5
  })

  console.log(`3️⃣ USUARIOS DEL CLUB: ${users.length}`)
  if (users.length === 0) {
    console.log('   ❌ NO HAY USUARIOS para este club')
  } else {
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.name})`)
      console.log(`     Role: ${u.role}, Active: ${u.active}`)
    })
  }
  console.log('')

  // 4. Verificar sesiones activas
  const sessions = await prisma.session.findMany({
    where: {
      user: {
        clubId
      }
    },
    include: {
      user: {
        select: {
          email: true
        }
      }
    },
    take: 5
  })

  console.log(`4️⃣ SESIONES ACTIVAS: ${sessions.length}`)
  sessions.forEach(s => {
    const expired = new Date(s.expiresAt) < new Date()
    const status = expired ? '❌ Expirada' : '✅ Válida'
    console.log(`   ${status} - ${s.user.email}`)
    console.log(`     Session ID: ${s.id}`)
    console.log(`     Expira: ${s.expiresAt.toLocaleString()}`)
  })
  console.log('')

  // Resumen
  console.log('📊 RESUMEN:')
  console.log(`   Clubs: ${clubs.length > 0 ? '✅' : '❌'}`)
  console.log(`   Módulo Torneos: ${tournamentsModule?.enabled ? '✅' : '❌'}`)
  console.log(`   Usuarios: ${users.length > 0 ? '✅' : '❌'}`)
  console.log(`   Sesiones: ${sessions.length > 0 ? '✅' : '❌'}`)

  await prisma.$disconnect()

  return {
    hasClub: clubs.length > 0,
    club: clubs[0],
    hasTournamentsModule: !!tournamentsModule,
    tournamentsEnabled: tournamentsModule?.isEnabled || false,
    hasUsers: users.length > 0,
    hasSessions: sessions.length > 0
  }
}

checkPrerequisites()
  .then((result) => {
    if (!result.hasClub) {
      console.log('\n⚠️  ACCIÓN REQUERIDA: Crear un club')
    } else if (!result.hasTournamentsModule || !result.tournamentsEnabled) {
      console.log('\n⚠️  ACCIÓN REQUERIDA: Habilitar módulo de torneos')
    } else if (!result.hasUsers) {
      console.log('\n⚠️  ACCIÓN REQUERIDA: Crear usuario para el club')
    } else if (!result.hasSessions) {
      console.log('\n⚠️  ACCIÓN REQUERIDA: Crear sesión de desarrollo')
    } else {
      console.log('\n✅ TODOS LOS PREREQUISITOS CUMPLIDOS')
    }
    process.exit(0)
  })
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
