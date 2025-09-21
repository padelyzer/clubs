import { prisma } from './lib/config/prisma'

async function auditClubConsistency() {
  console.log('🔍 AUDITORÍA COMPLETA DE CONSISTENCIA DE CLUB ID')
  console.log('=' * 60)
  
  // 1. Verificar datos actuales en la base de datos
  console.log('\n📊 1. DATOS ACTUALES EN BASE DE DATOS:')
  
  const clubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      active: true
    }
  })
  
  console.log('\n🏢 Clubes registrados:')
  clubs.forEach(club => {
    console.log(`   • ID: "${club.id}"`)
    console.log(`     Nombre: "${club.name}"`)  
    console.log(`     Slug: "${club.slug}"`)
    console.log(`     Activo: ${club.active}`)
    console.log()
  })
  
  // 2. Verificar usuarios
  console.log('\n👥 2. USUARIOS Y SUS CLUB IDS:')
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      clubId: true,
      role: true,
      Club: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  })
  
  users.forEach(user => {
    const clubExists = user.Club ? '✅' : '❌'
    console.log(`   • ${user.email} (${user.role})`)
    console.log(`     clubId: "${user.clubId}" ${clubExists}`)
    if (user.Club) {
      console.log(`     Club real: "${user.Club.name}" (slug: ${user.Club.slug})`)
    } else {
      console.log(`     ⚠️  PROBLEMA: Club no existe en DB`)
    }
    console.log()
  })
  
  // 3. Verificar datos con referencias
  console.log('\n📋 3. VERIFICACIÓN DE REFERENCIAS:')
  
  // Bookings
  const bookingStats = await prisma.booking.groupBy({
    by: ['clubId'],
    _count: {
      id: true
    }
  })
  
  console.log('\n🎾 Reservas por clubId:')
  for (const stat of bookingStats) {
    const club = clubs.find(c => c.id === stat.clubId)
    const status = club ? '✅' : '❌'
    console.log(`   • clubId: "${stat.clubId}" → ${stat._count.id} reservas ${status}`)
    if (!club) {
      console.log(`     ⚠️  PROBLEMA: Club no existe`)
    }
  }
  
  // Players
  const playerStats = await prisma.player.groupBy({
    by: ['clubId'],
    _count: {
      id: true
    }
  })
  
  console.log('\n👤 Jugadores por clubId:')
  for (const stat of playerStats) {
    const club = clubs.find(c => c.id === stat.clubId)
    const status = club ? '✅' : '❌'
    console.log(`   • clubId: "${stat.clubId}" → ${stat._count.id} jugadores ${status}`)
    if (!club) {
      console.log(`     ⚠️  PROBLEMA: Club no existe`)
    }
  }
  
  // Courts
  const courtStats = await prisma.court.groupBy({
    by: ['clubId'],
    _count: {
      id: true
    }
  })
  
  console.log('\n🎾 Canchas por clubId:')
  for (const stat of courtStats) {
    const club = clubs.find(c => c.id === stat.clubId)
    const status = club ? '✅' : '❌'
    console.log(`   • clubId: "${stat.clubId}" → ${stat._count.id} canchas ${status}`)
    if (!club) {
      console.log(`     ⚠️  PROBLEMA: Club no existe`)
    }
  }
  
  // Transactions
  const transactionStats = await prisma.transaction.groupBy({
    by: ['clubId'],
    _count: {
      id: true
    }
  })
  
  console.log('\n💰 Transacciones por clubId:')
  for (const stat of transactionStats) {
    const club = clubs.find(c => c.id === stat.clubId)
    const status = club ? '✅' : '❌'
    console.log(`   • clubId: "${stat.clubId}" → ${stat._count.id} transacciones ${status}`)
    if (!club) {
      console.log(`     ⚠️  PROBLEMA: Club no existe`)
    }
  }
  
  // 4. Buscar hardcoded references en problema anterior
  console.log('\n🔍 4. PROBLEMAS CONOCIDOS IDENTIFICADOS:')
  console.log('\n📁 Referencias hardcodeadas encontradas anteriormente:')
  console.log('   • check-players-phones.ts: usaba "basic5-club" en lugar de "club-basic5-001"')
  console.log('   • API player search: session.clubId vs database clubId mismatch')
  console.log('   • Calendar: fecha hardcodeada en agosto')
  
  // 5. Resumen de inconsistencias
  console.log('\n🎯 5. RESUMEN DE INCONSISTENCIAS ENCONTRADAS:')
  
  let issues = []
  
  // Check orphaned records
  const orphanedUsers = users.filter(u => !u.Club)
  if (orphanedUsers.length > 0) {
    issues.push(`❌ ${orphanedUsers.length} usuarios con clubId inválido`)
  }
  
  const validClubIds = clubs.map(c => c.id)
  
  for (const stat of bookingStats) {
    if (!validClubIds.includes(stat.clubId)) {
      issues.push(`❌ Reservas con clubId inválido: "${stat.clubId}"`)
    }
  }
  
  for (const stat of playerStats) {
    if (!validClubIds.includes(stat.clubId)) {
      issues.push(`❌ Jugadores con clubId inválido: "${stat.clubId}"`)
    }
  }
  
  for (const stat of courtStats) {
    if (!validClubIds.includes(stat.clubId)) {
      issues.push(`❌ Canchas con clubId inválido: "${stat.clubId}"`)
    }
  }
  
  for (const stat of transactionStats) {
    if (!validClubIds.includes(stat.clubId)) {
      issues.push(`❌ Transacciones con clubId inválido: "${stat.clubId}"`)
    }
  }
  
  if (issues.length === 0) {
    console.log('   ✅ No se encontraron inconsistencias en la base de datos')
  } else {
    issues.forEach(issue => console.log(`   ${issue}`))
  }
  
  console.log('\n📝 6. RECOMENDACIONES:')
  console.log('   1. Verificar que todas las referencias hardcodeadas usen IDs correctos')
  console.log('   2. Implementar validación de clubId en todas las APIs')
  console.log('   3. Crear constantes para clubIds en lugar de strings hardcodeados')
  console.log('   4. Agregar tests de integridad referencial')
  
  console.log('\n✅ Auditoría completada')
}

auditClubConsistency().catch(console.error).finally(() => process.exit())