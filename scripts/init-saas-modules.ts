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

async function initSaasModules() {
  console.log(`${colors.cyan}${colors.bright}🏗️ INICIALIZANDO SISTEMA DE MÓDULOS SAAS${colors.reset}\n`)
  
  try {
    // ==========================================
    // 1. CREAR MÓDULOS BASE
    // ==========================================
    console.log(`${colors.blue}1️⃣ Creando módulos base...${colors.reset}`)
    
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
        scalesWithCourts: false, // Precio fijo
        sortOrder: 5
      }
    ]
    
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
        console.log(`   ⏭️ Módulo ya existe: ${moduleData.name}`)
      }
    }
    
    // ==========================================
    // 2. CREAR TIERS DE PRECIOS
    // ==========================================
    console.log(`\n${colors.blue}2️⃣ Creando tiers de precios...${colors.reset}`)
    
    const modules_db = await prisma.saasModule.findMany()
    
    // Tiers para módulos que escalan con canchas
    const scalableTiers = [
      { name: '1-5 canchas', minCourts: 1, maxCourts: 5, prices: { bookings: 30000, customers: 20000, tournaments: 25000, classes: 20000 } }, // $300, $200, $250, $200
      { name: '6-10 canchas', minCourts: 6, maxCourts: 10, prices: { bookings: 50000, customers: 35000, tournaments: 40000, classes: 35000 } }, // $500, $350, $400, $350  
      { name: '11-20 canchas', minCourts: 11, maxCourts: 20, prices: { bookings: 80000, customers: 55000, tournaments: 65000, classes: 55000 } }, // $800, $550, $650, $550
      { name: '21+ canchas', minCourts: 21, maxCourts: null, prices: { bookings: 120000, customers: 80000, tournaments: 100000, classes: 80000 } } // $1200, $800, $1000, $800
    ]
    
    // Precio fijo para finanzas
    const financePrice = 40000 // $400 MXN
    
    for (const module of modules_db) {
      if (module.scalesWithCourts) {
        // Crear tiers escalables
        for (const tier of scalableTiers) {
          const existingTier = await prisma.modulePricingTier.findFirst({
            where: {
              moduleId: module.id,
              minCourts: tier.minCourts,
              maxCourts: tier.maxCourts
            }
          })
          
          if (!existingTier) {
            await prisma.modulePricingTier.create({
              data: {
                moduleId: module.id,
                name: tier.name,
                minCourts: tier.minCourts,
                maxCourts: tier.maxCourts,
                price: tier.prices[module.code as keyof typeof tier.prices]
              }
            })
            console.log(`   ✅ Tier creado: ${module.name} - ${tier.name}`)
          }
        }
      } else {
        // Precio fijo para finanzas
        const existingTier = await prisma.modulePricingTier.findFirst({
          where: { moduleId: module.id }
        })
        
        if (!existingTier) {
          await prisma.modulePricingTier.create({
            data: {
              moduleId: module.id,
              name: 'Precio fijo',
              minCourts: 0,
              maxCourts: null,
              price: financePrice
            }
          })
          console.log(`   ✅ Precio fijo creado: ${module.name}`)
        }
      }
    }
    
    // ==========================================
    // 3. CREAR DESCUENTOS DE EJEMPLO
    // ==========================================
    console.log(`\n${colors.blue}3️⃣ Creando descuentos de ejemplo...${colors.reset}`)
    
    const discounts = [
      {
        name: 'Descuento por Volumen - 10+ canchas',
        description: 'Descuento del 15% para clubes con 10 o más canchas',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minCourts: 10,
        moduleIds: [], // Aplica a todos los módulos
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
      },
      {
        name: 'Promoción Lanzamiento',
        description: 'Descuento del 25% primer mes para nuevos clientes',
        discountType: 'PERCENTAGE',
        discountValue: 25,
        minCourts: null,
        moduleIds: [],
        maxUses: 100,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 meses
      }
    ]
    
    for (const discountData of discounts) {
      const existingDiscount = await prisma.moduleDiscount.findFirst({
        where: { name: discountData.name }
      })
      
      if (!existingDiscount) {
        await prisma.moduleDiscount.create({
          data: discountData
        })
        console.log(`   ✅ Descuento creado: ${discountData.name}`)
      } else {
        console.log(`   ⏭️ Descuento ya existe: ${discountData.name}`)
      }
    }
    
    // ==========================================
    // 4. ACTIVAR MÓDULOS BÁSICOS PARA CLUBES EXISTENTES
    // ==========================================
    console.log(`\n${colors.blue}4️⃣ Activando módulos básicos para clubes existentes...${colors.reset}`)
    
    const existingClubs = await prisma.club.findMany({
      where: { status: 'APPROVED' }
    })
    
    const bookingsModule = await prisma.saasModule.findUnique({
      where: { code: 'bookings' }
    })
    
    const customersModule = await prisma.saasModule.findUnique({
      where: { code: 'customers' }
    })
    
    for (const club of existingClubs) {
      // Activar módulo de reservas (básico para todos)
      if (bookingsModule) {
        const existingBookingsModule = await prisma.clubModule.findUnique({
          where: {
            clubId_moduleId: {
              clubId: club.id,
              moduleId: bookingsModule.id
            }
          }
        })
        
        if (!existingBookingsModule) {
          await prisma.clubModule.create({
            data: {
              clubId: club.id,
              moduleId: bookingsModule.id,
              isEnabled: true,
              enabledAt: new Date(),
              gracePeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días gratis
            }
          })
          console.log(`   ✅ Módulo Reservas activado para: ${club.name}`)
        }
      }
      
      // Activar módulo de clientes
      if (customersModule) {
        const existingCustomersModule = await prisma.clubModule.findUnique({
          where: {
            clubId_moduleId: {
              clubId: club.id,
              moduleId: customersModule.id
            }
          }
        })
        
        if (!existingCustomersModule) {
          await prisma.clubModule.create({
            data: {
              clubId: club.id,
              moduleId: customersModule.id,
              isEnabled: true,
              enabledAt: new Date(),
              gracePeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días gratis
            }
          })
          console.log(`   ✅ Módulo Clientes activado para: ${club.name}`)
        }
      }
    }
    
    // ==========================================
    // 5. MOSTRAR RESUMEN
    // ==========================================
    console.log(`\n${colors.cyan}${colors.bright}📊 RESUMEN DE INICIALIZACIÓN${colors.reset}`)
    console.log('═'.repeat(50))
    
    const totalModules = await prisma.saasModule.count()
    const totalTiers = await prisma.modulePricingTier.count()
    const totalDiscounts = await prisma.moduleDiscount.count()
    const totalClubModules = await prisma.clubModule.count()
    
    console.log(`${colors.green}✅ Módulos creados: ${totalModules}${colors.reset}`)
    console.log(`${colors.green}✅ Tiers de precios: ${totalTiers}${colors.reset}`)
    console.log(`${colors.green}✅ Descuentos configurados: ${totalDiscounts}${colors.reset}`)
    console.log(`${colors.green}✅ Módulos de club activados: ${totalClubModules}${colors.reset}`)
    
    // Mostrar estructura de precios
    console.log(`\n${colors.yellow}💰 ESTRUCTURA DE PRECIOS:${colors.reset}`)
    const pricingStructure = await prisma.saasModule.findMany({
      include: {
        pricingTiers: {
          orderBy: { minCourts: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })
    
    for (const module of pricingStructure) {
      console.log(`\n   📦 ${module.name}:`)
      for (const tier of module.pricingTiers) {
        const priceFormatted = `$${(tier.price / 100).toFixed(2)} ${tier.currency}`
        console.log(`      - ${tier.name}: ${priceFormatted}`)
      }
    }
    
    console.log(`\n${colors.green}${colors.bright}✨ SISTEMA DE MÓDULOS SAAS INICIALIZADO EXITOSAMENTE${colors.reset}`)
    
  } catch (error) {
    console.error(`\n${colors.red}❌ ERROR EN LA INICIALIZACIÓN:${colors.reset}`)
    console.error(error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar inicialización
initSaasModules()
  .then(() => {
    console.log(`\n${colors.green}✅ Proceso finalizado exitosamente${colors.reset}`)
    process.exit(0)
  })
  .catch((error) => {
    console.error(`\n${colors.red}💥 Proceso finalizado con errores${colors.reset}`)
    process.exit(1)
  })