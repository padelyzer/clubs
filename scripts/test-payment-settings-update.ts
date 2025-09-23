import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
    }
  }
})

async function testPaymentSettingsUpdate() {
  console.log('🔍 Probando actualización de configuración de pagos...\n')
  
  try {
    // 1. Find club
    const club = await prisma.club.findFirst({
      where: { name: 'Club Demo Padelyzer' }
    })
    
    if (!club) {
      console.log('❌ Club no encontrado')
      return
    }
    
    console.log(`✅ Club: ${club.name} (${club.id})`)
    
    // 2. Check current provider
    console.log('\n2️⃣ Proveedor actual:')
    const currentProvider = await prisma.paymentProvider.findUnique({
      where: {
        clubId_providerId: {
          clubId: club.id,
          providerId: 'stripe'
        }
      }
    })
    
    if (currentProvider) {
      console.log('   ID:', currentProvider.id)
      console.log('   Enabled:', currentProvider.enabled)
      console.log('   Config:', JSON.stringify(currentProvider.config, null, 2))
      console.log('   Fees:', JSON.stringify(currentProvider.fees, null, 2))
    } else {
      console.log('   ❌ No existe')
    }
    
    // 3. Test update simulation
    console.log('\n3️⃣ Simulando actualización...')
    
    const testConfig = {
      providerId: 'stripe',
      name: 'Stripe',
      enabled: false,
      config: {
        publicKey: 'pk_test_123',
        secretKey: 'sk_test_456'
      },
      fees: { percentage: 2.9, fixed: 30 }
    }
    
    console.log('Datos a actualizar:', JSON.stringify(testConfig, null, 2))
    
    // 4. Perform update
    const updated = await prisma.paymentProvider.upsert({
      where: {
        clubId_providerId: {
          clubId: club.id,
          providerId: 'stripe'
        }
      },
      update: {
        name: testConfig.name,
        enabled: testConfig.enabled,
        config: testConfig.config,
        fees: testConfig.fees,
        updatedAt: new Date()
      },
      create: {
        id: `provider_stripe_${club.id}_${Date.now()}`,
        clubId: club.id,
        providerId: testConfig.providerId,
        name: testConfig.name,
        enabled: testConfig.enabled,
        config: testConfig.config,
        fees: testConfig.fees,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log('\n✅ Actualización exitosa!')
    console.log('   ID:', updated.id)
    console.log('   Enabled:', updated.enabled)
    console.log('   Config:', JSON.stringify(updated.config, null, 2))
    
    // 5. Clean up test data
    console.log('\n4️⃣ Limpiando datos de prueba...')
    await prisma.paymentProvider.update({
      where: { id: updated.id },
      data: {
        config: {
          publicKey: '',
          secretKey: ''
        },
        updatedAt: new Date()
      }
    })
    console.log('✅ Datos de prueba limpiados')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPaymentSettingsUpdate()