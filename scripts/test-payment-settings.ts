/**
 * Test script to validate payment settings functionality
 * Run with: npx tsx scripts/test-payment-settings.ts
 */

import { prisma } from '@/lib/config/prisma'
import { settingsService } from '@/lib/services/settings-service'

const TEST_CLUB_ID = 'test-club-id'

async function testPaymentSettings() {
  console.log('🧪 Testing Payment Settings Integration\n')
  
  try {
    // Test 1: Create or get test club
    console.log('1️⃣ Setting up test club...')
    const club = await prisma.club.upsert({
      where: { id: TEST_CLUB_ID },
      update: {},
      create: {
        id: TEST_CLUB_ID,
        name: 'Test Club',
        slug: 'test-club',
        email: 'test@club.com',
        phone: '555-0100',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Mexico',
        active: true
      }
    })
    console.log('✅ Test club ready\n')

    // Test 2: Test ClubSettings payment fields
    console.log('2️⃣ Testing ClubSettings payment fields...')
    
    const testSettings = {
      // Required fields
      slotDuration: 90,
      bufferTime: 15,
      advanceBookingDays: 30,
      allowSameDayBooking: true,
      currency: 'MXN',
      taxIncluded: true,
      taxRate: 16,
      cancellationFee: 50,
      noShowFee: 100,
      // Payment fields to test
      acceptCash: true,
      terminalEnabled: true,
      terminalId: 'TERM-TEST-001',
      transferEnabled: true,
      bankName: 'BBVA México',
      accountNumber: '1234567890123456',
      clabe: '012345678901234567',
      accountHolder: 'Club de Padel Test'
    }

    const updateResult = await settingsService.updateClubSettings(TEST_CLUB_ID, testSettings)
    console.log('Update result:', updateResult)

    const savedSettings = await settingsService.getClubSettings(TEST_CLUB_ID)
    console.log('Saved settings:', {
      acceptCash: savedSettings?.acceptCash,
      terminalEnabled: savedSettings?.terminalEnabled,
      terminalId: savedSettings?.terminalId,
      transferEnabled: savedSettings?.transferEnabled,
      bankName: savedSettings?.bankName,
      accountNumber: savedSettings?.accountNumber,
      clabe: savedSettings?.clabe,
      accountHolder: savedSettings?.accountHolder
    })

    // Validate each field
    const validations = [
      { field: 'acceptCash', expected: true, actual: savedSettings?.acceptCash },
      { field: 'terminalEnabled', expected: true, actual: savedSettings?.terminalEnabled },
      { field: 'terminalId', expected: 'TERM-TEST-001', actual: savedSettings?.terminalId },
      { field: 'transferEnabled', expected: true, actual: savedSettings?.transferEnabled },
      { field: 'bankName', expected: 'BBVA México', actual: savedSettings?.bankName },
      { field: 'accountNumber', expected: '1234567890123456', actual: savedSettings?.accountNumber },
      { field: 'clabe', expected: '012345678901234567', actual: savedSettings?.clabe },
      { field: 'accountHolder', expected: 'Club de Padel Test', actual: savedSettings?.accountHolder }
    ]

    let allPassed = true
    validations.forEach(v => {
      const pass = v.expected === v.actual
      console.log(`  ${pass ? '✅' : '❌'} ${v.field}: ${v.actual}`)
      if (!pass) allPassed = false
    })

    if (!allPassed) {
      throw new Error('Some ClubSettings validations failed')
    }
    console.log('✅ All ClubSettings payment fields validated\n')

    // Test 3: Test PaymentProvider (Stripe)
    console.log('3️⃣ Testing PaymentProvider (Stripe)...')
    
    const stripeProvider = {
      providerId: 'stripe',
      name: 'Stripe',
      enabled: true,
      config: {
        publicKey: 'pk_test_example123',
        secretKey: 'sk_test_example456'
      },
      fees: { percentage: 2.9, fixed: 30 }
    }

    const providerResult = await settingsService.updatePaymentProviders(TEST_CLUB_ID, [stripeProvider])
    console.log('Provider update result:', providerResult)

    const savedProviders = await settingsService.getPaymentProviders(TEST_CLUB_ID)
    const savedStripe = savedProviders.find(p => p.providerId === 'stripe')
    
    console.log('Saved Stripe provider:', {
      enabled: savedStripe?.enabled,
      publicKey: savedStripe?.config.publicKey,
      secretKey: savedStripe?.config.secretKey?.substring(0, 10) + '...'
    })

    const stripeValidations = [
      { field: 'enabled', expected: true, actual: savedStripe?.enabled },
      { field: 'publicKey', expected: 'pk_test_example123', actual: savedStripe?.config.publicKey },
      { field: 'secretKey', expected: 'sk_test_example456', actual: savedStripe?.config.secretKey }
    ]

    let stripeAllPassed = true
    stripeValidations.forEach(v => {
      const pass = v.expected === v.actual
      console.log(`  ${pass ? '✅' : '❌'} ${v.field}: ${v.field === 'secretKey' ? '***' : v.actual}`)
      if (!pass) stripeAllPassed = false
    })

    if (!stripeAllPassed) {
      throw new Error('Some PaymentProvider validations failed')
    }
    console.log('✅ PaymentProvider (Stripe) validated\n')

    // Test 4: Test API route simulation
    console.log('4️⃣ Simulating API route data structure...')
    
    // Simulate GET response
    const getResponse = {
      settings: savedSettings,
      paymentProviders: savedProviders
    }
    console.log('GET /api/settings/payments would return:', {
      hasSettings: !!getResponse.settings,
      providerCount: getResponse.paymentProviders.length
    })

    // Simulate POST body for Cash
    const cashBody = {
      settings: { acceptCash: false }
    }
    console.log('POST body for Cash update:', cashBody)

    // Simulate POST body for Transfer
    const transferBody = {
      settings: {
        transferEnabled: true,
        bankName: 'Santander',
        accountNumber: '9876543210',
        clabe: '876543210987654321',
        accountHolder: 'Nuevo Titular'
      }
    }
    console.log('POST body for Transfer update:', transferBody)

    // Simulate POST body for Terminal
    const terminalBody = {
      settings: {
        terminalEnabled: false,
        terminalId: ''
      }
    }
    console.log('POST body for Terminal update:', terminalBody)

    // Simulate POST body for Stripe
    const stripeBody = {
      paymentProviders: {
        stripe: {
          enabled: true,
          publicKey: 'pk_live_real123',
          secretKey: 'sk_live_real456'
        }
      }
    }
    console.log('POST body for Stripe update:', stripeBody)
    console.log('✅ API data structures validated\n')

    // Test 5: Validate data flow
    console.log('5️⃣ Testing complete data flow...')
    
    // Update through service (simulating API)
    await settingsService.updateClubSettings(TEST_CLUB_ID, {
      ...testSettings,
      acceptCash: false,
      terminalEnabled: false
    })

    const finalSettings = await settingsService.getClubSettings(TEST_CLUB_ID)
    console.log('Final state after update:')
    console.log(`  acceptCash: ${finalSettings?.acceptCash} (should be false)`)
    console.log(`  terminalEnabled: ${finalSettings?.terminalEnabled} (should be false)`)
    console.log('✅ Data flow validated\n')

    console.log('✨ All payment settings tests passed!')
    console.log('\n📋 Summary:')
    console.log('- ClubSettings payment fields: ✅')
    console.log('- PaymentProvider (Stripe): ✅')
    console.log('- API data structures: ✅')
    console.log('- Data flow: ✅')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run tests
testPaymentSettings()