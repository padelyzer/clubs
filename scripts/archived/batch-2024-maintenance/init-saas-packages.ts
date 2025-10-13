import { PrismaClient } from '@prisma/client'

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

async function initSaasPackages() {
  console.log(`${colors.cyan}${colors.bright}📦 INICIALIZANDO SISTEMA DE PAQUETES SAAS${colors.reset}\n`)
  
  try {
    // ==========================================
    // 1. OBTENER MÓDULOS EXISTENTES
    // ==========================================
    console.log(`${colors.blue}1️⃣ Obteniendo módulos existentes...${colors.reset}`)
    
    const modules = await prisma.saasModule.findMany({
      orderBy: { sortOrder: 'asc' }
    })
    
    if (modules.length === 0) {
      throw new Error('No se encontraron módulos. Ejecuta primero init-saas-modules.ts')
    }
    
    console.log(`   ✅ Encontrados ${modules.length} módulos`)
    
    // ==========================================
    // 2. CREAR PAQUETES PREDEFINIDOS
    // ==========================================
    console.log(`\n${colors.blue}2️⃣ Creando paquetes predefinidos...${colors.reset}`)
    
    const packages = [
      {
        name: 'basic',
        displayName: 'Básico',
        description: 'Paquete básico con funcionalidades esenciales',
        basePrice: 50000, // $500 MXN
        maxCourts: 5,
        maxUsers: 10,
        maxBookingsMonth: 500,
        isDefault: true,
        sortOrder: 1,
        modules: [
          { code: 'bookings', isIncluded: true, isOptional: false },
          { code: 'customers', isIncluded: true, isOptional: false }
        ]
      },
      {
        name: 'professional',
        displayName: 'Profesional',
        description: 'Para clubes medianos con funcionalidades avanzadas',
        basePrice: 100000, // $1000 MXN
        maxCourts: 15,
        maxUsers: 50,
        maxBookingsMonth: 2000,
        isDefault: false,
        sortOrder: 2,
        modules: [
          { code: 'bookings', isIncluded: true, isOptional: false },
          { code: 'customers', isIncluded: true, isOptional: false },
          { code: 'tournaments', isIncluded: true, isOptional: false },
          { code: 'classes', isIncluded: false, isOptional: true }, // Opcional
          { code: 'finance', isIncluded: false, isOptional: true }   // Opcional
        ]
      },
      {
        name: 'enterprise',
        displayName: 'Empresarial',
        description: 'Solución completa para grandes clubes',
        basePrice: 200000, // $2000 MXN
        maxCourts: null, // Ilimitado
        maxUsers: null,  // Ilimitado
        maxBookingsMonth: null, // Ilimitado
        isDefault: false,
        sortOrder: 3,
        modules: [
          { code: 'bookings', isIncluded: true, isOptional: false },
          { code: 'customers', isIncluded: true, isOptional: false },
          { code: 'tournaments', isIncluded: true, isOptional: false },
          { code: 'classes', isIncluded: true, isOptional: false },
          { code: 'finance', isIncluded: true, isOptional: false }
        ]
      },
      {
        name: 'custom',
        displayName: 'Personalizado',
        description: 'Paquete personalizable para necesidades específicas',
        basePrice: 0, // Se calcula dinámicamente
        maxCourts: null,
        maxUsers: null,
        maxBookingsMonth: null,
        isDefault: false,
        sortOrder: 4,
        modules: [
          { code: 'bookings', isIncluded: false, isOptional: true },
          { code: 'customers', isIncluded: false, isOptional: true },
          { code: 'tournaments', isIncluded: false, isOptional: true },
          { code: 'classes', isIncluded: false, isOptional: true },
          { code: 'finance', isIncluded: false, isOptional: true }
        ]
      }
    ]
    
    for (const packageData of packages) {
      // Verificar si el paquete ya existe
      const existingPackage = await prisma.saasPackage.findUnique({
        where: { name: packageData.name }
      })
      
      if (existingPackage) {
        console.log(`   ⏭️ Paquete ya existe: ${packageData.displayName}`)
        continue
      }
      
      // Crear el paquete
      const { modules: packageModules, ...packageInfo } = packageData
      const createdPackage = await prisma.saasPackage.create({
        data: packageInfo
      })
      
      console.log(`   ✅ Paquete creado: ${packageData.displayName}`)
      
      // Agregar módulos al paquete
      for (const moduleConfig of packageModules) {
        const module = modules.find(m => m.code === moduleConfig.code)
        if (!module) {
          console.log(`   ⚠️ Módulo no encontrado: ${moduleConfig.code}`)
          continue
        }
        
        await prisma.packageModule.create({
          data: {
            packageId: createdPackage.id,
            moduleId: module.id,
            isIncluded: moduleConfig.isIncluded,
            isOptional: moduleConfig.isOptional
          }
        })
        
        console.log(`      - Módulo agregado: ${module.name} (${moduleConfig.isIncluded ? 'Incluido' : 'Opcional'})`)
      }
    }
    
    // ==========================================
    // 3. ASIGNAR PAQUETE BÁSICO A CLUBES EXISTENTES
    // ==========================================
    console.log(`\n${colors.blue}3️⃣ Asignando paquete básico a clubes existentes...${colors.reset}`)
    
    const basicPackage = await prisma.saasPackage.findUnique({
      where: { name: 'basic' }
    })
    
    if (!basicPackage) {
      throw new Error('No se pudo encontrar el paquete básico')
    }
    
    const existingClubs = await prisma.club.findMany({
      where: { 
        status: 'APPROVED',
        clubPackage: null // Solo clubes sin paquete asignado
      }
    })
    
    for (const club of existingClubs) {
      await prisma.clubPackage.create({
        data: {
          clubId: club.id,
          packageId: basicPackage.id,
          notes: 'Asignado automáticamente durante la inicialización'
        }
      })
      
      console.log(`   ✅ Paquete Básico asignado a: ${club.name}`)
    }
    
    // ==========================================
    // 4. MOSTRAR RESUMEN
    // ==========================================
    console.log(`\n${colors.cyan}${colors.bright}📊 RESUMEN DE PAQUETES${colors.reset}`)
    console.log('═'.repeat(60))
    
    const packagesSummary = await prisma.saasPackage.findMany({
      include: {
        modules: {
          include: {
            module: true
          }
        },
        clubPackages: true,
        _count: {
          select: {
            clubPackages: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })
    
    for (const pkg of packagesSummary) {
      console.log(`\n${colors.yellow}📦 ${pkg.displayName}${colors.reset}`)
      console.log(`   💰 Precio: $${(pkg.basePrice / 100).toFixed(2)} ${pkg.currency}/mes`)
      console.log(`   🏢 Clubes asignados: ${pkg._count.clubPackages}`)
      console.log(`   🏟️ Máx. canchas: ${pkg.maxCourts || 'Ilimitado'}`)
      console.log(`   👥 Máx. usuarios: ${pkg.maxUsers || 'Ilimitado'}`)
      console.log(`   📅 Máx. reservas/mes: ${pkg.maxBookingsMonth || 'Ilimitado'}`)
      
      const includedModules = pkg.modules.filter(m => m.isIncluded)
      const optionalModules = pkg.modules.filter(m => m.isOptional && !m.isIncluded)
      
      if (includedModules.length > 0) {
        console.log(`   ✅ Módulos incluidos:`)
        includedModules.forEach(m => {
          console.log(`      - ${m.module.name}`)
        })
      }
      
      if (optionalModules.length > 0) {
        console.log(`   🔧 Módulos opcionales:`)
        optionalModules.forEach(m => {
          console.log(`      - ${m.module.name}`)
        })
      }
    }
    
    // ==========================================
    // 5. ESTADÍSTICAS FINALES
    // ==========================================
    const totalPackages = await prisma.saasPackage.count()
    const totalClubPackages = await prisma.clubPackage.count()
    const totalPackageModules = await prisma.packageModule.count()
    
    console.log(`\n${colors.cyan}${colors.bright}📈 ESTADÍSTICAS${colors.reset}`)
    console.log('═'.repeat(30))
    console.log(`${colors.green}✅ Paquetes creados: ${totalPackages}${colors.reset}`)
    console.log(`${colors.green}✅ Asignaciones de paquetes: ${totalClubPackages}${colors.reset}`)
    console.log(`${colors.green}✅ Configuraciones de módulos: ${totalPackageModules}${colors.reset}`)
    
    console.log(`\n${colors.green}${colors.bright}✨ SISTEMA DE PAQUETES INICIALIZADO EXITOSAMENTE${colors.reset}`)
    
  } catch (error) {
    console.error(`\n${colors.red}❌ ERROR EN LA INICIALIZACIÓN:${colors.reset}`)
    console.error(error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar inicialización
initSaasPackages()
  .then(() => {
    console.log(`\n${colors.green}✅ Proceso finalizado exitosamente${colors.reset}`)
    process.exit(0)
  })
  .catch((error) => {
    console.error(`\n${colors.red}💥 Proceso finalizado con errores${colors.reset}`)
    process.exit(1)
  })