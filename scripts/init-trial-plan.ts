#!/usr/bin/env tsx

import { prisma } from '@/lib/config/prisma'

async function initTrialPlan() {
  console.log('🚀 Inicializando plan trial...')

  try {
    // Check if trial plan exists
    const existingTrial = await prisma.subscriptionPlan.findFirst({
      where: { name: 'trial' }
    })

    if (existingTrial) {
      console.log('✅ Plan trial ya existe:', existingTrial.displayName)
      return existingTrial
    }

    // Create trial plan
    const trialPlan = await prisma.subscriptionPlan.create({
      data: {
        name: 'trial',
        displayName: 'Trial - 14 días',
        description: 'Prueba gratis por 14 días con acceso completo',
        price: 0,
        currency: 'MXN',
        interval: 'month',
        features: {
          support: true,
          analytics: true,
          customization: false,
          api_access: false,
          priority_support: false
        },
        maxClubs: 1,
        maxUsers: 5,
        maxCourts: 4,
        maxBookings: 100,
        commissionRate: 0,
        isActive: true,
        sortOrder: 0
      }
    })

    console.log('✅ Plan trial creado exitosamente')
    console.log('📋 Detalles del plan:')
    console.log('   - Nombre:', trialPlan.displayName)
    console.log('   - Precio:', trialPlan.price)
    console.log('   - Duración: 14 días')
    console.log('   - Usuarios máximos:', trialPlan.maxUsers)
    console.log('   - Canchas máximas:', trialPlan.maxCourts)
    console.log('   - Reservas mensuales:', trialPlan.maxBookings)

    // Also create other default plans if they don't exist
    const plans = [
      {
        name: 'basico',
        displayName: 'Básico',
        description: 'Plan ideal para clubes pequeños',
        price: 99900, // $999 MXN
        currency: 'MXN',
        interval: 'month',
        features: {
          support: true,
          analytics: true,
          customization: false,
          api_access: false,
          priority_support: false
        },
        maxClubs: 1,
        maxUsers: 10,
        maxCourts: 6,
        maxBookings: 500,
        commissionRate: 300, // 3%
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'profesional',
        displayName: 'Profesional',
        description: 'Para clubes en crecimiento',
        price: 199900, // $1,999 MXN
        currency: 'MXN',
        interval: 'month',
        features: {
          support: true,
          analytics: true,
          customization: true,
          api_access: false,
          priority_support: true
        },
        maxClubs: 1,
        maxUsers: 25,
        maxCourts: 12,
        maxBookings: 2000,
        commissionRate: 200, // 2%
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'empresarial',
        displayName: 'Empresarial',
        description: 'Solución completa para grandes clubes',
        price: 399900, // $3,999 MXN
        currency: 'MXN',
        interval: 'month',
        features: {
          support: true,
          analytics: true,
          customization: true,
          api_access: true,
          priority_support: true,
          white_label: true
        },
        maxClubs: 1,
        maxUsers: null, // Unlimited
        maxCourts: null, // Unlimited
        maxBookings: null, // Unlimited
        commissionRate: 100, // 1%
        isActive: true,
        sortOrder: 3
      }
    ]

    for (const planData of plans) {
      const existing = await prisma.subscriptionPlan.findFirst({
        where: { name: planData.name }
      })

      if (!existing) {
        const newPlan = await prisma.subscriptionPlan.create({
          data: planData as any
        })
        console.log(`✅ Plan ${newPlan.displayName} creado`)
      } else {
        console.log(`⏭️  Plan ${existing.displayName} ya existe`)
      }
    }

    console.log('\n✅ Todos los planes han sido inicializados')

    return trialPlan

  } catch (error) {
    console.error('❌ Error inicializando planes:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  initTrialPlan()
}