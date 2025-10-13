import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
    }
  }
})

async function fixClubSettings() {
  console.log('🔧 Verificando y arreglando configuración del club...\n')
  
  try {
    // 1. Find Club Demo
    const club = await prisma.club.findFirst({
      where: { name: 'Club Demo Padelyzer' }
    })
    
    if (!club) {
      console.log('❌ Club Demo Padelyzer no encontrado')
      return
    }
    
    console.log(`✅ Club encontrado: ${club.name} (${club.id})`)
    
    // 2. Check if ClubSettings exists
    console.log('\n2️⃣ Verificando ClubSettings...')
    let settings = await prisma.clubSettings.findUnique({
      where: { clubId: club.id }
    })
    
    if (!settings) {
      console.log('❌ No existe ClubSettings, creando...')
      settings = await prisma.clubSettings.create({
        data: {
          id: `settings_${club.id}_${Date.now()}`,
          clubId: club.id,
          slotDuration: 90,
          bufferTime: 15,
          advanceBookingDays: 30,
          allowSameDayBooking: true,
          currency: 'MXN',
          taxIncluded: true,
          taxRate: 16,
          cancellationFee: 0,
          noShowFee: 50,
          acceptCash: true,
          terminalEnabled: false,
          transferEnabled: true,
          timezone: 'America/Mexico_City',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('✅ ClubSettings creado')
    } else {
      console.log('✅ ClubSettings existe')
    }
    
    // 3. Check PaymentProviders
    console.log('\n3️⃣ Verificando PaymentProviders...')
    const providers = await prisma.paymentProvider.findMany({
      where: { clubId: club.id }
    })
    
    console.log(`Encontrados ${providers.length} proveedores de pago`)
    
    // 4. Create default Stripe provider if none exists
    const stripeProvider = providers.find(p => p.providerId === 'stripe')
    if (!stripeProvider) {
      console.log('Creando proveedor Stripe por defecto...')
      await prisma.paymentProvider.create({
        data: {
          id: `provider_stripe_${club.id}_${Date.now()}`,
          clubId: club.id,
          providerId: 'stripe',
          name: 'Stripe',
          enabled: false,
          config: {
            publicKey: '',
            secretKey: ''
          },
          fees: {
            percentage: 2.9,
            fixed: 30
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('✅ Proveedor Stripe creado (deshabilitado)')
    }
    
    // 5. Verify configuration
    const finalProviders = await prisma.paymentProvider.findMany({
      where: { clubId: club.id }
    })
    
    console.log(`\n✅ Total proveedores configurados: ${finalProviders.length}`)
    
    console.log('\n✅ Configuración del club lista para usar!')
    console.log('\n📝 Ahora puedes guardar las llaves de Stripe en Settings')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixClubSettings()