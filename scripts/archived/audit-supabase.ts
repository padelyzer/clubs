import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 AUDITORÍA COMPLETA DE SUPABASE')
  console.log('================================\n')
  
  try {
    // 1. USUARIOS
    console.log('👥 USUARIOS:')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        clubId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    console.log(`   Total: ${users.length}`)
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name}) [${user.role}] ${user.active ? '✅' : '❌'} Club: ${user.clubId || 'None'}`)
    })
    
    // 2. CLUBES
    console.log('\n🏢 CLUBES:')
    const clubs = await prisma.club.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        email: true,
        city: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    console.log(`   Total: ${clubs.length}`)
    clubs.forEach(club => {
      console.log(`   - ${club.name} (${club.slug}) [${club.status}] ${club.city} - ${club.email}`)
    })
    
    // 3. MÓDULOS SAAS
    console.log('\n🔧 MÓDULOS SAAS:')
    const modules = await prisma.saasModule.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        isActive: true,
        sortOrder: true
      },
      orderBy: { sortOrder: 'asc' }
    })
    console.log(`   Total: ${modules.length}`)
    modules.forEach(mod => {
      console.log(`   - ${mod.code}: ${mod.name} ${mod.isActive ? '✅' : '❌'}`)
      if (mod.description) console.log(`     ${mod.description}`)
    })
    
    // 4. PAQUETES SAAS
    console.log('\n📦 PAQUETES SAAS:')
    const packages = await prisma.saasPackage.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        isActive: true,
        isDefault: true,
        basePrice: true,
        currency: true,
        maxCourts: true,
        maxUsers: true,
        maxBookingsMonth: true
      },
      orderBy: { sortOrder: 'asc' }
    })
    console.log(`   Total: ${packages.length}`)
    packages.forEach(pkg => {
      console.log(`   - ${pkg.displayName} (${pkg.name}) ${pkg.isActive ? '✅' : '❌'} ${pkg.isDefault ? '[DEFAULT]' : ''}`)
      console.log(`     Precio: $${(pkg.basePrice / 100).toFixed(2)} ${pkg.currency}`)
      console.log(`     Límites: Courts:${pkg.maxCourts || '∞'} Users:${pkg.maxUsers || '∞'} Bookings/mes:${pkg.maxBookingsMonth || '∞'}`)
      if (pkg.description) console.log(`     ${pkg.description}`)
    })
    
    // 5. MÓDULOS DE PAQUETES
    console.log('\n🔗 MÓDULOS DE PAQUETES:')
    const packageModules = await prisma.packageModule.findMany({
      include: {
        package: { select: { displayName: true } },
        module: { select: { name: true, code: true } }
      }
    })
    console.log(`   Total: ${packageModules.length}`)
    packageModules.forEach(pm => {
      console.log(`   - ${pm.package.displayName} → ${pm.module.name} (${pm.module.code}) ${pm.isIncluded ? '✅ Incluido' : '❌ No incluido'} ${pm.isOptional ? '[Opcional]' : ''}`)
      if (pm.priceOverride) console.log(`     Precio custom: $${(pm.priceOverride / 100).toFixed(2)}`)
    })
    
    // 6. ASIGNACIONES CLUB-PAQUETE
    console.log('\n🏢📦 ASIGNACIONES CLUB-PAQUETE:')
    const clubPackages = await prisma.clubPackage.findMany({
      include: {
        club: { select: { name: true, slug: true } },
        package: { select: { displayName: true, name: true } }
      }
    })
    console.log(`   Total: ${clubPackages.length}`)
    clubPackages.forEach(cp => {
      console.log(`   - ${cp.club.name} (${cp.club.slug}) → ${cp.package.displayName} ${cp.isActive ? '✅ Activo' : '❌ Inactivo'}`)
      console.log(`     Activado: ${cp.activatedAt}`)
      if (cp.notes) console.log(`     Notas: ${cp.notes}`)
    })
    
    // 7. MÓDULOS DE CLUB (legacy)
    console.log('\n🏢🔧 MÓDULOS DE CLUB (Legacy):')
    const clubModules = await prisma.clubModule.findMany({
      include: {
        club: { select: { name: true, slug: true } },
        module: { select: { name: true, code: true } }
      }
    })
    console.log(`   Total: ${clubModules.length}`)
    clubModules.forEach(cm => {
      console.log(`   - ${cm.club.name} → ${cm.module.name} (${cm.module.code}) ${cm.isActive ? '✅' : '❌'}`)
    })
    
    // 8. TORNEOS
    console.log('\n🏆 TORNEOS:')
    const tournaments = await prisma.tournament?.findMany?.({
      select: {
        id: true,
        name: true,
        status: true,
        type: true,
        maxPlayers: true,
        startDate: true,
        endDate: true,
        Club: { select: { name: true } }
      }
    }).catch(() => []) || []
    console.log(`   Total: ${tournaments.length}`)
    tournaments.forEach(t => {
      console.log(`   - ${t.name} [${t.status}] ${t.type} Max:${t.maxPlayers} ${t.startDate} → ${t.endDate} Club: ${t.Club?.name}`)
    })
    
    // 9. ESTADÍSTICAS GENERALES
    console.log('\n📊 ESTADÍSTICAS:')
    console.log(`   - Usuarios activos: ${users.filter(u => u.active).length}`)
    console.log(`   - Clubes aprobados: ${clubs.filter(c => c.status === 'APPROVED').length}`)
    console.log(`   - Paquetes activos: ${packages.filter(p => p.isActive).length}`)
    console.log(`   - Módulos activos: ${modules.filter(m => m.isActive).length}`)
    console.log(`   - Clubes con paquete: ${clubPackages.filter(cp => cp.isActive).length}`)
    
  } catch (error) {
    console.error('❌ Error en auditoría:', error)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('\n✅ Auditoría completada')
  })
  .catch(async (e) => {
    console.error('💥 Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })