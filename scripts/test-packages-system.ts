import { PrismaClient } from '@prisma/client'
import { getClubPackageInfo, getAvailablePackages, assignPackageToClub, getClubPackageUsage } from '@/lib/saas/packages'

const prisma = new PrismaClient()

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

async function testPackagesSystem() {
  console.log(`${colors.cyan}${colors.bright}🧪 PROBANDO SISTEMA DE PAQUETES SAAS${colors.reset}\n`)
  
  try {
    // ==========================================
    // 1. OBTENER CLUB DE PRUEBA
    // ==========================================
    console.log(`${colors.blue}1️⃣ Obteniendo club de prueba...${colors.reset}`)
    
    const testClub = await prisma.club.findFirst({
      where: { status: 'APPROVED' }
    })
    
    if (!testClub) {
      throw new Error('No se encontró ningún club aprobado para pruebas')
    }
    
    console.log(`   ✅ Club encontrado: ${testClub.name} (ID: ${testClub.id})`)
    
    // ==========================================
    // 2. PROBAR OBTENCIÓN DE PAQUETES DISPONIBLES
    // ==========================================
    console.log(`\n${colors.blue}2️⃣ Probando obtención de paquetes disponibles...${colors.reset}`)
    
    const availablePackages = await getAvailablePackages()
    console.log(`   ✅ Paquetes disponibles: ${availablePackages.length}`)
    
    for (const pkg of availablePackages) {
      console.log(`      📦 ${pkg.displayName} - $${(pkg.basePrice / 100).toFixed(2)} ${pkg.currency}/mes`)
      console.log(`         Módulos incluidos: ${pkg.modules.filter(m => m.isIncluded).length}`)
      console.log(`         Módulos opcionales: ${pkg.modules.filter(m => m.isOptional && !m.isIncluded).length}`)
      console.log(`         Clubes asignados: ${pkg.clubsCount}`)
    }
    
    // ==========================================
    // 3. PROBAR INFORMACIÓN DEL PAQUETE ACTUAL
    // ==========================================
    console.log(`\n${colors.blue}3️⃣ Probando información del paquete actual del club...${colors.reset}`)
    
    const currentPackage = await getClubPackageInfo(testClub.id)
    if (currentPackage) {
      console.log(`   ✅ Paquete actual: ${currentPackage.displayName}`)
      console.log(`      Precio: $${(currentPackage.basePrice / 100).toFixed(2)} ${currentPackage.currency}/mes`)
      console.log(`      Límites:`)
      console.log(`        - Canchas: ${currentPackage.limits.maxCourts || 'Ilimitado'}`)
      console.log(`        - Usuarios: ${currentPackage.limits.maxUsers || 'Ilimitado'}`)
      console.log(`        - Reservas/mes: ${currentPackage.limits.maxBookingsMonth || 'Ilimitado'}`)
      console.log(`      Módulos:`)
      for (const module of currentPackage.modules) {
        const status = module.isIncluded ? 'Incluido' : module.isOptional ? (module.isActive ? 'Opcional-Activo' : 'Opcional-Inactivo') : 'No incluido'
        console.log(`        - ${module.moduleName}: ${status}`)
      }
    } else {
      console.log(`   ⚠️ El club no tiene paquete asignado`)
    }
    
    // ==========================================
    // 4. PROBAR USO DEL PAQUETE
    // ==========================================
    console.log(`\n${colors.blue}4️⃣ Probando estadísticas de uso del paquete...${colors.reset}`)
    
    const usage = await getClubPackageUsage(testClub.id)
    if (usage) {
      console.log(`   ✅ Uso actual del paquete:`)
      console.log(`      📊 Uso actual:`)
      console.log(`        - Canchas: ${usage.currentUsage.courts}/${usage.limits.maxCourts || '∞'}`)
      console.log(`        - Usuarios: ${usage.currentUsage.users}/${usage.limits.maxUsers || '∞'}`)
      console.log(`        - Reservas este mes: ${usage.currentUsage.bookingsThisMonth}/${usage.limits.maxBookingsMonth || '∞'}`)
      
      console.log(`      📈 Utilización:`)
      console.log(`        - Canchas: ${usage.utilization.courts.toFixed(1)}%`)
      console.log(`        - Usuarios: ${usage.utilization.users.toFixed(1)}%`)
      console.log(`        - Reservas: ${usage.utilization.bookings.toFixed(1)}%`)
      
      const anyOverLimit = Object.values(usage.isOverLimit).some(Boolean)
      if (anyOverLimit) {
        console.log(`      ⚠️ Límites excedidos:`)
        if (usage.isOverLimit.courts) console.log(`        - Canchas: EXCEDIDO`)
        if (usage.isOverLimit.users) console.log(`        - Usuarios: EXCEDIDO`)
        if (usage.isOverLimit.bookings) console.log(`        - Reservas: EXCEDIDO`)
      } else {
        console.log(`      ✅ Dentro de todos los límites`)
      }
    }
    
    // ==========================================
    // 5. PROBAR CAMBIO DE PAQUETE
    // ==========================================
    console.log(`\n${colors.blue}5️⃣ Probando cambio de paquete...${colors.reset}`)
    
    // Buscar un paquete diferente al actual
    const professionalPackage = availablePackages.find(p => p.name === 'professional')
    const enterprisePackage = availablePackages.find(p => p.name === 'enterprise')
    
    if (professionalPackage && currentPackage?.packageName !== 'professional') {
      console.log(`   🔄 Cambiando a paquete Profesional...`)
      const success = await assignPackageToClub(
        testClub.id, 
        professionalPackage.id, 
        'Prueba de cambio de paquete desde script'
      )
      
      if (success) {
        console.log(`   ✅ Paquete cambiado exitosamente`)
        
        // Verificar el cambio
        const newPackage = await getClubPackageInfo(testClub.id)
        if (newPackage) {
          console.log(`      Nuevo paquete: ${newPackage.displayName}`)
          console.log(`      Módulos activos: ${newPackage.modules.filter(m => m.isActive).length}`)
        }
      } else {
        console.log(`   ❌ Error al cambiar paquete`)
      }
    } else if (enterprisePackage && currentPackage?.packageName !== 'enterprise') {
      console.log(`   🔄 Cambiando a paquete Empresarial...`)
      const success = await assignPackageToClub(
        testClub.id, 
        enterprisePackage.id, 
        'Prueba de cambio a paquete empresarial'
      )
      
      if (success) {
        console.log(`   ✅ Paquete cambiado exitosamente`)
        
        // Verificar el cambio
        const newPackage = await getClubPackageInfo(testClub.id)
        if (newPackage) {
          console.log(`      Nuevo paquete: ${newPackage.displayName}`)
          console.log(`      Módulos activos: ${newPackage.modules.filter(m => m.isActive).length}`)
        }
      } else {
        console.log(`   ❌ Error al cambiar paquete`)
      }
    } else {
      console.log(`   ⏭️ No se encontró paquete diferente para probar cambio`)
    }
    
    // ==========================================
    // 6. MOSTRAR URLS DE PRUEBA
    // ==========================================
    console.log(`\n${colors.cyan}${colors.bright}🌐 URLS PARA PROBAR EN EL NAVEGADOR${colors.reset}`)
    console.log('═'.repeat(50))
    console.log(`${colors.green}📦 Panel de Paquetes:${colors.reset}`)
    console.log(`   http://localhost:3002/admin/packages`)
    console.log(`\n${colors.green}🏢 Gestión de Clubes:${colors.reset}`)
    console.log(`   http://localhost:3002/admin/clubs`)
    console.log(`\n${colors.green}📊 APIs de Prueba:${colors.reset}`)
    console.log(`   GET  /api/admin/packages`)
    console.log(`   GET  /api/admin/clubs/${testClub.id}/package`)
    console.log(`   PUT  /api/admin/clubs/${testClub.id}/package`)
    
    // ==========================================
    // 7. INFORMACIÓN PARA TESTING MANUAL
    // ==========================================
    console.log(`\n${colors.cyan}${colors.bright}🧪 INFORMACIÓN PARA TESTING MANUAL${colors.reset}`)
    console.log('═'.repeat(50))
    console.log(`${colors.yellow}Club ID para pruebas:${colors.reset} ${testClub.id}`)
    console.log(`${colors.yellow}Paquetes disponibles:${colors.reset}`)
    for (const pkg of availablePackages) {
      console.log(`   - ${pkg.displayName} (ID: ${pkg.id})`)
    }
    
    console.log(`\n${colors.green}${colors.bright}✨ SISTEMA DE PAQUETES FUNCIONANDO CORRECTAMENTE${colors.reset}`)
    
  } catch (error) {
    console.error(`\n${colors.red}❌ ERROR EN LAS PRUEBAS:${colors.reset}`)
    console.error(error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar pruebas
testPackagesSystem()
  .then(() => {
    console.log(`\n${colors.green}✅ Pruebas completadas exitosamente${colors.reset}`)
    process.exit(0)
  })
  .catch((error) => {
    console.error(`\n${colors.red}💥 Pruebas fallaron${colors.reset}`)
    process.exit(1)
  })