import { prisma } from '../lib/config/prisma'

async function checkStripeConfig() {
  try {
    console.log('🔍 Verificando configuración de Stripe...\n')
    
    // Obtener el club
    const club = await prisma.club.findFirst()
    if (!club) {
      console.log('❌ No se encontró club')
      return
    }
    
    console.log(`🏢 Club: ${club.name} (${club.id})`)
    console.log(`   Stripe Account ID: ${club.stripeAccountId || '❌ No configurado'}`)
    console.log(`   Stripe Onboarding: ${club.stripeOnboardingCompleted ? '✅' : '❌'}`)
    console.log(`   Stripe Charges: ${club.stripeChargesEnabled ? '✅' : '❌'}`)
    console.log(`   Stripe Payouts: ${club.stripePayoutsEnabled ? '✅' : '❌'}\n`)
    
    // Buscar ClubSettings
    const clubSettings = await prisma.clubSettings.findUnique({
      where: { clubId: club.id }
    })
    
    if (clubSettings) {
      console.log('⚙️  ClubSettings encontrado:')
      console.log(`   ID: ${clubSettings.id}`)
      
      // Mostrar solo campos relacionados con pagos
      const paymentFields = [
        'acceptCash', 'terminalEnabled', 'transferEnabled', 
        'bankName', 'accountNumber', 'clabe', 'accountHolder'
      ]
      
      paymentFields.forEach(field => {
        const value = (clubSettings as any)[field]
        if (value !== null && value !== undefined) {
          console.log(`   ${field}: ${value}`)
        }
      })
    } else {
      console.log('❌ No se encontró ClubSettings')
      
      // Crear ClubSettings básico
      console.log('\n🔧 Creando ClubSettings básico...')
      
      const newSettings = await prisma.clubSettings.create({
        data: {
          clubId: club.id,
          slotDuration: 90,
          bufferTime: 15,
          advanceBookingDays: 30,
          allowSameDayBooking: true,
          timezone: 'America/Mexico_City',
          currency: 'MXN',
          taxIncluded: true,
          taxRate: 16,
          acceptCash: true,
          terminalEnabled: false,
          transferEnabled: false
        }
      })
      
      console.log(`✅ ClubSettings creado: ${newSettings.id}`)
    }
    
    // Para testing, actualizar el club con un Stripe Account ID de prueba
    if (!club.stripeAccountId) {
      console.log('\n🔧 Configurando Stripe Account ID de prueba...')
      
      await prisma.club.update({
        where: { id: club.id },
        data: {
          stripeAccountId: 'acct_test_' + club.id.slice(-10),
          stripeOnboardingCompleted: true,
          stripeChargesEnabled: true,
          stripePayoutsEnabled: true
        }
      })
      
      console.log('✅ Stripe configurado para testing')
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkStripeConfig()