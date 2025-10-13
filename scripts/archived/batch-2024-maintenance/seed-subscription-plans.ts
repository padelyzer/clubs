import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const subscriptionPlans = [
  {
    name: 'basico',
    displayName: 'Plan Básico',
    description: 'Perfecto para clubs pequeños que están comenzando',
    price: 49900, // $499.00 MXN
    currency: 'MXN',
    interval: 'month',
    maxClubs: 1,
    maxUsers: 10,
    maxCourts: 3,
    maxBookings: 100,
    commissionRate: 300, // 3%
    isActive: true,
    sortOrder: 1,
    features: {
      dashboard: true,
      bookingManagement: true,
      customerSupport: true,
      analytics: false,
      multiLocation: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      advancedReports: false,
      whiteLabel: false
    }
  },
  {
    name: 'profesional',
    displayName: 'Plan Profesional',
    description: 'Ideal para clubs establecidos con múltiples canchas',
    price: 99900, // $999.00 MXN
    currency: 'MXN',
    interval: 'month',
    maxClubs: 1,
    maxUsers: 50,
    maxCourts: 10,
    maxBookings: 500,
    commissionRate: 250, // 2.5%
    isActive: true,
    sortOrder: 2,
    features: {
      dashboard: true,
      bookingManagement: true,
      customerSupport: true,
      analytics: true,
      multiLocation: false,
      customBranding: true,
      apiAccess: false,
      prioritySupport: true,
      advancedReports: false,
      whiteLabel: false
    }
  },
  {
    name: 'empresarial',
    displayName: 'Plan Empresarial',
    description: 'Para cadenas de clubs y organizaciones grandes',
    price: 199900, // $1999.00 MXN
    currency: 'MXN',
    interval: 'month',
    maxClubs: null, // Unlimited
    maxUsers: null, // Unlimited
    maxCourts: null, // Unlimited
    maxBookings: null, // Unlimited
    commissionRate: 200, // 2%
    isActive: true,
    sortOrder: 3,
    features: {
      dashboard: true,
      bookingManagement: true,
      customerSupport: true,
      analytics: true,
      multiLocation: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      advancedReports: true,
      whiteLabel: true
    }
  }
]

async function seedSubscriptionPlans() {
  console.log('🌱 Iniciando seed de planes de suscripción...')

  try {
    // Clear existing plans (optional - be careful in production)
    console.log('🗑️ Limpiando planes existentes...')
    await prisma.subscriptionPlan.deleteMany()

    // Create new plans
    console.log('📦 Creando nuevos planes...')
    for (const planData of subscriptionPlans) {
      const plan = await prisma.subscriptionPlan.create({
        data: planData
      })
      console.log(`✅ Plan creado: ${plan.displayName} - $${(plan.price / 100).toFixed(2)} ${plan.currency}`)
    }

    console.log(`🎉 Seed completado! ${subscriptionPlans.length} planes de suscripción creados.`)

    // Show created plans summary
    console.log('\n📋 Resumen de planes creados:')
    const createdPlans = await prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: 'asc' }
    })

    createdPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.displayName}`)
      console.log(`   💰 Precio: $${(plan.price / 100).toFixed(2)} ${plan.currency}/mes`)
      console.log(`   🏢 Clubs: ${plan.maxClubs || 'Ilimitados'}`)
      console.log(`   👥 Usuarios: ${plan.maxUsers || 'Ilimitados'}`)
      console.log(`   🏐 Canchas: ${plan.maxCourts || 'Ilimitadas'}`)
      console.log(`   📅 Reservas: ${plan.maxBookings || 'Ilimitadas'}`)
      console.log(`   💸 Comisión: ${plan.commissionRate / 100}%`)
      console.log(`   ✅ Activo: ${plan.isActive ? 'Sí' : 'No'}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error durante el seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedSubscriptionPlans()
    .catch((error) => {
      console.error('❌ Error fatal:', error)
      process.exit(1)
    })
}

export default seedSubscriptionPlans