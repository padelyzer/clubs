import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkClubSetupStatus() {
  console.log('🔍 VERIFICANDO ESTADO DE CONFIGURACIÓN INICIAL')
  console.log('==============================================\n')

  const clubId = 'club-test-isolation-001'

  // 1. Verificar el club
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      _count: {
        select: {
          Court: true,
          User: true,
          Pricing: true,
          Schedule: true,
          ScheduleRule: true,
          PriceRule: true
        }
      },
      ClubSettings: true
    }
  })

  if (!club) {
    console.log('❌ Club no encontrado')
    return
  }

  console.log('📊 ESTADO DE CONFIGURACIÓN:')
  console.log('===========================\n')

  // 2. Verificar elementos de configuración inicial
  const setupChecklist = {
    hasSettings: !!club.ClubSettings,
    hasCourts: club._count.Court > 0,
    hasSchedule: club._count.Schedule > 0 || club._count.ScheduleRule > 0,
    hasPricing: club._count.Pricing > 0 || club._count.PriceRule > 0,
    hasOperatingHours: false,
    hasPaymentMethods: false,
    setupCompleted: false
  }

  // Verificar detalles de settings
  if (club.ClubSettings) {
    setupChecklist.hasOperatingHours = !!(club.ClubSettings.openingTime && club.ClubSettings.closingTime)
    setupChecklist.hasPaymentMethods = !!(
      club.ClubSettings.cashEnabled ||
      club.ClubSettings.terminalEnabled ||
      club.ClubSettings.transferEnabled ||
      club.ClubSettings.stripeEnabled
    )
  }

  // Verificar si el setup está completo
  setupChecklist.setupCompleted = club.setupCompleted || false

  console.log('✅ Configuración básica (ClubSettings):', setupChecklist.hasSettings ? 'SÍ' : 'NO')
  console.log('🏸 Canchas configuradas:', setupChecklist.hasCourts ? `SÍ (${club._count.Court})` : 'NO')
  console.log('📅 Horarios configurados:', setupChecklist.hasSchedule ? 'SÍ' : 'NO')
  console.log('💰 Precios configurados:', setupChecklist.hasPricing ? 'SÍ' : 'NO')
  console.log('🕐 Horario de operación:', setupChecklist.hasOperatingHours ? 'SÍ' : 'NO')
  console.log('💳 Métodos de pago:', setupChecklist.hasPaymentMethods ? 'SÍ' : 'NO')
  console.log('🎯 Setup completado:', setupChecklist.setupCompleted ? 'SÍ' : 'NO')

  // 3. Determinar si debe mostrar el wizard
  const shouldShowSetupWizard = !setupChecklist.setupCompleted && (
    !setupChecklist.hasCourts ||
    !setupChecklist.hasOperatingHours ||
    !setupChecklist.hasPaymentMethods
  )

  console.log('\n🧙 DEBERÍA MOSTRAR SETUP WIZARD:', shouldShowSetupWizard ? 'SÍ' : 'NO')

  if (shouldShowSetupWizard) {
    console.log('\n📝 Pasos pendientes del setup:')
    if (!setupChecklist.hasCourts) console.log('   1. Configurar canchas')
    if (!setupChecklist.hasOperatingHours) console.log('   2. Configurar horarios de operación')
    if (!setupChecklist.hasPaymentMethods) console.log('   3. Configurar métodos de pago')
    if (!setupChecklist.hasPricing) console.log('   4. Configurar precios')
  }

  // 4. Resetear el setup para forzar el wizard (opcional)
  console.log('\n🔧 OPCIONES:')
  console.log('===========')

  if (setupChecklist.setupCompleted) {
    console.log('El club ya completó el setup inicial.')
    console.log('Si quieres forzar el wizard de nuevo, ejecuta: reset-club-setup.ts')
  } else if (!shouldShowSetupWizard) {
    console.log('El club tiene configuración parcial.')
    console.log('Debería redirigir automáticamente al setup wizard.')
  } else {
    console.log('El club NO tiene configuración inicial.')
    console.log('✅ Al iniciar sesión debería mostrar el Setup Wizard automáticamente.')

    // Marcar que necesita setup
    await prisma.club.update({
      where: { id: clubId },
      data: {
        setupCompleted: false
      }
    })
  }

  console.log('\n📍 URLs relevantes:')
  console.log('   Login: http://localhost:3002/login')
  console.log('   Setup: http://localhost:3002/c/club-test-isolation/setup')
  console.log('   Dashboard: http://localhost:3002/c/club-test-isolation/dashboard')

  await prisma.$disconnect()
}

checkClubSetupStatus().catch(console.error)