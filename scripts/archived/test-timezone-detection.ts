#!/usr/bin/env tsx

import { getSmartDefaultTimezone, detectTimezoneFromLocation } from '../lib/utils/timezone-detection'

function testTimezoneDetection() {
  console.log('🧪 Testing timezone detection system...\n')

  const testCases = [
    // México - diferentes regiones
    { city: 'Ciudad de México', state: 'CDMX', country: 'México', expected: 'America/Mexico_City' },
    { city: 'Tijuana', state: 'Baja California', country: 'México', expected: 'America/Tijuana' },
    { city: 'Cancún', state: 'Quintana Roo', country: 'México', expected: 'America/Cancun' },
    { city: 'Hermosillo', state: 'Sonora', country: 'México', expected: 'America/Hermosillo' },
    { city: 'Chihuahua', state: 'Chihuahua', country: 'México', expected: 'America/Chihuahua' },
    { city: 'Mazatlán', state: 'Sinaloa', country: 'México', expected: 'America/Mazatlan' },
    { city: 'Guadalajara', state: 'Jalisco', country: 'México', expected: 'America/Mexico_City' },
    
    // Latinoamérica
    { city: 'Buenos Aires', state: '', country: 'Argentina', expected: 'America/Buenos_Aires' },
    { city: 'Santiago', state: '', country: 'Chile', expected: 'America/Santiago' },
    { city: 'Lima', state: '', country: 'Perú', expected: 'America/Lima' },
    { city: 'Bogotá', state: '', country: 'Colombia', expected: 'America/Bogota' },
    { city: 'Caracas', state: '', country: 'Venezuela', expected: 'America/Caracas' },
    { city: 'São Paulo', state: '', country: 'Brasil', expected: 'America/Sao_Paulo' },
    
    // España
    { city: 'Madrid', state: '', country: 'España', expected: 'Europe/Madrid' },
    { city: 'Barcelona', state: '', country: 'Spain', expected: 'Europe/Madrid' },
    
    // Casos sin país específico
    { city: 'Unknown City', state: '', country: '', expected: 'America/Mexico_City' },
  ]

  console.log('🌍 Testing timezone detection by location:\n')

  let passedTests = 0
  let failedTests = 0

  testCases.forEach((testCase, index) => {
    const result = getSmartDefaultTimezone({
      city: testCase.city,
      state: testCase.state,
      country: testCase.country
    })

    const passed = result === testCase.expected
    const status = passed ? '✅' : '❌'
    
    console.log(`${(index + 1).toString().padStart(2)}. ${status} ${testCase.city}, ${testCase.state} ${testCase.country}`)
    console.log(`     Expected: ${testCase.expected}`)
    console.log(`     Got:      ${result}`)
    
    if (passed) {
      passedTests++
    } else {
      failedTests++
      console.log(`     ⚠️  Test failed!`)
    }
    console.log('')
  })

  console.log('='.repeat(60))
  console.log('📊 TEST RESULTS')
  console.log('='.repeat(60))
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${failedTests}`)
  console.log(`📊 Total:  ${testCases.length}`)
  
  if (failedTests === 0) {
    console.log('\n🎉 All timezone detection tests passed!')
  } else {
    console.log(`\n⚠️  ${failedTests} tests failed. Please review the detection logic.`)
  }

  // Test edge cases
  console.log('\n🔍 Testing edge cases:')
  
  const edgeCases = [
    { input: { city: '', state: '', country: '' }, description: 'Empty values' },
    { input: { city: 'TIJUANA', state: 'BAJA CALIFORNIA', country: 'MEXICO' }, description: 'Uppercase' },
    { input: { city: 'ciudad de méxico', state: 'cdmx', country: 'méxico' }, description: 'Lowercase' },
    { input: { city: 'Playa del Carmen', state: 'Quintana Roo', country: 'México' }, description: 'Multi-word city in Cancun zone' },
  ]

  edgeCases.forEach(edgeCase => {
    const result = getSmartDefaultTimezone(edgeCase.input)
    console.log(`   ${edgeCase.description}: ${result}`)
  })

  console.log('\n📋 System is ready for future club registrations!')
}

testTimezoneDetection()