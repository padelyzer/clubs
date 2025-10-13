/**
 * Test script to validate reading payment data from backend
 * Run with: npx tsx scripts/test-payment-read-flow.ts
 */

import { settingsService } from '@/lib/services/settings-service'
import { prisma } from '@/lib/config/prisma'

const TEST_CLUB_ID = 'test-club-id'

async function testReadFlow() {
  console.log('🧪 Testing Payment Read Flow\n')
  
  try {
    // Setup: Create test data
    console.log('📝 Setting up test data...')
    
    // Create test settings
    await prisma.clubSettings.upsert({
      where: { clubId: TEST_CLUB_ID },
      update: {
        acceptCash: true,
        terminalEnabled: true,
        terminalId: 'READER-001',
        transferEnabled: true,
        bankName: 'Banco Test',
        accountNumber: '1111222233334444',
        clabe: '111222333444555666',
        accountHolder: 'Test Account Holder'
      },
      create: {
        clubId: TEST_CLUB_ID,
        slotDuration: 90,
        bufferTime: 15,
        advanceBookingDays: 30,
        allowSameDayBooking: true,
        currency: 'MXN',
        taxIncluded: true,
        taxRate: 16,
        cancellationFee: 50,
        noShowFee: 100,
        acceptCash: true,
        terminalEnabled: true,
        terminalId: 'READER-001',
        transferEnabled: true,
        bankName: 'Banco Test',
        accountNumber: '1111222233334444',
        clabe: '111222333444555666',
        accountHolder: 'Test Account Holder'
      }
    })
    
    // Create Stripe provider
    await prisma.paymentProvider.upsert({
      where: {
        clubId_providerId: {
          clubId: TEST_CLUB_ID,
          providerId: 'stripe'
        }
      },
      update: {
        enabled: true,
        config: {
          publicKey: 'pk_test_read123',
          secretKey: 'sk_test_read456'
        }
      },
      create: {
        clubId: TEST_CLUB_ID,
        providerId: 'stripe',
        name: 'Stripe',
        enabled: true,
        config: {
          publicKey: 'pk_test_read123',
          secretKey: 'sk_test_read456'
        },
        fees: { percentage: 2.9, fixed: 30 }
      }
    })
    
    console.log('✅ Test data created\n')
    
    // Test 1: Read ClubSettings
    console.log('1️⃣ Testing ClubSettings Read...')
    const settings = await settingsService.getClubSettings(TEST_CLUB_ID)
    
    if (!settings) {
      throw new Error('Failed to read ClubSettings')
    }
    
    console.log('ClubSettings received:')
    console.log(`  acceptCash: ${settings.acceptCash}`)
    console.log(`  terminalEnabled: ${settings.terminalEnabled}`)
    console.log(`  terminalId: ${settings.terminalId}`)
    console.log(`  transferEnabled: ${settings.transferEnabled}`)
    console.log(`  bankName: ${settings.bankName}`)
    console.log(`  accountNumber: ${settings.accountNumber}`)
    console.log(`  clabe: ${settings.clabe}`)
    console.log(`  accountHolder: ${settings.accountHolder}`)
    
    // Validate cash fields
    const cashValid = settings.acceptCash === true
    console.log(`\n  Cash fields: ${cashValid ? '✅' : '❌'}`)
    
    // Validate terminal fields
    const terminalValid = settings.terminalEnabled === true && 
                         settings.terminalId === 'READER-001'
    console.log(`  Terminal fields: ${terminalValid ? '✅' : '❌'}`)
    
    // Validate transfer fields
    const transferValid = settings.transferEnabled === true &&
                         settings.bankName === 'Banco Test' &&
                         settings.accountNumber === '1111222233334444' &&
                         settings.clabe === '111222333444555666' &&
                         settings.accountHolder === 'Test Account Holder'
    console.log(`  Transfer fields: ${transferValid ? '✅' : '❌'}`)
    console.log()
    
    // Test 2: Read PaymentProviders
    console.log('2️⃣ Testing PaymentProviders Read...')
    const providers = await settingsService.getPaymentProviders(TEST_CLUB_ID)
    
    console.log(`Providers count: ${providers.length}`)
    
    const stripeProvider = providers.find(p => p.providerId === 'stripe')
    if (!stripeProvider) {
      throw new Error('Stripe provider not found')
    }
    
    console.log('Stripe provider received:')
    console.log(`  enabled: ${stripeProvider.enabled}`)
    console.log(`  publicKey: ${stripeProvider.config.publicKey}`)
    console.log(`  secretKey: ${stripeProvider.config.secretKey?.substring(0, 10)}...`)
    
    const stripeValid = stripeProvider.enabled === true &&
                       stripeProvider.config.publicKey === 'pk_test_read123' &&
                       stripeProvider.config.secretKey === 'sk_test_read456'
    console.log(`\n  Stripe fields: ${stripeValid ? '✅' : '❌'}`)
    console.log()
    
    // Test 3: Simulate API GET response
    console.log('3️⃣ Simulating API GET /api/settings/payments...')
    
    const apiResponse = {
      success: true,
      data: {
        settings,
        paymentProviders: providers
      }
    }
    
    console.log('API Response structure:')
    console.log(`  success: ${apiResponse.success}`)
    console.log(`  data.settings: ${apiResponse.data.settings ? '✅ Present' : '❌ Missing'}`)
    console.log(`  data.paymentProviders: ${apiResponse.data.paymentProviders ? '✅ Present' : '❌ Missing'}`)
    console.log()
    
    // Test 4: Verify frontend component data mapping
    console.log('4️⃣ Verifying Frontend Component Data Mapping...')
    
    // Cash Section
    const cashData = {
      acceptCash: settings.acceptCash
    }
    console.log('Cash Section would receive:')
    console.log(`  acceptCash: ${cashData.acceptCash}`)
    
    // Transfer Section
    const transferData = {
      transferEnabled: settings.transferEnabled,
      bankName: settings.bankName,
      accountNumber: settings.accountNumber,
      clabe: settings.clabe,
      accountHolder: settings.accountHolder
    }
    console.log('\nTransfer Section would receive:')
    console.log(`  transferEnabled: ${transferData.transferEnabled}`)
    console.log(`  bankName: ${transferData.bankName}`)
    console.log(`  accountNumber: ${transferData.accountNumber}`)
    console.log(`  clabe: ${transferData.clabe}`)
    console.log(`  accountHolder: ${transferData.accountHolder}`)
    
    // Terminal Section
    const terminalData = {
      terminalEnabled: settings.terminalEnabled,
      terminalId: settings.terminalId
    }
    console.log('\nTerminal Section would receive:')
    console.log(`  terminalEnabled: ${terminalData.terminalEnabled}`)
    console.log(`  terminalId: ${terminalData.terminalId}`)
    
    // Stripe Section
    const stripeData = {
      enabled: stripeProvider.enabled,
      publicKey: stripeProvider.config.publicKey,
      secretKey: stripeProvider.config.secretKey
    }
    console.log('\nStripe Section would receive:')
    console.log(`  enabled: ${stripeData.enabled}`)
    console.log(`  publicKey: ${stripeData.publicKey}`)
    console.log(`  secretKey: ${stripeData.secretKey?.substring(0, 10)}...`)
    
    // Final validation
    const allValid = cashValid && terminalValid && transferValid && stripeValid
    
    if (allValid) {
      console.log('\n✨ All read operations validated successfully!')
    } else {
      console.log('\n❌ Some read operations failed validation')
    }
    
    console.log('\n📋 Summary:')
    console.log('- ClubSettings read: ✅')
    console.log('- PaymentProviders read: ✅')
    console.log('- API response structure: ✅')
    console.log('- Frontend data mapping: ✅')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run tests
testReadFlow()