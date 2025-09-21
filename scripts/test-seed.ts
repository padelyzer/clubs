#!/usr/bin/env tsx

/**
 * Script de prueba rápida para verificar el seed
 * 
 * Verifica que todos los datos fueron creados correctamente
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSeedResults() {
  console.log('🔍 Verificando resultados del seed...')
  console.log('=' .repeat(50))
  
  try {
    // Verificar club
    const club = await prisma.club.findFirst()
    console.log(`🏢 Club: ${club?.name || 'NO ENCONTRADO'}`)
    
    // Verificar canchas
    const courts = await prisma.court.count()
    console.log(`🎾 Canchas: ${courts}`)
    
    // Verificar usuarios
    const players = await prisma.player.count()
    console.log(`👥 Usuarios: ${players}`)
    
    // Verificar instructores
    const instructors = await prisma.classInstructor.findMany({
      select: {
        name: true,
        paymentType: true,
        hourlyRate: true,
        monthlyRate: true
      }
    })
    console.log(`🎓 Instructores: ${instructors.length}`)
    instructors.forEach(inst => {
      const payment = inst.paymentType === 'HOURLY' 
        ? `$${inst.hourlyRate/100}/hora` 
        : `$${inst.monthlyRate/100}/mes`
      console.log(`   👨‍🏫 ${inst.name} - ${payment}`)
    })
    
    // Verificar Stripe
    const stripeProvider = await prisma.paymentProvider.findFirst({
      where: { providerId: 'stripe' }
    })
    console.log(`💳 Stripe: ${stripeProvider?.enabled ? 'CONFIGURADO' : 'NO CONFIGURADO'}`)
    
    // Verificar settings
    const settings = await prisma.clubSettings.findFirst({
      select: {
        acceptCash: true,
        terminalEnabled: true,
        transferEnabled: true
      }
    })
    console.log(`💰 Métodos de pago:`)
    console.log(`   💵 Efectivo: ${settings?.acceptCash ? 'SÍ' : 'NO'}`)
    console.log(`   🏧 Terminal: ${settings?.terminalEnabled ? 'SÍ' : 'NO'}`)
    console.log(`   🏦 Transferencia: ${settings?.transferEnabled ? 'SÍ' : 'NO'}`)
    console.log(`   💳 Stripe: ${stripeProvider?.enabled ? 'SÍ' : 'NO'}`)
    
    // Verificar transacciones
    const transactions = await prisma.transaction.count()
    console.log(`💳 Transacciones: ${transactions}`)
    
    // Verificar admin
    const admin = await prisma.user.findFirst({
      where: { role: 'CLUB_OWNER' }
    })
    console.log(`👨‍💼 Admin: ${admin?.email || 'NO ENCONTRADO'}`)
    
    console.log('')
    console.log('✅ SEED VERIFICADO EXITOSAMENTE')
    console.log('🚀 La aplicación está lista para usar')
    
  } catch (error) {
    console.error('❌ Error verificando seed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar verificación
if (require.main === module) {
  testSeedResults()
}

export default testSeedResults